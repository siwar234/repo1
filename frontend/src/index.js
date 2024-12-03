import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { store } from "./JS/store/store";
import { Provider } from "react-redux";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Spinner from 'react-bootstrap/Spinner';

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <React.Suspense fallback={<div><Spinner animation="border"  style={{width:'500px',height:"800px"}}/></div>}>
        <App />
        
      </React.Suspense>
      </HashRouter>
          <ToastContainer /> 
  </Provider>,
  document.getElementById('root')
);
