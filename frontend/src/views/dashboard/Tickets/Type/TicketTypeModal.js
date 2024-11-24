import React, { useState } from 'react';
import { Modal, Box, Button, TextField, Typography, Tooltip } from '@mui/material';
import { useDispatch } from 'react-redux';
import { addType, getTypes } from '../../../../JS/actions/Types';
import image1 from "../../../../assets/TicketIcon/bookmark.png"
import IconTypeModal from './IconTypeModal';
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column"
};



function TicketTypeModal({ setOpen, open,selectedIcon,setSelectedIcon }) {
  const dispatch = useDispatch();
  const [typetitle, settypetitle] = useState('');
  const [openIcon, setopenIcon] = useState(false);

   // Error message
  const [error, setError] = useState(false); 

  const handleCloseType = () => setOpen(false);


  const handleopenIcon = () => {
    setopenIcon(true);
  };




 

  const handleCloseIcon = () => {
    setopenIcon(false);
  };

 
  const handleSelectIcon = (iconUrl) => {
    setSelectedIcon(iconUrl);
  };


  // Create new workflow with validation
  const handleCreateType = async () => {
    if (typetitle.trim()) {
      setError(false); 
      const createdType = await dispatch(addType({
        TypesTitle: typetitle,
        TypesIcon: selectedIcon
      }));

      // if (createdType) {
      //   dispatch(updatetickets(projectId, userid, ticketId, { workflow: createdWorkflow._id }));
      // }

      // dispatch(getTypes());
      handleCloseType();
    } else {
      setError(true); 
    }
  };

  return (
    <Modal open={open} onClose={handleCloseType} aria-labelledby="modal-title" aria-describedby="modal-description">
      <Box sx={style}>
        <Typography id="modal-title" variant="h5" component="h2" gutterBottom>
        create  a ticket type
        </Typography>

        <Typography sx={{fontWeight:"bold"}} id="modal-title" variant="h7" component="h7" gutterBottom mt={1}>
        title
        <span style={{ color: 'red' }}>*</span>
        </Typography>


        <TextField
          required
          fullWidth
          label="title"
          placeholder="Enter a new type title"
          margin="normal"
          value={typetitle}
          onChange={(e) => settypetitle(e.target.value)}
          error={error}  
          helperText={error ? "title  is required" : ""} 
        />

<Typography 

sx={{fontWeight:"bold"}}
 id="modal-title" variant="h7"
  component="h7" gutterBottom mt={1}>
Icon
<span style={{ color: 'red' }}>*</span>
        </Typography>

        <Box mt={1} mb={3} display="flex" flexDirection="row">

        <Tooltip title="type ticket icon">

        <img

        style={{
                    width: '24px',
                    height: '22px',
                    marginRight: '10px',
                    marginTop:"8px",
                    '&:hover': {
                      borderLeft: '2px solid gra',
                      backgroundColor: 'blue',
                      borderRadius:"10px"
                      
          
                  },

                    
                  }} 
        alt='iconimage' 
        src={ selectedIcon|| image1 }

        
        />     
</Tooltip>




<Button
            variant="outlined"
            onClick={handleopenIcon}
            sx={{ mb: 3 , width:"50%" }}
          >
            Modifier l'icône
          </Button>
          <IconTypeModal  openIcon={openIcon} handleCloseIcon={handleCloseIcon} handleSelectIcon={handleSelectIcon}/> 
        </Box>


      

       

        <Box display="flex" justifyContent="space-between">
          <Button variant="outlined" color="secondary" onClick={handleCloseType}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleCreateType}>
            Create
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default TicketTypeModal;
