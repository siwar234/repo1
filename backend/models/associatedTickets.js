
const mongoose = require('mongoose')

const { ObjectId } = mongoose.Schema.Types


const associatedTicketsSchema = new mongoose.Schema(
  {
    associatedTicketsstoryPoints: {
      type: String,  
      trim: true,
    },

    ticketId :{ type: mongoose.Schema.Types.ObjectId,ref: 'Tickets'},
    
    associatedTicketsidentifiant: {
      type: String,  
      trim: true,
    },

    associatedTicketsDescription: {
        type: String,
        trim: true,
    
      },
      
      mainTicket: { type: mongoose.Schema.Types.ObjectId, ref: 'Tickets' },

      relation: String, 
      
      
      associatedTicketsdescriptionticket: {
        imageD: [{
          type: String,
          trim: true,
        }],
        descriptionText: {
          type: String,
          trim: true,
        }
      },
      
     
    position: {
      type: Number,
     
    },
     
      

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

     

      

    projectId:
    { type: ObjectId, ref: 'Project' },

    

        workflow : 
          { type: ObjectId, ref: 'Workflow' },

      
          // Type: [{
          //   typetitle:{ type: String ,   default:"subTask"},
          //   typeIcon:{ type: String, }
            
          // }],


          votes: [{
            type: ObjectId,
            ref: 'User' 
          }],

        flag :   { type: Boolean },

       


  


//    Feature: { type: mongoose.Schema.Types.ObjectId, ref: 'Features' },

      
       
        Priority :{type: String,
          default:"Low",
        trim: true,}
            


    
   
    }, { timestamps: true });

    
  
 
  
  module.exports = mongoose.model("associatedTickets", associatedTicketsSchema)
  
