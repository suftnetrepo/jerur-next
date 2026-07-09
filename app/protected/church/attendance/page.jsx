'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Table } from '../../../../src/components/elements/table/table';
import { Button, Badge, Card, Spinner, Form, InputGroup } from 'react-bootstrap';
import { useAttendance } from '../../../../hooks/useAttendance';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import RenderFollowUpOffcanvas from './renderFollowUpOffcanvas';
import Tooltip from '@mui/material/Tooltip';
import { capitalizeFirstLetter } from '../../../../utils/helpers';
import { TiEye, TiPlusOutline } from 'react-icons/ti';
import { BsClipboard2Data, BsDatabaseFill, BsDownload, BsExclamationTriangle, BsHeartPulse, BsPeople, BsSearch, BsCheck2Circle } from 'react-icons/bs';
import useDebounce from '../../../../hooks/useDebounce';
import { zat } from '../../../../utils/api';
import { ATTENDANCE, CHURCH } from '../../../../utils/apiUrl';
import { VERBS } from '../../../../config';
import { exportAttendanceSummaryPdf } from '../../../../utils/attendanceExport';

const FILTER_STORAGE_KEY = 'attendanceDashboardFilters';

const getStoredSearch = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const rawFilters = window.localStorage.getItem(FILTER_STORAGE_KEY);
    const parsedFilters = rawFilters ? JSON.parse(rawFilters) : null;

    return parsedFilters?.searchQuery || '';
  } catch (error) {
    return '';
  }
};

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
  { key: 'expectedMembers', label: 'Expected Members', tone: 'info', icon: BsPeople },
  { key: 'attendanceSubmitted', label: 'Attendance Submitted', tone: 'primary', icon: BsCheck2Circle },
  { key: 'needAttention', label: 'Need Attention', tone: 'warning', icon: BsExclamationTriangle },
  { key: 'openCareCases', label: 'Open Care Cases', tone: 'danger', icon: BsHeartPulse }
];

const STATUS_FILTERS = [
  'PRESENT_IN_CHURCH',
  'JOINED_ONLINE',
  'ABSENT',
  'SICK',
  'TRAVELLING',
  'WORKING',
  'FAMILY_COMMITMENT',
  'NEEDS_PRAYER',
  'OTHER'
];

const buildDateRange = (value) => {
  if (!value) {
    return {};
  }

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return {};
  }

  const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
};

const formatWords = (value, fallback = 'None') => {
  if (!value) return fallback;

  return value
    .toLowerCase()
    .split('_')
    .map((word) => capitalizeFirstLetter(word))
    .join(' ');
};

const getSubmittedPercentage = (submitted, expected) => {
  if (!expected) {
    return '0% of expected';
  }

  return `${Math.round((submitted / expected) * 100)}% of expected`;
};

const Page = () => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState(getStoredSearch);
  const [show, setShow] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [seedLoading, setSeedLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const {
    attendanceData,
    services,
    assignableUsers,
    loading,
    error,
    totalCount,
    selectedService,
    selectedDate,
    selectedQueue,
    dashboard,
    handleFetchAttendance,
    handleFetchDashboard,
    handleSelectService,
    handleSelectDate,
    handleSelectQueue,
    handleCreateFollowUp
  } = useAttendance(debouncedSearchQuery);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const rawFilters = window.localStorage.getItem(FILTER_STORAGE_KEY);
      const parsedFilters = rawFilters ? JSON.parse(rawFilters) : {};

      window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify({
        ...parsedFilters,
        searchQuery
      }));
    } catch (error) {
      console.warn('Unable to persist attendance search filter.', error);
    }
  }, [searchQuery]);

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

  const hasAttendanceRows = attendanceData.length > 0;

  const getSelectedServiceMeta = () => {
    return (dashboard?.serviceCards || services).find((service) => service._id === selectedService) || null;
  };

  const getGeneratedBy = () => {
    const firstName = session?.user?.first_name || '';
    const lastName = session?.user?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || session?.user?.email || 'System';
  };

  const fetchChurchName = async () => {
    const { data, success } = await zat(CHURCH.fetchOne, null, VERBS.GET);

    if (!success) {
      return 'Church';
    }

    return data?.name || 'Church';
  };

  const fetchExportRows = async () => {
    if (!selectedService) {
      return [];
    }

    const params = {
      serviceId: selectedService,
      page: 1,
      limit: Math.max(totalCount || attendanceData.length || 0, 1),
      searchQuery: debouncedSearchQuery,
      ...buildDateRange(selectedDate)
    };

    if (selectedQueue !== 'ALL') {
      if (STATUS_FILTERS.includes(selectedQueue)) {
        params.status = selectedQueue;
      } else {
        params.queue = selectedQueue;
      }
    }

    const { data, success } = await zat(ATTENDANCE.fetchByService, null, VERBS.GET, params);

    if (!success) {
      throw new Error('Unable to fetch attendance export data.');
    }

    return Array.isArray(data) ? data : [];
  };

  const handleExport = async () => {
    if (!selectedService || exportLoading || !hasAttendanceRows) {
      return;
    }

    setExportLoading(true);

    try {
      const [churchName, rows] = await Promise.all([
        fetchChurchName(),
        fetchExportRows()
      ]);
      const service = getSelectedServiceMeta();
      const exportPayload = {
        churchName,
        serviceName: service?.title || 'Service',
        serviceDate: selectedDate,
        generatedAt: new Date().toISOString(),
        generatedBy: getGeneratedBy(),
        dashboard,
        rows
      };

      if (!rows.length) {
        throw new Error('No attendance records matched the selected filters.');
      }

      await exportAttendanceSummaryPdf(exportPayload);
    } catch (exportError) {
      console.warn(exportError);
      window.alert(exportError.message || 'Unable to export attendance report.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleSeedAttendance = async () => {
    if (!selectedService || seedLoading) {
      return;
    }

    setSeedLoading(true);

    try {
      const response = await fetch('/api/dev/seed-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ serviceId: selectedService })
      });

      if (!response.ok) {
        throw new Error('Unable to seed attendance data.');
      }

      await Promise.all([
        handleFetchDashboard(selectedService),
        handleFetchAttendance()
      ]);
    } catch (seedError) {
      console.warn(seedError);
    } finally {
      setSeedLoading(false);
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
          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
            <h5 className="card-title ms-2 mb-0">Attendance</h5>
            <div className="d-flex align-items-center justify-content-end gap-2 flex-wrap">
              {isDevelopment && (
                <Badge bg="warning" text="dark" className="px-3 py-2 border border-warning-subtle rounded-pill">
                  DEV ONLY
                </Badge>
              )}
              {isDevelopment && (
                <Button variant="outline-secondary" size="sm" onClick={handleSeedAttendance} disabled={!selectedService || seedLoading} className="text-nowrap">
                  <BsDatabaseFill className="me-2" />
                  {seedLoading ? 'Seeding Attendance...' : 'Seed Mock Attendance'}
                  {seedLoading && <Spinner size="sm" className="ms-2" />}
                </Button>
              )}
              <Tooltip title={hasAttendanceRows ? '' : 'No attendance records to export.'} disableHoverListener={hasAttendanceRows} arrow>
                <span>
                  <Button variant="outline-secondary" size="sm" onClick={handleExport} disabled={!hasAttendanceRows || exportLoading} className="text-nowrap">
                    <BsDownload className="me-2" />
                    {exportLoading ? 'Generating Attendance Summary...' : 'Attendance Summary'}
                    {exportLoading && <Spinner size="sm" className="ms-2" />}
                  </Button>
                </span>
              </Tooltip>
            </div>
          </div>

          {dashboard?.kpis && (
            <div className="row mb-4">
              {kpiCards.map((card) => (
                <div className="col-sm-6 col-lg-3" key={card.key}>
                  <Card className="py-3 px-3 h-100">
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
                            <small className="d-block text-muted mt-1">
                              {card.key === 'expectedMembers' && 'Based on selected service'}
                              {card.key === 'attendanceSubmitted' && getSubmittedPercentage(dashboard.kpis?.attendanceSubmitted || 0, dashboard.kpis?.expectedMembers || 0)}
                              {card.key === 'needAttention' && 'Sick, Absent, Needs Prayer'}
                              {card.key === 'openCareCases' && 'Requiring follow-up'}
                            </small>
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

          {services.length > 0 && (
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Filters</h6>
                <small className="text-muted">Refine attendance by service, date, search, and status.</small>
              </div>
              <div className="d-flex gap-3 flex-wrap align-items-end">
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Service</Form.Label>
                  <Form.Select value={selectedService || ''} onChange={(event) => handleSelectService(event.target.value)} style={{ minWidth: 220 }}>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.title || 'Service'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Date</Form.Label>
                  <Form.Control type="date" value={selectedDate || ''} onChange={(event) => handleSelectDate(event.target.value)} />
                </Form.Group>
                <Form.Group style={{ minWidth: 280 }}>
                  <Form.Label className="small fw-semibold mb-1">Search</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <BsSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search attendance..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </div>
            </div>
          )}

          {selectedService && (
            <div className="mb-4">
              <div className="small fw-semibold mb-2">Attendance Status</div>
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
            </div>
          )}

          {selectedService ? (
            <>
              <Table
                data={attendanceData}
                columns={columns}
                pageCount={totalCount}
                loading={loading}
                fetchData={handleFetchAttendance}
                hidePaginationWhenEmpty
                emptyState={{
                  icon: <BsClipboard2Data size={52} className="text-muted opacity-50 mb-3" />,
                  title: 'No attendance has been recorded for this service',
                  description: (
                    <>
                      <div>Select a service and begin recording attendance.</div>
                      {isDevelopment && <div>In development you can also seed mock attendance.</div>}
                    </>
                  ),
                  minHeight: 260
                }}
              />
            </>
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
