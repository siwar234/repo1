import React from 'react';
import {
  Box,
  MenuItem,
  ListItem,
  Menu,
 
  FormControlLabel,
  Checkbox,
  Tooltip,
  Typography,
  Avatar,
} from '@mui/material';



export default function MenuFiltredPerson({
  setAnchor,
  setisMenuOpened,
  filteredMembers,
  anchorEl,
  owner,
  checked,
  setchecked
}) {

  const handleMenuClosed = () => {
    setisMenuOpened(false);
    setAnchor(null);
  };
  

  const handleCheckboxChange = (personFirstName) => {
    setchecked((prev) => ({
      ...prev,
      [personFirstName]: !prev[personFirstName],
    }));
    setisMenuOpened(false);
    setAnchor(null);
    
  };



  

  return (
    <>
      <Menu
        id="Filtrage-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClosed}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiMenu-paper': {
            width: '200px',
            height: '120px',
          },
        }}
      >
        <Box style={{ overflow: 'auto', maxHeight: '150px' }}>

      
            <ListItem style={{ display: 'flex', flexDirection: 'column' }} disablePadding>
             
                       {filteredMembers?.map((member) => (

              <MenuItem
                sx={{
                  width: '200px',
                  '&:hover': {
                    borderLeft: '2px solid  #9a9a9b7d',
                    backgroundColor: '#e0e1e37d',
                  },
                }}
              >
         
<FormControlLabel
  control={
    <Box display="flex" alignItems="center">
      <Checkbox 
checked={checked[member.memberId.firstName] }
onChange={() => handleCheckboxChange(member.memberId?.firstName)}
        // onChange={() => handlePersonCheckboxChange(member.memberId?.firstName)} 
      />


      


      <Avatar
        src={member.memberId?.profilePicture}
        sx={{
          bgcolor: '#42a5f5',
          width: 30,
          height: 30,
          fontSize: '13px',
          marginRight: '8px', 
        }}
      >
        {member.memberId?.firstName && member.memberId.firstName.substring(0, 2).toUpperCase()}
      </Avatar>
    </Box>
  }
  label={
    <Tooltip title={member.memberId?.firstName}>
      <Typography>{member.memberId?.firstName}</Typography>
    </Tooltip>
  }
/>
</MenuItem>
 ))}
<MenuItem
                sx={{
                  width: '200px',
                  '&:hover': {
                    borderLeft: '2px solid  #9a9a9b7d',
                    backgroundColor: '#e0e1e37d',
                  },
                }}
              >
<FormControlLabel
  control={
    <Box display="flex" alignItems="center">
      <Checkbox 
checked={checked[owner?.firstName] }
onChange={() => handleCheckboxChange(owner?.firstName)}
        // onChange={() => handlePersonCheckboxChange(member.memberId?.firstName)} 
      />
<Avatar

src={owner?.profilePicture}

sx={{
  bgcolor: '#42a5f5',
  width: 30,
  height: 30,
  fontSize: '13px',
  marginRight: '8px', 
}}
>       {owner?.firstName && owner.firstName.substring(0, 2).toUpperCase()}

</Avatar>
    </Box>
  }
  label={
    <Tooltip title={owner?.firstName}>
      <Typography>{owner?.firstName}</Typography>
    </Tooltip>
  }
/>


</MenuItem>

              
            </ListItem>
         
        </Box>
      </Menu>
    </>
  );
}
