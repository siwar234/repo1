import axios from 'axios';
import {
 
  LOAD_TICKETS,
  FAIL_TICKETS,
  GET_TICKETS_SUCCESS,
  UPDATE_TIKCET_SUCCESS,
  DELETE_TICKETS_SUCCESS,
  GET_ALLTICKETS_SUCCESS,
  UPDATE_POSITION_SUCCESS,
  
  
  
} from '../actionTypes/tickets';
import {
 
  CREATE_TICKETS_SUCCESS,
  UPDATE_TIKCETS_SUCCESS,
  FAIL_TASKS,
  UPDATE_TIKCETSFEATURE_SUCCESS,
  UPDATE_TIKCETSIMAGES_SUCCESS,
  VOTE_TICKET,
  DELETE_VOTE,
  ADD_COMMENT,
  DELETE_COMMENT,
  UPDATE_COMMENT,
  DELETE_TICKETS_FLAG_SUCCESS,
  UPDATE_TIKCETS_FLAG_SUCCESS,
  ASSOCIATE_TICKETS_SUCCESS,
  ASSOCIATE_TICKETS_FAILURE,
 
  FILTER_TICKETS_BY_PERSON_REQUEST,
  FILTER_TICKETS_BY_PERSON_SUCCESS,
  FILTER_TICKETS_BY_PERSON_FAILURE,
  GET_CHILD_ICKETS_SUCCESS,
  GET_ASSOCIATE_ICKETS_SUCCESS
  
} from '../actionTypes/tasks';
import { toast } from 'react-toastify';
import {  getTasks, updateSecondGrid } from './tasks';
import { getAllFeatures } from './feature';
import io from 'socket.io-client';
import { url,httpUrl } from "../../ConnectionString"

const socket = io(`${httpUrl}`);


export const getListTicketsByproject = (projectId) => async (dispatch, getState) => {
  dispatch({ type: LOAD_TICKETS });

  try {
    const response = await axios.get(`${url}/tickets/getlisticketsbyproject/${projectId}`);
    dispatch({ type: GET_TICKETS_SUCCESS, payload: { tickets: response.data } });

   
  } catch (error) {
    dispatch({ type: FAIL_TICKETS, payload: error.message });
  }
};


export const getallticket = (id) => async (dispatch, getState) => {
  dispatch({ type: LOAD_TICKETS });

  try {
    const response = await axios.get(`${url}/tickets/getalltickets/${id}`);
    dispatch({ type: GET_ALLTICKETS_SUCCESS, payload: { alltickets: response.data } });

    
  } catch (error) {
    dispatch({ type: FAIL_TICKETS, payload: error.message });
  }
};

export const createTickets = (ticketsData,projectId) => async (dispatch, getState) => {

  try {
    const response = await axios.post(`${url}/tickets/createtickets`, ticketsData);
    dispatch({ type: CREATE_TICKETS_SUCCESS, payload: response.data });
    
    
    dispatch(getTasks(projectId))
    
    toast.success("Your Ticket is created");
  } catch (error) {
    dispatch({ type: FAIL_TASKS, payload: error.message });
  }
};



//add childtickets

// export const addchildTicket = (ticketsData,projectId) => async (dispatch, getState) => {

//   try {
//     const response = await axios.post(`${url}/tickets/createchildTickets`, ticketsData);
//     dispatch({ type: CREATE_TICKETS_SUCCESS, payload: response.data });
    
    
//     dispatch(getTasks(projectId))
    
//     toast.success("Your childTicket is created");
//   } catch (error) {
//     dispatch({ type: FAIL_TASKS, payload: error.message });
//   }
// };

