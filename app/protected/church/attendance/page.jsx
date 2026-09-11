'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Table } from '../../../../src/components/elements/table/table';
import { Button, Badge, Card, Spinner, Form, InputGroup } from 'react-bootstrap';
import { useAttendance } from '../../../../hooks/useAttendance';
import ErrorDialogue, { OkDialogue } from '../../../../src/components/elements/errorDialogue';
import RenderFollowUpOffcanvas from './renderFollowUpOffcanvas';
import Tooltip from '@mui/material/Tooltip';
import { capitalizeFirstLetter } from '../../../../utils/helpers';
import { TiEye, TiPlusOutline } from 'react-icons/ti';
import { BsClipboard2Data, BsDatabaseFill, BsDownload, BsExclamationTriangle, BsHeartPulse, BsPeople, BsSearch, BsCheck2Circle } from 'react-icons/bs';
import useDebounce from '../../../../hooks/useDebounce';
import { zat } from '../../../../utils/api';
import { ATTENDANCE, CHURCH } from '../../../../utils/apiUrl';
import { VERBS } from '../../../../config';
import { exportAttendanceCsv, exportAttendanceSummaryPdf } from '../../../../utils/attendanceExport';

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

const demographicCards = [
  { key: 'totalAttendance', label: 'Total People', maleKey: 'male', femaleKey: 'female' },
  { key: 'adults', label: 'Adults', maleKey: 'adultMale', femaleKey: 'adultFemale' },
  { key: 'youth', label: 'Youth', maleKey: 'youthMale', femaleKey: 'youthFemale' },
  { key: 'children', label: 'Children', maleKey: 'childrenMale', femaleKey: 'childrenFemale' }
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

const toDateBoundary = (value, endOfDay = false) => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
};

const formatInputDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const [exportLoading, setExportLoading] = useState(null);
  const [exportError, setExportError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const {
    attendanceData,
    services,
    assignableUsers,
    loading,
    error,
    totalCount,
    selectedService,
    selectedStartDate,
    selectedEndDate,
    selectedQueue,
    selectedAgeGroup,
    selectedGender,
    selectedSubmissionType,
    selectedChannel,
    dashboard,
    handleFetchAttendance,
    handleFetchDashboard,
    handleSelectService,
    handleSelectDateRange,
    handleSelectReportFilter,
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
      ...(selectedStartDate ? { startDate: toDateBoundary(selectedStartDate)?.toISOString() } : {}),
      ...(selectedEndDate ? { endDate: toDateBoundary(selectedEndDate, true)?.toISOString() } : {}),
      ...(selectedAgeGroup !== 'ALL' ? { ageGroup: selectedAgeGroup } : {}),
      ...(selectedGender !== 'ALL' ? { gender: selectedGender } : {}),
      ...(selectedSubmissionType !== 'ALL' ? { submissionType: selectedSubmissionType } : {}),
      ...(selectedChannel !== 'ALL' ? { checkedInVia: selectedChannel } : {})
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

  const handleExport = async (format) => {
    if (!selectedService || exportLoading || !hasAttendanceRows) {
      return;
    }

    setExportError(null);
    setExportSuccess(null);
    setExportLoading(format);

    try {
      const [churchName, rows] = await Promise.all([
        fetchChurchName(),
        fetchExportRows()
      ]);
      const service = getSelectedServiceMeta();
      const exportPayload = {
        churchName,
        serviceName: service?.title || 'Service',
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        generatedAt: new Date().toISOString(),
        generatedBy: getGeneratedBy(),
        dashboard,
        rows,
        filters: {
          status: selectedQueue,
          ageGroup: selectedAgeGroup,
          gender: selectedGender,
          submissionType: selectedSubmissionType,
          channel: selectedChannel,
          search: debouncedSearchQuery
        }
      };

      if (!rows.length) {
        throw new Error('No attendance records matched the selected filters.');
      }

      if (format === 'csv') {
        exportAttendanceCsv(exportPayload);
      } else {
        await exportAttendanceSummaryPdf(exportPayload);
      }
      setExportSuccess(`Attendance ${format.toUpperCase()} exported successfully.`);
    } catch (exportError) {
      console.warn(exportError);
      setExportError(exportError.message || 'Unable to export attendance report.');
    } finally {
      setExportLoading(null);
    }
  };

  const applyDatePreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    handleSelectDateRange('selectedStartDate', formatInputDate(start));
    handleSelectDateRange('selectedEndDate', formatInputDate(end));
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
        Header: 'Household',
        accessor: 'totalAttendance',
        Cell: ({ row, value }) => {
          const household = row.original?.household;
          const male = household
            ? (household.adults?.male || 0) + (household.youth?.male || 0) + (household.children?.male || 0)
            : null;
          const female = household
            ? (household.adults?.female || 0) + (household.youth?.female || 0) + (household.children?.female || 0)
            : null;

          return (
            <div>
              <span className="fw-semibold">{value ?? row.original?.count ?? 0} people</span>
              <small className="d-block text-muted">
                {household ? `Male ${male} · Female ${female}` : 'Demographics not captured'}
              </small>
            </div>
          );
        }
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
       headerClassName: 'text-center actions-header',
        className: 'text-center actions-cell',
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
                  <Button variant="outline-secondary" size="sm" onClick={() => handleExport('pdf')} disabled={!hasAttendanceRows || Boolean(exportLoading)} className="text-nowrap">
                    <BsDownload className="me-2" />
                    {exportLoading === 'pdf' ? 'Generating PDF...' : 'Export PDF'}
                    {exportLoading === 'pdf' && <Spinner size="sm" className="ms-2" />}
                  </Button>
                  <Button variant="outline-primary" size="sm" onClick={() => handleExport('csv')} disabled={!hasAttendanceRows || Boolean(exportLoading)} className="text-nowrap ms-2">
                    <BsDownload className="me-2" />
                    {exportLoading === 'csv' ? 'Generating CSV...' : 'Export CSV'}
                    {exportLoading === 'csv' && <Spinner size="sm" className="ms-2" />}
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

          {dashboard?.kpis && (
            <div className="row g-3 mb-4">
              {demographicCards.map((card) => (
                <div className="col-sm-6 col-lg-3" key={card.key}>
                  <Card className="border h-100">
                    <Card.Body className="py-3 px-4">
                      <small className="text-muted d-block">{card.label}</small>
                      <span className="fs-4 fw-semibold">{dashboard.kpis?.[card.key] || 0}</span>
                      <small className="d-block text-muted mt-1">
                        Male {dashboard.kpis?.[card.maleKey] || 0} · Female {dashboard.kpis?.[card.femaleKey] || 0}
                      </small>
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
                <small className="text-muted">The table, totals and exports use these filters.</small>
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
                  <Form.Label className="small fw-semibold mb-1">From</Form.Label>
                  <Form.Control type="date" value={selectedStartDate || ''} max={selectedEndDate || undefined} onChange={(event) => handleSelectDateRange('selectedStartDate', event.target.value)} />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">To</Form.Label>
                  <Form.Control type="date" value={selectedEndDate || ''} min={selectedStartDate || undefined} onChange={(event) => handleSelectDateRange('selectedEndDate', event.target.value)} />
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
              <div className="d-flex gap-2 flex-wrap mt-3">
                <Button size="sm" variant="outline-secondary" onClick={() => applyDatePreset(1)}>Today</Button>
                <Button size="sm" variant="outline-secondary" onClick={() => applyDatePreset(7)}>Last 7 days</Button>
                <Button size="sm" variant="outline-secondary" onClick={() => applyDatePreset(30)}>Last 30 days</Button>
              </div>
              <div className="d-flex gap-3 flex-wrap align-items-end mt-3">
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Age group</Form.Label>
                  <Form.Select value={selectedAgeGroup} onChange={(event) => handleSelectReportFilter('selectedAgeGroup', event.target.value)}>
                    <option value="ALL">All age groups</option>
                    <option value="adults">Adults</option>
                    <option value="youth">Youth</option>
                    <option value="children">Children</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Gender</Form.Label>
                  <Form.Select value={selectedGender} onChange={(event) => handleSelectReportFilter('selectedGender', event.target.value)}>
                    <option value="ALL">All genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Submission</Form.Label>
                  <Form.Select value={selectedSubmissionType} onChange={(event) => handleSelectReportFilter('selectedSubmissionType', event.target.value)}>
                    <option value="ALL">All submissions</option>
                    <option value="HOUSEHOLD">Household</option>
                    <option value="INDIVIDUAL">Individual</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Channel</Form.Label>
                  <Form.Select value={selectedChannel} onChange={(event) => handleSelectReportFilter('selectedChannel', event.target.value)}>
                    <option value="ALL">All channels</option>
                    <option value="MANUAL">In church / manual</option>
                    <option value="ONLINE">Online</option>
                    <option value="QR_CODE">QR code</option>
                  </Form.Select>
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
      {exportError && <ErrorDialogue showError message={exportError} onClose={() => setExportError(null)} />}
      {exportSuccess && <OkDialogue showSuccess message={exportSuccess} onClose={() => setExportSuccess(null)} />}
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
