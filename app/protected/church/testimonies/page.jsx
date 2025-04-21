'use client';

import React, { useMemo, useState } from 'react';
import { Table } from '../../../../src/components/elements/table/table';
import { Button } from 'react-bootstrap';
import { useTestimonies } from '../../../../hooks/useTestimonies';
import { MdDelete } from 'react-icons/md';
import { TiEdit } from 'react-icons/ti';
import DeleteConfirmation from '../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import useDebounce from '../../../../hooks/useDebounce';
import RenderTestimonyOffcanvas from './renderOffcanvas';
import Tooltip from '@mui/material/Tooltip';
import { getYesNoColorCode, dateFormatted } from '@/utils/helpers';

const Page = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [show, setShow] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const {
    data,
    error,
    fields,
    success,
    loading,
    totalCount,
    handleFetch,
    handleDelete,
    handleEdit,
    handleSave,
    handleReset,
    handleChange,
    handleSelect
  } = useTestimonies(debouncedSearchQuery);

  const handleClose = () => {
    handleReset();
    setShow(false);
  };
  const handleShow = () => {
    handleReset();
    setShow(true);
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'createdAt',
        headerClassName: { textAlign: 'center' },
        Cell: ({ value }) => (
          <div className="d-flex justify-content-start align-items-center">
            <span >{dateFormatted(value)}</span>
          </div>
        )
      },
      { Header: 'Firstname', accessor: 'first_name', sortType: 'basic' },
      { Header: 'Lastname', accessor: 'last_name', sortType: 'basic' },
      {
        Header: 'Status',
        accessor: 'status',
        headerClassName: { textAlign: 'center' },
        Cell: ({ value }) => (
          <div className="d-flex justify-content-start align-items-center">
            <span className={`badge ${getYesNoColorCode(value)}`}>{value ? 'Yes' :'No'}</span>
          </div>
        )
      },
      {
        Header: 'Actions',
        disableSortBy: true,
        className: 'center',
        Cell: ({ row }) => (
          <div className="d-flex justify-content-center align-items-center">
            <Tooltip title="Edit Testimony" arrow>
              <span className="p-0">
                <TiEdit
                  size={30}
                  className="pointer me-2"
                  onClick={() => {
                    handleShow();
                    handleSelect(row.original);
                  }}
                />
              </span>
            </Tooltip>
            <Tooltip title="Delete Testimony" arrow>
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
          <h5 className="card-title ms-2 mb-2">Testimonies</h5>
          <div className="d-flex justify-content-between align-items-center mb-3">
            {/* Search Box */}
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
                handleShow();
              }}
            >
              + Add Testimony
            </Button>
          </div>
          <Table data={data} columns={columns} pageCount={totalCount} loading={loading} fetchData={handleFetch} />
        </div>
      </div>
      {!loading && <span className="overlay__block" />}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
      <RenderTestimonyOffcanvas
        handleClose={handleClose}
        handleChange={handleChange}
        show={show}
        setShow={setShow}
        fields={fields}
        success={success}
        handleReset={handleReset}
        handleEdit={handleEdit}
        handleSave={handleSave}
      />
    </>
  );
};

export default Page;
