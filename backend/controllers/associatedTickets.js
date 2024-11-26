const Tickets=require('../models/Tickets');
const Task = require('../models/Tasks');
const mongoose = require("mongoose");

AssociateTicket=require("../models/associatedTickets")



//tickets association 

exports.associateTicket = async (req, res) => {
  const { ticketId, associatedTicketIds, relation } = req.body;
  try {

    if (!ticketId || !Array.isArray(associatedTicketIds) || !relation) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ message: 'Invalid main ticket ID' });
    }

    for (const id of associatedTicketIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid associated ticket ID' });
      }
    }

    // Find and update the main ticket
    let ticket = await Tickets.findById(ticketId)
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
      }).populate({
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
      })
      .populate('workflow').populate('Types');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Create associated ticket objects without inverse relation
    const associatedTicketObjects = associatedTicketIds.map(id => ({
      ticketId: id,
      relation: relation
    }));

    // Add associated tickets to the main ticket
    ticket.associatedTickets.push(...associatedTicketObjects);

    // Save the main ticket with associated tickets
    await ticket.save();

    // Determine the inverse relation only for the main ticket update
    let inverseRelation;
    switch (relation) {
      case 'is blocked by':
        inverseRelation = 'blocks';
        break;
      case 'blocks':
        inverseRelation = 'is blocked by';
        break;
      case 'is cloned by':
        inverseRelation = 'clones';
        break;
      case 'clones':
        inverseRelation = 'is cloned by';
        break;
      case 'is duplicated by':
        inverseRelation = 'duplicates';
        break;
      case 'duplicates':
        inverseRelation = 'is duplicated by';
        break;
      case 'is caused by':
        inverseRelation = 'causes';
        break;
      case 'causes':
        inverseRelation = 'is caused by';
        break;
      
      default:
        inverseRelation = relation;
    }

    // Update associated tickets in the associated tickets array for both the main ticket and the associated tickets
    await Tickets.updateMany(
      { _id: { $in: associatedTicketIds } },
      { $addToSet: { associatedTickets: { ticketId: ticketId, relation: inverseRelation } } }
    );

    // Re-populate the ticket data to send a response
    ticket = await Tickets.findById(ticketId)
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
              { path: 'ResponsibleTicket', model: 'User' },
              { path: 'workflow', model: 'Workflow' }
            ]
          }
        ]
      }).populate('workflow').populate('Types');

    const task = await Task.findById(ticket.TaskId)
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
              { path: 'ticketId', model: 'Tickets' },
              { path: 'ResponsibleTicket', model: 'User' },
              { path: 'workflow', model: 'Workflow' }
            ]
          },
          {
            path: 'childTickets',
            populate: [
              { path: 'ticketId', model: 'Tickets' }
            ],
          },
          { path: 'votes', model: 'User' }
        ]
      });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const taskId = task._id;
    res.status(200).json({ task, taskId, ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



  
  
  
  
  exports.dissociateTicket = async (req, res) => {
    const { ticketId, associatedTicketId } = req.body;
  
    try {
      if (!ticketId || !associatedTicketId) {
        return res.status(400).json({ message: 'Invalid request data' });
      }
  
      if (!mongoose.Types.ObjectId.isValid(ticketId) || !mongoose.Types.ObjectId.isValid(associatedTicketId)) {
        return res.status(400).json({ message: 'Invalid ticket ID(s)' });
      }
  
      // Find the main ticket
      let ticket = await Tickets.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Main ticket not found' });
      }
  
      console.log('Main ticket found:', ticketId);
  
      // Remove the associated ticket reference from the main ticket's associatedTickets array
      ticket.associatedTickets = ticket.associatedTickets.filter(
        (assocTicket) => assocTicket.ticketId.toString() !== associatedTicketId
      );
  
      await ticket.save();
  
     
       await Tickets.updateMany(
        { 'associatedTickets.ticketId': ticketId },
        { $pull: { associatedTickets: { ticketId: ticketId } } }
      );
  
        ticket = await Tickets.findById(ticketId)
        .populate('ResponsibleTicket')
        .populate('Feature')
        .populate('User')
        .populate('votes')
        .populate({
          path: 'comments',
          populate: {
            path: 'commenterId',
            model: 'User',
          },
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
        }).populate('Workflow').populate("Types");
  
      const task = await Task.findById(ticket.TaskId)
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
            { path: 'votes', model: 'User' },
          ],
        });
  
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
  
      res.status(200).json({ task, taskId: task._id, ticket });
    } catch (error) {
      console.error('Error during dissociation:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };


  exports.getListassociateTicketsByTicket= async (req, res) => {
    try {
      const TicketId = req.params.TicketId;
      
      const associatetickets = await AssociateTicket.find({ ticketId: TicketId }).populate('votes')
      .populate({
        path: 'comments',
        populate: { path: 'commenterId', model: 'User' },
      })
     
      .populate('workflow');


      const parentticket= await Tickets.findById(TicketId)
      .populate('ResponsibleTicket')
      .populate('Feature')
      .populate('votes').populate({
        path: "comments",
        populate: {
          path: "commenterId",
          model: "User"
        }
      }).populate({
        path: 'associatedTickets',
        populate: [
          {
            path: 'ticketId',
            model: 'Tickets',
           
          },
          { path: 'ResponsibleTicket', model: 'User' },
          { path: 'workflow', model: 'Workflow' } 
        ]
      }).populate({
        path: 'childTickets',
        populate: [
          {
            path: 'ticketId',
            model: 'Tickets',
            
          }
        ]
      })
      .populate('workflow').populate('Types');

      const task = await Task.findById(parentticket.TaskId)
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
                
                },
                ,
                { path: 'ResponsibleTicket', model: 'User' },
                { path: 'workflow', model: 'Workflow' } 
              ]
            },
            {
                path: 'childTickets',
                populate: [
                  {
                    path: 'ticketId',
                    model: 'Tickets',
                  },
                ],
              },

           
            { path: 'votes', model: 'User' },
          ],
        });
  
      const taskId = task?._id;
   
      
  
      res.status(201).json({
        ticket:parentticket,
        task,
        taskId,
        TicketId,
        associatetickets
      });
        } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  
  