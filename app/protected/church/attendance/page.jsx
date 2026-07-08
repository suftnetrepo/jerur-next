'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Table } from '../../../../src/components/elements/table/table';
import { Button, Badge, Card, Form } from 'react-bootstrap';
import { useAttendance } from '../../../../hooks/useAttendance';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import RenderFollowUpOffcanvas from './renderFollowUpOffcanvas';
import Tooltip from '@mui/material/Tooltip';
import { capitalizeFirstLetter } from '../../../../utils/helpers';
import { TiEye, TiPlusOutline } from 'react-icons/ti';
import useDebounce from '../../../../hooks/useDebounce';

const outcomeColors = {
  'PRESENT_IN_CHURCH': 'success',
  'JOINED_ONLINE': 'info',
  'ABSENT': 'danger',
  'SICK': 'warning',
  'NEEDS_PRAYER': 'warning',
  'TRAVELLING': 'secondary',
  'WORKING': 'secondary',
  'FAMILY_COMMITMENT': 'secondary',
  'OTHER': 'secondary'
};

const careSignalColors = {
  NO_ACTION: 'secondary',
  OPTIONAL: 'info',
  REVIEW: 'warning',
  NEEDS_CARE: 'danger',
  URGENT: 'dark'
};

const kpiCards = [
  { key: 'expectedMembers', label: 'Expected Members', tone: 'info' },
  { key: 'attendanceSubmitted', label: 'Attendance Submitted', tone: 'primary' },
  { key: 'needAttention', label: 'Need Attention', tone: 'warning' },
  { key: 'openCareCases', label: 'Open Care Cases', tone: 'danger' }
];

const formatWords = (value, fallback = 'None') => {
  if (!value) return fallback;

  return value
    .toLowerCase()
    .split('_')
    .map((word) => capitalizeFirstLetter(word))
    .join(' ');
};

