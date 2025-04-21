import React from 'react';
import { Table } from 'react-bootstrap';
import { TiDelete } from 'react-icons/ti';
import Tooltip from '@mui/material/Tooltip';
import DeleteConfirmation from '@/components/elements/ConfirmDialogue';

const RegisterTable = ({ data, eventId, handleDelete }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Firstname</th>
          <th>Lastname</th>
          <th>Mobile</th>
          <th>Email</th>
          <th className="d-flex justify-content-center align-items-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data?.length > 0 ? (
          data.map((item) => (
            <tr key={item._id}>
              <td>{item.first_name}</td>
              <td>{item.last_name}</td>
              <td>{item.mobile}</td>
              <td>{item.email}</td>
              <td>
                <div className="d-flex justify-content-center align-items-center">
                  <Tooltip title="Delete Agenda" arrow>
                    <span className="p-0">
                      <DeleteConfirmation
                        onConfirm={async (id) => {
                          handleDelete(id, eventId);
                        }}
                        onCancel={() => {}}
                        itemId={item._id}
                      >
                        <TiDelete size={40} className="pointer" />
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
              No register member available.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default RegisterTable;