export const updatetickets = (projectId, userId, id, ticketsData) => async (dispatch, getState) => {
  try {
    const response = await axios.put(`${url}/tickets/Updatetickets/${id}`, {
      ...ticketsData,
      User: userId
    });
    const { task, ticketId, taskid, ticket } = response.data;

    dispatch({
      type: UPDATE_TIKCETS_SUCCESS,
      payload: { task, ticketId, taskid, ticket },
    });

    if (ticketsData.ResponsibleTicket) {
      socket.emit('ticketnotification', response.data);
    }
    const isSecondGridOpen = getState().tasksReducer.isSecondGridOpen[taskid];
    if (isSecondGridOpen) {
      dispatch(updateSecondGrid(ticketId, taskid, ticket));
    }

    toast.success("Your Ticket is updated");
    dispatch(getallticket(userId));
    dispatch(getAllFeatures(projectId));
  } catch (error) {
    dispatch({
      type: FAIL_TASKS,
      payload: error.response?.data?.message || 'An error occurred',
    });
  }
};



export const updateTicketPosition = (ticketId, updatedData,projectid) => async (dispatch) => {
  try {
    const response = await axios.put(`${url}/tickets/updatepositon/${ticketId}`, updatedData);
    dispatch({ type: UPDATE_POSITION_SUCCESS, payload: response.data });
    // toast.success("postion update");
    dispatch(getListTicketsByproject(projectid))


  } catch (error) {
  }
};


export const updateticketsimages = (id, ticketsdata) => async (dispatch) => {
  try {
    const response = await axios.put(`${url}/tickets/updateticketsimages/${id}`, ticketsdata);
    
    const { ticketId, taskId, ticket } = response.data;

    dispatch({
      type: UPDATE_TIKCETSIMAGES_SUCCESS,
      payload: response.data,
    });

    dispatch(updateSecondGrid(ticketId, taskId, ticket)); 
    toast.success("Your Ticket feature is updated");
  } catch (error) {
    dispatch({
      type: FAIL_TASKS,
      payload: error.response.data.message, 
    });
  }
}

export const associateTickets = (ticketId, associatedTicketIds, relation, projectId) => async (dispatch) => {
  try {
    const response = await axios.post(`${url}/tickets/associateticket`, {
      ticketId,
      associatedTicketIds,
      relation
    });


    const {  taskId, ticket } = response.data;

    dispatch({
      type: ASSOCIATE_TICKETS_SUCCESS,
      payload: response.data.task
    });

    dispatch(updateSecondGrid(ticketId, taskId, ticket));
    dispatch(getTasks(projectId));
    toast.success("Your Ticket feature is associated");

  } catch (error) {
    dispatch({
      type: ASSOCIATE_TICKETS_FAILURE,
      payload: error.response ? error.response.data : error.message
    });
  }
};



export const dissociateTicket = (ticketId, associatedTicketId,projectId) => async (dispatch) => {
  try {

    const response  = await axios.post(`${url}/tickets/dissociateticket`, { ticketId, associatedTicketId });
    const { taskId, ticket } = response.data;

    // dispatch({
    //   type: DISSOCIATE_TICKET_SUCCESS,
    //   payload: response.data
    // });
    
    dispatch(updateSecondGrid(ticketId, taskId, ticket)); 
    dispatch(getTasks(projectId));

    toast.success("Your Ticket feature is dissociated");

  } catch (error) {
    // console.log(error)
    // dispatch({
    //   type: DISSOCIATE_TICKET_FAILURE,
    //   payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    // });
  }
};


export const updatingtickets = (projectid,id, ticketsData) => async (dispatch) => {
  try {
    const response = await axios.put(`${url}/tickets/updateticket/${id}`, ticketsData);
    dispatch({
      type: UPDATE_TIKCET_SUCCESS,
      payload: response.data,
    });
    dispatch(getListTicketsByproject(projectid))
    toast.success("Your Ticket is updated");

   
  } catch (error) {
    dispatch({
      type: FAIL_TASKS,
      payload: error.response.data.message, 
    });
  }
}

