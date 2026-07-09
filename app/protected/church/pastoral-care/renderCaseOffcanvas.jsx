import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Card, Col, Form, Offcanvas, Row, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
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
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
};

const STATUS_BADGE_VARIANTS = {
  OPEN: 'warning',
  CONTACTED: 'info',
  VISITED: 'primary',
  CLOSED: 'success'
};

const PRIORITY_BADGE_VARIANTS = {
  LOW: 'secondary',
  MEDIUM: 'warning',
  HIGH: 'danger'
};

const SummaryField = ({ label, value, muted = false }) => (
  <div className="border rounded-3 p-3 h-100 bg-white">
    <div className="text-muted small fw-semibold mb-1">{label}</div>
    <div className={muted ? 'text-muted small' : 'fw-semibold'}>{value}</div>
  </div>
);

const buildDraftState = (caseData) => ({
  status: caseData?.status || 'OPEN',
  assignedTo: caseData?.assignedTo?._id || '',
  priority: caseData?.priority || 'MEDIUM',
  note: caseData?.note || ''
});

const RenderCaseOffcanvas = ({ show, handleClose, caseData, owners = [], loading, saving, handleSaveCase }) => {
  const [draft, setDraft] = useState(buildDraftState(caseData));
  const [baseline, setBaseline] = useState(buildDraftState(caseData));
  const notesRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const scrollTopRef = useRef(0);

  useEffect(() => {
    const nextDraft = buildDraftState(caseData);
    setDraft(nextDraft);
    setBaseline(nextDraft);
  }, [caseData?._id]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollTopRef.current;
    }
  });

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baseline), [baseline, draft]);

  const handleDraftChange = useCallback((field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleRequestClose = useCallback(async () => {
    if (!isDirty) {
      handleClose();
      return;
    }

    const result = await Swal.fire({
      title: 'Unsaved changes',
      text: 'You have unsaved changes. Are you sure you want to close?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Close without saving',
      cancelButtonText: 'Continue editing'
    });

    if (result.isConfirmed) {
      setDraft(baseline);
      handleClose();
    }
  }, [baseline, handleClose, isDirty]);

  const handleSave = useCallback(async () => {
    const success = await handleSaveCase({
      status: draft.status,
      assignedTo: draft.assignedTo || null,
      priority: draft.priority,
      note: draft.note
    });

    if (success) {
      setBaseline(draft);
      return;
    }

    setDraft(baseline);
  }, [baseline, draft, handleSaveCase]);

  const memberName = caseData?.memberId
    ? `${caseData.memberId.first_name || ''} ${caseData.memberId.last_name || ''}`.trim()
    : 'Unknown Member';
  const memberDepartment = caseData?.memberId?.department || caseData?.memberId?.group || 'Not available';
  const memberSince = formatDate(caseData?.memberId?.createdAt || caseData?.memberId?.joinedAt || caseData?.memberId?.memberSince);
  const attendanceStatus = formatWords(caseData?.attendanceId?.status, 'No linked attendance');
  const attendanceService = caseData?.attendanceId?.serviceId?.title || 'No linked service';
  const attendanceMessage = caseData?.attendanceId?.message || 'No attendance response';
  const caseStatusVariant = STATUS_BADGE_VARIANTS[draft.status] || 'secondary';
  const priorityVariant = PRIORITY_BADGE_VARIANTS[draft.priority] || 'secondary';
  const assignedPastorData = owners.find((owner) => owner._id === draft.assignedTo) || caseData?.assignedTo || null;
  const assignedPastor = assignedPastorData
    ? `${assignedPastorData.first_name || ''} ${assignedPastorData.last_name || ''}`.trim()
    : 'Unassigned';
  const noteEntries = useMemo(() => ([
    {
      id: caseData?._id || 'current-note',
      author: assignedPastor !== 'Unassigned' ? assignedPastor : 'Care team',
      date: formatDate(caseData?.updatedAt || caseData?.createdAt),
      note: draft.note || caseData?.note || 'No internal note yet. Add a note to capture care context.'
    }
  ]), [assignedPastor, caseData?._id, caseData?.createdAt, caseData?.note, caseData?.updatedAt, draft.note]);

  if (!show) {
    return null;
  }

  return (
    <Offcanvas show={show} onHide={handleRequestClose} placement="end" style={{ width: '42%', backgroundColor: 'white' }}>
      <Offcanvas.Header closeButton className="border-bottom align-items-start py-3 px-4">
        <div className="d-flex justify-content-between align-items-start w-100 me-3 gap-3">
          <div>
            <Offcanvas.Title className="mb-1">Pastoral Care Case</Offcanvas.Title>
            <div className="text-muted small">Review case context, attendance details, and internal pastoral actions.</div>
          </div>
          <Badge bg={caseStatusVariant} className="px-3 py-2 rounded-pill align-self-center">
            {formatWords(draft.status, 'Open')}
          </Badge>
        </div>
      </Offcanvas.Header>
      <Offcanvas.Body className="px-4 py-3 d-flex flex-column">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <Form className="d-flex flex-column h-100">
            <div
              ref={scrollContainerRef}
              className="grow overflow-auto pe-1"
              onScroll={(event) => {
                scrollTopRef.current = event.currentTarget.scrollTop;
              }}
            >
              <Card className="border-0 shadow-sm mb-3">
                <Card.Body className="p-3">
                  <div className="text-muted small fw-semibold mb-1">Member Summary</div>
                  <h5 className="mb-3">{memberName}</h5>
                  <Row className="g-3">
                    <Col sm={6}>
                      <SummaryField label="Department" value={memberDepartment} muted={memberDepartment === 'Not available'} />
                    </Col>
                    <Col sm={6}>
                      <SummaryField label="Service" value={attendanceService} muted={attendanceService === 'No linked service'} />
                    </Col>
                    <Col sm={6}>
                      <SummaryField label="Member Since" value={memberSince} muted={memberSince === 'Not available'} />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm mb-3">
                <Card.Body className="p-3">
                  <div className="text-muted small fw-semibold mb-3">Case Summary</div>
                  <Row className="g-3">
                    <Col sm={6}>
                      <SummaryField label="Reason" value={formatWords(caseData?.reason)} />
                    </Col>
                    <Col sm={6}>
                      <SummaryField label="Priority" value={formatWords(draft.priority)} />
                    </Col>
                    <Col sm={6}>
                      <SummaryField label="Assigned To" value={assignedPastor} muted={assignedPastor === 'Unassigned'} />
                    </Col>
                    <Col sm={6}>
                      <SummaryField label="Created Date" value={formatDate(caseData?.createdAt)} muted={formatDate(caseData?.createdAt) === 'Not available'} />
                    </Col>
                    <Col sm={6}>
                      <SummaryField label="Last Updated" value={formatDate(caseData?.updatedAt)} muted={formatDate(caseData?.updatedAt) === 'Not available'} />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm mb-3">
                <Card.Body className="p-3">
                  <div className="text-muted small fw-semibold mb-3">Attendance Information</div>
                  <Row className="g-3">
                    <Col md={4}>
                      <SummaryField label="Service" value={attendanceService} muted={attendanceService === 'No linked service'} />
                    </Col>
                    <Col md={4}>
                      <SummaryField label="Attendance Status" value={attendanceStatus} muted={attendanceStatus === 'No linked attendance'} />
                    </Col>
                    <Col md={4}>
                      <SummaryField label="Member Response" value={attendanceMessage} muted={attendanceMessage === 'No attendance response'} />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm mb-3">
                <Card.Body className="p-3">
                  <div className="text-muted small fw-semibold mb-3">Pastoral Actions</div>
                  <div className="mb-3">
                    <Form.Label className="small fw-semibold mb-2">Quick Status</Form.Label>
                    <div className="d-flex gap-2 flex-wrap">
                      {['OPEN', 'CONTACTED', 'VISITED', 'CLOSED'].map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={draft.status === status ? 'primary' : 'outline-secondary'}
                          className="rounded-pill px-3"
                          disabled={saving}
                          onClick={() => handleDraftChange('status', status)}
                        >
                          {formatWords(status)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="caseAssignedPastor">
                        <Form.Label className="small fw-semibold">Assigned Pastor</Form.Label>
                        <Form.Select value={draft.assignedTo} onChange={(event) => handleDraftChange('assignedTo', event.target.value)}>
                          <option value="">Unassigned</option>
                          {owners.map((owner) => (
                            <option key={owner._id} value={owner._id}>
                              {`${owner.first_name || ''} ${owner.last_name || ''}`.trim()}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="casePriority">
                        <Form.Label className="small fw-semibold">Priority</Form.Label>
                        <Form.Select value={draft.priority} onChange={(event) => handleDraftChange('priority', event.target.value)}>
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm mb-3">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
                    <div>
                      <div className="text-muted small fw-semibold mb-1">Internal Notes</div>
                      <div className="text-muted small">Notes are displayed in a timeline-ready format so history can be added later.</div>
                    </div>
                    <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => notesRef.current?.focus()}>
                      + Add Note
                    </Button>
                  </div>
                  <div className="d-flex flex-column gap-3 mb-3">
                    {noteEntries.map((entry) => (
                      <div key={entry.id} className="border rounded-3 p-3 bg-light">
                        <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-2">
                          <div className="fw-semibold small">{entry.author}</div>
                          <div className="text-muted small">{entry.date}</div>
                        </div>
                        <div className="small text-dark">{entry.note}</div>
                      </div>
                    ))}
                  </div>
                  <Form.Group controlId="careFollowUpNotes">
                    <Form.Label className="small fw-semibold">New Note</Form.Label>
                    <Form.Control
                      ref={notesRef}
                      as="textarea"
                      rows={4}
                      value={draft.note}
                      onChange={(event) => handleDraftChange('note', event.target.value)}
                      placeholder="Add internal notes for this pastoral care case"
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-2 position-sticky bottom-0 bg-white">
              <Button variant="secondary" onClick={handleRequestClose} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving || !isDirty}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default React.memo(RenderCaseOffcanvas);