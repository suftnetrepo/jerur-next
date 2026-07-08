import React, { useEffect, useState } from 'react';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { capitalizeFirstLetter } from '../../../../utils/helpers';

const DEFAULT_PRIORITY = {
  SICK: 'HIGH',
  NEEDS_PRAYER: 'HIGH',
  ABSENT: 'MEDIUM',
  OTHER: 'MEDIUM'
};

const RenderFollowUpOffcanvas = ({
  show,
  handleClose,
  attendance,
  assignableUsers,
  handleCreateFollowUp
}) => {
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

  if (!attendance) return null;

  const memberName = attendance.memberId
    ? `${attendance.memberId.first_name || ''} ${attendance.memberId.last_name || ''}`.trim()
    : 'Unknown Member';

  const serviceName = attendance.serviceId?.title || 'Service';

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" style={{ width: '35%', backgroundColor: 'white' }}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Add Follow-up</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form>
          {/* Member (Read-only) */}
          <Form.Group controlId="formMember" className="mb-3">
            <Form.Label className="text-dark">Member</Form.Label>
            <Form.Control
              type="text"
              value={memberName}
              disabled
              className="border-dark"
            />
          </Form.Group>

          {/* Service (Read-only) */}
          <Form.Group controlId="formService" className="mb-3">
            <Form.Label className="text-dark">Service</Form.Label>
            <Form.Control
              type="text"
              value={serviceName}
              disabled
              className="border-dark"
            />
          </Form.Group>

          {/* Attendance Status (Read-only) */}
          <Form.Group controlId="formAttendanceStatus" className="mb-3">
            <Form.Label className="text-dark">Attendance Status</Form.Label>
            <Form.Control
              type="text"
              value={capitalizeFirstLetter(attendance.status?.replace(/_/g, ' ') || '')}
              disabled
              className="border-dark"
            />
          </Form.Group>

          {/* Reason Dropdown */}
          <Form.Group controlId="formReason" className="mb-3">
            <Form.Label className="text-dark">Reason</Form.Label>
            <Form.Select
              value={fields.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              className="border-dark"
            >
              <option value="ABSENT">Absent</option>
              <option value="SICK">Sick</option>
              <option value="NEEDS_PRAYER">Needs Prayer</option>
              <option value="BEREAVEMENT">Bereavement</option>
              <option value="OTHER">Other</option>
            </Form.Select>
          </Form.Group>

          {/* Priority Dropdown */}
          <Form.Group controlId="formPriority" className="mb-3">
            <Form.Label className="text-dark">Priority</Form.Label>
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

          {/* Assigned To Dropdown */}
          <Form.Group controlId="formAssignedTo" className="mb-3">
            <Form.Label className="text-dark">Assigned To</Form.Label>
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

          {/* Notes Textarea */}
          <Form.Group controlId="formNotes" className="mb-3">
            <Form.Label className="text-dark">Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Add any notes..."
              value={fields.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="border-dark"
            />
          </Form.Group>

          {/* Buttons */}
          <div className="d-flex gap-2 justify-content-end">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Follow-up'}
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default RenderFollowUpOffcanvas;
