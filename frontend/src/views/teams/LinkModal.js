import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { useDispatch } from 'react-redux';
import { addLink } from 'src/JS/actions/equipe';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const LinkModal = ({ open, equipeId , setOpen}) => {
  const [webAddress, setWebAddress] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [createAnother, setCreateAnother] = useState(false);
  const [urlError, setUrlError] = useState('');
  const dispatch = useDispatch();

  const handleClose = () => {
    setOpen(false)
    setUrlError("")
    setWebAddress("")
    setDescription("")
    setCreateAnother("")
    };

  const handleAdd = () => {
    const linkData = {
      webAddress,
      title,
      description,
    };

    dispatch(addLink(equipeId, linkData));

    if (!createAnother) {
      handleClose();
    }

    setWebAddress('');
    setTitle('');
    setDescription('');
    setUrlError('');
  };

  const validateUrl = (url) => {
    const urlPattern = new RegExp(
      // protocol
      '^(https?:\\/\\/)?' + 
      //domain name
      '((([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,})|' + 
      '((\\d{1,3}\\.){3}\\d{1,3}))' + 
      // OR IP (v4) address
      '(\\:\\d+)?(\\/[-a-zA-Z0-9%_.~+]*)*' + 
      '(\\?[;&a-zA-Z0-9%_.~+=-]*)?' + 
      // fragment locator
      '(\\#[-a-zA-Z0-9_]*)?$', 
      'i'
    );
    return urlPattern.test(url);
  };

  const handleWebAddressChange = (e) => {
    const url = e.target.value;
    setWebAddress(url);

    if (!validateUrl(url)) {
      setUrlError('Please enter a valid URL.');
    } else {
      setUrlError('');
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          Add a Link
        </Typography>
        <Typography id="modal-description" sx={{ mt: 2 }}>
          Let everyone know where and how the team works.
        </Typography>
        <TextField
          margin="normal"
          fullWidth
          label="Adresse web"
          placeholder="for ex. https://Teamsyn/"
          value={webAddress}
          onChange={handleWebAddressChange}
          required
          error={Boolean(urlError)}
          helperText={urlError}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Titre"
          placeholder="Add a website"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField
          margin="normal"
          fullWidth
          label="Description"
          placeholder="Add a description to your link so that everyone knows why it's important to the team."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={4}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={createAnother}
              onChange={(e) => setCreateAnother(e.target.checked)}
            />
          }
          label="Add another one"
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={handleClose} sx={{ mr: 1 }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={!webAddress || Boolean(urlError)}
          >
            Add
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default LinkModal;
