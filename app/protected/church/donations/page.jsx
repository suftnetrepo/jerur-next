'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Table } from '../../../../src/components/elements/table/table';
import { Button, Card, Dropdown, DropdownButton, Form, InputGroup, Spinner } from 'react-bootstrap';
import { useDonation } from '../../../../hooks/useDonation';
import { MdDelete } from 'react-icons/md';
import { TiEdit, TiEye } from 'react-icons/ti';
import DeleteConfirmation from '../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import RenderUserOffcanvas from './renderOffcanvas';
import Tooltip from '@mui/material/Tooltip';
import { formatCurrency, dateFormatted } from '../../../../utils/helpers';
import {
  DONATION_TYPE_FILTER_OPTIONS,
  PAYMENT_METHOD_FILTER_OPTIONS,
  getDonationTypeLabel,
  getPaymentMethodLabel
} from '../../../../utils/donationConstants';
import { CHURCH } from '../../../../utils/apiUrl';
import { zat } from '../../../../utils/api';
import { VERBS } from '../../../../config';
import { exportDonationReportCsv, exportDonationReportPdf } from '../../../../utils/donationExport';
import { BsCashCoin, BsCurrencyPound, BsDownload, BsLaptop, BsReceipt, BsSearch } from 'react-icons/bs';

const FILTER_PRESETS = [
  { key: 'TODAY', label: 'Today' },
  { key: 'THIS_WEEK', label: 'This Week' },
  { key: 'THIS_MONTH', label: 'This Month' },
  { key: 'LAST_MONTH', label: 'Last Month' },
  { key: 'THIS_YEAR', label: 'This Year' },
  { key: 'CUSTOM', label: 'Custom' }
];

const KPI_CARDS = [
  { key: 'totalAmount', label: 'Total Donations', icon: BsCurrencyPound, tone: 'primary', isCurrency: true },
  { key: 'onlineAmount', label: 'Online Donations', icon: BsLaptop, tone: 'info', isCurrency: true },
  { key: 'offlineAmount', label: 'Offline Donations', icon: BsCashCoin, tone: 'warning', isCurrency: true },
  { key: 'transactionCount', label: 'Total Transactions', icon: BsReceipt, tone: 'success', isCurrency: false }
];

const createDefaultFilters = () => ({
  donationType: 'ALL',
  startDate: '',
  endDate: '',
  paymentMethod: 'ALL',
  search: '',
  preset: 'CUSTOM'
});

const formatInputDate = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getPresetRange = (preset) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (preset) {
    case 'TODAY':
      return { startDate: formatInputDate(start), endDate: formatInputDate(end) };
    case 'THIS_WEEK': {
      const day = now.getDay();
      const diffToMonday = (day + 6) % 7;
      start.setDate(now.getDate() - diffToMonday);
      end.setDate(start.getDate() + 6);
      return { startDate: formatInputDate(start), endDate: formatInputDate(end) };
    }
    case 'THIS_MONTH':
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
      return { startDate: formatInputDate(start), endDate: formatInputDate(end) };
    case 'LAST_MONTH':
      start.setMonth(start.getMonth() - 1, 1);
      end.setMonth(end.getMonth(), 0);
      return { startDate: formatInputDate(start), endDate: formatInputDate(end) };
    case 'THIS_YEAR':
      start.setMonth(0, 1);
      end.setMonth(11, 31);
      return { startDate: formatInputDate(start), endDate: formatInputDate(end) };
    default:
      return { startDate: '', endDate: '' };
  }
};

const getFilterOptionLabel = (options, value, fallback) => {
  return options.find((option) => option.value === value)?.label || fallback;
};

const getReportPeriodLabel = (filters) => {
  if (filters.startDate && filters.endDate) {
    return `${dateFormatted(filters.startDate)} - ${dateFormatted(filters.endDate)}`;
  }

  if (filters.startDate) {
    return `From ${dateFormatted(filters.startDate)}`;
  }

  if (filters.endDate) {
    return `Up to ${dateFormatted(filters.endDate)}`;
  }

  return 'All Dates';
};

