import React, { useEffect, useState } from 'react';
import { Avatar, Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  getListTicketsByproject,
  updateTicketPosition,
  updatingtickets,
} from '../../../JS/actions/Tickets';
import { getWorkflows } from '../../../JS/actions/workflows';
import { useParams } from 'react-router';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../../components/shared/DashboardCard';
import image from '../../../assets/images/checking.webp';
import image1 from '../../../assets/images/bugging.png';
import image2 from '../../../assets/images/storie.png';
import image4 from '../../../assets/images/subtask.png';
import image5 from '../../../assets/images/icons8-flow-chart-100.png';

import { FcApproval } from 'react-icons/fc';
import Featureupdate from '../Features/Featureupdate';
import { getprojectbyid } from 'src/JS/actions/project';
import { getAllFeatures } from 'src/JS/actions/feature';
import PriorityMenu from '../Tickets/PriorityMenu';
import EditIcon from '@mui/icons-material/Edit';
import { GrClose, GrCheckmark } from 'react-icons/gr';
import LongMenu from 'src/components/Menu/menu';
import FeatureMenu from 'src/components/Menu/FeatureMenu';
import TasksMenu from 'src/components/Menu/TasksMenu';
import { IoFlagSharp } from 'react-icons/io5';
import TicketModal from '../Tickets/TicketModal';
import { IoEyeOutline } from 'react-icons/io5';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { selectAllTickets } from '../Selectors';
import ResponsibleMenu from '../Tickets/ResponsibleMenu';
import AddWorkflow from './AddWorkflow';
import { FiltragePerPerson } from '../FiltredByPerson/FiltragePerPerson';
import StoryPoints from '../Tickets/StroyPoints';

