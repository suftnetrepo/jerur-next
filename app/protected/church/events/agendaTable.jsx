import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { TiEdit, TiDelete } from 'react-icons/ti';
import Tooltip from '@mui/material/Tooltip';
import DeleteConfirmation from '../../../../src/components/elements/ConfirmDialogue';

const AgendaTable = ({ agenda, handleSelect, eventId, handleDelete }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Sn</th>
          <th>Title</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Status</th>
          <th className="d-flex justify-content-center align-items-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {agenda?.length > 0 ? (
          agenda
            .sort((a, b) => a.sequency_no - b.sequency_no)
            .map((item) => (
              <tr key={item._id}>
                <td>{item.sequency_no}</td>
                <td>{item.title}</td>
                <td>{item.start_time}</td>
                <td>{item.end_time}</td>
                <td>{item.status ? <Badge bg="success">Yes</Badge> : <Badge bg="secondary">No</Badge>}</td>
                <td>
                  <div className="d-flex justify-content-center align-items-center">
                    <Tooltip title="Edit Agenda" arrow>
                      <span className="p-0">
                        <TiEdit size={30} className="pointer me-1" onClick={async () => await handleSelect(item)} />
                      </span>
                    </Tooltip>
                    <Tooltip title="Delete Agenda" arrow>
                      <span className="p-0">
                        <DeleteConfirmation
                          onConfirm={async (id) => {
                            handleDelete(id, eventId);
                          }}
                          onCancel={() => {}}
                          itemId={item._id}
                        >
                          <TiDelete size={30} className="pointer" />
                        </DeleteConfirmation>
                      </span>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center text-muted">
              No agenda items available.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default AgendaTable;
