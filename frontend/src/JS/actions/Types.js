
import { url } from "../../ConnectionString"
import axios from 'axios';
import {
    TYPES_REQUEST,
    GET_TYPES_SUCCESS,
    TYPES_FAILURE,
    ADD_TYPE_SUCCESS


} from '../actionTypes/Types';

export const getTypes = () => async (dispatch) => {
    dispatch({ type: TYPES_REQUEST });
  
    try {
      const response = await axios.get(`${url}/types/gettypes`);  
      dispatch({
        type: GET_TYPES_SUCCESS,
        payload: response.data, 
      });
  
    } catch (error) {
      dispatch({
        type: TYPES_FAILURE,
        payload: error.message,
      });
    }
  };


  
export const addType = (workflowData) => async (dispatch) => {
  dispatch({ type: TYPES_REQUEST });

  try {
    const response = await axios.post(`${url}/types/addtypes`, workflowData);  
    dispatch({
      type: ADD_TYPE_SUCCESS,
      payload: response.data, 
    });

    // Return the created workflow so it can be used directly in the calling function
    return response.data;

  } catch (error) {
    dispatch({
      type: TYPES_FAILURE,
      payload: error.message,
    });
    throw error; // Optional: rethrow error to handle it in the calling code
  }
};