export default function Table() {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const [MenuResponsible, setMenuResponsible] = useState({});
  const [editModes, setEditModes] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isopening, setisopening] = useState({});

  //menu feature
  const handleMenuToggle = (event) => {
    setIsMenuOpen((prevOpen) => !prevOpen);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setAnchorEl(null);
  };

  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedTasks, setselectedTasks] = useState([]);

  //edit mode
  const [description, setDescription] = useState({});

  const handleUpdateDescription = (ticketId) => {
    setDescription((prevPriorityMap) => ({
      ...prevPriorityMap,
      [ticketId]: description,
    }));
    dispatch(updatingtickets(projectId, ticketId, { Description: description }));
    handleCancel(ticketId);
  };

  const handleEditClick = (ticketid) => {
    const updatedEditModes = { ...(editModes || {}) };

    Object.keys(updatedEditModes).forEach((otherTicketId) => {
      updatedEditModes[otherTicketId] = false;
    });

    updatedEditModes[ticketid] = true;

    setEditModes(updatedEditModes);
  };

  const handleCancel = () => {
    setEditModes((prevEditModes) => {
      const updatedEditModes = { ...prevEditModes };
      Object.keys(prevEditModes).forEach((ticketIndex) => {
        updatedEditModes[ticketIndex] = false;
      });
      return updatedEditModes;
    });
  };

  const handleResponsible = (event, ticketId) => {
    setMenuResponsible({ ...MenuResponsible, [ticketId]: event.currentTarget });
  };

  const handleclosedResponsible = (ticketId) => {
    setMenuResponsible({ ...MenuResponsible, [ticketId]: null });
  };

  useEffect(() => {
    if (!projectId) return;

    dispatch(getListTicketsByproject(projectId));
    dispatch(getprojectbyid(projectId));
    dispatch(getAllFeatures(projectId));
    dispatch(getWorkflows());
  }, [dispatch, projectId]);

  //   const toDoTickets = useSelector(selectToDoTickets);
  // const InprogressTickets = useSelector(selectInProgressTickets);
  // const doneTickets = useSelector(selectDoneTickets);

  //

  const allTickets = useSelector(selectAllTickets);

  const handleAssignResponsible = (userId, ticketId) => {
    dispatch(updatingtickets(projectId, ticketId, { ResponsibleTicket: userId }));

    handleclosedResponsible(ticketId);
  };

  const handleFeatureSelect = (featureid, ticketid) => {
    dispatch(updatingtickets(projectId, ticketid, { Feature: featureid }));
  };

  const handleupdatePriority = (ticketId, PrioritytValue) => {
    dispatch(updatingtickets(projectId, ticketId, { Priority: PrioritytValue }));
  };

  const handlePriority = (event, ticketId) => {
    setisopening({ ...isopening, [ticketId]: event.currentTarget });
  };

  const handleclosing = (ticketId) => {
    setisopening({ ...isopening, [ticketId]: null });
  };
  const options = ['delete ticket', 'delete indicator'];

  const [openDeleting, setDeletemodall] = useState('');

  const handleCloseDeleting = () => {
    setDeletemodall(false);
  };

  const user = useSelector((state) => state.userReducer.user);
  const project = useSelector((state) => state.projectReducer.project);

   const userId=user?._id

  const [open, setOpen] = useState(false);

  const handleOpen = (ticketId) => {
    setOpen((prevOpen) => ({
      ...prevOpen,
      [ticketId]: true,
    }));
  };
  const handleClose = () => setOpen(false);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId && destination.index === source.index)
    ) {
      return;
    }

    const newPosition = destination.index + Date.now();
    const ticketsData = {
      position: newPosition,
      workflow: destination.droppableId,
    };

    dispatch(updateTicketPosition(draggableId, ticketsData, projectId));
  };

  const [checked, setchecked] = useState({});

  const handlePersonClick = (person) => {
    setSelectedPerson(person);

    setchecked((prevChecked) => {
      const newChecked = {};
      newChecked[person] = true;
      return newChecked;
    });

    // dispatch(filterTicketsByPerson(projectId, person));
  };

  const renderTicketBlock = (ticket) => {
    const hasFullCoverImage =
      ticket.CoverImage && ticket.CoverImage.length > 0 && ticket.CoverImage[0].size === 'Full';
    const hasSmallCoverImage =
      ticket.CoverImage && ticket.CoverImage.length > 0 && ticket.CoverImage[0].size === 'small';
    const backgroundColored = hasFullCoverImage ? ticket.CoverImage[0].colorimage : 'white';
    const backgroundColorr = hasSmallCoverImage && ticket.CoverImage[0].colorimage;
    const tooltipTitle = ticket?.Types?.TypesTitle ? ticket.Types?.TypesTitle : 'Story';

    return (
      <Box
        style={{
          borderRadius: '1px',
          marginTop: '20px',
          width: '280px',
          height: '185px',
          backgroundColor: backgroundColored,
        }}
      >
        {hasSmallCoverImage && (
          <Box
            style={{
              width: '280px',
              height: '20%',
              backgroundColor: backgroundColorr,
            }}
          />
        )}

        <TicketModal
          open={open[ticket._id]}
          handleClose={handleClose}
          ticket={ticket}
          user={user}
        />

<span style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
}}>
  <div style={{ display: 'flex', alignItems: 'center', marginLeft: "15px" }}>
    {ticket.Priority === 'Low' && (
      <KeyboardDoubleArrowDownIcon
        style={{ width: "15px", marginRight: "5px", color: "#5b356fcc" }}
      />
    )}
    {ticket.Priority === 'High' && (
      <KeyboardDoubleArrowUpIcon
        style={{ width: "15px", marginRight: "5px", color: "rgb(35 145 115)" }}
      />
    )}
    {ticket.Priority !== 'Low' && ticket.Priority !== 'High' && (
      <DensityMediumIcon
        style={{ width: "15px", marginRight: "5px", color: "#c1535c" }}
      />
    )}
    <Typography
      sx={{
        fontSize: '13px',
        color: ticket.Priority === 'Low'
          ? '#5b356fcc'
          : ticket.Priority === 'High'
          ? 'rgb(35 145 115)'
          : '#c1535c',
        fontFamily: 'revert',
        fontWeight: 'bold',
        marginRight: '8px',
      }}
      onClick={(event) => handlePriority(event, ticket._id)}
    >
      {ticket.Priority}
    </Typography>
  </div>

  {/* Right-aligned icon and menu */}
  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
    <IoEyeOutline
      onClick={() => handleOpen(ticket._id)}
      style={{ fontSize: "20px", marginLeft: "10px" }}
    />

    <LongMenu
      options={options}
      MoreVertIconstyle={{ alignItems: "flex-end", marginTop: "10px" }}
      setDeletemodall={setDeletemodall}
      ticketId={ticket._id}
      openDeleting={openDeleting}
      handleCloseDeleting={handleCloseDeleting}
      ticketname={ticket.Description}
    />
  </div>
