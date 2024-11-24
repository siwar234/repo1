
const mongoose = require('mongoose')

const { ObjectId } = mongoose.Schema.Types


const TicketsSchema = new mongoose.Schema(
  {
    storyPoints: {
      type: String,  
      trim: true,
    },
    
    identifiant: {
      type: String,  
      trim: true,
    },

    Description: {
        type: String,
        trim: true,
    
      },
      
      EstimatedDuration: {
        type: String,
      },

   
      
      descriptionticket: {
        imageD: [{
          type: String,
          trim: true,
        }],
        descriptionText: {
          type: String,
          trim: true,
        }
      },
      
      CoverImage: [{
        colorimage: {
          type: String,
          trim: true,
        },
        size :{
          type: String,
          trim: true,
        }
    }],
    position: {
      type: Number,
     
    },
     
      
      ResponsibleTicket : { type: ObjectId, ref: 'User' },

      comments: [{
        commenterId: {
          type: ObjectId,
          ref: 'User'
        },
        comment: {
          type: String
        },
        createdAt: {
          type: Date,
          default: Date.now
        },
        updatedAt: {
          type: Date,
          default: Date.now
        }
      }],

      associatedTickets: [{
        ticketId: {
          type: ObjectId,
          ref: 'Tickets',
        },
        relation: {
          type: String,
          enum: ['is blocked by', 'blocks',`cloned by`], 
        }
      }],

      childTickets: [{
        TicketId: {
          type: ObjectId,
          ref: 'Tickets',
        },
      
    
      }],

    projectId:
    { type: ObjectId, ref: 'Project' },

      TaskId:
        { type: ObjectId, ref: 'Tasks' },

        workflow : 
          { type: ObjectId, ref: 'Workflow' },

          Types : 
          { type: ObjectId, ref: 'Types' },

      
          
          votes: [{
            type: ObjectId,
            ref: 'User' 
          }],

        flag :   { type: Boolean },

        
      //   Type :{
      //     type: String,
      //     trim: true,
      //     default:"story"
      // },

      User :{ type: mongoose.Schema.Types.ObjectId,ref: 'User'},

  


   Feature: { type: mongoose.Schema.Types.ObjectId, ref: 'Features' },

      
       
        Priority :{type: String,
          default:"Low",
        trim: true,}
            


    
   
    }, { timestamps: true });

    
  
 
  
  module.exports = mongoose.model("Tickets", TicketsSchema)
  
