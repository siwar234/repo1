
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { ObjectId } = mongoose.Schema.Types


const equipeSchema = new mongoose.Schema(
  {
    NameEquipe: {
      type: String,
      trim: true,
      index: true
  
    },
    
    description: {
      type: String,
      trim: true,
  
    },
    
        owner:{type:ObjectId,ref:'User'},

     

   members:  {     
    type: [
     {
      memberId:{type:ObjectId,ref:'User'},      
     }
   ],
 },

 links: [
  {
    webAddress: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/\S+/.test(v);
        },
        message: (props) => `${props.value} is not a valid web address!`,
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
],

   emails: [{
    email: {
      type: String,
      validate: {
        validator: function(v) {
          return /\S+@\S+\.\S+/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`
      }
    },
    
  }]
   
   
    }, { timestamps: true });

    
  
 
  
  module.exports = mongoose.model("Equipe", equipeSchema)
  
