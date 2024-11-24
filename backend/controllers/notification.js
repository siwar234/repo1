const Notification = require('../models/Notifications');


exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      responsible_user: { $elemMatch: { userId: req.params.userId } } 
      })
      .populate('data.User')
      .populate({ path: 'data.User', model: 'User' })

            .populate('data._id')
            .populate( { path: 'data.projectId', model: 'Project' })
            .populate( { path: 'data.task.related', model: 'Tasks' })
            .populate( { path: 'data.ticketsToDo.ResponsibleTicket', model: 'User' })
            .populate( { path: 'data.tickets', model: 'Tickets' })
            .populate( { path: 'data.task.projectId', model: 'Project' })

      .sort({ timestamp: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

  

// exports.getTicketNotification = async (req, res) => {
//     try {
//       const notifications = await Notification.find({ responsible_ticket: req.params.userId }).populate('ticket').populate('responsible_ticket');
//       res.status(200).json(notifications);
//     } catch (error) {
//       console.error('Error getting notifications:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   };

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    // console.log("Received notification ID from frontend:", notificationId); 

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await Notification.updateMany(
      { responsible_user: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json( result );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

