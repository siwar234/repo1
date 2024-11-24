

import React from 'react'
import {  MenuItem,Typography,Box,  Avatar } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import ReadNotification from './ReadNotification';

export const DeleteprojectNotification = ({notification,image5,handleMarkAsRead,userId}) => {

  return (
<>

   
{notification.data && notification.type === 'deleteprojectnotification' 
&&
//  userId===notification.responsible_user &&
 (
    <MenuItem style={{ marginTop: "15px" }}>
      <Avatar
      sx={{
        bgcolor: '#42a5f5',
        width: 40,
        height: 40,
        fontSize:'13px'
      }}
       alt={notification.data.User?.firstName} 
       src={notification.data.User?.profilePicture}
        >
      {notification.data.User?.firstName.substring(0, 2).toUpperCase()}
      </Avatar>
  
      <Box ml={2}>
        <Typography variant="body1" style={{ fontWeight: "bold" }}>
        {notification.data.User?.firstName}  has deleted  this project 
          <span style={{ color: "gray", marginLeft: "10px", fontWeight: "lighter", marginRight: "20px" }}>
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </span>
          <ReadNotification notification={notification} handleMarkAsRead={handleMarkAsRead}>

</ReadNotification>                      </Typography>
        <Typography variant="body2" color="textSecondary">
          <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
            <img src={notification.data?._id?.Icon || image5} style={{ width: "18px", height: "18px" }} alt='Project icon' />
            <span style={{ marginLeft: 8, fontSize: "13px" }}>{notification.data?.projectName}</span>
          </div>
        </Typography>
      </Box>
    </MenuItem>
  )}
       
     </>
  )
}








