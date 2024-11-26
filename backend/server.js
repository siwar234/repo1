const express = require('express');
const mongoose = require('mongoose');
const passport = require("passport");
const session = require("express-session");
const env = require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const Notification=require('./models/Notifications')
const app = express();
const os = require('os');

const Tasks=require('./models/Tasks');
const cron = require('node-cron');
const Equipe=require('./models/Equipe')
const Project = require('./models/Project');
const Ticket=require('./models/Tickets')
const oneDay = 86400000;

// Session setup
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: oneDay,
      path: ['/'],
    },
  })
);




// Passport setup
app.use(passport.initialize());
app.use(passport.session());


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));



app.use((req, res, next) => {
  req.io = io;
  next();
});

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes
const authroute = require('./routes/auth');
const googleAuth = require('./routes/google');
const equipeRoute = require('./routes/equipe');
const projectRoute = require('./routes/project');
const tasksRoute = require('./routes/tasks');
const ticketsRoute = require('./routes/tickets');
const featureRoute = require('./routes/feature');
const favouiteRoute = require('./routes/favourites');
const userRoute = require('./routes/user');
const notificationRoute = require('./routes/notifications');
const communicationRoute = require('./routes/CommunicationSpace');
const worflowRoute = require('./routes/workflows');
const typeRoute = require('./routes/Types');

// const { updateAllTicketsEtat } = require('./controllers/Tickets');
// Google OAuth strategy
require("./controllers/google-auth")(passport);

// Connect to the database
require('./config/db.config');

// Routes middleware
app.use("/", googleAuth);
app.use("/api/auth", authroute);
app.use("/api", userRoute);
app.use("/api/equipe", equipeRoute);
app.use("/api/project", projectRoute);
app.use("/api/tasks", tasksRoute);
app.use("/api/tickets", ticketsRoute);
app.use("/api/feature", featureRoute);
app.use("/api/favrouites", favouiteRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/communicationspace", communicationRoute);
app.use("/api/workflows/",worflowRoute)
app.use('/pdf', express.static(path.join(__dirname, 'pdf')));
app.use("/api/types/",typeRoute)
// Start server
const PORT = process.env.PORT ; 
if (process.env.NODE_ENV !== 'test') {

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
}
app.use('/pdf', express.static(path.join(__dirname,  'pdf')));

app.get('/api/pdf/:filename', (req, res) => {
    const filename = req.params.filename;
    const pdfPath = path.join(__dirname, 'pdf', filename);

    console.log('Requested PDF Path:', pdfPath); 

    res.download(pdfPath, filename, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Error downloading the file');
        }
    });
});

const PORTT = 4101; 
const server = http.createServer();

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'],
    // allowedHeaders: ['Authorization'],
    credentials: true,
  },
});




server.listen(PORTT, () => {
  console.log(`Socket server running on port ${PORTT}`);
});




const parseDuration = (durationStr) => {
  const weeks = parseInt(durationStr.split(' ')[0]);
  return weeks * 7 * 24 * 60 * 60 * 1000; 
};



  
// cron.schedule('0 0 * * *', async () => {
//   console.log('Checking ticket statuses...');
  
//   await updateAllTicketsEtat(io); 
// });



////notification approching deadline for tasks
const approachingDeadline = async () => {
  try {
    const now = new Date();
    // 2 days from now

    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); 
    const tasks = await Tasks.find({
      $or: [
        // Condition 1
        {
          $and: [
            { StartDate: { $exists: true } },
            { Duration: { $exists: true } },
            { EndDate: { $eq: null } }
          ]
        },
        // Condition 2
        {
          $and: [
            { StartDate: { $exists: true } },
            { EndDate: { $exists: true } }
          ]
        }
      ]
    })
    .populate({
      path: 'tickets',
      match: { Etat: { $ne: 'DONE' } }
    })
    .populate({
      path: 'tickets',
      populate: [
        { path: 'ResponsibleTicket', model: 'User' },
        { path: 'Feature', model: 'Features' },
        { path: 'votes', model: 'User' },
        {
          path: 'comments',
          populate: { path: 'commenterId', model: 'User' }
        },
        { path: 'projectId', model: 'Project' }
      ]
    })
    .populate('projectId');

    const approachingDeadlineTasks = tasks.filter(task => {
      if (task.EndDate) {
        // Condition 2: Task has StartDate and EndDate
        const endDateMinusTwoDays = new Date(task.EndDate.getTime() - 2 * 24 * 60 * 60 * 1000);
        return endDateMinusTwoDays < now;
      } else if (task.StartDate && task.Duration) {
        // Condition 1: Task has StartDate and Duration, EndDate is null
        const endDate = new Date(task.StartDate.getTime() + parseDuration(task.Duration));
        return endDate < twoDaysFromNow;
      }
      return false;
    });

    for (const task of approachingDeadlineTasks) {

      const responsibleUsers = Array.isArray(task.projectId.Responsable)
      ? task.projectId.Responsable.map(user => ({ userId: user })) 
      : [{ userId: task.projectId.Responsable }]; 

        const notificationData = new Notification({
          type: 'approachingDeadline',
          data: task,
          read: false,
          responsible_user: responsibleUsers,
          timestamp: new Date()
        });

        const savedNotification = await notificationData.save();
        // console.log('Notification saved to MongoDB:', savedNotification);

        // Emit 'approachingDeadline' event to all connected clients
        io.emit('messages', { type: 'approachingDeadline', ...savedNotification._doc });
      
    }
  } catch (error) {
    console.error('Error checking tasks approaching deadline:', error);
  }
};

