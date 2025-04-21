'use client';

import React, { useMemo, useState, Suspense } from 'react';
import { Table } from '@/components/elements/table/table';
import { Button } from 'react-bootstrap';
import { useFellowship } from '../../../../hooks/useFellowship';
import { MdArrowBack } from 'react-icons/md';
import { TiEdit } from 'react-icons/ti';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import { useRouter } from 'next/navigation';
import Tooltip from '@mui/material/Tooltip';
import RenderFormOffcanvas from './renderFormOffcanvas';
import { getYesNoColorCode } from '@/utils/helpers';

const Render = () => {
  const router = useRouter();
  const [show, setShow] = useState(false);
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
    handleSelect,
    handleSelectedAddress
  } = useFellowship();
 
  const columns = useMemo(
    () => [
      { Header: 'Name', accessor: 'name', sortType: 'basic' },
      { Header: 'Mobile', accessor: 'mobile', sortType: 'basic' },
      { Header: 'Address', accessor: 'addressLine1', sortType: 'basic' },
      { Header: 'Town', accessor: 'town', sortType: 'basic' },
      { Header: 'County', accessor: 'county', sortType: 'basic' },
      { Header: 'Postcode', accessor: 'postcode', sortType: 'basic' },
      { Header: 'Country', accessor: 'country', sortType: 'basic' },
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
          </div>
        )
      }
    ],
    []
  );

  return (
    <div className="ms-5 me-5 ">
      <div className="d-flex justify-content-start align-items-center mb-3">
        <Button variant="outline-secondary" onClick={() => router.push(`/protected/church/fellowship`)}>
          <MdArrowBack size={24} /> Back
        </Button>
        <h3 className="card-title ms-2">Fellowship</h3>
      </div>
      <div className={` mt-2 ${!loading ? 'overlay__block' : null}`}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-end mb-3">
            <div></div>
            <Button
              type="submit"
              size="sm"
              onClick={async () => {
                setShow(true);
                handleReset();
              }}
            >
              + Add Fellowship
            </Button>
          </div>
          <Table data={data} columns={columns} pageCount={totalCount} loading={loading} fetchData={handleFetch} />
        </div>
      </div>
      {!loading && <span className="overlay__block" />}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
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
        handleSelectedAddress={handleSelectedAddress}
      />
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
