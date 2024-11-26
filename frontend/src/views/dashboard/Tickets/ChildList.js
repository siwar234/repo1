import React, { useEffect, useState } from 'react';
import {  Typography, Box, Button, Tooltip } from '@mui/material';
import image1 from '../../../assets/images/bug.png';
import image2 from '../../../assets/images/checking.webp';

import image3 from '../../../assets/images/storie.png';
import image4 from '../../../assets/images/subtask.png';

import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import { useDispatch } from 'react-redux';
import { getChildTicket } from 'src/JS/actions/Tickets';
import { useSelector } from 'react-redux';

const ChildTicketItem = ({ childticket  }) => {
  const [isHovered, setIsHovered] = useState(false);
//   const dispatch = useDispatch();

  const getImageSrc = (type) => {
    switch (type) {
      case 'Bug':
        return image1;
      case 'Task':
        return image2;
      case 'story':
        return image3;
      default:
        return image4;
    }
  };

  const getStatusStyles = (etat) => {
    switch (etat) {
      case 'TO DO':
        return {
          backgroundColor: '#7ca1f35e',
          color: '#5d87ff'
        };
      case 'IN_PROGRESS':
        return {
          backgroundColor: 'rgb(227 226 226 / 55%)',
          color: 'rgb(107 107 107)'
        };
      case 'DONE':
        return {
          backgroundColor: 'rgb(214 247 210)',
          color: 'rgb(12 119 26)'
        };
      default:
        console.warn('Unknown status:', etat);
        return {
          backgroundColor: '#f0f0f0',
          color: '#000000'
        };
    }
  };

  const statusStyles = getStatusStyles(childticket?.workflow.workflowTitle);

 
  return (
    <Box
      display="flex"
       
      alignItems="center"
      justifyContent="space-between"
      mb={0.2}
      p={1}
      border={1}
      mr={2}
      borderColor={'#dedfe2'}
     
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        '&:hover': {
          backgroundColor: '#f0f0f0',
        },
        position: 'relative',
      }}
    >
      <Box display="flex" alignItems="center">
        <Tooltip title={childticket?.Type.TypesTitle} >
        <img
          src={getImageSrc(childticket?.Type?.TypesTitle)}
          alt="icon"
          style={{
            width:childticket?.Type.TypesTitle === 'story' ? '21px' : '18px',
            height: childticket?.Type?.TypesTitle === 'story' ? '21px' : '18px',
            marginRight: '15px',
          }}
        /></Tooltip>
            <Box >
        
        <Typography mr={2}  variant="body2" color="black" >
     {childticket?.ChildTicketidentifiant}   </Typography>
      </Box>
        <Box>
        
          <Typography fontWeight={"bold"} variant="body2" color="black">
            {childticket?.ChildTicketDescription}
          </Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems="center">
        <Tooltip title={childticket?.Priority}>
          <Box ml={2} mr={3}>
            {childticket.Priority === 'Low' && (
              <KeyboardDoubleArrowDownIcon
                style={{
                  width: '15px',
                  marginRight: '5px',
                  marginLeft: '10px',
                  marginTop: '10px',
                  color: '#5b356fcc',
                }}
              />
            )}
            {childticket?._id.Priority === 'High' && (
              <KeyboardDoubleArrowUpIcon
                style={{
                  width: '15px',
                  marginRight: '5px',
                  marginLeft: '10px',
                  marginTop: '10px',
                  color: 'rgb(35 145 115)',
                }}
              />
            )}
            {childticket?.Priority === 'Medium' && (
              <DensityMediumIcon
                style={{
                  width: '15px',
                  marginRight: '5px',
                  marginLeft: '10px',
                  marginTop: '10px',
                  color: '#c1535c',
                }}
              />
            )}
          </Box>
        </Tooltip>
       
         <Button
          style={{
            fontSize: '10px',
            width: 'fit-content',
            textAlign: 'center',
            borderRadius: '3px',
            height: '25px',
            fontWeight: 'bold',
            backgroundColor: statusStyles.backgroundColor,
            marginRight: '35px',
            marginLeft: '5px',
            color: statusStyles.color,
            fontFamily: 'system-ui',
          }}
        >
          <span>{childticket?.workflow.workflowTitle}</span>
        </Button> 

        {/* {isHovered && (
          <Tooltip title="Dissociate Ticket">
            <IconButton
              sx={{
                position: 'absolute',
                top: '50%',
                right: '0px',
                transform: 'translateY(-50%)',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: '#e7e6e6',
                },
                color: '#515351',
                borderRadius: "0",
                marginRight: "5px"
              }}
              onClick={handleDissociate}
            >
              <CloseIcon style={{ fontSize: '16px', fontWeight: "bold" }} />
            </IconButton>
          </Tooltip>
        )} */}
      </Box>
    </Box>
  );
};

const ChildList = ({  ticketId ,projectId,taskId,isSecondGridOpen}) => {

    const dispatch=useDispatch()

    useEffect(() => {
        dispatch(getChildTicket(ticketId));
      }, [dispatch, ticketId]);






  const childtickets = useSelector ((state) => state.tasksReducer.chilTickets) || [];

  // const childtickets = isSecondGridOpen[taskId]?.[ticketId]?.childTickets || [];

  return (
      <Box ml={2} mb={6} mt={3}>
            <Box  mb={2} mt={4} >
      {childtickets.length > 0 && <h4>Child Tickets</h4>}
      </Box>
        {childtickets.map((childticket) => (
          <ChildTicketItem
            key={childticket?._id}
            childticket={childticket}
            mainTicketId={childticket.ticketId} 
            projectId={projectId} 
          />
        ))}
      </Box>
  );
};

export default ChildList;