//inactive users 
const inactiveMember = async () => {
  try {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    // Fetch tasks that match the criteria
    const tasks = await Tasks.find({
      $or: [
        // Condition 1: Task has StartDate, Duration, and no EndDate
        {
          $and: [
            { StartDate: { $exists: true } },
            { Duration: { $exists: true } },
            { EndDate: { $eq: null } }
          ]
        },
        // Condition 2: Task has StartDate and EndDate
        {
          $and: [
            { StartDate: { $exists: true } },
            { EndDate: { $exists: true } }
          ]
        }
      ]
    })
    .populate({
      path: 'tickets',
      match: { Etat: 'TO DO' } 
    })
    .populate({
      path: 'tickets',
      populate: { path: 'ResponsibleTicket', model: 'User' } 
    })
    .populate('projectId');

    // Filter tasks where the deadline is approaching and all tickets are 'TO DO'
    const approachingDeadlineTasks = tasks.filter(task => {
      if (task.EndDate) {
        // Condition 2: Task has StartDate and EndDate
        const endDateMinusTwoDays = new Date(task.EndDate.getTime() - 2 * 24 * 60 * 60 * 1000);
        return endDateMinusTwoDays < now;
      } else if (task.StartDate && task.Duration) {
        // Condition 1: Task has StartDate and Duration, EndDate is null
        const endDate = new Date(task.StartDate.getTime() + parseDuration(task.Duration));
        return endDate < twoDaysFromNow;
      }
      return false;
    });

    for (const task of approachingDeadlineTasks) {
      // Populate ResponsibleTicket for each ticket in ticketsToDo
      const ticketsToDo = await Ticket.find({ _id: { $in: task.tickets.map(ticket => ticket._id) } })
        .populate('ResponsibleTicket');

        const responsibleUsers = Array.isArray(task.projectId.Responsable)
      ? task.projectId.Responsable.map(user => ({ userId: user })) 
      : [{ userId: task.projectId.Responsable }]; 

      const notificationData = new Notification({
        type: 'inactiveMember',
        data: {
          task: task,
          ticketsToDo: ticketsToDo
        },
        read: false,
        responsible_user: responsibleUsers,
        timestamp: new Date()
      });

      const savedNotification = await notificationData.save();

      // Emit 'inactiveMember' event to all connected clients
      io.emit('messages', { type: 'inactiveMember', ...savedNotification._doc });
    }
  } catch (error) {
    console.error('Error checking tasks approaching deadline:', error);
  }
};





//// notification OverdueTaskstasks
const checkOverdueTasks = async () => {
  try {
    const now = new Date();

    const overdueTasks = await Tasks.find({
      $or: [
        // Condition 1
        {
          $and: [
            { StartDate: { $exists: true } },
            { Duration: { $exists: true } },
            { EndDate: { $eq: null } },
            {
              $expr: {
                $lt: [
                  { $add: ['$startDate', parseDuration('$Duration')] },
                  now,
                ],
              },
            },
          ],
        },
        // Condition 2
        {
          $and: [
            { StartDate: { $exists: true } },
            { EndDate: { $exists: true } },
            {
              $expr: {
                $lt: [
                  { $add: ['$StartDate', { $subtract: ['$EndDate', '$StartDate'] }] },
                  now,
                ],
              },
            },
          ],
        },
      ],
    }).populate({
      path: 'tickets',
      match: { Etat: { $ne: 'DONE' } },
    }).populate({
      path: 'tickets',
      populate: [
        { path: 'ResponsibleTicket', model: 'User' },
        { path: 'Feature', model: 'Features' },
        { path: 'votes', model: 'User' },
        {
          path: 'comments',
          populate: { path: 'commenterId', model: 'User' }
        },
        { path: 'projectId', model: 'Project' },
      ]
    }).populate('projectId');

    for (const task of overdueTasks) {
      // Check if all tickets of the task are != done
      const allTicketsNotDone = task.tickets.every(ticket => ticket.workflow.workflowTitle !== 'DONE');

      if (allTicketsNotDone) {
        const notificationData = new Notification({
          type: 'overdueTask',
          data: task,
          read: false,
          responsible_user: task.projectId.Responsable,
          timestamp: new Date(),
        });

        const savedNotification = await notificationData.save();
        // console.log('Notification saved to MongoDB:', savedNotification);

        io.emit('messages', { type: 'overdueTask', ...savedNotification._doc });
      }
    }
  } catch (error) {
    console.error('Error checking overdue tasks:', error);
  }
}

