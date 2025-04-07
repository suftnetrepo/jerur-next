import React from 'react';
import { Table } from 'react-bootstrap';
import { dateFormatted } from '../../../utils/helpers';

const RecentProjects = ({ data }) => {
  console.log('......................................data', data);

  const getStatusColorCode = (status) => {
    const colors = {
      inactive: 'bg-danger',
      'under discipline': 'bg-warning',
      inactive: 'bg-info',
      active: 'bg-primary',
      provisional: 'bg-secondary'
    };
    return colors[status] || 'bg-secondary';
  };

  return (
    <div className="table-responsive">
      <Table className="table  table-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Firstname</th>
            <th>Lastname</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index}>
              <td>{dateFormatted(item.createdAt)}</td>
              <td>{item.first_name}</td>
              <td>{item.last_name}</td>
              <td>{item.email}</td>
              <td>{item.mobile}</td>
              <td>
                <span className={`badge ${getStatusColorCode(item.status)}`}>{item.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RecentProjects;
