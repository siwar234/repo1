import { Avatar, AvatarGroup, Box, Button, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { IoPersonAdd } from 'react-icons/io5';
import MenuFiltredPerson from './MenuFiltredPerson';
import InvitationModal from 'src/views/teams/InvitationModal';
import { useDispatch } from 'react-redux';
import { getTasks } from 'src/JS/actions/tasks';

export const FiltragePerPerson = ({ selectedPerson,setSelectedPerson,handlePersonClick,projectId ,checked,setchecked}) => {
  const projects = useSelector((state) => state.projectReducer.project);
 const dispatch=useDispatch()
  const equipes = projects?.Equipe;
  const owner = equipes?.owner;
  const filteredMembers =
    equipes?.members?.filter((member) => member.memberId?._id !== owner?._id
    )  
     || [];



    //Menu 

    const [isMenuOpened, setisMenuOpened] = useState(false);
    const [anchorEl, setAnchor] = useState(null);

    const handleMenu = (event) => {
      setisMenuOpened((prevOpen) => !prevOpen);
      setAnchor(event.currentTarget); 
  };

//checkperson
  const isAnyMemberChecked = Object.values(checked).some((isChecked) => isChecked);

  return (
<Box 
  marginLeft={3}  
  display="flex" 
  flexDirection="row" 
  alignItems="center" 
  gap={2} 
>
      
              {!isAnyMemberChecked && (

      <AvatarGroup
      
        style={{ justifyContent: 'center', 
          alignItems: 'center', marginLeft: '40px' }}
        max={3}
      >
        <Tooltip title="non assigned">
          <Avatar

            sx={{
              bgcolor: '#576883',
              width: 35,
              height: 35,
              fontSize: '13px',
            }}
          ></Avatar>
        </Tooltip>

        <Avatar
         onClick={handleMenu}
         id="Filtrage-menu-button"
         aria-controls={isMenuOpened ? 'Filtrage-menu' : undefined}
         aria-expanded={isMenuOpened}
         aria-haspopup="true"
          sx={{
            bgcolor: '#e0e1e3c7',
            width: 35,
            height: 35,
            fontSize: '13px',
            marginRight: '10px',
            color:"#576883",
            fontWeight:"bold",
            
          }}
        >
     + {filteredMembers.length + 1} 
        </Avatar>
       
    
         </AvatarGroup>  )}
 <MenuFiltredPerson
         owner={owner}
         handleMenu={handleMenu} 
         checked={checked}
         setchecked={setchecked}
         isMenuOpened={isMenuOpened} anchorEl={anchorEl} setisMenuOpened={setisMenuOpened} setAnchor={setAnchor} filteredMembers={filteredMembers} setSelectedPerson={setSelectedPerson} selectedPerson={selectedPerson} />
      
      
      
      {isAnyMemberChecked && (

    
<AvatarGroup
      
style={{ justifyContent: 'center', 
  alignItems: 'center', marginLeft: '50px', 
  marginRight:"15px",
  
}}
max={3}
>
<Tooltip title="non assigned">
  <Avatar
              onClick={() => handlePersonClick('Non-Assigned')}


    sx={{
      bgcolor: '#576883',
      width: 35,
      height: 35,
      fontSize: '13px',
    }}
  ></Avatar>
</Tooltip>

<Tooltip title={owner?.firstName}>
  <Avatar
      onClick={() => handlePersonClick(owner?.firstName)} 

      src={owner?.profilePicture}

    sx={{
      bgcolor: '#576883',
      width: 35,
      height: 35,
      fontSize: '13px',
      border: checked[owner?.firstName]
       || selectedPerson === owner?.firstName ? '2px solid blue !important' : 'none',

    }}
  >       {owner?.firstName && owner?.firstName.substring(0, 2).toUpperCase()}

  </Avatar>
</Tooltip>
{filteredMembers?.map((member) => (
        <Tooltip title={member?.memberId?.firstName}>

        <Avatar
              onClick={() => handlePersonClick(member?.memberId?.firstName)}

         src={member?.memberId?.profilePicture}
         sx={{

            bgcolor: '#e0e1e3c7',
            width: 35,
            height: 35,
            fontSize: '13px',
            color:"#576883",
            fontWeight:"bold",
            border: checked[member?.memberId?.firstName] || selectedPerson === member?.memberId?.firstName 
            ? '2px solid blue !important' : 'none', 

          }}
        >
      {member?.memberId?.firstName && member?.memberId?.firstName.substring(0, 2).toUpperCase()}

        </Avatar>
     
</Tooltip>
        
        ))}

        </AvatarGroup>)}




      <Tooltip title="invite to team"


      >
      <Avatar
        
        sx={{
          bgcolor: '#e0e1e3d9',
          width: 35,
          height: 35,
          fontSize: '13px',
        }}
      >
        <IoPersonAdd style={{ width: 20, height: 20 ,color:"#576883",    
               fontWeight:"bold"
}} />
      </Avatar>
      </Tooltip>
      {isAnyMemberChecked && (
        <Button
                  variant="contained"
                  sx={{
                    border: 'none',
                    fontWeight: 'bold',
                    fontFamily: 'inherit',
                    fontSize:  '12px',
                    color: 'black',
                    backgroundColor: '#434a4f1f',
                    minWidth: '5px',
                    width:  '120px',
                    height: '35px',
                    MaxHeight: '5px',
                    fontcolor: 'black',
                    padding: '1 px',
                    justifyContent: 'center',
                    marginLeft: '20px',
                  }}
                  onClick={() => {
                    dispatch(getTasks(projectId));

                    setSelectedPerson([]); 
                    setchecked({});
                  }}
                  

              
                >
                  cancel filters
                </Button>)}
                <InvitationModal   />

    </Box>
  );
};
