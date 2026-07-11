'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Badge, Button, Card, Form, Toast, ToastContainer } from 'react-bootstrap';
import Tooltip from '@mui/material/Tooltip';
import { TiEye } from 'react-icons/ti';
import { BsHeartPulse, BsPersonCheck, BsTelephoneOutbound, BsCheck2Circle } from 'react-icons/bs';
import { Table } from '../../../../src/components/elements/table/table';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import useDebounce from '../../../../hooks/useDebounce';
import { usePastoralCare } from '../../../../hooks/usePastoralCare';
import RenderCaseOffcanvas from './renderCaseOffcanvas';
import { capitalizeFirstLetter } from '../../../../utils/helpers';

const formatWords = (value, fallback = 'None') => {
  if (!value) return fallback;

  return value
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

const statusVariant = {
  OPEN: 'warning',
  CONTACTED: 'info',
  VISITED: 'primary',
  CLOSED: 'success'
};

const priorityVariant = {
  LOW: 'secondary',
  MEDIUM: 'warning',
  HIGH: 'danger'
};

const dashboardCards = [
  { key: 'openCases', label: 'Open Cases', filterType: 'status', filterValue: 'OPEN', tone: 'warning', icon: BsHeartPulse },
  { key: 'assignedToMe', label: 'Assigned To Me', filterType: 'assignedTo', filterValue: 'ME', tone: 'info', icon: BsPersonCheck },
  { key: 'contacted', label: 'Contacted', filterType: 'status', filterValue: 'CONTACTED', tone: 'primary', icon: BsTelephoneOutbound },
  { key: 'closed', label: 'Closed', filterType: 'status', filterValue: 'CLOSED', tone: 'success', icon: BsCheck2Circle }
];

const Page = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [toastState, setToastState] = useState({ show: false, message: '' });
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const {
    data,
    owners,
    dashboard,
    selectedStatus,
    selectedAssignedTo,
    selectedPriority,
    selectedCase,
    loading,
    detailsLoading,
    saving,
    error,
    totalCount,
    handleFetch,
    handleFetchCase,
    handleUpdateCase,
    handleSelectStatus,
    handleSelectAssignedTo,
    handleSelectPriority,
    handleClearSelectedCase
  } = usePastoralCare(debouncedSearchQuery);

  const handleOpenCase = useCallback(async (row) => {
    const opened = await handleFetchCase(row.original._id);
    if (opened) {
      setShowDrawer(true);
    }
  }, [handleFetchCase]);

  const handleCloseDrawer = useCallback(() => {
    setShowDrawer(false);
    handleClearSelectedCase();
  }, [handleClearSelectedCase]);

  const handleCardFilter = useCallback((card) => {
    if (card.filterType === 'status') {
      handleSelectAssignedTo('ALL');
      handleSelectStatus(card.filterValue);
      return;
    }

    handleSelectStatus('ALL');
    handleSelectAssignedTo(card.filterValue);
  }, [handleSelectAssignedTo, handleSelectStatus]);

  const handleSaveCase = useCallback(async (updates) => {
    if (!selectedCase?._id) {
      return false;
    }

    const assignedToData = updates.assignedTo
      ? owners.find((owner) => owner._id === updates.assignedTo) || null
      : null;

    const success = await handleUpdateCase(selectedCase._id, {
      ...updates,
      assignedToData
    });

    if (success) {
      setToastState({ show: true, message: 'Pastoral care case updated successfully.' });
    }

    return success;
  }, [handleUpdateCase, owners, selectedCase]);

  const columns = useMemo(() => [
    {
      Header: 'Member',
      accessor: 'memberId',
      Cell: ({ value }) => {
        const memberName = value ? `${value.first_name || ''} ${value.last_name || ''}`.trim() : 'Unknown Member';
        return <span className="fw-semibold">{memberName}</span>;
      }
    },
    {
      Header: 'Reason',
      accessor: 'reason',
      Cell: ({ value }) => <span>{formatWords(value)}</span>
    },
    {
      Header: 'Case Owner',
      accessor: 'assignedTo',
      Cell: ({ value }) => <span>{value ? `${value.first_name || ''} ${value.last_name || ''}`.trim() : 'Unassigned'}</span>
    },
    {
      Header: 'Priority',
      accessor: 'priority',
      Cell: ({ value }) => <Badge bg={priorityVariant[value] || 'secondary'}>{formatWords(value)}</Badge>
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => <Badge bg={statusVariant[value] || 'secondary'}>{formatWords(value)}</Badge>
    },
    {
      Header: 'Last Updated',
      accessor: 'updatedAt',
      Cell: ({ value }) => <span>{formatDate(value)}</span>
    },
    {
      Header: 'Actions',
      disableSortBy: true,
      headerClassName: 'text-center actions-header',
        className: 'text-center actions-cell',
      Cell: ({ row }) => (
        <div className="d-flex justify-content-center align-items-center">
          <Tooltip title="Open Case" arrow>
            <span className="p-0 d-flex align-items-center pointer" onClick={() => handleOpenCase(row)}>
              <TiEye size={22} className="me-1 text-primary" />
              <span className="text-primary small">Open Case</span>
            </span>
          </Tooltip>
        </div>
      )
    }
  ], [handleOpenCase]);

  return (
    <>
      <div className={`ms-5 me-5 mt-2 ${!loading ? 'overlay__block' : null}`}>
        <div className="card-body">
          <h5 className="card-title ms-2 mb-3">Pastoral Care</h5>

          {dashboard?.kpis && (
            <div className="row mb-4">
              {dashboardCards.map((card) => (
                <div className="col-sm-6 col-lg-3" key={card.key}>
                  <Card className="py-3 px-3 h-100 pointer" onClick={() => handleCardFilter(card)}>
                    <Card.Body>
                      {(() => {
                        const Icon = card.icon;

                        return (
                      <div className="d-flex gap-3 flex-wrap align-items-top justify-content-between">
                        <div className="flex-fill d-flex align-items-top mb-4 mb-sm-0">
                          <div className="me-3">
                            <span className={`avatar avatar-rounded bg-${card.tone}`}>
                              <Icon className="text-white fs-16" />
                            </span>
                          </div>
                          <div>
                            <span className="d-block">{card.label}</span>
                            <span className="fs-16 fw-semibold">{dashboard.kpis?.[card.key] || 0}</span>
                          </div>
                        </div>
                      </div>
                        );
                      })()}
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
            <div className="d-flex gap-2 flex-wrap">
              {['ALL', 'OPEN', 'CONTACTED', 'VISITED', 'CLOSED'].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={selectedStatus === status ? 'primary' : 'outline-secondary'}
                  onClick={() => handleSelectStatus(status)}
                >
                  {formatWords(status, 'All')}
                </Button>
              ))}
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Form.Select value={selectedAssignedTo} onChange={(event) => handleSelectAssignedTo(event.target.value)} className="w-auto">
                <option value="ALL">Assigned To</option>
                <option value="ME">Me</option>
                {owners.map((owner) => (
                  <option key={owner._id} value={owner._id}>
                    {`${owner.first_name || ''} ${owner.last_name || ''}`.trim()}
                  </option>
                ))}
              </Form.Select>
              <Form.Select value={selectedPriority} onChange={(event) => handleSelectPriority(event.target.value)} className="w-auto">
                <option value="ALL">Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Form.Select>
              <Form.Control
                type="text"
                placeholder="Search member"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-auto"
              />
            </div>
          </div>

          <Table data={data} columns={columns} pageCount={totalCount} loading={loading} fetchData={handleFetch} />
        </div>
      </div>

      {!loading && <span className="overlay__block" />}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" show={toastState.show} onClose={() => setToastState({ show: false, message: '' })} autohide delay={2500}>
          <Toast.Body className="text-white">{toastState.message}</Toast.Body>
        </Toast>
      </ToastContainer>
      <RenderCaseOffcanvas
        show={showDrawer}
        handleClose={handleCloseDrawer}
        caseData={selectedCase}
        owners={owners}
        loading={detailsLoading}
        saving={saving}
        handleSaveCase={handleSaveCase}
      />
    </>
  );
};

export default Page;