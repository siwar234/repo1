import React, { useState } from 'react';
import { Modal, Box, Button, TextField, Typography, IconButton } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useDispatch } from 'react-redux';
import { updatetickets } from '../../../../JS/actions/Tickets';
import { addWorkflow, getWorkflows } from '../../../../JS/actions/workflows';

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

// Color palettes
const nudeColors = ['#CC8291', '#CC9A82', '#8F91A6', '#CC9E92', '#9CB09C', '#C99A9C', '#CC996F'];
const backgroundColors = ['#FFC1CC', '#FFDDC1', '#C5C8E6', '#FFDFD3', '#C1E1C1', '#FDE2E4', '#FFD6A5'];

function TicketworkflowModal({ setOpen, open, ticketId, projectId, userid, workflows }) {
  const dispatch = useDispatch();
  const [selectedColor, setSelectedColor] = useState('#F4E1D2');
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState('#F4E1D2');
  const [workflowName, setWorkflowName] = useState('');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [backgroundcolorPickerOpen, setbackgroundColorPickerOpen] = useState(false);

   // Error message
  const [error, setError] = useState(false); 

  const handleClose = () => setOpen(false);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setColorPickerOpen(false);
  };

  const toggleColorPicker = () => {
    setColorPickerOpen(!colorPickerOpen);
  };

  const handleBackgroundColorSelect = (backgroundolor) => {
    setSelectedBackgroundColor(backgroundolor);
    setbackgroundColorPickerOpen(false);
  };

  const toggleBackgroundColorPicker = () => {
    setbackgroundColorPickerOpen(!backgroundcolorPickerOpen);
  };

  // Create new workflow with validation
  const handleCreateWorkflow = async () => {
    if (workflowName.trim()) {
      setError(false); // Reset error if the name is valid
      const createdWorkflow = await dispatch(addWorkflow({
        workflowTitle: workflowName,
        workflowColor: selectedColor,
        workflowBackground: selectedBackgroundColor
      }));

      if (createdWorkflow) {
        dispatch(updatetickets(projectId, userid, ticketId, { workflow: createdWorkflow._id }));
      }

      dispatch(getWorkflows());
      handleClose();
    } else {
      setError(true); 
    }
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
          Create a Workflow
        </Typography>

        <TextField
          required
          fullWidth
          label="Name"
          placeholder="Enter a new workflow name"
          margin="normal"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          error={error}  
          helperText={error ? "Name is required" : ""} 
        />

        <Box my={2}>
          <Typography>Choose color</Typography>
          <Box display="flex" alignItems="center" gap={2} mt={1}>
            <Box sx={{
              width: '40px',
              height: '40px',
              backgroundColor: selectedColor,
              border: '1px solid black',
              borderRadius: '50%',
            }} />
            <Button variant="outlined" endIcon={<ArrowDropDownIcon />} onClick={toggleColorPicker}>
              Choose Color
            </Button>
          </Box>
          {colorPickerOpen && (
            <Box display="flex" gap={1} mt={2}>
              {nudeColors.map((color) => (
                <IconButton key={color} onClick={() => handleColorSelect(color)} sx={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: color,
                  borderRadius: '50%',
                  border: selectedColor === color ? '2px solid black' : '1px solid gray',
                  '&:hover': { borderColor: 'black' },
                }} />
              ))}
            </Box>
          )}
        </Box>

        <Box my={2}>
          <Typography>Choose background color</Typography>
          <Box display="flex" alignItems="center" gap={2} mt={1}>
            <Box sx={{
              width: '40px',
              height: '40px',
              backgroundColor: selectedBackgroundColor,
              border: '1px solid black',
              borderRadius: '50%',
            }} />
            <Button variant="outlined" endIcon={<ArrowDropDownIcon />} onClick={toggleBackgroundColorPicker}>
              Choose Background Color
            </Button>
          </Box>
          {backgroundcolorPickerOpen && (
            <Box display="flex" gap={1} mt={2} flexDirection="row">
              {backgroundColors.map((color) => (
                <IconButton key={color} onClick={() => handleBackgroundColorSelect(color)} sx={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: color,
                  borderRadius: '50%',
                  border: selectedBackgroundColor === color ? '2px solid black' : '1px solid gray',
                  '&:hover': { borderColor: 'black' },
                }} />
              ))}
            </Box>
          )}
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleCreateWorkflow}>
            Create
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default TicketworkflowModal;
