import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { deleteticketsflag } from 'src/JS/actions/Tickets';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Divider, TextField } from '@mui/material';
import { relatedtask } from 'src/JS/actions/tasks';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DiscussionSpaceModal from 'src/views/dashboard/communicationspace/DiscussionModal';
import DeleteTicketModal from 'src/views/dashboard/Tickets/DeleteTicketModal';

export default function LongMenu({
  setDeletemodal,
  setDeletemodall,
  taskId,
  options,
  MoreVertIconstyle,
  ticketId,
  projectId,
  task,
  handleopenUpdate,
  openDeleting,
  handleCloseDeleting,
  ticketname
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isRelateTaskDropdownOpen, setIsRelateTaskDropdownOpen] = useState(false);
  // const { projectId } = useParams();
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasksReducer.tasks);
  const currentTask = tasks.find((task) => task._id === taskId);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);}

  const handleOpenDelete = (taskId) => {
    setDeletemodal((prevState) => ({
      ...prevState,
      [taskId]: true,
    }));
    handleClose();
  };

  const deletingticketflag = (ticketid) => {
    dispatch(deleteticketsflag(projectId, ticketid));
  };

  const handledelete = (ticketId) => {
    setDeletemodall((prevState) => ({
      ...prevState,
      [ticketId]: true,
    }));
    handleClose();
  };

  const handleRelateTaskHover = () => {
    setIsRelateTaskDropdownOpen(true);
  };

  const handleRelateTaskLeave = () => {
    setIsRelateTaskDropdownOpen(false);
  };

  const handleRelateTask = async (relatedTaskId) => {
    try {
      await dispatch(relatedtask(taskId, relatedTaskId,projectId));
    } catch (error) {
      console.error('Error relating tasks:', error);
    }
  };

  const isTaskAlreadyRelated = (task) => {
    if (currentTask && currentTask.related) {
      return currentTask.related._id.includes(task._id);
    }
    return false;
  };

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
    }
  }, [tasks]);

  const filteredTasks = tasks.filter(
    (task) =>
      task._id !== taskId &&
      !isTaskAlreadyRelated(task) &&
      task.TaskName.toLowerCase().includes(searchQuery.toLowerCase())
  );



  

  return (
    <div style={{ display: 'flex', flexDirection: 'row', marginTop: '-5px' }}>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={anchorEl ? 'long-menu' : undefined}
        aria-expanded={Boolean(anchorEl) ? 'true' : 'false'}
        aria-haspopup="true"
        onClick={handleClick}
        sx={{
          ...MoreVertIconstyle,
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu id="long-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} 
  transformOrigin={{ vertical: 'Top', horizontal: 'left' }}

      sx={{
        '& .MuiMenu-paper': {
          width: '210px',
        },
      }}>
        {options.map((option) => (
          <div key={option}>
            {option === 'relate sprints' ? (
              <MenuItem
                onMouseEnter={handleRelateTaskHover}
                onMouseLeave={handleRelateTaskLeave}
                onClick={() => setIsRelateTaskDropdownOpen(false)}
               
              >
                {option}
                <ArrowForwardIosIcon style={{ width: "10px", marginLeft: "25px", fontWeight: "bolder", color: "#616161" }} />

                <Menu
                  id="submenu"
                  anchorEl={anchorEl}
                  open={isRelateTaskDropdownOpen}
                  onClose={() => setIsRelateTaskDropdownOpen(false)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'Top', horizontal: 'right' }}
                  sx={{
                    '& .MuiMenu-paper': {
                      width: '220px',
                      marginTop: '150px',
                    },
                  }}
                >
                  <TextField
                    variant="outlined"
                    placeholder="Search tasks"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                      marginBottom: '8px',
                      marginLeft: '5px',
                      width: '210px',
                    }}
                    inputProps={{
                      style: {
                        height: '20px',
                        padding: '10px',
                      },
                    }}
                  />
                  <Divider
                    sx={{
                      borderBottomWidth: '2px',
                      marginTop: '2px',
                    }}
                  />
                  <Box style={{ overflow: 'auto', maxHeight: '60px' }}>
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map((task) => (
                        <MenuItem onClick
                        ={() => handleRelateTask(task._id)} key={task._id}>
                        {task.TaskName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No tasks to relate</MenuItem>
                  )}
                </Box>
              </Menu>
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                if (option === 'delete task') {
                  handleOpenDelete(taskId);
                } else if (option === 'delete indicator') {
                  deletingticketflag(ticketId);
                } else if (option === 'delete ticket' ) {
                  handledelete(ticketId);
                } else if(option==="Add To a discussion space") {
                  handleOpenModal();
                }
                else if(option==="edit sprint") {
                  handleopenUpdate(taskId);
                }
                
                else  {
                  handleClose()}
              }}
            >
              {option}
            </MenuItem>
          )}
        </div>
      ))}
    </Menu>
    <DeleteTicketModal openDeleting={openDeleting} handleCloseDeleting={handleCloseDeleting}  ticketId={ticketId} ticketname={ticketname} />

    <DiscussionSpaceModal  open={isModalOpen} handleClose={handleCloseModal} task={task} projectId={projectId}  />
  </div>
);
}