const Page = () => {
  const [draftFilters, setDraftFilters] = useState(createDefaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(createDefaultFilters);
  const [show, setShow] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const {
    data,
    error,
    fields,
    success,
    loading,
    totalCount,
    summary,
    handleFetch,
    handleDelete,
    handleEdit,
    handleSave,
    handleReset,
    handleChange,
    handleSelect,
    fetchExportRows
  } = useDonation(appliedFilters);

  const handleClose = useCallback(() => {
    handleReset();
    setViewOnly(false);
    setShow(false);
  }, [handleReset]);
  const handleShow = useCallback(() => {
    handleReset();
    setViewOnly(false);
    setShow(true);
  }, [handleReset]);

  const handleFilterChange = useCallback((name, value) => {
    setDraftFilters((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'startDate' || name === 'endDate' ? { preset: 'CUSTOM' } : {})
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({
      ...draftFilters,
      search: draftFilters.search.trim()
    });
  }, [draftFilters]);

  const handleResetFilters = useCallback(() => {
    const resetFilters = createDefaultFilters();
    setDraftFilters(resetFilters);
    setAppliedFilters(resetFilters);
  }, []);

  const handlePresetSelect = useCallback((preset) => {
    setDraftFilters((previous) => ({
      ...previous,
      ...getPresetRange(preset),
      preset
    }));
  }, []);

  const fetchChurchName = useCallback(async () => {
    const { data: church, success: churchSuccess } = await zat(CHURCH.fetchOne, null, VERBS.GET);
    return churchSuccess ? church?.name || 'Church' : 'Church';
  }, []);

  const hasDonations = (summary?.transactionCount || 0) > 0;

  const handleExport = useCallback(
    async (format) => {
      if (!hasDonations || exportLoading) {
        return;
      }

      setExportLoading(true);

      try {
        const [churchName, rows] = await Promise.all([fetchChurchName(), fetchExportRows()]);

        if (!rows.length) {
          throw new Error('No donations matched the selected filters.');
        }

        const exportPayload = {
          churchName,
          reportPeriod: getReportPeriodLabel(appliedFilters),
          selectedDonationType: getFilterOptionLabel(
            DONATION_TYPE_FILTER_OPTIONS,
            appliedFilters.donationType,
            'All Donation Types'
          ),
          selectedPaymentMethod: getFilterOptionLabel(
            PAYMENT_METHOD_FILTER_OPTIONS,
            appliedFilters.paymentMethod,
            'All Payment Methods'
          ),
          summary,
          rows,
          generatedAt: new Date().toISOString()
        };

        if (format === 'PDF') {
          await exportDonationReportPdf(exportPayload);
        } else {
          exportDonationReportCsv(exportPayload);
        }
      } catch (exportError) {
        window.alert(exportError.message || 'Unable to export donations.');
      } finally {
        setExportLoading(false);
      }
    },
    [appliedFilters, exportLoading, fetchChurchName, fetchExportRows, hasDonations, summary]
  );

  const tableKey = useMemo(() => JSON.stringify(appliedFilters), [appliedFilters]);

  const columns = useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'date_donated',
        headerClassName: { textAlign: 'center' },
        Cell: ({ value }) => (
          <div className="d-flex justify-content-start align-items-center">
            <span className="text-dark">{dateFormatted(value)}</span>
          </div>
        )
      },
      { Header: 'Firstname', accessor: 'first_name', sortType: 'basic' },
      { Header: 'Lastname', accessor: 'last_name', sortType: 'basic' },
      {
        Header: 'Donation Type',
        accessor: 'donation_type',
        sortType: 'basic',
        Cell: ({ value }) => getDonationTypeLabel(value)
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        headerClassName: { textAlign: 'center' },
        Cell: ({ value }) => (
          <div className="d-flex justify-content-start align-items-center">
            <span className="text-dark">{formatCurrency('£', value)}</span>
          </div>
        )
      },
      {
        Header: 'Payment Method',
        accessor: 'online',
        headerClassName: { textAlign: 'center' },
        Cell: ({ value }) => (
          <div className="d-flex justify-content-start align-items-center">
            <span className={`badge ${value ? 'bg-primary' : 'bg-secondary'}`}>{getPaymentMethodLabel(value)}</span>
          </div>
        )
      },
      {
        Header: 'Actions',
        disableSortBy: true,
        headerClassName: 'text-center actions-header',
        className: 'text-center actions-cell',
        Cell: ({ row }) => (
          <>
            {row?.original?.online ? (
              <div className="d-flex justify-content-center align-items-center">
                <Tooltip title="Edit Donation" arrow>
                  <span className="p-0">
                    <TiEdit
                      size={30}
                      className="pointer me-2"
                      onClick={() => {
                        setViewOnly(false);
                        handleShow();
                        handleSelect(row.original);
                      }}
                    />
                  </span>
                </Tooltip>
                <Tooltip title="Delete Donation" arrow>
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
            ) : (
              <div className="d-flex justify-content-center align-items-center ms-2">
                <Tooltip title="View donation details" arrow>
                  <span className="p-0">
                    <TiEye
                      size={30}
                      className="pointer me-2"
                      onClick={() => {
                        setViewOnly(true);
                        handleShow();
                        handleSelect(row.original);
                      }}
                    />
                  </span>
                </Tooltip>
              </div>
            )}
          </>
        )
      }
    ],
    [handleDelete, handleSelect, handleShow]
  );

  return (
    <>
      <div className={`ms-5 me-5 mt-2 ${!loading ? 'overlay__block' : null}`}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
            <h5 className="card-title ms-2 mb-0">Donations</h5>
            <div className="d-flex align-items-center justify-content-end gap-2 flex-wrap">
              <DropdownButton
                id="donation-export-dropdown"
                title={exportLoading ? 'Exporting...' : 'Export'}
                variant="outline-secondary"
                size="sm"
                disabled={!hasDonations || exportLoading}
              >
                <Dropdown.Item onClick={() => handleExport('PDF')}>
                  <BsDownload className="me-2" />
                  Export PDF
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleExport('CSV')}>
                  <BsDownload className="me-2" />
                  Export CSV
                </Dropdown.Item>
              </DropdownButton>
            </div>
          </div>

          <div className="row mb-4">
            {KPI_CARDS.map((card) => {
              const Icon = card.icon;
              const rawValue = summary?.[card.key] || 0;

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
                            <span className="fs-16 fw-semibold">
                              {card.isCurrency ? formatCurrency('£', rawValue) : rawValue}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              );
            })}
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Filters</h6>
              <small className="text-muted">Refine donations by type, date, payment method, and donor name.</small>
            </div>
            <div className="d-flex gap-3 flex-wrap align-items-end">
              <Form.Group style={{ minWidth: 220 }}>
                <Form.Label className="small fw-semibold mb-1">Donation Type</Form.Label>
                <Form.Select
                  value={draftFilters.donationType}
                  onChange={(event) => handleFilterChange('donationType', event.target.value)}
                >
                  {DONATION_TYPE_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={draftFilters.startDate}
                  onChange={(event) => handleFilterChange('startDate', event.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={draftFilters.endDate}
                  onChange={(event) => handleFilterChange('endDate', event.target.value)}
                />
              </Form.Group>
              <Form.Group style={{ minWidth: 220 }}>
                <Form.Label className="small fw-semibold mb-1">Payment Method</Form.Label>
                <Form.Select
                  value={draftFilters.paymentMethod}
                  onChange={(event) => handleFilterChange('paymentMethod', event.target.value)}
                >
                  {PAYMENT_METHOD_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group style={{ minWidth: 280 }}>
                <Form.Label className="small fw-semibold mb-1">Search</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <BsSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search first name, last name, or full name"
                    value={draftFilters.search}
                    onChange={(event) => handleFilterChange('search', event.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </div>
            <div className="mt-3">
              <div className="small fw-semibold mb-2">Quick Presets</div>
              <div className="d-flex gap-2 flex-wrap">
                {FILTER_PRESETS.map((preset) => (
                  <Button
                    key={preset.key}
                    variant={draftFilters.preset === preset.key ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => handlePresetSelect(preset.key)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="d-flex gap-2 flex-wrap">
                <Button size="sm" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
                <Button size="sm" variant="outline-secondary" onClick={handleResetFilters}>
                  Reset
                </Button>
                {exportLoading && <Spinner size="sm" className="align-self-center" />}
              </div>

              <Button type="submit" size="sm" onClick={handleShow}>
                + Add Donation
              </Button>
            </div>
          </div>

          <Table
            key={tableKey}
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
        viewOnly={viewOnly}
      />
    </>
  );
};

export default Page;
