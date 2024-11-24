import { createSelector } from 'reselect';

const selectTickets = state => state.ticketsReducer.tickets;



export const selectAllTickets = createSelector(
  [selectTickets],
  tickets => tickets.filter(ticket => ticket.TaskId?.StartDate != null)
);


// import { createSelector } from 'reselect';

// const selectTickets = state => state.ticketsReducer.tickets;

// export const selectAllTickets = createSelector(
//   [selectTickets],
//   tickets => tickets.filter(ticket => ticket.TaskId?.StartDate != null)
// );

// export const selectToDoTickets = createSelector(
//   [selectAllTickets],
//   tickets => tickets.filter(ticket => ticket.workflow.workflowTitle === 'TO DO')
// );

// export const selectInProgressTickets = createSelector(
//   [selectAllTickets],
//   tickets => tickets.filter(ticket => ticket.workflow.workflowTitle === 'IN_PROGRESS')
// );

// export const selectDoneTickets = createSelector(
//   [selectAllTickets],
//   tickets => tickets.filter(ticket => ticket.workflow.workflowTitle === 'DONE')
// );