const Page = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [show, setShow] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const {
    attendanceData,
    services,
    assignableUsers,
    loading,
    error,
    totalCount,
    selectedService,
    selectedQueue,
    dashboard,
    handleFetchAttendance,
    handleSelectService,
    handleSelectQueue,
    handleCreateFollowUp
  } = useAttendance(debouncedSearchQuery);

  const handleClose = () => {
    setSelectedAttendance(null);
    setShow(false);
  };

  const handleShow = (attendance) => {
    setSelectedAttendance(attendance);
    setShow(true);
  };

  const handleAddFollowUp = async (followUpData) => {
    const result = await handleCreateFollowUp(followUpData);
    if (result) {
      handleClose();
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Member',
        accessor: 'memberName',
        Cell: ({ row, value }) => {
          const memberId = row.original?.memberId?._id;

          return (
            memberId ? (
              <Link href={`/protected/church/members?memberId=${memberId}`} className="fw-semibold text-decoration-none">
                {value}
              </Link>
            ) : (
              <span className="fw-semibold">{value}</span>
            )
          );
        }
      },
      {
        Header: 'Attendance',
        accessor: 'attendanceOutcome',
        Cell: ({ value }) => (
          <div className="d-flex justify-content-start align-items-center">
            <Badge bg={outcomeColors[value] || 'secondary'} className="p-2">
              {formatWords(value, 'Unknown')}
            </Badge>
          </div>
        )
      },
      {
        Header: 'Member Response',
        accessor: 'responseSummary',
        Cell: ({ row, value }) => {
          return (
            <div className="d-flex flex-column justify-content-start align-items-start">
              <small>{value}</small>
              {row.original?.wantsPastorContact && (
                <span className="small text-danger">Pastor contact requested</span>
              )}
            </div>
          );
        }
      },
      {
        Header: 'Care Signal',
        accessor: 'careSignal',
        Cell: ({ value }) => (
          <div className="d-flex justify-content-start align-items-center">
            <Badge bg={careSignalColors[value] || 'secondary'} className="p-2">
              {formatWords(value, 'Unknown')}
            </Badge>
          </div>
        )
      },
      {
        Header: 'Care Case',
        accessor: 'careCaseStatus',
        Cell: ({ value }) => (
          <div className="d-flex justify-content-start align-items-center">
            <Badge bg={value ? 'primary' : 'light'} text={value ? 'light' : 'dark'} className="p-2">
              {formatWords(value, 'None')}
            </Badge>
          </div>
        )
      },
      {
        Header: 'Actions',
        disableSortBy: true,
        className: 'center',
        Cell: ({ row }) => {
          return (
          <div className="d-flex justify-content-center align-items-center">
            {!row.original.careFollowUp && row.original.careSignal !== 'NO_ACTION' ? (
              <Tooltip title="Create Care Case" arrow>
                <span className="p-0 d-flex align-items-center pointer" onClick={() => handleShow(row.original)}>
                  <TiPlusOutline size={24} className="me-1 text-primary" />
                  <span className="text-primary small">Create Care Case</span>
                </span>
              </Tooltip>
            ) : row.original.careFollowUp ? (
              <Tooltip title="Open Care Case" arrow>
                <span className="p-0 d-flex align-items-center text-muted">
                  <TiEye size={22} className="me-1" />
                  <span className="small">Open Care Case</span>
                </span>
              </Tooltip>
            ) : (
              <span className="text-muted small">No action</span>
            )}
          </div>
        )}
      }
    ],
    []
  );

  return (
    <>
      <div className={`ms-5 me-5 mt-2 ${!loading ? 'overlay__block' : null}`}>
        <div className="card-body">
          <h5 className="card-title ms-2 mb-3">Attendance</h5>

          {dashboard?.kpis && (
            <div className="row mb-4">
              {kpiCards.map((card) => (
                <div className="col-sm-6 col-lg-3" key={card.key}>
                  <Card className="py-3 px-3 h-100">
                    <Card.Body>
                      <div className="d-flex gap-3 flex-wrap align-items-top justify-content-between">
                        <div className="flex-fill d-flex align-items-top mb-4 mb-sm-0">
                          <div className="me-3">
                            <span className={`avatar avatar-rounded bg-${card.tone}`}>
                              <i className="bi bi-boxes text-white fs-16"></i>
                            </span>
                          </div>
                          <div>
                            <span className="d-block">{card.label}</span>
                            <span className="fs-16 fw-semibold">{dashboard.kpis?.[card.key] || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {(dashboard?.serviceCards || services).length > 0 && (
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Services</h6>
                <small className="text-muted">Select a service to review attendance and care workload.</small>
              </div>
              <div className="row g-3">
                {(dashboard?.serviceCards || services).map((service) => (
                  <div className="col-md-6 col-xl-4" key={service._id}>
                    <Card
                      className={`h-100 ${selectedService === service._id ? 'border-primary shadow-sm' : ''}`}
                      role="button"
                      onClick={() => handleSelectService(service._id)}
                    >
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <div className="fw-semibold">{service.title || 'Service'}</div>
                            <div className="small text-muted">Date: {service.schedule || 'Schedule unavailable'}</div>
                          </div>
                          <Badge bg={selectedService === service._id ? 'primary' : 'light'} text={selectedService === service._id ? 'light' : 'dark'}>
                            {service.attendanceSubmitted || 0}
                          </Badge>
                        </div>
                        <div className="small text-muted">Attendance count: {service.attendanceSubmitted || 0}</div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedService && (
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                <div className="d-flex gap-2 flex-wrap">
                {(dashboard?.summaryQueues || []).map((queue) => (
                  <Button
                    key={queue.key}
                    variant={selectedQueue === queue.key ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => handleSelectQueue(queue.key)}
                    className="text-nowrap"
                  >
                    {queue.label} ({queue.count})
                  </Button>
                ))}
                </div>
                <Form.Control
                  type="text"
                  placeholder="Search attendance"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-auto"
                />
              </div>
            </div>
          )}

          {selectedService ? (
            <Table
              data={attendanceData}
              columns={columns}
              pageCount={totalCount}
              loading={loading}
              fetchData={handleFetchAttendance}
            />
          ) : (
            <div className="alert alert-info">Select a service to view attendance</div>
          )}
        </div>
      </div>
      {!loading && <span className="overlay__block" />}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
      <RenderFollowUpOffcanvas
        handleClose={handleClose}
        show={show}
        attendance={selectedAttendance}
        assignableUsers={assignableUsers}
        handleCreateFollowUp={handleAddFollowUp}
      />
    </>
  );
};

export default Page;
