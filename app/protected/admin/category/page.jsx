'use client';

import React, { useMemo, useState } from 'react';
import { Table } from '@/components/elements/table/table';
import { Button } from 'react-bootstrap';
import { useCategories } from '../../../../hooks/useCategories';
import Badge from 'react-bootstrap/Badge';
import { MdDelete } from 'react-icons/md';
import { TiEdit } from 'react-icons/ti';
import DeleteConfirmation from '../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import RenderCategoryOffcanvas from './renderCategoryOffcanvas';
import useDebounce from '../../../../hooks/useDebounce';

const Category = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [show, setShow] = useState(false);
  const {
    data,
    error,
    editData,
    totalCount,
    handleFetch,
    loading,
    handleDelete,
    handleEdit,
    handleSelect,
    handleSave,
    handleReset
  } = useCategories(debouncedSearchQuery);

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
      { Header: 'Name', accessor: 'name', sortType: 'basic' },
      { Header: 'Description', accessor: 'description', sortType: 'basic' },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <div className="d-flex justify-content-center align-items-center">
            {value ? (
              <Badge bg="success" className="p-2">
                Yes
              </Badge>
            ) : (
              <Badge bg="danger" className="p-2">
                No
              </Badge>
            )}
          </div>
        )
      },
      {
        Header: 'Actions',
        disableSortBy: true,
        headerClassName: { textAlign: 'center' },
        Cell: ({ row }) => (
          <div className="d-flex justify-content-center align-items-center">
            <TiEdit
              size={30}
              className="pointer me-2"
              onClick={() => {
                handleShow();
                handleSelect(row.original);
              }}
            />
            <DeleteConfirmation
              onConfirm={async (id) => {
                handleDelete(id);
              }}
              onCancel={() => {}}
              itemId={row.original._id}
            >
              <MdDelete size={30} className="pointer" />
            </DeleteConfirmation>
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
          <h5 className="card-title ms-2 mb-2">Categories</h5>
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
             + Add Category
            </Button>
          </div>
          <Table data={data} columns={columns} pageCount={totalCount} fetchData={handleFetch} />
        </div>
      </div>
      {!loading && <span className="overlay__block" />}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
      <RenderCategoryOffcanvas
        handleClose={handleClose}
        show={show}
        editData={editData}
        handleEdit={handleEdit}
        handleSave={handleSave}
      />
    </>
  );
};

export default Category;
