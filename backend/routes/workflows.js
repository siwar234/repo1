const express = require('express');
const { getworkflows, createWorkflow } = require('../controllers/workflow');
const router = express.Router()

router.get('/getworkflows', getworkflows);


router.post('/addWorkflow',createWorkflow);


module.exports = router;
