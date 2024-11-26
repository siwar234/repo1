const mongoose = require('mongoose');
const Role = require('../models/role');
const Workflow=require("../models/workflow");
const Types = require('../models/Types');



async function seedWorkflows() {
    try {
      // Check if there are any workflows in the database already
      const existingWorkflows = await Workflow.find();
  
      if (existingWorkflows.length === 0) {
        const workflows = [
          { workflowTitle: 'TO DO', workflowColor: '#5d87ff' },
          { workflowTitle: 'IN_PROGRESS', workflowColor: 'rgb(107 107 107)' },
          { workflowTitle: 'DONE', workflowColor: 'rgb(12 119 26)' }
        ];
  
        // Create the workflows
        await Workflow.insertMany(workflows);
        // console.log("Workflows seeded successfully.");
      } else {
        // console.log("Workflows already exist in the database.");
      }
    } catch (error) {
      // console.error("Error seeding workflows:", error);
    }
  }
  


  async function seedTypes() {
    try {
      const existingTypes = await Types.find();
  
      if (existingTypes.length === 0) {
        const Type = [
          { TypesTitle: 'story'},
          { TypesTitle: 'Bug' },
          { TypesTitle: 'Task' },
          { TypesTitle: 'subTask' },

          
        ];
  
        // Create the workflows
        await Types.insertMany(Type);
        // console.log("Type seeded successfully.");
      } else {
        // console.log("Type already exist in the database.");
      }
    } catch (error) {
      // console.error("Error seeding Type:", error);
    }
  }
  

// Roles
function initialRole() {
    Role.estimatedDocumentCount()
        .then((count) => {
            if (count === 0) {
                return Promise.all([
                    new Role({ name: 'admin' }).save(),
                    new Role({ name: 'user' }).save(),
                ]);
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    initialRole();
    seedWorkflows()
    seedTypes()
}).catch((err) => {
    console.log(err);
});

module.exports = mongoose;
