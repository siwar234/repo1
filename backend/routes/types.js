const express = require('express');
const router = express.Router()
const { getTypes, createTypes } = require('../controllers/Types');


router.get('/gettypes', getTypes);
router.post('/addtypes', createTypes);


module.exports = router;