export const addCommentToTicket = (projectId,ticketid, commenterId,commentText) => async (dispatch) => {
  try {
    const response = await axios.post(`${url}/tickets/addcomment/${ticketid}`,{ commenterId,commentText });
    const {ticketId, taskid, ticketcomment} = response.data;

    dispatch({
      type: ADD_COMMENT,
      payload: response.data, 
    });
      socket.emit('feedbacknotification', response.data);
    
    dispatch(updateSecondGrid(ticketId, taskid, ticketcomment)); 
    dispatch(getTasks(projectId))
    dispatch(getListTicketsByproject(projectId));

    
  } catch (error) {
    dispatch({
      type: FAIL_TASKS,
      payload: error.response.data.message,
    });
  }
};



// Action to filter tickets by person
export const filterTicketsByPerson = (projectId, person) => async (dispatch) => {
  try {
    dispatch({ type: FILTER_TICKETS_BY_PERSON_REQUEST });

    const { data } = await axios.get(`${url}/tickets/filter/${projectId}/${person}`);

    dispatch({
      type: FILTER_TICKETS_BY_PERSON_SUCCESS,
      payload: data,  
    });
  } catch (error) {
    dispatch({
      type: FILTER_TICKETS_BY_PERSON_FAILURE,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};







export const updateticketsFeature = (projectId, id, ticketsData) => async (dispatch, getState) => {
  try {
    const response = await axios.put(`${url}/tickets/Updateticketsfeature/${id}`, ticketsData);
    const { ticketId, taskid, ticketfeature } = response.data;
    
    dispatch({
      type: UPDATE_TIKCETSFEATURE_SUCCESS,
      payload: response.data,
    });
  
    const isSecondGridOpen = getState().tasksReducer.isSecondGridOpen[taskid];
    if (isSecondGridOpen) {
      dispatch(updateSecondGrid(ticketId, taskid, ticketfeature));
    }
  
    dispatch(getTasks(projectId));
    dispatch(getAllFeatures(projectId));
    
    toast.success("Your Ticket feature is updated");
    
  } catch (error) {
    dispatch({
      type: FAIL_TASKS,
      payload: error.response.data.message, 
    });
  }
}

export const deleteCommentFromTicket = (ticketid, commentId, commenterId) => async (dispatch) => {
  try {
    const response = await axios.delete(`${url}/tickets/deleteComment/${ticketid}/${commentId}/${commenterId}`);

    const {ticketId, taskId, ticket } = response.data;

    dispatch({
      type: DELETE_COMMENT,
      payload: response.data,
    });

    dispatch(updateSecondGrid(ticketId, taskId, ticket)); 

    // toast.success("Comment deleted successfully");
  } catch (error) {
    dispatch({
      type: FAIL_TASKS,
      payload: error.response.data.message, 
    });
  }
};


export const updateComment = (ticketid, commentId, commenterId, updatedCommentText) => async (dispatch) => {
  try {
    const response = await axios.put(`${url}/tickets/updateComment/${ticketid}/${commentId}`, {
      commenterId,
      updatedCommentText,
    });
    const {ticketId, taskId, ticket } = response.data;

    dispatch({
      type: UPDATE_COMMENT,
      payload: response.data,
    });

    dispatch(updateSecondGrid(ticketId, taskId, ticket)); 

    toast.success("Comment updated successfully");
  } catch (error) {
    dispatch({
      type: FAIL_TASKS,
      payload: error.response.data.message,
    });
  }
};



export const deleteVoteFromTicket = (ticketid,voterId) => async (dispatch) => {
  try {
    const response = await axios.delete(`${url}/tickets/deleteVote/${ticketid}/${voterId}`);

   
    const { ticketId,taskId, ticket } = response.data;

    dispatch({
      type: DELETE_VOTE,
      payload: response.data,
    });

    dispatch(updateSecondGrid(ticketId, taskId, ticket)); 

    toast.success("Your vote has been deleted successfully");
  } catch (error) {
    dispatch({
      type: FAIL_TASKS,
      payload: error.response.data.message, 
    });
  }
};



export const addVoteToTicket = (ticketid, voterId) => async (dispatch) => {
  try {
    const response = await axios.post(`${url}/tickets/${ticketid}/vote`, { voterId });
   
    const {taskId,ticketId, ticket} = response.data;
    
    dispatch({
      type: VOTE_TICKET,
      payload: response.data,
    });

    dispatch(updateSecondGrid(ticketId, taskId, ticket)); 

    toast.success("Your vote has been added successfully");
  } catch (error) {
    dispatch({
      type: FAIL_TASKS,
      payload: error.response.data.message, 
    });
  }
};





export const updateticketsflag = (projectId,ticketid) => async (dispatch) => {
  try {
    const response = await axios.put(`${url}/tickets/updateTicketFlag/${ticketid}`);
    
    const { ticketId, taskId, ticket } = response.data;

    dispatch({
      type: UPDATE_TIKCETS_FLAG_SUCCESS,
      payload: response.data,
    });

    dispatch(updateSecondGrid(ticketId, taskId, ticket)); 
    dispatch(getTasks(projectId))
    toast.success("Your Ticket feature is updated");
  } catch (error) {
    dispatch({
      type: FAIL_TASKS,
      payload: error.response.data.message, 
    });
  }
}


export const deleteticketsflag = (projectId,ticketid) => async (dispatch) => {
  dispatch({ type: LOAD_TICKETS });

try {
  const response =await axios.delete(`${url}/tickets/deleteTicketFlag/${ticketid}`);
    const { ticketId, taskId, ticket } = response.data;

    dispatch({ type: DELETE_TICKETS_FLAG_SUCCESS, payload: ticketid });


    dispatch(updateSecondGrid(ticketId, taskId, ticket)); 
    dispatch(getListTicketsByproject(projectId))


  } catch (error) {
    dispatch({ type: FAIL_TICKETS, payload: error.response.data });
  }
};


export const deletetickets = (ticketId,projectId) => async (dispatch) => {
  dispatch({ type: LOAD_TICKETS });
try {
    await axios.delete(`${url}/tickets/deleteticket/${ticketId}`);
    dispatch({ type: DELETE_TICKETS_SUCCESS, payload: ticketId });
    dispatch(getTasks(projectId))
  } catch (error) {
    dispatch({ type: FAIL_TICKETS, payload: error.response.data });
  }
};


export const deleteImage = (ticketId, imageIndex,projectId) => async (dispatch) => {

  try {
    const response = await fetch(`${url}/tickets/${ticketId}/images/${imageIndex}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // dispatch({ type: DELETE_IMAGE, payload: response.data });

    dispatch(getListTicketsByproject(projectId))

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }

   
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};



// child tickets

export const addchildTicket = (ticketsData,projectId) => async (dispatch) => {

  try {
    const response = await axios.post(`${url}/tickets/createchildTickets`, ticketsData);
    // dispatch({ type: CREATE_CHILD_ICKETS_SUCCESS, payload: response.data });
    const { ticketId, taskId, ticket } = response.data;

    dispatch(updateSecondGrid(ticketId, taskId, ticket));

    dispatch(getTasks(projectId))
    dispatch(getChildTicket(ticketId))

    toast.success("Your childTicket is created");
  } catch (error) {
    dispatch({ type: FAIL_TASKS, payload: error.message });
  }
};


export const getChildTicket = (TicketId) => async (dispatch) => {

  try {
    const response = await axios.get(`${url}/tickets/getchildTickets/${TicketId}`);
    dispatch({ type: GET_CHILD_ICKETS_SUCCESS, payload: response.data });
    const {  taskId, ticket } = response.data;

    dispatch(updateSecondGrid(TicketId, taskId, ticket));

    
  } catch (error) {
    dispatch({ type: FAIL_TASKS, payload: error.message });
  }
};



/// get associate tickets
export const getassociateTicket = (TicketId) => async (dispatch) => {

  try {
    const response = await axios.get(`${url}/tickets/getassociateTickets/${TicketId}`);
    dispatch({ type: GET_ASSOCIATE_ICKETS_SUCCESS, payload: response.data });
    const { ticketId, taskId, ticket } = response.data;

    dispatch(updateSecondGrid(ticketId, taskId, ticket));

    
  } catch (error) {
    dispatch({ type: FAIL_TASKS, payload: error.message });
  }
};






