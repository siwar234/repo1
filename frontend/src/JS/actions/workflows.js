// src/redux/actions/workflowActions.js
import axios from 'axios';
import {
  WORKFLOWS_REQUEST,
  GET_WORKFLOWS_SUCCESS,
  WORKFLOWS_FAILURE,
  ADD_WORKFLOWS_SUCCESS,

} from '../actionTypes/workflows';
import { url } from "../../ConnectionString"

export const getWorkflows = () => async (dispatch) => {
  dispatch({ type: WORKFLOWS_REQUEST });

  try {
    const response = await axios.get(`${url}/workflows/getworkflows`);  
    dispatch({
      type: GET_WORKFLOWS_SUCCESS,
      payload: response.data, 
    });

  } catch (error) {
    dispatch({
      type: WORKFLOWS_FAILURE,
      payload: error.message,
    });
  }
};



export const addWorkflow = (workflowData) => async (dispatch) => {
  dispatch({ type: WORKFLOWS_REQUEST });

  try {
    const response = await axios.post(`${url}/workflows/addWorkflow`, workflowData);  
    dispatch({
      type: ADD_WORKFLOWS_SUCCESS,
      payload: response.data, 
    });

    // Return the created workflow so it can be used directly in the calling function
    return response.data;

  } catch (error) {
    dispatch({
      type: WORKFLOWS_FAILURE,
      payload: error.message,
    });
    throw error; // Optional: rethrow error to handle it in the calling code
  }
};



