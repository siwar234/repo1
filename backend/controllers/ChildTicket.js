const Workflow=require("../models/workflow")
const Type = require("../models/Types");
const ChildTickets=require ("../models/ChildTicket")
// const mongoose = require("mongoose");
const Tickets=require('../models/Tickets');
const Task = require('../models/Tasks');


// add a child ticket


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

exports.addchildTicket = async (req, res) => {
    try {
      const {
        ticketId,
        ChildTicketDescription,
        Priority,
        flag,
        projectId,
        storyPoints,
      } = req.body;
  
      if (!ChildTicketDescription) {
        return res.status(400).json({ error: 'Description is required' });
      }
  
      const randomString = await generateTicketId(projectId);
  
      const todoWorkflow = await Workflow.findOne({ workflowTitle: 'TO DO' });
      if (!todoWorkflow) {
        return res.status(500).json({ error: 'Default workflow not found' });
      }
  
      if (!ticketId) {
        return res.status(400).json({ message: 'Invalid request data' });
      }

      const subTaskType = await Type.findOne({ TypesTitle: 'subTask' });
      if (!subTaskType) {
        return res.status(500).json({ error: 'Default subTaskType not found' });
      }
  
      
      // Create child ticket object
      const tickets = new ChildTickets({
        ChildTicketidentifiant: randomString,
        ticketId:ticketId,
        Priority,
        flag: flag || false,
        ChildTicketDescription,
        projectId,
        identifiant: randomString,
        workflow: todoWorkflow._id, 
        storyPoints: storyPoints || null,
        Type:subTaskType._id
      });
  
      const child = await tickets.save(); 
  
      // Populate the saved child ticket
      const populatedChild = await ChildTickets.findById(child._id)
        .populate('votes')
        .populate({
          path: 'comments',
          populate: { path: 'commenterId', model: 'User' },
        })
       
        .populate('workflow')
  
      // Update the parent ticket
      const parentticket= await Tickets.findByIdAndUpdate(ticketId, {
        $push: { childTickets: populatedChild._id },
      }) .populate('ResponsibleTicket')
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
      .populate({
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
                  populate: { path: 'ResponsibleTicket', model: 'User' },
                },
              ],
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
        ticketId,
      });
    } catch (error) {
      console.error('Error creating tickets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };




  exports.getListchildTicketsByTicket= async (req, res) => {
    try {
      const TicketId = req.params.TicketId;
      
      const childtickets = await ChildTickets.find({ ticketId: TicketId }).populate('votes')
      .populate({
        path: 'comments',
        populate: { path: 'commenterId', model: 'User' },
      })
      

      .populate('workflow').populate('Type');


      const parentticket= await Tickets.findById(TicketId)
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
      .populate({
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
                  populate: [
                    { path: 'ResponsibleTicket', model: 'User' },
                    { path: 'workflow', model: 'Workflow' }
                  ]
                }
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
        childtickets
      });
        } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };
