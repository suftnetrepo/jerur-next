'use client';

import React, { useMemo, useState } from 'react';
import { Table } from '@/components/elements/table/table';
import { Button } from 'react-bootstrap';
import { useEvent } from '../../../../hooks/useEvent';
import { MdDelete } from 'react-icons/md';
import { TiEdit } from 'react-icons/ti';
import DeleteConfirmation from '../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import useDebounce from '../../../../hooks/useDebounce';
import { dateFormatted } from '../../../../utils/helpers';
import { useRouter } from 'next/navigation';
import Tooltip from '@mui/material/Tooltip';
import { getYesNoColorCode } from '@/utils/helpers';

const Page = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { data, error, loading, totalCount, handleDelete, handleFetch } = useEvent(debouncedSearchQuery);

  const columns = useMemo(
    () => [
      { Header: 'Title', accessor: 'title', sortType: 'basic' },
      {
        Header: 'Start Date',
        accessor: 'start_date',
        Cell: ({ value }) => <div className="d-flex align-items-center">{dateFormatted(value)}</div>
      },
      {
        Header: 'End Date',
        accessor: 'end_date',
        Cell: ({ value }) => <div className="d-flex align-items-center">{dateFormatted(value)}</div>
      },
      {
        Header: 'Status',
        accessor: 'status',
        headerClassName: { textAlign: 'center' },
        Cell: ({ value }) => (
          <div className="d-flex justify-content-start align-items-center">
            <span className={`badge ${getYesNoColorCode(value)}`}>{value ? 'Yes' : 'No'}</span>
          </div>
        )
      },
      {
        Header: 'Actions',
        disableSortBy: true,
        headerClassName: { textAlign: 'center' },
        Cell: ({ row }) => (
          <div className="d-flex justify-content-center align-items-center">
            <Tooltip title="Edit Event" arrow>
              <span className="p-0">
                <TiEdit
                  size={30}
                  className="pointer me-2"
                  onClick={() => {
                    router.push(`/protected/church/events/${row.original._id}/edit`);
                  }}
                />
              </span>
            </Tooltip>

            <Tooltip title="Delete Event" arrow>
              <span className="p-0">
                <DeleteConfirmation
                  onConfirm={async (id) => {
                    handleDelete(id);
                  }}
                  onCancel={() => {}}
                  itemId={row.original._id}
                >
                  <MdDelete size={30} className="pointer" />
                </DeleteConfirmation>
              </span>
            </Tooltip>
          </div>
        )
      }
    ],
    []
  );

  return (
    <>
      <div className={`ms-5 me-5 mt-2 ${!loading ? 'overlay__block' : null}`}>
        <div className="card-body">
          <h3 className="card-title ms-2 mb-2">Event Schedules</h3>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              className="form-control w-25"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              onClick={() => {
                router.push('/protected/church/events/create');
              }}
            >
              + Add Event
            </Button>
          </div>
          <Table data={data} columns={columns} pageCount={totalCount} loading={loading} fetchData={handleFetch} />
        </div>
      </div>
      {!loading && <span className="overlay__block" />}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
    </>
  );
};

export default Page;
