import React, { useEffect, useState } from 'react';
import { Badge, Button, Form, Offcanvas, Spinner } from 'react-bootstrap';
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

const RenderCaseOffcanvas = ({ show, handleClose, caseData, loading, saving, handleStatusUpdate, handleNotesUpdate }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNotes(caseData?.note || '');
  }, [caseData]);

  if (!show) {
    return null;
  }

  const memberName = caseData?.memberId
    ? `${caseData.memberId.first_name || ''} ${caseData.memberId.last_name || ''}`.trim()
    : 'Unknown Member';
  const assignedPastor = caseData?.assignedTo
    ? `${caseData.assignedTo.first_name || ''} ${caseData.assignedTo.last_name || ''}`.trim()
    : 'Unassigned';
  const attendanceStatus = formatWords(caseData?.attendanceId?.status, 'No linked attendance');
  const attendanceService = caseData?.attendanceId?.serviceId?.title || 'No linked service';
  const attendanceMessage = caseData?.attendanceId?.message || 'No attendance response';

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" style={{ width: '38%', backgroundColor: 'white' }}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Pastoral Care Case</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h6 className="mb-3">Case Details</h6>
              <div className="mb-2"><strong>Member:</strong> {memberName}</div>
              <div className="mb-2"><strong>Reason:</strong> {formatWords(caseData?.reason)}</div>
              <div className="mb-2"><strong>Assigned Pastor:</strong> {assignedPastor}</div>
              <div className="mb-2"><strong>Priority:</strong> {formatWords(caseData?.priority)}</div>
              <div className="mb-2"><strong>Status:</strong> <Badge bg="primary">{formatWords(caseData?.status)}</Badge></div>
              <div className="mb-2"><strong>Created:</strong> {formatDate(caseData?.createdAt)}</div>
              <div className="mb-2"><strong>Updated:</strong> {formatDate(caseData?.updatedAt)}</div>
            </div>

            <div className="mb-4">
              <h6 className="mb-3">Attendance Information</h6>
              <div className="mb-2"><strong>Service:</strong> {attendanceService}</div>
              <div className="mb-2"><strong>Attendance Status:</strong> {attendanceStatus}</div>
              <div className="mb-2"><strong>Member Response:</strong> {attendanceMessage}</div>
              <div className="mb-2"><strong>Attendance Updated:</strong> {formatDate(caseData?.attendanceId?.updatedAt || caseData?.attendanceId?.submittedAt)}</div>
            </div>

            <div className="mb-4">
              <h6 className="mb-3">Quick Status Actions</h6>
              <div className="d-flex gap-2 flex-wrap">
                {['OPEN', 'CONTACTED', 'VISITED', 'CLOSED'].map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={caseData?.status === status ? 'primary' : 'outline-secondary'}
                    disabled={saving}
                    onClick={() => handleStatusUpdate(status, notes)}
                  >
                    {formatWords(status)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h6 className="mb-3">Internal Notes</h6>
              <Form.Group controlId="careFollowUpNotes" className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add internal notes for this pastoral care case"
                />
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleClose} disabled={saving}>
                  Close
                </Button>
                <Button variant="primary" onClick={() => handleNotesUpdate(notes)} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default RenderCaseOffcanvas;