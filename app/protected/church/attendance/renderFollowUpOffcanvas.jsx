import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Offcanvas, Button, Form, Badge, Card, Row, Col } from 'react-bootstrap';
import { capitalizeFirstLetter } from '../../../../utils/helpers';

const DEFAULT_PRIORITY = {
  SICK: 'HIGH',
  NEEDS_PRAYER: 'HIGH',
  ABSENT: 'MEDIUM',
  OTHER: 'MEDIUM'
};

const STATUS_BADGE_VARIANTS = {
  OPEN: 'warning',
  CONTACTED: 'info',
  VISITED: 'primary',
  CLOSED: 'success',
  NEW_CASE: 'secondary'
};

const PRIORITY_BADGE_VARIANTS = {
  LOW: 'secondary',
  MEDIUM: 'warning',
  HIGH: 'danger'
};

const formatDisplayText = (value, fallback = 'Not available') => {
  if (!value) {
    return fallback;
  }

  return capitalizeFirstLetter(String(value).replace(/_/g, ' ').toLowerCase());
};

const formatDateTime = (value) => {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
};

const getUserLabel = (user) => {
  if (!user) {
    return '';
  }

  return `${user.first_name || ''} ${user.last_name || ''}`.trim();
};

const SummaryField = ({ label, value, muted = false }) => (
  <div className="border rounded-3 p-3 h-100 bg-white">
    <div className="text-muted small text-uppercase fw-semibold mb-1">{label}</div>
    <div className={muted ? 'text-muted small' : 'fw-semibold'}>{value}</div>
  </div>
);

