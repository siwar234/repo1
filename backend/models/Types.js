const mongoose = require('mongoose');

const TypesSchema = new mongoose.Schema({
  TypesTitle: {
    type: String,
    
  },
  TypesIcon: {
    type: String,
  },

//   workflowBackground : {
//     type: String,
//   },

  
});

const Types = mongoose.model('Types', TypesSchema);

module.exports = Types;
