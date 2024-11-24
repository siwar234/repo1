import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import DeleteTicketModal from './DeleteTicketModal';


const ITEM_HEIGHT = 48;

export default function TicketdetailsMenu({handleflagclick,ticketid,
  isSecondGridOpen,
  taskId,deletingticketflag,
  projectId,
  handleCloseTicketGrid
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };


  //delete ticket modal

  const [openDeleting, setDeletemodall] = React.useState("");

  const handledelete = (ticketId) => {
    setDeletemodall((prevState) => ({
      ...prevState,
      [ticketId]: true,
    }));
    handleClose();
  };

  const handleCloseDeleting = () => {
    setDeletemodall(false);

      
    };


 // Function to handle exporting the ticket data to Excel
const handleExportExcel = () => {
    // Extract ticket data from the isSecondGridOpen object for the given taskId
    const ticketData = Object.keys(isSecondGridOpen[taskId] || {}).map((ticketId) => {
        const ticket = isSecondGridOpen[taskId][ticketId];
        return {
            // Collecting specific fields from each ticket
            Description: ticket.Description,
            Etat: ticket.workflow.workflowTitle,
            Priority: ticket.Priority,
            Project: ticket.projectId.projectName,
            Feature: ticket.Feature?.titleF, // Use optional chaining to safely access feature title
            Votes: ticket.votes?.length || 0, // If votes exist, use length, otherwise default to 0
            Responsible: ticket.ResponsibleTicket?.firstName, // Responsible person's first name
            CreatedAt: new Date(ticket.createdAt).toLocaleDateString(), // Format date
            UpdatedAt: new Date(ticket.updatedAt).toLocaleDateString(), // Format date
        };
    });

    // Defining the data for the Excel worksheet. The data is structured as a 2D array.
    const worksheetData = [
        [ticketData[0]?.Description], // Ticket Description in the first row
        [], // Empty row
        ['projectName', ticketData[0]?.Project || ''], // Project name in the third row
        ['Etat', ticketData[0]?.Etat || ''], // Etat (status) in the fourth row
        ['Priority', ticketData[0]?.Priority || ''], // Priority in the fifth row
        ['Feature', ticketData[0]?.Feature || ''], // Feature title in the sixth row
        ['Votes', ticketData[0]?.Votes || 0], // Number of votes in the seventh row
        ['Responsible', ticketData[0]?.Responsible || ''], // Responsible person's name in the eighth row
        [], // Another empty row
        ['Created At', ticketData[0]?.CreatedAt || ''], // Created At date in the 10th row
        ['Updated At', ticketData[0]?.UpdatedAt || ''], // Updated At date in the 11th row
    ];

    // Convert the 2D array to a worksheet using XLSX library
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Define the merge ranges for cells A1:B1
    const mergeRanges = [
        { s: { r: 0, c: 0 }, e: { r: 1, c: 1 } }, // Merge cells from A1 to B1
    ];

    // Apply the merge ranges to the worksheet
    worksheet['!merges'] = mergeRanges;

    // Create a new workbook (a container for worksheets)
    const workbook = XLSX.utils.book_new();

    // Append the created worksheet to the workbook with the sheet name "Tickets"
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');

    // Write the workbook to a buffer in xlsx format
    const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx', // Specify the file type (Excel format)
        type: 'array', // Specify the output format as an array
    });

    // Create a blob (binary large object) from the excelBuffer and set the type as octet-stream (for file download)
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // Use FileSaver's saveAs function to trigger the download of the Excel file
    saveAs(data, 'tickets.xlsx');
};





  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        style={{ color: '#42526E' }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: '20ch',
          },
        }}
      >
     
     <MenuItem
  onClick={() => {
    if (isSecondGridOpen[taskId][ticketid].flag) {
        deletingticketflag(ticketid);
    } else {
      handleflagclick(ticketid);
    }
  }}
>
  {isSecondGridOpen[taskId][ticketid].flag ? "delete an indicator" : "add an indicator"}
</MenuItem>

<MenuItem
  onClick={() => {  handledelete(isSecondGridOpen[taskId][ticketid])}}>

    delete ticket

</MenuItem>
<MenuItem
 onClick={handleExportExcel}>
 Export ticket csv format 
</MenuItem>


      </Menu>
      <DeleteTicketModal openDeleting={openDeleting}
       handleCloseDeleting={handleCloseDeleting}  ticketId={isSecondGridOpen[taskId][ticketid]._id} 
      ticketname={isSecondGridOpen[taskId][ticketid].Description}
      projectId={projectId}
      handleCloseTicketGrid={handleCloseTicketGrid}
       />

    </div>
  );
}