import React, { useEffect, useState } from 'react';
import { Divider, MenuItem, Menu } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getTypes } from '../../JS/actions/Types';
import TicketTypeModal from 'src/views/dashboard/Tickets/Type/TicketTypeModal';

export default function TicketTypeMenu({
  menuAnchor,
  
  handleMenuClose,
  setTicketType,
  image,
  image1,
  image2,
  ticketType,
  setticketTitle,
  selectedIcon,
  setSelectedIcon,
  setticketicon
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTypes());
  }, [dispatch]);

  const Types = useSelector((state) => state.typesReducer.types) || [];


    //manage worflows
    const [open, setOpen] = useState(false);

    const handleOpentype = () => setOpen(true);
    

  return (
    <>
      <Menu
        id="type-menu"
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {Array.isArray(Types) &&
          Types.map((Type) => (
            ticketType !== Type?._id && ( 
              <MenuItem
                key={Type?._id}
                style={{ width: '150px' }}
                onClick={() => {
                  console.log('Changing Type:', Type?.TypesTitle, 'ID:', Type?._id);
                  setTicketType(Type?._id); 
                  setticketTitle(Type?.TypesTitle)
                  setticketicon(Type?.TypesIcon)

                  handleMenuClose(); 
                }}
              >
                <img
                  src={
                    Type.TypesTitle === 'Bug'
                      ? image1
                      : Type.TypesTitle === 'Task'
                      ? image
                      :Type.TypesTitle === 'story'
                      ? image2
                      :Type.TypesIcon
                  }
                  alt="icon"
                  style={{
                    width: '18px',
                    height: '18px',
                    marginRight: '10px',
                  }}
                />
                <span
                  style={{
                    color: '#29292b',
                    fontFamily: 'sans-serif',
                  }}
                >
                  {Type?.TypesTitle}
                </span>
              </MenuItem>
            )
          ))}
        <Divider />
        <MenuItem
          onClick={handleOpentype}
          style={{ fontFamily: 'sans-serif' }}
        >
          Manage Types

        </MenuItem>
        <TicketTypeModal open={open} setOpen={setOpen}  selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} />
      </Menu>
    </>
  );
}
