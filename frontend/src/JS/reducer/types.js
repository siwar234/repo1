// src/redux/reducers/workflowReducer.js
import {
    TYPES_REQUEST,
    GET_TYPES_SUCCESS,
    TYPES_FAILURE,
    ADD_TYPE_SUCCESS
    } from '../actionTypes/Types';
  
  const initialState = {
    types: [],
    loading: false,
    error: null,
  };
  
  const typesReducer = (state = initialState, { type, payload }) => {

    switch (type) {

      //get workflow
      case TYPES_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
        };
      case GET_TYPES_SUCCESS:
        return {
          ...state,
          loading: false,
          types: payload,
        };
      case TYPES_FAILURE:
        return {
          ...state,
          loading: false,
          error: payload,
        };

        case ADD_TYPE_SUCCESS :
       
          return {
            ...state,
            loading: false,
            types: payload,
          };

        

    




        


      default:
        return state;



      

    }
  };
  
  export default typesReducer;
  