import React ,{ useEffect, useState } from 'react';
import { MenuItem, Divider, Menu, Typography } from '@mui/material';
import { getWorkflows } from '../../../../JS/actions/workflows';
import { useDispatch,useSelector } from 'react-redux';

import TicketworkflowModal from './TicketworkflowModal';

export default function WorkflowMenu({ anchorEl,ticketId, handleCloseing, userid,setWorkflow,projectId, currentWorkflow,  }) {

  const dispatch=useDispatch()

  useEffect(() => {
    dispatch(getWorkflows());  
  }, [dispatch]);

  const workflows = useSelector((state) => state.workflowReducer.workflows) || [];

  //manage worflows
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);

  return (
    <Menu
      id="workflow-menu"
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleCloseing}
    >
      {Array.isArray(workflows) && workflows.map((workflow) => (
      currentWorkflow !== workflow?.workflowTitle && (
          <MenuItem
            key={workflow?._id}
            style={{ width: '150px' }}
            onClick={() => setWorkflow(workflow?._id)}
          >
            <Typography
              style={{
                fontSize: '10px',
                fontFamily: 'system-ui',
                width: '75px',
                textAlign: 'center',
                borderRadius: '3px',
                height: '23px',
                backgroundColor:
                workflow.workflowTitle === 'TO DO'
                    ? '#7ca1f35e'
                    : workflow.workflowTitle === 'IN_PROGRESS'
                    ? 'rgb(227 226 226 / 55%)'
                    : workflow.workflowTitle==='DONE'
                    ?'rgb(214 247 210)'
                    :workflow.workflowBackground,
                marginRight: '10px',
                marginTop: '5px',
                color:
                  workflow?.workflowTitle === 'IN_PROGRESS'
                    ? 'rgb(107 107 107)'
                    : workflow?.workflowTitle === 'TO DO'
                    ? '#5d87ff'
                    : workflow?.workflowTitle === 'DONE' 
                    ?'rgb(12 119 26)'
                    : workflow.workflowColor,
                fontWeight: 'bold',
              }}
            >
              {workflow?.workflowTitle}
            </Typography>
          </MenuItem>
        )
      ))}
      <Divider />
      <MenuItem 
     onClick={handleOpen}

      style={{ fontFamily: 'sans-serif' }}>Manage workflows</MenuItem>
      <TicketworkflowModal ticketId={ticketId} userid={userid} projectId={projectId} open={open} setOpen={setOpen} workflows={workflows}/>
    </Menu>

  );
}
