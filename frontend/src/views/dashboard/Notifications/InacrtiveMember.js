import React from 'react'
import {  MenuItem, Typography, Box, Avatar } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { MdFaceRetouchingOff } from "react-icons/md";
import ReadNotification from './ReadNotification';

export const InacrtiveMember = ({ notification, image2, image3, handleMarkAsRead ,userId}) => {

  const renderResponsibleTickets = () => {
    return notification.data.ticketsToDo.map((ticket, index) => (
      ticket.ResponsibleTicket && ( // Only render if ResponsibleTicket is present
        <Typography key={index} variant="body2" color="textSecondary">
          <div style={{ display: 'flex', alignItems: 'center', flexDirection: "row", overflow: "auto", maxHeight: "50px" }}>
            <Avatar alt={ticket.ResponsibleTicket?.firstName} src={ticket.ResponsibleTicket?.profilePicture} style={{ width: "28px", height: "28px" }} />
            <span style={{ marginLeft: 8, fontSize: "13px", marginTop: "5px" }}>
              {ticket.ResponsibleTicket?.firstName} <span  style={{ marginLeft: 8}}> for Ticket :  {ticket.Description} </span>
            </span>
          </div>
        </Typography>
      )
    ));
  };

  const hasResponsibleTickets = notification.data && notification.data.ticketsToDo && notification.data.ticketsToDo.some(ticket => ticket.ResponsibleTicket); 

  return (
    <>
      {notification.data && notification.type === 'inactiveMember' && hasResponsibleTickets && userId===notification.responsible_user &&  (
        <MenuItem style={{ marginTop: "15px" }}>
          <Box ml={1}>
            <Typography style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center',
              position: 'relative'
            }}>
              <MdFaceRetouchingOff style={{ fontSize: '30px', marginRight: '5px' }} />
              <Typography variant="body1" style={{ fontWeight: 'bold', marginRight: '5px' }}>
                these members are inactive in
                <span style={{ marginLeft: '5px' }}>
                  {notification.data.task.TaskName} in {notification.data.task.projectId.projectName}
                </span>
                <span
                  style={{ color: 'gray', marginLeft: '10px', fontWeight: 'lighter', marginRight: '18px' }}
                >
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </span>
              </Typography>
            </Typography>
            <ReadNotification notification={notification} handleMarkAsRead={handleMarkAsRead}>
      
      </ReadNotification>
            <Typography variant="body2" color="textSecondary">
              <span style={{ marginLeft: 8, fontSize: "13px", marginTop: "4px" }}>
                deadline {formatDistanceToNow(new Date(notification.data.task.EndDate), { addSuffix: true })}
              </span>
              {hasResponsibleTickets && ( 
                <div style={{ display: 'flex', alignItems: 'center', flexDirection: "row", marginTop: "4px" }}>
                  <span style={{ marginLeft: 8, fontSize: "13px", marginTop: "5px" }}>
                    {renderResponsibleTickets()}
                  </span>
                </div>
              )}
            </Typography>
          </Box>
        </MenuItem>
      )}
    </>
  )
}
