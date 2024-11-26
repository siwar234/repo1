import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Autocomplete, Button, Select, MenuItem, InputLabel, FormControl, Link, Box, TextField, Tooltip } from '@mui/material';
import { addchildTicket, getListTicketsByproject } from '../../../JS/actions/Tickets';
import { FcSearch } from 'react-icons/fc';

export default function ChildTicket({ projectId, ticketId,taskId,setshowchildTicket }) {
  const [selectedRelation, setSelectedRelation] = useState('is blocked by');
  const [selectedTickets, setSelectedTickets] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {

    dispatch(getListTicketsByproject(projectId));

  }, [dispatch, projectId]);

  const handleRelationChange = (e) => {
    setSelectedRelation(e.target.value);
  };

  const handleTicketsChange = (event, newTickets) => {
    setSelectedTickets(newTickets);
  };



  

  // set choose ticket by description

  const [showsearch, setshowsearch] = useState(false);


  const handlechoosticket = () => {
    setshowsearch((prev) => !prev);
  };

//cild tickets
 
  const [ticketText, setTicketText] = useState('');


  const handleAddChildTicketSubmit = async (ticketId) => {
    const ChildTicketDescription = ticketText[ticketId];

    

    if (!ChildTicketDescription) {
      console.error('Description is required');
      return;
    }

    const ticketData = {
      ChildTicketDescription: ChildTicketDescription,
      ticketId:ticketId,
      
      projectId:projectId
    };

    const dataWithProjectId = { ...ticketData };

    await dispatch(addchildTicket(dataWithProjectId,projectId));

    setTicketText({ ...ticketText, [ticketId]: '' });
  };


  const handleChildTicketTextChange = (event, ticketid) => {
    setTicketText({ ...ticketText, [ticketid]: event.target.value });
  };


  return (

    <Box sx={{ width: 365, display: 'flex', flexDirection: 'column', gap: 1 }}  mb={4} ml={2}>
      <h3 sx={{ marginLeft: '10px' }}>child Tickets</h3>
      {!showsearch && (

<Box  sx={{ width: 365, display: 'flex', flexDirection: 'row', }}>
<FormControl sx={{ width: "50%"}}>
<InputLabel>Type
</InputLabel>
        <Select
          // value={selectedRelation}
          value="subTask"
          label="Type"
          onChange={handleRelationChange}
        >
          <MenuItem value="subTask" disabled="true">subTask</MenuItem>
          

        </Select>
      </FormControl>

      {/* <form
                                    onSubmit={(event) => {
                                    event.preventDefault();
                                    handleAddChildTicketSubmit(ticketId);
                                    }}> */}
          

      <TextField 
       value={ticketText[ticketId] || ''}
       onChange={(event) => handleChildTicketTextChange(event, ticketId)}
      style={{marginLeft:"10px"}}
       label="what should be done ?" 
        fullWidth >

      </TextField>

      {/* </form> */}

{/* 
 
<ChildList 
isSecondGridOpen={isSecondGridOpen} 
taskId={isSecondGridOpen[taskId]} 
ticketId={isSecondGridOpen[taskId][ticketId]} projectId={projectId}  />
  */}

      </Box>)}


      {showsearch && (
      <Autocomplete
        multiple
        // options={filteredTickets} 
        getOptionLabel={(option) => option.Description}
        value={selectedTickets}
        onChange={handleTicketsChange}
        renderInput={(params) => <TextField {...params} label="choose by ticket summary" variant="outlined" />}
      />)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link href="#" underline="hover" style={{ fontSize: '13px', fontWeight: "bold" }} onClick={handlechoosticket}>
      <Tooltip title="choose an existing ticket"><FcSearch style={{ fontSize:"20px" ,marginRight:"5px"}}/> </Tooltip>
      choose an existing ticket
        </Link>
        <Box>
          <Button
            style={{ marginRight: '5px', width: "20px", fontSize: "12px", fontWeight: "bold" }}
            variant="contained"
            color="primary"
            onClick={() => handleAddChildTicketSubmit(ticketId)}

            // disabled={selectedTickets.length === 0}
                        disabled={ticketText[ticketId]===""}

          >
            Create
          </Button>
          <Button
            style={{ marginRight: '5px', width: "20px", fontSize: "12px", fontWeight: "bold" }}
            variant="outlined"
            onClick={() => setshowchildTicket(false)}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
