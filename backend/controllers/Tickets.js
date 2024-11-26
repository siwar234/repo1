
const mongoose = require("mongoose");
const Tickets=require('../models/Tickets');
const Task = require('../models/Tasks');
const Features = require('../models/Features');
const { predictAndUpdateTicketDuration } = require('../controllers/Tasks');
const moment = require('moment');
const Workflow=require("../models/workflow")
const cron = require('node-cron');
const Type = require("../models/Types");


async function generateTicketId(projectId = 'PRJ', prefix = 'TIC') {
  const latestTicket = await Tickets.findOne({ projectId }).sort({ 'identifiant': -1 }).limit(1);
  
  const projectCode = projectId.slice(0, 3).toUpperCase();

  let lastTicketNumber = 0;
  if (latestTicket && latestTicket.identifiant) {
      const parts = latestTicket.identifiant.split('-');
      const number = parseInt(parts[2], 10);  
      if (!isNaN(number)) {
          lastTicketNumber = number;
      }
  }

  // Increment the number for the new ticket
  const newTicketNumber = lastTicketNumber + 1;

  return `${projectCode}-${prefix}-${newTicketNumber}`;
}



exports.createTickets = async (req, res) => {
  try {
      const { Description, Priority, flag, Etat, TaskId, ResponsibleTicket, projectId, Types ,storyPoints} = req.body;

      if (!Description) {
          return res.status(400).json({ error: 'Description is required' });
      }

      const randomString = await generateTicketId(projectId); 

      const todoWorkflow = await Workflow.findOne({ workflowTitle: 'TO DO' });
      if (!todoWorkflow) {
        return res.status(500).json({ error: 'Default workflow not found' });
      }

      const storyType = await Type.findOne({ TypesTitle: 'story' });
      if (!storyType) {
        return res.status(500).json({ error: 'Default storyType not found' });
      }


      

      const tickets = new Tickets({
          Description: Description,
          Priority: Priority,
          flag: flag || false ,
          Etat: Etat || '',
          TaskId: TaskId,
          projectId: projectId,
          ResponsibleTicket: ResponsibleTicket,
          Types: Types || storyType._id,
          storyPoints: storyPoints || '',
          identifiant: randomString ,
          workflow: todoWorkflow._id 
        });

        const savedTicket = await tickets.save();
        
        await Task.findByIdAndUpdate(TaskId, { $push: { tickets: savedTicket._id } });

        res.status(201).json(savedTicket);
      } catch (error) {
        console.error('Error creating tickets:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };





exports.FilterTicketsPerPerson = async (req, res) => {
  try {
    const { projectId, person } = req.params;

    const tasks = await Task.find({ projectId })
      .populate('tickets')
      .populate('related')
      .populate({
        path: 'tickets',
        populate: [
          { path: 'ResponsibleTicket', model: 'User' },
          { path: 'Feature', model: 'Features' },
          { path: 'votes', model: 'User' },
          { path: 'workflow', model: 'Workflow' },
          { path: 'Types', model: 'Types' },
          {
            path: 'associatedTickets',
            populate: [
              { 
                path: 'ticketId', 
                model: 'Tickets',
                populate: [
                  { path: 'ResponsibleTicket', model: 'User' },
                  { path: 'workflow', model: 'Workflow' }
                ]
              }
            ]
          },
          {
            path: 'comments',
            populate: { path: 'commenterId', model: 'User' }
          }
        ]
      })
      .populate('projectId');

    let filteredTasks = tasks.map(task => {
      return {
        ...task._doc,
        tickets: task.tickets.filter(ticket => {
          if (person === 'Non-Assigned') {
            return !ticket.ResponsibleTicket || ticket.ResponsibleTicket === null;
          } else {
            return ticket.ResponsibleTicket?.firstName.toLowerCase() === person.toLowerCase(); 
          }
        }),
      };
    });

    filteredTasks = filteredTasks.filter(task => task.tickets.length > 0);

    res.status(200).json(filteredTasks);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};






  exports.getListTicketsBytasks = async (req, res) => {
    try {
      const TaskId = req.params.TaskId;
      
      const tickets = await Tickets.find({ TaskId });
  
      res.status(200).json(tickets);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  
  exports.getalltickets = async (req, res) => {
    try {
        const { id } = req.params;

        const alltickets = await Tickets.find({ ResponsibleTicket: id })
            .populate('projectId')
            .populate('ResponsibleTicket')
            .populate('Feature')
            .populate('votes')
            
            .populate({
              path: "comments",
              populate: {
                path: "commenterId",
                model: "User"
              }
            })
            .populate({
              path: 'associatedTickets',
              populate: [
                {
                  path: 'ticketId',
                  model: 'Tickets',
                  populate: [
                    {
                      path: 'ResponsibleTicket',
                      model: 'User'
                    },
                    {
                      path: 'workflow',
                      model: 'Workflow'
                    }
                  ]
                }
              ]
            })
            
            .populate('workflow').populate('Types')
                   res.status(200).json(alltickets);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};


  exports.getListTicketsByproject = async (req, res) => {
    try {
      const projectId = req.params.projectId;
      
      const tickets = await Tickets.find({ projectId }).populate('TaskId').populate('ResponsibleTicket').populate('Feature').populate('votes').populate("comments")  
     
      .populate({
        path: "comments",
        populate: {
          path: "commenterId",
          model: "User"
        }
      })
      .populate({
        path: 'associatedTickets',
        populate: [
          {
            path: 'ticketId',
            model: 'Tickets',
            populate: [
              {
                path: 'ResponsibleTicket',
                model: 'User'
              },
              {
                path: 'workflow',
                model: 'Workflow'
              }
            ]
          }
        ]
      }).populate('workflow').populate("Types")
      res.status(200).json(tickets);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };


  exports.updatedtickets = async (req, res) => {
    try {
        console.log('Request Body:', req.body); // Log the request body

        // Destructure with correct field names
        const { Description, ResponsibleTicket, Etat, Type, Priority, Feature, storyPoints } = req.body;

        // console.log('Updating Fields:', { Description, ResponsibleTicket, Etat, Type, Priority, Feature, storyPoints });

        const updatedFields = { Description, ResponsibleTicket, Etat, Type, Priority, Feature, storyPoints };

        const updatedtickets = await Tickets.findOneAndUpdate(
            { _id: req.params.id },
            { $set: updatedFields },
            { new: true }
        );

        // console.log('Updated Ticket:', updatedtickets);

        if (!updatedtickets) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        if (Feature) {
            await Features.findOneAndUpdate(
                { _id: Feature },
                { $addToSet: { Tickets: req.params.id } }
            );

            await Features.updateMany(
                { _id: { $ne: Feature }, Tickets: req.params.id },
                { $pull: { Tickets: req.params.id } }
            );
        }

        const originaltickets = await Tickets.findById(req.params.id).populate('ResponsibleTicket').populate('Feature').populate('votes').populate({
          path: "comments",
          populate: {
            path: "commenterId",
            model: "User"
          }
        }) 
        .populate({
          path: 'associatedTickets',
          populate: [
            {
              path: 'ticketId',
              model: 'Tickets',
              populate: [
                {
                  path: 'ResponsibleTicket',
                  model: 'User'
                },
                {
                  path: 'workflow',
                  model: 'Workflow'
                }
              ]
            }
          ]
        }).populate('workflow').populate("Types");

        res.status(200).json(originaltickets);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};





    
exports.updateTicketPosition = async (req, res) => {
  try {
    const { position, workflow } = req.body;
    const { ticketId } = req.params;

    const updatedTicket = await Tickets.findByIdAndUpdate(
      ticketId,
      { $set: { position: position, workflow: workflow } }, 
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket position:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

  
  
  //update worflow/priorit/responsible 
exports.updateTicket = async (req, res) => {
  try {
    const { Description, ResponsibleTicket, Etat, Type, Priority, User, CoverImage, position, storyPoints, workflow } = req.body;
    
    const updatedTicket = await Tickets.findOneAndUpdate(
      { _id: req.params.id }, 
      { Description, ResponsibleTicket, Etat, Type, Priority, User, CoverImage, position, storyPoints, workflow }, 
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const task = await Task.findById(updatedTicket.TaskId)
      .populate('tickets')
      .populate('related')
      .populate({
        path: 'tickets',
        populate: [
          { path: 'ResponsibleTicket', model: 'User' },
          { path: 'Feature', model: 'Features' },
          { path: 'votes', model: 'User' },
          { path: 'workflow', model: 'Workflow' },
          { path: 'Types', model: 'Types' },

          {
            path: 'associatedTickets',
            populate: [
              { 
                path: 'ticketId', 
                model: 'Tickets',
                populate: [
                  { path: 'ResponsibleTicket', model: 'User' },
                  { path: 'workflow', model: 'Workflow' }
                ]
              }
            ]
          },
          
          { 
            path: 'comments', 
            populate: { path: 'commenterId', model: 'User' } 
          }
        ]
      });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const taskid = updatedTicket.TaskId;
    const ticketId = updatedTicket._id;

    const ticket = await Tickets.findById(ticketId)
      .populate('ResponsibleTicket')
      .populate('Feature')
      .populate('User')
      .populate('votes')
      .populate({
        path: 'comments',
        populate: {
          path: 'commenterId',
          model: 'User'
        }
      })
      .populate({
        path: 'associatedTickets',
        populate: [
          {
            path: 'ticketId',
            model: 'Tickets',
            populate: [
              {
                path: 'ResponsibleTicket',
                model: 'User'
              },
              {
                path: 'workflow',
                model: 'Workflow'
              }
            ]
          }
        ]
      }).populate('workflow').populate("Types");

    res.status(200).json({ task, taskid, ticketId, ticket });

  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





//delete ticket images
exports.deleteimage = async (req, res) => {
  try {
    const { ticketId, imageIndex } = req.params;

    const ticket = await Tickets.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Check if imageIndex is valid
    if (ticket.descriptionticket.imageD.length > imageIndex) {
      // Remove the image at the specified index
      ticket.descriptionticket.imageD.splice(imageIndex, 1);
      
      // Save the updated ticket
      await ticket.save();
      return res.status(200).json( ticket );
    } else {
      return res.status(400).json({ error: 'Invalid image index' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

exports.updateTicketfeature = async (req, res) => {
  try {
    const { Feature } = req.body;

    // Find the old feature ID associated with the ticket
    const ticket = await Tickets.findById(req.params.id);
    const oldFeatureId = ticket ? ticket.Feature : null;

    // Update the ticket with the new feature
    const updatedTicket = await Tickets.findOneAndUpdate(
      { _id: req.params.id },
      { Feature },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    console.log('Feature ID:', Feature);

    if (Feature) {
      const task = await Task.findById(updatedTicket.TaskId);

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const feature = await Features.findById(Feature);

      if (!feature) {
        return res.status(404).json({ error: 'Feature not found' });
      }

      let startDate = feature.startDate ? feature.startDate : task.StartDate;
      let endDate = feature.endDate ? feature.endDate : task.EndDate;

      if (task.StartDate < startDate) {
        startDate = task.StartDate;
      }
      if (task.EndDate > endDate) {
        endDate = task.EndDate;
      }

      // Update the new feature with the ticket and its dates
      await Features.findOneAndUpdate(
        { _id: Feature },
        {
          $addToSet: { Tickets: req.params.id },
          startDate,
          endDate
        }
      );

      // If there was an old feature associated with the ticket
      if (oldFeatureId) {
        // Find the old feature
        const oldFeature = await Features.findById(oldFeatureId);

        if (oldFeature) {
          // Remove the ticket from the old feature and update its dates
          await Features.findOneAndUpdate(
            { _id: oldFeatureId },
            {
              $pull: { Tickets: req.params.id },
              startDate: null, // Resetting to null as we'll recalculate it
              endDate: null // Resetting to null as we'll recalculate it
            }
          );

          // Find remaining tickets associated with the old feature
          const remainingTickets = await Tickets.find({ Feature: oldFeatureId });
          let earliestStartDate = Infinity;
          let latestEndDate = -Infinity;

          for (const ticket of remainingTickets) {
            const relatedTask = await Task.findById(ticket.TaskId);
            if (relatedTask) {
              if (relatedTask.StartDate < earliestStartDate) {
                earliestStartDate = relatedTask.StartDate;
              }
              if (relatedTask.EndDate > latestEndDate) {
                latestEndDate = relatedTask.EndDate;
              }
            }
          }

          const newStartDate = earliestStartDate === Infinity ? null : earliestStartDate;
          const newEndDate = latestEndDate === -Infinity ? null : latestEndDate;

          // Update the dates of the old feature based on remaining tickets
          await Features.findOneAndUpdate(
            { _id: oldFeatureId },
            {
              $set: {
                startDate: newStartDate,
                endDate: newEndDate
              }
            }
          );
        }
      }
    } else {
      // If the ticket is removed from the feature
      if (oldFeatureId) {
        // Remove the ticket from the old feature and update its dates
        await Features.findOneAndUpdate(
          { _id: oldFeatureId },
          {
            $pull: { Tickets: req.params.id },
            startDate: null, 
            endDate: null 
          }
        );

        // Find remaining tickets associated with the old feature
        const remainingTickets = await Tickets.find({ Feature: oldFeatureId });
        let earliestStartDate = Infinity;
        let latestEndDate = -Infinity;

        for (const ticket of remainingTickets) {
          const relatedTask = await Task.findById(ticket.TaskId);
          if (relatedTask) {
            if (relatedTask.StartDate < earliestStartDate) {
              earliestStartDate = relatedTask.StartDate;
            }
            if (relatedTask.EndDate > latestEndDate) {
              latestEndDate = relatedTask.EndDate;
            }
          }
        }

        const newStartDate = earliestStartDate === Infinity ? null : earliestStartDate;
        const newEndDate = latestEndDate === -Infinity ? null : latestEndDate;

        // Update the dates of the old feature based on remaining tickets
        await Features.findOneAndUpdate(
          { _id: oldFeatureId },
          {
            $set: {
              startDate: newStartDate,
              endDate: newEndDate
            }
          }
        );
      }
    }

    // Find and return the updated task with populated tickets and features
    const updatedTask = await Task.findById(updatedTicket.TaskId).populate('tickets').populate('related').populate({
      path: 'tickets',
      populate: [
        { path: 'ResponsibleTicket', model: 'User' },
        { path: 'Feature', model: 'Features' },
        { path: 'votes', model: 'User' } ,
        { path: 'workflow', model: 'Workflow' },
        { path: 'Types', model: 'Types' },

        {
          path: 'associatedTickets',
          populate: [
            { 
              path: 'ticketId', 
              model: 'Tickets',
              populate: [
                { path: 'ResponsibleTicket', model: 'User' },
                { path: 'workflow', model: 'Workflow' }
              ]
            }
          ]
        },
        
        { 
          path: 'comments', 
          populate: { path: 'commenterId', model: 'User' } 
        }

      ]
    });

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const taskid = updatedTicket.TaskId;
    const ticketId = updatedTicket._id;

    const ticketfeature = await Tickets.findById(ticketId)
    .populate('ResponsibleTicket')
    .populate('Feature')
    .populate('votes').populate({
      path: "comments",
      populate: {
        path: "commenterId",
        model: "User"
      }
    }) .populate({
      path: 'associatedTickets',
      populate: [
        {
          path: 'ticketId',
          model: 'Tickets',
          populate: [
            {
              path: 'ResponsibleTicket',
              model: 'User'
            },
            {
              path: 'workflow',
              model: 'Workflow'
            }
          ]
        }
      ]
    }).populate('workflow')
    .populate('Types')
    
    
 
    res.status(200).json({updatedTask,taskid,ticketId,ticketfeature });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { ticketid } = req.params;
    const { commenterId, commentText} = req.body;

    const commenticket = await Tickets.findByIdAndUpdate(
      ticketid,
      {
        $push: {
          comments: {
            commenterId: commenterId,
            comment: commentText
          }
        }
      },
      { new: true } 
    );

    const taskid = commenticket.TaskId;
    const ticketId = commenticket._id;

    const ticketcomment = await Tickets.findById(ticketId)
    .populate('ResponsibleTicket')
    .populate('Feature')
    .populate('votes').populate({
      path: "comments",
      populate: {
        path: "commenterId",
        model: "User"
      }
    })
    .populate({
      path: 'associatedTickets',
      populate: [
        {
          path: 'ticketId',
          model: 'Tickets',
          populate: [
            {
              path: 'ResponsibleTicket',
              model: 'User'
            },
            {
              path: 'workflow',
              model: 'Workflow'
            }
          ]
        }
      ]
    }).populate('workflow');   

    const task = await Task.findById(commenticket.TaskId).populate('related')
      .populate('tickets')
      .populate({
        path: 'tickets',
        populate: [
          { path: 'ResponsibleTicket', model: 'User' },
          { path: 'Feature', model: 'Features' },
          { path: 'votes', model: 'User' },
          { path: 'workflow', model: 'Workflow' },
          { path: 'Types', model: 'Types' },
          {
            path: 'associatedTickets',
            populate: [
              { 
                path: 'ticketId', 
                model: 'Tickets',
                populate: [
                  { path: 'ResponsibleTicket', model: 'User' },
                  { path: 'workflow', model: 'Workflow' }
                ]
              }
            ]
          },
          
          { 
            path: 'comments', 
            populate: { path: 'commenterId', model: 'User' } 
          }
        ]
      });

     

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const newCommentId = commenticket.comments[commenticket.comments.length - 1]._id;
    const newComment = ticketcomment.comments.find(comment => comment._id.toString() === newCommentId.toString());

    res.status(200).json({ task, ticketId, taskid, ticketcomment,newComment});
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal server error' }); 
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { ticketid, commentId, commenterId } = req.params;

    const updatedTicket = await Tickets.findByIdAndUpdate(
      ticketid,
      { $pull: { comments: { _id: commentId, commenterId: commenterId } } },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

   
 const task = await Task.findById(updatedTicket.TaskId).populate('tickets').populate('related').populate({
      path: 'tickets',
      populate: [
        { path: 'ResponsibleTicket', model: 'User' },
        { path: 'Feature', model: 'Features' } ,
         { path: 'votes', model: 'User' },
         { path: 'workflow', model: 'Workflow' },
         { path: 'Types', model: 'Types' },
         {
          path: 'associatedTickets',
          populate: [
            { 
              path: 'ticketId', 
              model: 'Tickets',
              populate: [
                { path: 'ResponsibleTicket', model: 'User' },
                { path: 'workflow', model: 'Workflow' }
              ]
            }
          ]
        },
        
         { 
          path: 'comments', 
          populate: { path: 'commenterId', model: 'User' } 
        }
         
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const taskId = updatedTicket.TaskId;
    const ticketId = updatedTicket._id;
   const ticket=  await Tickets.findById(ticketId)
    .populate('ResponsibleTicket')
    .populate('Feature')
    .populate('votes').populate({
      path: "comments",
      populate: {
        path: "commenterId",
        model: "User"
      }
    })
    .populate({
      path: 'associatedTickets',
      populate: [
        {
          path: 'ticketId',
          model: 'Tickets',
          populate: [
            {
              path: 'ResponsibleTicket',
              model: 'User'
            },
            {
              path: 'workflow',
              model: 'Workflow'
            }
          ]
        }
      ]
    })
    .populate('workflow');   

    res.status(200).json({ task,ticketId,taskId,ticket});
    } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { ticketid, commentId } = req.params;
    const { commenterId, updatedCommentText } = req.body;

    const comment = await Tickets.findOneAndUpdate(
      { 
        _id: ticketid, 
        'comments._id': commentId, 
        'comments.commenterId': commenterId 
      },
      { 
        $set: { 
          'comments.$[comment].comment': updatedCommentText,
          'comments.$[comment].updatedAt': new Date() 
        }
      },
      { 
        new: true,
        arrayFilters: [{ 'comment._id': commentId }] 
      }
    );
    

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }
    console.log('Updated comment:', comment); 

    const ticket = await Tickets.findById(ticketid)
      .populate('ResponsibleTicket')
      .populate('Feature')
      .populate('votes')
      .populate({
        path: 'comments',
        populate: {
          path: 'commenterId',
          model: 'User'
        }
      })
      .populate({
        path: 'associatedTickets',
        populate: [
          {
            path: 'ticketId',
            model: 'Tickets',
            populate: [
              {
                path: 'ResponsibleTicket',
                model: 'User'
              },
              {
                path: 'workflow',
                model: 'Workflow'
              }
            ]
          }
        ]
      })
      .populate('workflow');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const taskId = ticket.TaskId;
    const ticketId = ticket._id;

    const task = await Task.findById(taskId).populate('tickets').populate('related').populate({
      path: 'tickets',
      populate: [
        { path: 'ResponsibleTicket', model: 'User' },
        { path: 'Feature', model: 'Features' } ,
        { path: 'workflow', model: 'Workflow' },
        { path: 'Types', model: 'Types' },
        
        {
          path: 'associatedTickets',
          populate: [
            { 
              path: 'ticketId', 
              model: 'Tickets',
              populate: [
                { path: 'ResponsibleTicket', model: 'User' },
                { path: 'workflow', model: 'Workflow' }
              ]
            }
          ]
        },
        
        { path: 'votes', model: 'User' },
        { 
          path: 'comments', 
          populate: { path: 'commenterId', model: 'User' } 
        }
      ]
    });

    res.status(200).json({ task,ticketId, taskId, ticket });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



exports.addVote = async (req, res) => {
  const { ticketid } = req.params;
  const { voterId } = req.body;

  try {
    const ticketupdated = await Tickets.findById(ticketid);

    if (!ticketupdated) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticketupdated.votes.includes(voterId)) {
      return res.status(400).json({ error: 'You have already voted for this ticket' });
    }

    ticketupdated.votes.push(voterId);

    await ticketupdated.save();


    const task = await Task.findById(ticketupdated.TaskId).populate('tickets').populate('related').populate({
      path: 'tickets',
      populate: [
        { path: 'ResponsibleTicket', model: 'User' },
        { path: 'Feature', model: 'Features' } ,
         { path: 'votes', model: 'User' },
         { path: 'workflow', model: 'Workflow' },
         {
          path: 'associatedTickets',
          populate: [
            { 
              path: 'ticketId', 
              model: 'Tickets',
              populate: [
                { path: 'ResponsibleTicket', model: 'User' },
                { path: 'workflow', model: 'Workflow' }
              ]
            }
          ]
        },
        
         { 
          path: 'comments', 
          populate: { path: 'commenterId', model: 'User' } 
        }
         
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const ticketId = ticketupdated._id;
    const taskId = ticketupdated.TaskId;
    const ticket = await Tickets.findById(ticketId)
    .populate('ResponsibleTicket')
    .populate('Feature')
    .populate('votes').populate({
      path: "comments",
      populate: {
        path: "commenterId",
        model: "User"
      }
    })
    .populate({
      path: 'associatedTickets',
      populate: [
        {
          path: 'ticketId',
          model: 'Tickets',
          populate: [
            {
              path: 'ResponsibleTicket',
              model: 'User'
            },
            {
              path: 'workflow',
              model: 'Workflow'
            }
          ]
        }
      ]
    })
    .populate('workflow').populate('Types');

    res.status(200).json({task, ticketId, taskId, ticket });
    // res.status(200).json({task,ticketid, taskId, ticket });

  } catch (error) {
    console.error('Error adding vote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.deleteVote = async (req, res) => {
  const { ticketid } = req.params;
  const { voterId } = req.params;

  try {
    console.log('Deleting vote:', voterId);
    
    const updatedTicket = await Tickets.findByIdAndUpdate(
      ticketid,
      { $pull: { votes: voterId } },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const task = await Task.findById(updatedTicket.TaskId).populate('tickets').populate('related').populate({
      path: 'tickets',
      populate: [
        { path: 'ResponsibleTicket', model: 'User' },
        { path: 'Feature', model: 'Features' } ,
         { path: 'votes', model: 'User' },
         { path: 'Types', model: 'Types' },
         {
          path: 'associatedTickets',
          populate: [
            { 
              path: 'ticketId', 
              model: 'Tickets',
              populate: [
                { path: 'ResponsibleTicket', model: 'User' },
                { path: 'workflow', model: 'Workflow' }
              ]
            }
          ]
        },
        
         { 
          path: 'comments', 
          populate: { path: 'commenterId', model: 'User' } 
        }
         
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const taskId = updatedTicket.TaskId;
    const ticketId = updatedTicket._id;
   const ticket=  await Tickets.findById(ticketId)
    .populate('ResponsibleTicket')
    .populate('Feature')
    .populate('votes').populate({
      path: "comments",
      populate: {
        path: "commenterId",
        model: "User"
      }
    })
    .populate({
      path: 'associatedTickets',
      populate: [
        {
          path: 'ticketId',
          model: 'Tickets',
          populate: [
            {
              path: 'ResponsibleTicket',
              model: 'User'
            },
            {
              path: 'workflow',
              model: 'Workflow'
            }
          ]
        }
      ]
    })
    .populate('workflow').populate('Types');   

    res.status(200).json({ task,ticketId,taskId,ticket});

  } catch (error) {
    console.error('Error deleting vote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





exports.updateTicketimages = async (req, res) => {
  try {
    const { descriptionticket } = req.body;

    if (!descriptionticket) {
      return res.status(400).json({ error: 'No description ticket provided' });
    }

    const { descriptionText, imageD } = descriptionticket;

    const updateFields = {};

    if (descriptionText) {
      updateFields['descriptionticket.descriptionText'] = descriptionText;
    }

    if (imageD && imageD.length > 0) {
      updateFields['$addToSet'] = {
        'descriptionticket.imageD': { $each: imageD }
      };
    }

    const updatedTickets = await Tickets.findOneAndUpdate(
      { _id: req.params.id },
      updateFields,
      { new: true }
    );

    if (!updatedTickets) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const task = await Task.findById(updatedTickets.TaskId).populate('tickets').populate('related').populate({
      path: 'tickets',
      populate: [
        { path: 'ResponsibleTicket', model: 'User' },
        { path: 'Feature', model: 'Features' },
        { path: 'workflow', model: 'Workflow' },
        { path: 'Types', model: 'Types' },

        {
          path: 'associatedTickets',
          populate: [
            { 
              path: 'ticketId', 
              model: 'Tickets',
              populate: [
                { path: 'ResponsibleTicket', model: 'User' },
                { path: 'workflow', model: 'Workflow' }
              ]
            }
          ]
        },
        
        { path: 'votes', model: 'User' }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const ticketId = updatedTickets._id;
    const taskId = updatedTickets.TaskId;

    // Populate the ticket object
    const ticket = await Tickets.findById(ticketId)
      .populate('ResponsibleTicket')
      .populate('Feature')
      .populate('votes').populate({
        path: "comments",
        populate: {
          path: "commenterId",
          model: "User"
        }
      })
      .populate({
        path: 'associatedTickets',
        populate: [
          {
            path: 'ticketId',
            model: 'Tickets',
            populate: [
              {
                path: 'ResponsibleTicket',
                model: 'User'
              },
              {
                path: 'workflow',
                model: 'Workflow'
              }
            ]
          }
        ]
      })
      .populate('workflow').populate('Types');

    res.status(200).json({ task, ticketId, taskId, ticket });

  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





exports.deleteTicket = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;

    await Task.updateMany(
      { tickets: ticketId },
      { $pull: { tickets: ticketId } }
    );

    await Features.updateMany(
      { Tickets: ticketId },
      { $pull: { Tickets: ticketId } }
    );

   
    // Delete the ticket
    const deletedTicket = await Tickets.findByIdAndDelete(ticketId);

    if (!deletedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Get the updated task details after ticket removal
    const task = await Task.findById(deletedTicket.TaskId)
      .populate('tickets')
      .populate('related')
      .populate({
        path: 'tickets',
        populate: [
          { path: 'ResponsibleTicket', model: 'User' },
          { path: 'Feature', model: 'Features' },
          { path: 'workflow', model: 'Workflow' },
          { path: 'Types', model: 'Types' },
          {
            path: 'associatedTickets',
            populate: [
              { 
                path: 'ticketId', 
                model: 'Tickets',
                populate: [
                  { path: 'ResponsibleTicket', model: 'User' },
                  { path: 'workflow', model: 'Workflow' }
                ]
              }
            ]
          },
          
          { path: 'votes', model: 'User' }
        ]
      });

    // Respond with the necessary data
    res.status(200).json({
      message: 'Ticket deleted successfully',
      task,
      ticketId,
      taskId: deletedTicket.TaskId,
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'An error occurred while deleting the ticket', error });
  }
};



exports.updateTicketFlag = async (req, res) => {
  try {
    const { ticketid } = req.params;

  

    const updatedTicket = await Tickets.findByIdAndUpdate(
      ticketid,
      { flag: true },
      { new: true }
    );


  
    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const task = await Task.findById(updatedTicket.TaskId).populate('tickets').populate('related').populate({
      path: 'tickets',
      populate: [
        { path: 'ResponsibleTicket', model: 'User' },
        { path: 'Feature', model: 'Features' },
        { path: 'workflow', model: 'Workflow' },
        { path: 'Types', model: 'Types' },

        {
          path: 'associatedTickets',
          populate: [
            { 
              path: 'ticketId', 
              model: 'Tickets',
              populate: [
                { path: 'ResponsibleTicket', model: 'User' },
                { path: 'workflow', model: 'Workflow' }
              ]
            }
          ]
        },
        
        { path: 'votes', model: 'User' }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const ticketId = updatedTicket._id;
    const taskId = updatedTicket.TaskId;

    // Populate the ticket object
    const ticket = await Tickets.findById(ticketId)
      .populate('ResponsibleTicket')
      
      .populate('Feature')
      .populate({
        path: 'associatedTickets',
        populate: [
          {
            path: 'ticketId',
            model: 'Tickets',
            populate: [
              {
                path: 'ResponsibleTicket',
                model: 'User'
              },
              {
                path: 'workflow',
                model: 'Workflow'
              }
            ]
          }
        ]
      })
      .populate('votes').populate({
        path: "comments",
        populate: {
          path: "commenterId",
          model: "User"
        }
      }).populate('workflow').populate('Types');

    res.status(200).json({ task, ticketId, taskId, ticket });

  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



exports.deleteticketflag = async (req, res) => {
  try {
    const { ticketid } = req.params;

  

    const flagticket = await Tickets.findByIdAndUpdate(
      ticketid,
      { flag: false },
      { new: true }
    );


  
    if (!flagticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const task = await Task.findById(flagticket.TaskId).populate('tickets').populate('related').populate({
      path: 'tickets',
      populate: [
        { path: 'ResponsibleTicket', model: 'User' },
        { path: 'Feature', model: 'Features' },
        { path: 'workflow', model: 'Workflow' },
        { path: 'Types', model: 'Types' },

        {
          path: 'associatedTickets',
          populate: [
            { 
              path: 'ticketId', 
              model: 'Tickets',
              populate: [
                { path: 'ResponsibleTicket', model: 'User' },
                { path: 'workflow', model: 'Workflow' }
              ]
            }
          ]
        },
        
        { path: 'votes', model: 'User' }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const ticketId = flagticket._id;
    const taskId = flagticket.TaskId;

    // Populate the ticket object
    const ticket = await Tickets.findById(ticketId)
      .populate('ResponsibleTicket')
      .populate('Feature')
      .populate({
        path: 'associatedTickets',
        populate: [
          {
            path: 'ticketId',
            model: 'Tickets',
            populate: [
              {
                path: 'ResponsibleTicket',
                model: 'User'
              },
              {
                path: 'workflow',
                model: 'Workflow'
              }
            ]
          }
        ]
      })
      .populate('votes').populate({
        path: "comments",
        populate: {
          path: "commenterId",
          model: "User"
        }
      }).populate('workflow').populate('Types');

    res.status(200).json({ task, ticketId, taskId, ticket });

  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



function calculateEndDate(createdAt, estimatedDuration) {
  if (!createdAt || !estimatedDuration) {
    throw new Error('Both createdAt and estimatedDuration must be provided');
  }

  let daysToAdd = 0;

  const durationParts = estimatedDuration.split(' ');

  for (let i = 0; i < durationParts.length; i += 2) {
    const durationValue = parseInt(durationParts[i]);
    const durationUnit = durationParts[i + 1].toLowerCase();

    if (durationUnit.includes('day')) {
      daysToAdd += durationValue; 
    } else if (durationUnit.includes('week')) {
      daysToAdd += durationValue * 7; 
    }
  }

  const endDate = new Date(createdAt);
  endDate.setDate(endDate.getDate() + daysToAdd); 

  return endDate;
}


exports.updateAllTicketsEtat = async (io) => {
  try {
    const tickets = await Tickets.find({ Etat: { $ne: 'DONE' } }).exec(); 
    for (const ticket of tickets) {
    
      if (ticket.createdAt && ticket.EstimatedDuration) {
        const endDate = calculateEndDate(ticket.createdAt, ticket.EstimatedDuration);
        
        if (new Date() >= endDate) {
          ticket.workflow.workflowTitle = 'DONE';
          await ticket.save();
          io.emit('ticketUpdated', ticket); 
        }
      } else {
        console.warn(`Ticket ${ticket._id} has undefined createdAt or EstimatedDuration.`);
      }
    }
  } catch (error) {
    console.error('Error updating ticket statuses:', error);
  }
};





cron.schedule('0 * * * *', async () => {
  console.log('Checking ticket statuses...');
  await updateAllTicketsEtat();
});










