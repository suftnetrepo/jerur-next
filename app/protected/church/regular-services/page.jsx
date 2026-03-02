'use client';

import React, { useMemo, useState, Suspense } from 'react';
import { Table } from '../../../../src/components/elements/table/table';
import { Button } from 'react-bootstrap';
import { useRegularService } from '../../../../hooks/useRegularService';
import { MdArrowBack } from 'react-icons/md';
import { TiEdit } from 'react-icons/ti';
import { FaTasks } from 'react-icons/fa';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import { useRouter } from 'next/navigation';
import Tooltip from '@mui/material/Tooltip';
import RenderFormOffcanvas from './renderFormOffcanvas';
import RenderAgendaOffcanvas from './renderAgendaOffcanvas';
import { getYesNoColorCode, serviceType } from '../../../../utils/helpers';
import useDebounce from '../../../../hooks/useDebounce';

const Render = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [showAgenda, setShowAgenda] = useState(false);
  const {
    data,
    error,
    fields,
    success,
    loading,
    totalCount,
    handleDelete,
    handleFetch,
    handleChange,
    handleEdit,
    handleSave,
    handleReset,
    handleSelect
  } = useRegularService(debouncedSearchQuery);

  const columns = useMemo(
    () => [
      { Header: 'Sn', accessor: 'sequency_no', sortType: 'basic' },
      {
        Header: 'Service Type',
        accessor: 'service_type',
        headerClassName: { textAlign: 'center' },
        Cell: ({ value }) => (
          <div className="d-flex justify-content-start align-items-center">
            <span>{serviceType[value]}</span>
          </div>
        )
      },
      { Header: 'Title', accessor: 'title', sortType: 'basic' },
      { Header: 'Start Time', accessor: 'start_time', sortType: 'basic' },
      { Header: 'End Time', accessor: 'end_time', sortType: 'basic' },
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
        Header: 'Remote',
        accessor: 'remote',
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
            <Tooltip title="Edit Service" arrow>
              <span className="p-0">
                <TiEdit
                  size={30}
                  className="pointer me-2"
                  onClick={async () => {
                    setShow(true);
                    await handleSelect(row.original);
                  }}
                />
              </span>
            </Tooltip>
            <Tooltip title="View Service Agenda" arrow>
              <span className="p-0">
                <FaTasks
                  size={30}
                  className="pointer ms-2"
                  onClick={async () => {
                    setShowAgenda(true);
                    await handleSelect(row.original);
                  }}
                />
              </span>
            </Tooltip>
          </div>
        )
      }
    ],
    []
  );

  return (
    <div className="ms-5 me-5 ">
      <div className="d-flex justify-content-start align-items-center mb-3">

        <h3 className="card-title ms-2">Regular Services</h3>
      </div>
      <div className={` mt-2 ${!loading ? 'overlay__block' : null}`}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-end mb-3">
            <div><input
              type="text"
              className="form-control w-25"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            /></div>
            <Button
              type="submit"
              size="sm"
              onClick={async () => {
                setShow(true);
                handleReset();
              }}
            >
              + Add Service
            </Button>
          </div>
          <Table data={data} columns={columns} pageCount={totalCount} loading={loading} fetchData={handleFetch} />
        </div>
      </div>
      {!loading && <span className="overlay__block" />}
      {error && <ErrorDialogue showError={error} onClose={() => { }} />}
      <RenderFormOffcanvas
        fields={fields}
        handleChange={handleChange}
        handleSave={handleSave}
        handleEdit={handleEdit}
        handleReset={handleReset}
        handleDelete={handleDelete}
        show={show}
        success={success}
        error={error}
        setShow={setShow}
      />
      {fields._id && <RenderAgendaOffcanvas show={showAgenda} setShow={setShowAgenda} selectedServiceId={fields._id} />}
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Render />
    </Suspense>
  );
}
