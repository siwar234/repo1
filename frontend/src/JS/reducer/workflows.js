// src/redux/reducers/workflowReducer.js
import {
    WORKFLOWS_REQUEST,
    GET_WORKFLOWS_SUCCESS,
    ADD_WORKFLOWS_SUCCESS,
    WORKFLOWS_FAILURE  } from '../actionTypes/workflows';
  
  const initialState = {
    workflows: [],
    loading: false,
    error: null,
  };
  
  const workflowReducer = (state = initialState, { type, payload }) => {

    switch (type) {

      //get workflow
      case WORKFLOWS_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
        };
      case GET_WORKFLOWS_SUCCESS:
        return {
          ...state,
          loading: false,
          workflows: payload,
        };
      case WORKFLOWS_FAILURE:
        return {
          ...state,
          loading: false,
          error: payload,
        };

//add workflow
        

          case  ADD_WORKFLOWS_SUCCESS :
          return { 
    
           ...state,
           loading: false,
           workflows: payload,
         };




        


      default:
        return state;



      

    }
  };
  
  export default workflowReducer;
  