'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Table } from '../../../../src/components/elements/table/table';
import { Button } from 'react-bootstrap';
import { useMember } from '../../../../hooks/useMember';
import { MdDelete } from 'react-icons/md';
import { TiEdit } from 'react-icons/ti';
import DeleteConfirmation from '../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import useDebounce from '../../../../hooks/useDebounce';
import RenderUserOffcanvas from './renderOffcanvas';
import Tooltip from '@mui/material/Tooltip';
import { capitalizeFirstLetter, getStatusStyle } from '../../../../utils/helpers';

const MEMBER_STATUS_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'provisional', label: 'Provisional' },
  { key: 'under discipline', label: 'Under Discipline' },
  { key: 'inactive', label: 'Inactive' }
];

const Page = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [show, setShow] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const {
    data,
    error,
    fields,
    success,
    loading,
    totalCount,
    statusCounts,
    handleFetch,
    handleDelete,
    handleEdit,
    handleFetchOne,
    handleSave,
    handleReset,
    handleChange,
    handleSelect
  } = useMember(debouncedSearchQuery, selectedStatus);

  const handleClose = useCallback(() => {
    handleReset();
    setShow(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('memberId');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [handleReset, pathname, router, searchParams]);
  const handleShow = useCallback(() => {
    handleReset();
    setShow(true);
  }, [handleReset]);

  useEffect(() => {
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return;
    }

    handleFetchOne(memberId).then((result) => {
      if (result) {
        setShow(true);
      }
    });
  }, [searchParams, handleFetchOne]);

  const columns = useMemo(
    () => [
      { Header: 'Firstname', accessor: 'first_name', sortType: 'basic' },
      { Header: 'Lastname', accessor: 'last_name', sortType: 'basic' },
      { Header: 'Mobile', accessor: 'mobile', sortType: 'basic' },
      { Header: 'Email', accessor: 'email' },
      {
        Header: 'Role',
        accessor: 'role',
        headerClassName: { textAlign: 'center' },
        Cell: ({ value }) => (
          <div className="d-flex justify-content-start align-items-center">
            <span >{capitalizeFirstLetter(value)}</span>
          </div>
        )
      },
      {
        Header: 'Status',
        accessor: 'status',
        headerClassName: { textAlign: 'center' },
        Cell: ({ value }) => (
          <div className="d-flex justify-content-start align-items-center">
            <span style={getStatusStyle(value)}>{capitalizeFirstLetter(value)}</span>
          </div>
        )
      },
      {
        Header: 'Actions',
        disableSortBy: true,
       headerClassName: 'text-center actions-header',
        className: 'text-center actions-cell',
        Cell: ({ row }) => (
          <div className="d-flex justify-content-center align-items-center">
            <Tooltip title="Edit Member" arrow>
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
            <Tooltip title="Delete Member" arrow>
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
    [handleDelete, handleSelect, handleShow]
  );

  const getStatusCount = useCallback((statusKey) => {
    if (statusKey === 'ALL') {
      return statusCounts?.all ?? totalCount;
    }

    return statusCounts?.[statusKey] ?? 0;
  }, [statusCounts, totalCount]);

  return (
    <>
      <div className={`ms-5 me-5 mt-2 ${!loading ? 'overlay__block' : null}`}>
        <div className="card-body">
          <h5 className="card-title ms-2 mb-2">Members</h5>
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
              + Add Member
            </Button>
          </div>
          <div className="mb-4">
            <div className="small fw-semibold mb-2">Status</div>
            <div className="d-flex gap-2 flex-wrap">
              {MEMBER_STATUS_FILTERS.map((status) => (
                <Button
                  key={status.key}
                  variant={selectedStatus === status.key ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setSelectedStatus(status.key)}
                  className="text-nowrap"
                >
                  {status.label} ({getStatusCount(status.key)})
                </Button>
              ))}
            </div>
          </div>
          <Table
            key={selectedStatus}
            data={data}
            columns={columns}
            pageCount={totalCount}
            loading={loading}
            fetchData={handleFetch}
          />
        </div>
      </div>
      {!loading && <span className="overlay__block" />}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
      <RenderUserOffcanvas
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
