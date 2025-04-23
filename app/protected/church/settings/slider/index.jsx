'use client';

import React, { useMemo, useState } from 'react';
import { Table } from '@/components/elements/table/table';
import { Button, Badge } from 'react-bootstrap';
import { useSlider } from '@/hooks/useSlider';
import { TiEdit } from 'react-icons/ti';
import { MdDelete } from 'react-icons/md';
import ErrorDialogue from '@/src/components/elements/errorDialogue';
import DeleteConfirmation from '@/src/components/elements/ConfirmDialogue';
import Tooltip from '@mui/material/Tooltip';
import RenderSliderOffcanvas from './render';

const Slider = () => {
  const [show, setShow] = useState(false);
  const {
    handleChange,
    handleEdit,
    handleSave,
    handleFetch,
    handleSelect,
    handleReset,
    handleDelete,
    data,
    error,
    fields,
    loading,
    success
  } = useSlider();

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
      { Header: 'Title', accessor: 'title', sortType: 'basic' },
      { Header: 'Description', accessor: 'message', sortType: 'basic' },
      {
        Header: 'Image Only',
        accessor: 'imageOnly',
        Cell: ({ value }) => (
          <div className="d-flex justify-content-start align-items-center">
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
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <div className="d-flex justify-content-start align-items-center">
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
        className: 'center',
        Cell: ({ row }) => (
          <div className="d-flex justify-content-center align-items-center">
            <Tooltip title="Edit Slider" arrow>
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
            <Tooltip title="Delete Slider" arrow>
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
    <div className="ms-5 me-5 ">
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
              + Add Slider
            </Button>
          </div>
          <Table data={data} columns={columns} pageCount={data?.length > 0 ? data?.length  : 0} loading={loading} fetchData={handleFetch} />
        </div>
      </div>
      {!loading && <span className="overlay__block" />}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
      <RenderSliderOffcanvas
          handleClose={handleClose}
          handleChange={handleChange}
          handleSave={handleSave}
          show={show}
          setShow={setShow}
          fields={fields}
          success={success}
          handleReset={handleReset}
          handleEdit={handleEdit}
        />
    </div>
  );
};

export default Slider;