</span>


        <PriorityMenu
          isopened={isopening[ticket._id]}
          handleclosed={() => handleclosing(ticket._id)}
          currentPriority={ticket.Priority}
          setPriority={(PrioritytValue) => handleupdatePriority(ticket._id, PrioritytValue)}
        />

        {editModes[ticket._id] ? (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 'fit-content' }}>
              <TextField
                defaultValue={ticket.Description}
                onChange={(e) => setDescription(e.target.value)}
                InputProps={{
                  style: {
                    height: '40px',
                    width: '260px',
                    border: ' 1px solid #5283FD',
                    marginLeft: '10px',
                    marginTop: '10px',
                  },
                }}
              />

              <div
                style={{ position: 'absolute', bottom: '-35px', left: '210px', display: 'flex' }}
              >
                <Box display="flex" alignItems="center">
                  <IconButton
                    style={{
                      width: '25px',
                      height: '25px',
                      backgroundColor: 'white',
                      borderRadius: '0',
                      opacity: 2000,
                      marginRight: '8px',
                    }}
                    onClick={() => handleCancel(ticket._id)}
                  >
                    <GrClose style={{ color: 'black', fontSize: '20px' }} />
                  </IconButton>
                  <IconButton
                    style={{
                      width: '25px',
                      height: '25px',
                      backgroundColor: 'white',
                      borderRadius: '0',
                      opacity: 2000,
                    }}
                    onClick={() => handleUpdateDescription(ticket._id)}
                  >
                    <GrCheckmark style={{ color: 'black', fontSize: '20px' }} />
                  </IconButton>
                </Box>
              </div>
            </div>
          </div>
        ) : (
          <Typography
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: ticket.CoverImage.length > 0 ? 'transparant' : '#e8e8e894',
                padding: '3px',
                '& .edit-icon': {
                  display: 'block',
                  width: '30px',
                },
              },
              fontSize: '13px',
              color: 'black',
              fontFamily: 'revert',
              fontWeight: '200',
              marginRight: '8px',
              marginLeft: '15px',
              marginTop: '10px',
              position: 'relative',
            }}
          >
            {ticket.Description}
            <Tooltip title="edit ticket">
              <IconButton
                className="edit-icon"
                sx={{
                  display: 'none',
                  position: 'absolute',
                  top: '50%',
                  left: '100%',
                  transform: 'translate(-100%, -50%)',
                }}
              >
                <EditIcon
                  onClick={() => handleEditClick(ticket._id)}
                  style={{ width: '15px', height: '13px', borderRadius: '0', marginTop: '10px' }}
                />
              </IconButton>
            </Tooltip>
          </Typography>
        )}

        <Featureupdate
          ticket={ticket}
          ticketid={ticket._id}
          handleFeatureSelect={(featureid) => handleFeatureSelect(featureid, ticket._id)}
          typographyStyle={{
            fontSize: '13px',
            width: '120px',
            textAlign: 'center',
            borderRadius: '3px',
            height: 'fit-content',
            fontWeight: 'bold',
            marginBottom: '3px',
            fontFamily: 'sans-serif',
            marginLeft: '10px',
            marginTop: '10px',
            color:
              ticket.Feature?.iconF === '#7CA1F3'
                ? '#385DB0'
                : ticket.Feature?.iconF === '#CDF7D4'
                ? '#51A15F'
                : ticket.Feature?.iconF === '#ffc0ca'
                ? '#CC596B'
                : 'black',
            backgroundColor: ticket.Feature?.iconF,
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '20px',
            marginLeft: '15px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={tooltipTitle} arrow>
              <img
                src={
                  ticket?.Types?.TypesTitle === 'Bug'
                    ? image1
                    : ticket?.Types?.TypesTitle === 'Task'
                    ? image
                    : ticket?.Types?.TypesTitle === 'story'
                    ? image2
                    : ticket?.Types?.TypesTitle === 'subTask'
                    ? image4
                    : ticket?.Types?.TypesIcon
                }
                alt="icon"
                style={{ width: '18px', height: '18px', marginRight: '10px' }}
              />
            </Tooltip>
            <Tooltip title={ticket.identifiant} arrow>
              <Typography
                style={{
                  fontWeight: 'bold',
                  marginRight: '14px',
                  color: '#3e6c90',
                  fontSize: '13px',
                  textDecoration: ticket.workflow.workflowTitle === 'DONE' && 'line-through',
                }}
              >
                {ticket.identifiant}
              </Typography>
            </Tooltip>
           
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {ticket.workflow?.workflowTitle === 'DONE' && (
              <div style={{ fontSize: '22px', marginRight: '10px' }}>
                <FcApproval />
              </div>
            )}

            {ticket.flag && <IoFlagSharp style={{ color: '#c04747', marginRight: '10px' }} />}
            <Tooltip
      title={` ${
        ticket.childTickets?.filter(child => child.workflow === 'DONE').length  || 0
      } of  ${ ticket.childTickets.length} Done Child Tickets `}
    >
            {ticket.childTickets.length > 0 && (
              <img
                src={image5}
                alt="childTicke"
                style={{
                  width: '15px',
                  height: '15px',
                  marginRight: '15px',
                 
                }}
              />
            )}
</Tooltip>


<StoryPoints
                                          userId={userId}
                                          projectId={projectId}
                                          ticket={ticket}
                                          project={project}
                                        />
            <Tooltip
              title={`Responsible: ${
                ticket.ResponsibleTicket ? ticket.ResponsibleTicket.firstName : 'Not assigned'
              }`}
            >
              <Avatar
                src={ticket?.ResponsibleTicket?.profilePicture || ''}
                onClick={(event) => handleResponsible(event, ticket._id)}
                sx={{
                  bgcolor: ticket?.ResponsibleTicket ? '#42a5f5' : '#3c597c',
                  width: 30,
                  height: 30,
                  fontSize: '11px',
                  marginRight: '20px',
                }}
              >
                {ticket?.ResponsibleTicket?.firstName &&
                  ticket?.ResponsibleTicket?.firstName.substring(0, 2).toUpperCase()}
              </Avatar>
            </Tooltip>

            <ResponsibleMenu
              ResponsibleTicket={ticket?.ResponsibleTicket?.firstName}
              responsible={ticket?.ResponsibleTicket}
              Responsibleid={ticket?.ResponsibleTicket?._id}
              projectId={projectId}
              ticketId={ticket._id}
              handleAssignResponsible={(userId) => handleAssignResponsible(userId, ticket._id)}
              MenuResponsible={MenuResponsible[ticket._id]}
              handleclosedResponsible={() => handleclosedResponsible(ticket._id)}
            />
          </div>
        </div>
      </Box>
      //     </div>
      //   >)}
      // </Draggable
    );
  };

  const workflows = useSelector((state) => state.workflowReducer.workflows) || [];
  const [selectedPerson, setSelectedPerson] = useState([]);

  return (
    <PageContainer title="Dashboard" description="This is Table">
      <DashboardCard title="All Tickets">
        <Box display="flex" flexDirection={'row'}>
          <FeatureMenu
            handleMenuToggle={handleMenuToggle}
            handleMenuClose={handleMenuClose}
            isMenuOpen={isMenuOpen}
            anchorEl={anchorEl}
            selectedFeatures={selectedFeatures}
            setSelectedFeatures={setSelectedFeatures}
          />

          <TasksMenu selectedTasks={selectedTasks} setselectedTasks={setselectedTasks} />
          <Box mb={2}>
            <FiltragePerPerson
              selectedPerson={selectedPerson}
              setSelectedPerson={setSelectedPerson}
              handlePersonClick={handlePersonClick}
              projectId={projectId}
              checked={checked}
              setchecked={setchecked}
            />
          </Box>
        </Box>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box style={{ display: 'flex', overflowX: 'auto', maxHeight: '600px' }}>
            {Array.isArray(workflows) &&
              workflows.map((workflow) => (
                <Box style={{ marginRight: '30px', minWidth: '280px' }} key={workflow._id}>
                  <Box
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      // position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      backgroundColor: 'white',
                      marginBottom: '20px',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '20px',
                        marginTop: '20px',
                      }}
                    >
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor:
                            workflow.workflowTitle === 'TO DO'
                              ? '#7ca1f35e'
                              : workflow.workflowTitle === 'IN_PROGRESS'
                              ? 'rgb(227 226 226 / 55%)'
                              : workflow.workflowTitle === 'DONE'
                              ? 'rgb(214 247 210)'
                              : workflow.workflowBackground,
                          marginRight: '10px',
                          marginBottom: '10px',
                        }}
                      ></div>
                      <Typography
                        sx={{
                          fontSize: '13px',
                          color: '#5d5d5d',
                          fontFamily: 'revert',
                          fontWeight: 'bold',
                          marginBottom: '10px',
                        }}
                      >
                        {workflow.workflowTitle}
                        <span style={{ marginLeft: '5px' }}>
                          {/* Display the count of tickets under each workflow */}
                          {
                            allTickets.filter(
                              (ticket) => ticket.workflow.workflowTitle === workflow.workflowTitle,
                            ).length
                          }
                        </span>
                      </Typography>
                    </div>
                  </Box>
                  <Droppable droppableId={workflow._id}>
                    {(provided) => (
                      <Box
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{ minHeight: 500 }}
                      >
                        {allTickets
                          .filter(
                            (ticket) =>
                              ticket.workflow?._id === workflow._id &&
                              (selectedFeatures.length === 0 ||
                                selectedFeatures.includes(ticket.Feature?.titleF)) &&
                              (selectedTasks.length === 0 ||
                                selectedTasks.includes(ticket.TaskId.TaskName)) &&
                              (selectedPerson.length === 0 ||
                                (selectedPerson.includes('Non-Assigned') &&
                                  !ticket.ResponsibleTicket) ||
                                selectedPerson.includes(ticket.ResponsibleTicket?.firstName)),
                          )
                          .map((ticket, index) => (
                            <Draggable draggableId={ticket._id} index={index} key={ticket._id}>
                              {(provided) => (
                                <Box
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  {renderTicketBlock(ticket)}
                                </Box>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Box>
              ))}
            <AddWorkflow />
          </Box>
        </DragDropContext>
      </DashboardCard>
    </PageContainer>
  );
}
