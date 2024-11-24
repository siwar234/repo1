 import { combineReducers } from "redux";
import userReducer from "./user";
import equipeReducer from "./equipe";
import projectReducer from "./project";
import tasksReducer from "./tasks";
import ticketsReducer from "./tickets";
import featureReducer from "./feature"
import favouritesReducer from "./favourites"
import notificationReducer from "./notifications"
import communicationReducer from "./communicationSpace"
import workflowReducer from "./workflows";
import typesReducer from "./types"
const rootReducer = combineReducers({
  userReducer,
  equipeReducer,
  projectReducer,
  tasksReducer,
  ticketsReducer,
  featureReducer,
  favouritesReducer,
  notificationReducer,
  communicationReducer,
  workflowReducer,
  typesReducer

  
});
export default rootReducer;