if (process.env.NODE_ENV !== 'test') {

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('projectnotification', async (data) => {
    try {
      const responsibleUsers = Array.isArray(data.Responsable)
        ? data.Responsable.map(user => ({ userId: user })) 
        : [{ userId: data.Responsable }]; 
  
      const notificationData = new Notification({
        type: 'projectnotification',
        data: data,
        read: false,
        responsible_user: responsibleUsers, 
        timestamp: new Date(),
      });
  
      const savedNotification = await notificationData.save();
      // console.log('Notification saved to MongoDB:', savedNotification);
  
      // Emit the message to the connected clients
      io.emit('messages', { type: 'projectnotification', ...notificationData._doc });
    } catch (error) {
      console.error('Error handling project notification:', error);
    }
  });
  
  

  socket.on('ticketnotification', async (data) => {
    console.log('new ticket:', data);
    try {

      const responsibleUsers = Array.isArray(data.ticket.ResponsibleTicket._id)
        ? data.ticket.ResponsibleTicket.map(user => ({ userId: user })) 
        : [{ userId: data.ticket.ResponsibleTicket._id }]; 


      const notificationData = new Notification({
        type: 'ticketnotification',
        data: data,
        read: false,
        responsible_user: responsibleUsers,

        timestamp: new Date(),
      });

      const savedNotification = await notificationData.save();
      // console.log('Notification saved to MongoDB:', savedNotification);

      // Emit 'messages' event to all connected clients with type ticket
      io.emit('messages', { type: 'ticketnotification', ...notificationData._doc });
    } catch (error) {
      console.error('Error handling ticket notification:', error);
    }
  });


  //////send admin notification
  socket.on('failedAttemptnotification', async (data) => {
    // console.log('new project:', data);
    try {

      const notificationData = new Notification({
        type: 'failedAttemptnotification',
        data: data,
        read: false,
        responsible_user: "66994a7628333a34de9ec4e2",
        timestamp: new Date(),
      });

      const savedNotification = await notificationData.save();
      console.log('Notification saved to MongoDB:', savedNotification);

      // Emit 'messages' event to all connected clients with type project
      io.emit('messages', { type: 'failedAttemptnotification', ...notificationData._doc });

      
    } catch (error) {
      console.error('Error handling  failedAttempt notification:', error);
    }
  });


////send feedback notification
  socket.on('feedbacknotification', async (data) => {
    try {

      const responsibleUsers = Array.isArray(data.ticketcomment.ResponsibleTicket._id)
        ? data.ticketcomment.ResponsibleTicket.map(user => ({ userId: user })) 
        : [{ userId: data.ticketcomment.ResponsibleTicket._id }]; 

      const notificationData = new Notification({
        type: 'feedbacknotification',
        data: data,
        read: false,
        responsibleUsers: responsibleUsers,
        timestamp: new Date(),
      });

      const savedNotification = await notificationData.save();

      // Emit 'messages' event to all connected clients with type project
      io.emit('messages', { type: 'feedbacknotification', ...notificationData._doc });

      
    } catch (error) {
      console.error('Error handling feedback notification:', error);
    }
  });


  ///// delete project notification
  socket.on('deleteprojectnotification', async (data) => {
    try {
      const notifications = data.teamMembers.map(member => ({
        type: 'deleteprojectnotification',
        data: {
          projectId: data.projectId,
          projectName: data.projectName,
          User:data.User
        },
        responsible_user: [{ userId: member.userId }],
        read: false,
        timestamp: new Date(),
      }));
  
      await Notification.insertMany(notifications);
  
      io.emit('messages', { type: 'deleteprojectnotification', projectId: data.projectId, projectName: data.projectName });
  
    } catch (error) {
      console.error('Error handling project delete notification:', error);
    }
  });
  



      
  socket.on('relatedTasksNotification', async (data) => {
    // console.log('new project:', data);
    try {
      const responsibleUsers = Array.isArray(data.task.projectId.Responsable._id)
      ? data.task.projectId.Responsable.map(user => ({ userId: user })) 
      : [{ userId: data.task.projectId.Responsable._id }]; 

      const notificationData = new Notification({
        type: 'relatedTasksNotification',
        data: data,
        read: false,
        responsible_user: responsibleUsers,
        timestamp: new Date(),
      });

      const savedNotification = await notificationData.save();
      // console.log('Notification saved to MongoDB:', savedNotification);

      // Emit 'messages' event to all connected clients with type project
      io.emit('messages', { type: 'relatedTasksNotification', ...notificationData._doc });

      
    } catch (error) {
      console.error('Error handling project notification:', error);
    }
  });


  


  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
}


if (process.env.NODE_ENV !== 'test') {

cron.schedule('0 */3 * * *', () => {
  // console.log('Running checkOverdueTasks every 3 hours');
  checkOverdueTasks();
    approachingDeadline();
     inactiveMember()


  
});

}




// cron.schedule('*/5 * * * * *', () => {
//   console.log('Running checkOverdueTasks every 5 seconds');
//   // inactiveMember()
//    approachingDeadline();

// });

module.exports = {app,io};
