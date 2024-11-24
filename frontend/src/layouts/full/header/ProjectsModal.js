import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Fade,
  TextField,
  Typography,
  Avatar,
  Button,
  Box,
  Select,
  MenuItem,
  FormHelperText,
  FormControl,
} from '@mui/material';
import image from '../../../assets/images/scrum.gif';
import { useDispatch, useSelector } from 'react-redux';
import { createProject } from 'src/JS/actions/project';
import { GetchEquipesOwner } from 'src/JS/actions/equipe';
import { useNavigate } from 'react-router';

const ProjectsModal = ({ openProject, handleCloseProject }) => {
  const dispatch = useDispatch();
  const navigate=useNavigate()
  const [projectName, setProjectName] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState('');
  const [customProjectType, setCustomProjectType] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedResponsable, setSelectedResponsable] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [projectNameError, setprojectNameError] = useState('');
  const [projectTypeError, setprojectTypeError] = useState('');
  const [projectTeamError, setprojectTeamError] = useState(false);
  const [projectResposnibleError, setprojectResposnibleError] = useState(false);

  const user = useSelector((state) => state.userReducer.user);
  const userId = user._id;

  const handleSubmit = async () => {
    if (projectName.trim() === '') {
      setprojectNameError('Project Name is required');
      return;
    }
    
    if (selectedProjectType === '' || (selectedProjectType === 'Other' && customProjectType.trim() === '')) {
      setprojectTypeError('Project Type is required');
      return;
    }

    if (selectedTeam === '') {
      setprojectTeamError(true);
      return;
    }

    if (selectedResponsable === '') {
      setprojectResposnibleError(true);
      return;
    }

    const formData = {
      projectName,
      senderId: user._id,
      type: selectedProjectType === 'Other' ? customProjectType.trim() : selectedProjectType,
      equipeId: selectedTeam,
      ResponsableId: selectedResponsable || user._id,
    };

    await dispatch(createProject(formData,navigate));

    // Reset state
    setProjectName('');
    setSelectedProjectType('');
    setCustomProjectType('');
    setSelectedTeam('');
    setSelectedResponsable('');
    handleCloseProject();
  };

  useEffect(() => {
    dispatch(GetchEquipesOwner(userId));
  }, [dispatch]);

  const equipesOwner = useSelector((state) => state.equipeReducer.EquipesOwner);

  const handleTeamChange = (teamId) => {
    const selectedTeam = equipesOwner.find((equipe) => equipe._id === teamId);
    setTeamMembers(selectedTeam ? selectedTeam.members : []);
    setSelectedResponsable('');
    setprojectTeamError(false); 
    setprojectResposnibleError(false)
  };

  const handleTypeChange = (event) => {
    setSelectedProjectType(event.target.value);
    if (event.target.value !== 'Other') {
      setCustomProjectType('');
    }
    setprojectTypeError(''); // Clear error on type change
  };

  const handleBlur = () => {
    if (selectedTeam === '') {
      setprojectTeamError(true);
    }
  };

  return (
    <Modal open={openProject}>
      <Fade in={openProject}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              width: '960px',
              height: '630px',
              padding: '20px',
              background: '#fff',
              borderRadius: '5px',
              overflow: 'auto',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            <div style={{ marginRight: '20px' }}>
              <Typography
                variant="h6"
                sx={{ fontSize: 20, fontWeight: '550', marginLeft: '10px' }}
                color="rgb(52, 71, 103)"
                fontFamily={'Roboto, Helvetica, Arial, sans-serif'}
                gutterBottom
                mt={2}
              >
                Create a New Project
              </Typography>
              <div style={{ marginRight: '20px', flex: 'column' }}>
                <Typography variant="body1" gutterBottom mt={5} mb={4} fontWeight={'150'}>
                  Explore what's possible when you collaborate with your team. Edit project details
                  anytime in project settings.
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Project Name <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField
                  placeholder="Try a project Name, project goal, milestone ..."
                  variant="outlined"
                  fullWidth
                  value={projectName}
                  error={!!projectNameError}
                  helperText={projectNameError}
                  onChange={(e) => setProjectName(e.target.value)}
                />

                <Typography mt={2} variant="body1" gutterBottom>
                  Choose your Project Type <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Select
                  fullWidth
                  value={selectedProjectType}
                  onChange={handleTypeChange}
                  error={!!projectTypeError}
                >
                  <MenuItem value="">Select Project Type</MenuItem>
                  <MenuItem value="Software development">Software development</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Design">Design</MenuItem>
                  <MenuItem value="Human Resources">Human Resources</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {selectedProjectType === 'Other' && (
                  <TextField
                    style={{ marginTop: '10px' }}
                    fullWidth
                    value={customProjectType}
                    onChange={(e) => setCustomProjectType(e.target.value)}
                    placeholder="Enter custom project type"
                    error={!!projectTypeError}
                    helperText={projectTypeError}
                  />
                )}

                <Typography mt={2} variant="body1" gutterBottom>
                  Assign a team <span style={{ color: 'red' }}>*</span>
                </Typography>
                <FormControl fullWidth error={projectTeamError}>
                  <Select
                    fullWidth
                    value={selectedTeam}
                    onChange={(e) => {
                      setSelectedTeam(e.target.value);
                      handleTeamChange(e.target.value);
                    }}
                    onBlur={handleBlur}
                  >
                    {equipesOwner.map((equipe) => (
                      <MenuItem key={equipe._id} value={equipe._id}>
                        {equipe.NameEquipe}
                      </MenuItem>
                    ))}
                  </Select>
                  {projectTeamError && (
                    <FormHelperText>Please select a team.</FormHelperText>
                  )}
                </FormControl>

                {selectedTeam && (
                  <div>
                    <Typography mt={2} variant="body1" gutterBottom>
                      Choose Responsible <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FormControl fullWidth error={projectResposnibleError}>
                      <Select
                        fullWidth
                        value={selectedResponsable}
                        onChange={(e) => setSelectedResponsable(e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Select Responsible
                        </MenuItem>
                        <MenuItem value={user._id}>
                          <Avatar
                            src={user?.profilePicture}
                            sx={{
                              bgcolor: '#42a5f5',
                              width: 30,
                              height: 30,
                              marginRight: 1,
                              fontSize: '13px',
                            }}
                          >
                            {user?.firstName && user?.firstName.substring(0, 2).toUpperCase()}
                          </Avatar>
                          <span>{user.firstName}</span>
                        </MenuItem>
                        {teamMembers.map((member) => (
                          <MenuItem key={member.memberId._id} value={member.memberId._id}>
                            <Avatar
                              src={member.memberId.profilePicture}
                              sx={{
                                bgcolor: '#42a5f5',
                                width: 30,
                                height: 30,
                                marginRight: 1,
                                fontSize: '13px',
                              }}
                            >
                              {member.memberId.firstName &&
                                member.memberId.firstName.substring(0, 2).toUpperCase()}
                            </Avatar>
                            <span> {member.memberId.firstName}</span>
                          </MenuItem>
                        ))}
                      </Select>
                      {projectResposnibleError && (
                    <FormHelperText>Please select a Responsable.</FormHelperText>
                  )}
                    </FormControl>
                    
                  </div>
                )}
              </div>
            </div>
            <Box style={{ display: 'flex', flexDirection: 'column' }}>
              <img src={image} alt="teamimg" style={{ width: '350px', marginTop: '140px' }} />
              <Box
                maxWidth="100%"
                maxHeight={'90%'}
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '70px',
                  paddingRight: '20px',
                }}
              >
                <Button color="inherit" variant="contained" size="small" onClick={handleCloseProject}>
                  Close
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  style={{ marginLeft: '10px', backgroundColor: 'rgb(52, 71, 103)' }}
                  onClick={handleSubmit}
                >
                  Create a New Project
                </Button>
              </Box>
            </Box>
          </div>
        </div>
      </Fade>
    </Modal>
  );
};

ProjectsModal.propTypes = {
  openProject: PropTypes.bool.isRequired,
  handleCloseProject: PropTypes.func.isRequired,
};

export default ProjectsModal;
