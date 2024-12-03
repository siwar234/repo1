// JoinTeamPage.js

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addtoteam } from "../../JS/actions/equipe";

function JoinTeam() {
  const location = useLocation();
  const navigate = useNavigate();
  const hash = window.location.hash;

  const string = hash.split('?')[1];
  const searchparams = new URLSearchParams(string);

  const tokenn = searchparams.get('token');
  const equipeId = searchparams.get('equipeId');

  const isInvitation = () => {
    const hash = window.location.hash;
    const stringquer = hash.split('?')[1];
    const params = new URLSearchParams(stringquer);
    return params.has('equipeId') && params.has('token');
  };

  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.userReducer.isAuth);
  console.log("token",tokenn)

  useEffect(() => {


    
      dispatch(addtoteam(tokenn, equipeId));
    

    if (isInvitation() && !isAuth) {
      
      window.location.href = `http://192.168.1.178/#/authentificate/login?equipeId=${equipeId}&token=${tokenn}`;

      // navigate(`/authentificate/login?equipeId=${equipeId}&token=${tokenn}`);
    } else  {

      window.location.href = `http://192.168.1.178/#/team/equipe/${equipeId}`;


      // navigate(`/team/equipe/${equipeId}`);
    }
  }, [dispatch, tokenn, equipeId, isAuth, navigate]);

  return (
    <div>
      <p>Joining team...</p>
    </div>
  );
}

export default JoinTeam;
