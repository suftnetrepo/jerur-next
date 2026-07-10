'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Badge, Button, Card, Form } from 'react-bootstrap';
import Tooltip from '@mui/material/Tooltip';
import { TiEdit, TiEye } from 'react-icons/ti';
import { MdDelete } from 'react-icons/md';
import { BsBook, BsCalendar2Week, BsCheck2Circle, BsPencilSquare } from 'react-icons/bs';
import { Table } from '../../../../src/components/elements/table/table';
import DeleteConfirmation from '../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import useDebounce from '../../../../hooks/useDebounce';
import { useSermon } from '../../../../hooks/useSermon';
import RenderSermonOffcanvas from './renderOffcanvas';
import { capitalizeFirstLetter } from '../../../../utils/helpers';

const statusVariant = {
  DRAFT: 'secondary',
  PUBLISHED: 'success',
  ARCHIVED: 'dark'
};

const kpiCards = [
  { key: 'totalSermons', label: 'Total Sermons', tone: 'info', icon: BsBook },
  { key: 'thisMonth', label: 'This Month', tone: 'primary', icon: BsCalendar2Week },
  { key: 'published', label: 'Published', tone: 'success', icon: BsCheck2Circle },
  { key: 'drafts', label: 'Drafts', tone: 'warning', icon: BsPencilSquare }
];

const formatWords = (value, fallback = 'Not available') => {
  if (!value) {
    return fallback;
  }

  return String(value)
    .toLowerCase()
    .split('_')
    .map((word) => capitalizeFirstLetter(word))
    .join(' ');
};

const formatDate = (value) => {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
};

const Page = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState('create');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedSpeaker = useDebounce(selectedSpeaker, 300);

  const {
    data,
    error,
    fields,
    success,
    loading,
    detailsLoading,
    totalCount,
    selectedSermon,
    serviceOptions,
    kpis,
    handleFetch,
    handleDelete,
    handleFetchOne,
    handleSave,
    handleEdit,
    handleReset,
    handleChange,
    handleClearSelectedSermon
  } = useSermon({
    searchQuery: debouncedSearchQuery,
    selectedSpeaker: debouncedSpeaker,
    selectedStatus,
    selectedDate
  });

  const handleClose = useCallback(() => {
    handleReset();
    handleClearSelectedSermon();
    setDrawerMode('create');
    setShowDrawer(false);
  }, [handleClearSelectedSermon, handleReset]);

  const handleOpenCreate = useCallback(() => {
    handleReset();
    handleClearSelectedSermon();
    setDrawerMode('create');
    setShowDrawer(true);
  }, [handleClearSelectedSermon, handleReset]);

  const handleOpenView = useCallback(async (id) => {
    setDrawerMode('view');
    setShowDrawer(true);
    await handleFetchOne(id);
  }, [handleFetchOne]);

  const handleOpenEdit = useCallback(async (id) => {
    setDrawerMode('edit');
    setShowDrawer(true);
    await handleFetchOne(id);
  }, [handleFetchOne]);

  const columns = useMemo(() => [
    {
      Header: 'Title',
      accessor: 'title',
      Cell: ({ value }) => <span className="fw-semibold">{value}</span>
    },
    {
      Header: 'Speaker',
      accessor: 'speakerName'
    },
    {
      Header: 'Service',
      accessor: 'serviceId',
      Cell: ({ value }) => <span>{value?.title || 'Not assigned'}</span>
    },
    {
      Header: 'Date',
      accessor: 'preachedAt',
      Cell: ({ value }) => <span>{formatDate(value)}</span>
    },
    {
      Header: 'Duration',
      accessor: 'durationMinutes',
      Cell: ({ value }) => <span>{value ? `${value} mins` : '-'}</span>
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => <Badge bg={statusVariant[value] || 'secondary'}>{formatWords(value)}</Badge>
    },
    {
      Header: 'Actions',
      disableSortBy: true,
      headerClassName: 'text-center actions-header',
        className: 'text-center actions-cell',
      Cell: ({ row }) => (
        <div className="d-flex justify-content-center align-items-center">
          <Tooltip title="View Sermon" arrow>
            <span className="p-0">
              <TiEye size={26} className="pointer me-2 text-primary" onClick={() => handleOpenView(row.original._id)} />
            </span>
          </Tooltip>
          <Tooltip title="Edit Sermon" arrow>
            <span className="p-0">
              <TiEdit size={30} className="pointer me-2" onClick={() => handleOpenEdit(row.original._id)} />
            </span>
          </Tooltip>
          <Tooltip title="Delete Sermon" arrow>
            <span className="p-0">
              <DeleteConfirmation
                onConfirm={async (id) => {
                  await handleDelete(id);
                }}
                onCancel={() => {}}
                itemId={row.original._id}
              >
                <MdDelete size={28} className="pointer" />
              </DeleteConfirmation>
            </span>
          </Tooltip>
        </div>
      )
    }
  ], [handleDelete, handleOpenEdit, handleOpenView]);

  return (
    <>
      <div className={`ms-5 me-5 mt-2 ${!loading ? 'overlay__block' : null}`}>
        <div className="card-body">
          <h5 className="card-title ms-2 mb-3">Sermons</h5>

          <div className="row mb-4">
            {kpiCards.map((card) => {
              const Icon = card.icon;

              return (
                <div className="col-sm-6 col-lg-3" key={card.key}>
                  <Card className="py-3 px-3 h-100">
                    <Card.Body>
                      <div className="d-flex gap-3 flex-wrap align-items-top justify-content-between">
                        <div className="flex-fill d-flex align-items-top mb-4 mb-sm-0">
                          <div className="me-3">
                            <span className={`avatar avatar-rounded bg-${card.tone}`}>
                              <Icon className="text-white fs-16" />
                            </span>
                          </div>
                          <div>
                            <span className="d-block">{card.label}</span>
                            <span className="fs-16 fw-semibold">{kpis?.[card.key] || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              );
            })}
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
            <div className="d-flex gap-2 flex-wrap">
              <Form.Control
                type="text"
                placeholder="Search sermons"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-auto"
              />
              <Form.Control
                type="text"
                placeholder="Speaker"
                value={selectedSpeaker}
                onChange={(event) => setSelectedSpeaker(event.target.value)}
                className="w-auto"
              />
              <Form.Select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="w-auto">
                <option value="ALL">Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </Form.Select>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-auto"
              />
            </div>

            <Button type="button" size="sm" onClick={handleOpenCreate}>
              + Add Sermon
            </Button>
          </div>

          <Table
            data={data}
            columns={columns}
            pageCount={totalCount}
            loading={loading}
            fetchData={handleFetch}
            hidePaginationWhenEmpty
            emptyState={{
              icon: <BsBook size={36} className="text-muted mb-3" />,
              title: 'No sermons found',
              description: 'Add your first sermon to begin building your church sermon library.', 
            }}
          />
        </div>
      </div>

      {!loading && <span className="overlay__block" />}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
      <RenderSermonOffcanvas
        show={showDrawer}
        setShow={setShowDrawer}
        mode={drawerMode}
        handleClose={handleClose}
        handleChange={handleChange}
        success={success}
        handleReset={handleReset}
        handleEdit={handleEdit}
        handleSave={handleSave}
        fields={fields}
        sermon={selectedSermon}
        loading={detailsLoading}
        serviceOptions={serviceOptions}
      />
    </>
  );
};

export default Page;