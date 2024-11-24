const mongoose = require("mongoose");
const Workflow=require('../models/workflow');

exports.createWorkflow = async (req, res) => {
    const { workflowTitle,workflowColor,workflowBackground} = req.body;
  
    try {
     
  
      const newWorkflow = new Workflow({
        workflowTitle: workflowTitle,
        workflowColor: workflowColor,
        workflowBackground:workflowBackground
       
      });
  
      const savedworkflow = await newWorkflow.save();
  
      const workflows = await Workflow.find();

      
  
      res.status(201).json(workflows);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Error creating post' });
    }
  };

  exports.getworkflows = async (req, res) => {
    try {
      const workflows = await Workflow.find();
      res.json(workflows); 
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch workflows' });
    }
  };