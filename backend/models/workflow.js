const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  workflowTitle: {
    type: String,
    
  },
  workflowColor: {
    type: String,
  },

  workflowBackground : {
    type: String,
  },

  
});

const Workflow = mongoose.model('Workflow', workflowSchema);

module.exports = Workflow;
