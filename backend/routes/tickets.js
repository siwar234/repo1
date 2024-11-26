const express = require('express');
const { createTickets, getListTicketsBytasks, updateTicketPosition,updatedtickets,getListTicketsByproject, updateTicket, updateTicketfeature, deleteTicket,
     getalltickets, updateTicketimages, addVote, 
     deleteVote, addComment, deleteComment, updateComment, 
     updateTicketFlag, deleteticketflag, deleteimage,
       FilterTicketsPerPerson } = require('../controllers/Tickets');
const router = express.Router()


const Feature = require('../models/Features');
const Ticket = require('../models/Tickets');
const Task = require('../models/Tasks');
const {addchildTicket, getListchildTicketsByTicket } = require('../controllers/ChildTicket');
const { associateTicket, dissociateTicket, getListassociateTicketsByTicket } = require('../controllers/associatedTickets');



// router.post("/createTickets/:id" , createTickets)
router.post("/createTickets" , createTickets)



router.get('/filter/:projectId/:person', FilterTicketsPerPerson);

//associate tickets
router.post('/associateticket', associateTicket); 
router.post('/dissociateticket', dissociateTicket);
router.get("/getassociateTickets/:TicketId",getListassociateTicketsByTicket)

///

router.get("/getlistickets/:TaskId",getListTicketsBytasks)

router.get("/getlisticketsbyproject/:projectId",getListTicketsByproject)

router.put('/Updatetickets/:id', updateTicket);
router.put('/updateticket/:id', updatedtickets);


router.get("/getalltickets/:id",getalltickets)

router.put('/Updateticketsfeature/:id', updateTicketfeature);
//flag
router.put('/updateTicketFlag/:ticketid', updateTicketFlag);
router.delete('/deleteTicketFlag/:ticketid', deleteticketflag)
 
router.delete('/deleteticket/:ticketId', deleteTicket)


router.put('/updateticketsimages/:id', updateTicketimages);

router.post('/:ticketid/vote', addVote);

router.post('/addcomment/:ticketid', addComment);

router.delete('/deleteVote/:ticketid/:voterId', deleteVote)

router.delete('/deleteComment/:ticketid/:commentId/:commenterId', deleteComment);
router.put('/updateComment/:ticketid/:commentId', updateComment);
router.put('/updatepositon/:ticketId',updateTicketPosition)

router.delete('/:ticketId/images/:imageIndex',deleteimage)


//ticket child
router.post("/createchildTickets" , addchildTicket)
 
router.get("/getchildTickets/:TicketId",getListchildTicketsByTicket)


module.exports = router;