const RenderFollowUpOffcanvas = ({
  show,
  handleClose,
  attendance,
  assignableUsers,
  handleCreateFollowUp
}) => {
  const notesRef = useRef(null);
  const [fields, setFields] = useState({
    reason: 'OTHER',
    priority: 'MEDIUM',
    assignedTo: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!attendance) {
      return;
    }

    const reason = ['ABSENT', 'SICK', 'NEEDS_PRAYER', 'BEREAVEMENT', 'OTHER'].includes(attendance.status)
      ? attendance.status
      : 'OTHER';

    setFields({
      reason,
      priority: DEFAULT_PRIORITY[reason] || 'MEDIUM',
      assignedTo: '',
      notes: attendance.message || ''
    });
  }, [attendance]);

  const handleChange = (name, value) => {
    setFields((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'reason' ? { priority: DEFAULT_PRIORITY[value] || 'MEDIUM' } : {})
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const followUpData = {
      userId: attendance?.userId?._id,
      memberId: attendance?.memberId?._id,
      attendanceId: attendance?._id,
      reason: fields.reason,
      priority: fields.priority,
      note: fields.notes,
      assignedTo: fields.assignedTo || null
    };

    const result = await handleCreateFollowUp(followUpData);

    if (result) {
      setLoading(false);
      setFields({
        reason: 'OTHER',
        priority: 'MEDIUM',
        assignedTo: '',
        notes: ''
      });
      handleClose();
    }

    setLoading(false);
  };

  const assignedUser = useMemo(
    () => (assignableUsers || []).find((user) => user._id === fields.assignedTo),
    [assignableUsers, fields.assignedTo]
  );

  if (!attendance) return null;

  const memberName = attendance.memberId
    ? `${attendance.memberId.first_name || ''} ${attendance.memberId.last_name || ''}`.trim()
    : 'Unknown Member';
  const serviceName = attendance.serviceId?.title || 'Service';
  const caseStatus = attendance.careCaseStatus || 'NEW_CASE';
  const caseStatusLabel = formatDisplayText(caseStatus, 'New Case');
  const caseStatusVariant = STATUS_BADGE_VARIANTS[caseStatus] || 'secondary';
  const priorityVariant = PRIORITY_BADGE_VARIANTS[fields.priority] || 'secondary';
  const attendanceStatus = formatDisplayText(attendance.status);
  const memberDepartment = attendance.memberId?.department || attendance.memberId?.group || 'Not available';
  const memberSince = formatDateTime(attendance.memberId?.createdAt || attendance.memberId?.joinedAt || attendance.memberId?.memberSince);
  const noteEntries = [
    {
      id: 'draft-note',
      author: assignedUser ? getUserLabel(assignedUser) : 'Case intake',
      date: formatDateTime(attendance.updatedAt || attendance.createdAt),
      note: fields.notes || 'No internal note yet. Add a note to capture context for future follow-up.'
    }
  ];
  const quickStatusOptions = [
    { label: 'Absent', value: 'ABSENT' },
    { label: 'Sick', value: 'SICK' },
    { label: 'Needs Prayer', value: 'NEEDS_PRAYER' },
    { label: 'Other', value: 'OTHER' }
  ];

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" style={{ width: '42%', backgroundColor: 'white' }}>
      <Offcanvas.Header closeButton className="border-bottom align-items-start py-3 px-4">
        <div className="d-flex justify-content-between align-items-start w-100 me-3 gap-3">
          <div>
            <Offcanvas.Title className="mb-1">Pastoral Care Case</Offcanvas.Title>
            <div className="text-muted small">Review attendance context, assign ownership, and capture internal follow-up notes.</div>
          </div>
          <Badge bg={caseStatusVariant} className="px-3 py-2 rounded-pill text-uppercase align-self-center">
            {caseStatusLabel}
          </Badge>
        </div>
      </Offcanvas.Header>
      <Offcanvas.Body className="px-4 py-3 d-flex flex-column" style={{ overflowY: 'auto' }}>
        <Form className="d-flex flex-column h-100">
          <div className="grow">
            <Card className="border-0 shadow-sm mb-3">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                  <div>
                    <div className="text-muted small text-uppercase fw-semibold mb-1">Member Summary</div>
                    <h5 className="mb-1">{memberName}</h5>
                    <div className="text-muted small">Attendance case workspace</div>
                  </div>
                  <Badge bg={priorityVariant} className="px-3 py-2 rounded-pill align-self-center">
                    {formatDisplayText(fields.priority, 'Medium Priority')}
                  </Badge>
                </div>
                <Row className="g-3 mt-1">
                  <Col sm={6}>
                    <SummaryField label="Department" value={memberDepartment} muted={memberDepartment === 'Not available'} />
                  </Col>
                  <Col sm={6}>
                    <SummaryField label="Service" value={serviceName} />
                  </Col>
                  <Col sm={6}>
                    <SummaryField label="Member Since" value={memberSince} muted={memberSince === 'Not available'} />
                  </Col>
                  <Col sm={6}>
                    <SummaryField label="Pastor Contact" value={attendance.wantsPastorContact ? 'Requested' : 'Not requested'} muted={!attendance.wantsPastorContact} />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-3">
              <Card.Body className="p-3">
                <div className="text-muted small text-uppercase fw-semibold mb-3">Case Summary</div>
                <Row className="g-3">
                  <Col sm={6}>
                    <SummaryField label="Reason" value={formatDisplayText(fields.reason)} />
                  </Col>
                  <Col sm={6}>
                    <SummaryField label="Priority" value={formatDisplayText(fields.priority)} />
                  </Col>
                  <Col sm={6}>
                    <SummaryField label="Assigned To" value={assignedUser ? `${getUserLabel(assignedUser)} (${assignedUser.role})` : 'Assign to me'} muted={!assignedUser} />
                  </Col>
                  <Col sm={6}>
                    <SummaryField label="Created Date" value={formatDateTime(attendance.createdAt)} muted={formatDateTime(attendance.createdAt) === 'Not available'} />
                  </Col>
                  <Col sm={6}>
                    <SummaryField label="Last Updated" value={formatDateTime(attendance.updatedAt || attendance.createdAt)} muted={formatDateTime(attendance.updatedAt || attendance.createdAt) === 'Not available'} />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-3">
              <Card.Body className="p-3">
                <div className="text-muted small text-uppercase fw-semibold mb-3">Attendance Information</div>
                <Row className="g-3">
                  <Col md={4}>
                    <SummaryField label="Service" value={serviceName} />
                  </Col>
                  <Col md={4}>
                    <SummaryField label="Attendance Status" value={attendanceStatus} />
                  </Col>
                  <Col md={4}>
                    <SummaryField label="Member Response" value={attendance.message || 'No response submitted'} muted={!attendance.message} />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-3">
              <Card.Body className="p-3">
                <div className="text-muted small text-uppercase fw-semibold mb-3">Pastoral Actions</div>
                <div className="mb-3">
                  <Form.Label className="small fw-semibold mb-2">Quick Status</Form.Label>
                  <div className="d-flex gap-2 flex-wrap">
                    {quickStatusOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={fields.reason === option.value ? 'primary' : 'outline-secondary'}
                        size="sm"
                        className="rounded-pill px-3"
                        onClick={() => handleChange('reason', option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group controlId="formAssignedTo">
                      <Form.Label className="small fw-semibold">Assigned Pastor</Form.Label>
                      <Form.Select
                        value={fields.assignedTo}
                        onChange={(e) => handleChange('assignedTo', e.target.value)}
                        className="border-dark"
                      >
                        <option value="">Assign to me</option>
                        {(assignableUsers || []).map((user) => (
                          <option key={user._id} value={user._id}>
                            {`${user.first_name} ${user.last_name}`.trim()} ({user.role})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formPriority">
                      <Form.Label className="small fw-semibold">Priority</Form.Label>
                      <Form.Select
                        value={fields.priority}
                        onChange={(e) => handleChange('priority', e.target.value)}
                        className="border-dark"
                      >
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
                    <div className="text-muted small text-uppercase fw-semibold mb-1">Internal Notes</div>
                    <div className="text-muted small">Capture follow-up context. The layout supports multiple notes when history becomes available.</div>
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

                <Form.Group controlId="formNotes">
                  <Form.Label className="small fw-semibold">New Note</Form.Label>
                  <Form.Control
                    ref={notesRef}
                    as="textarea"
                    rows={4}
                    placeholder="Add internal context, pastoral observations, or next steps..."
                    value={fields.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="border-dark"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </div>

          <div className="d-flex gap-2 justify-content-end pt-3 border-top mt-2 position-sticky bottom-0 bg-white">
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default RenderFollowUpOffcanvas;
