'use client';

import React from 'react';
import { Form, Button } from 'react-bootstrap';
import DeleteConfirmation from '../../../../src/components/elements/ConfirmDialogue';
import { normalizeTime } from '../../../../utils/helpers';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const RegularServiceForm = ({ errorMessages, handleDelete, handleSubmit, handleChange, fields }) => {

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    handleChange('description', pastedText);
    e.preventDefault();
  };

  return (
    <Form>
      <div className="row">
        <div className="col-md-12">
          <Form.Group controlId="formName" className="mb-3">
            <Form.Label className="text-dark"> Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter title"
              name="title"
              value={fields?.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="border-dark"
              maxLength={50}
            />
            {errorMessages?.title?.message && (
              <span className="text-danger fs-13 ms-2">{errorMessages?.title?.message}</span>
            )}
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group controlId="formLastName" className="mb-3">
            <Form.Label className="text-dark">Sequency No</Form.Label>
            <Form.Select
              className="border-dark"
              aria-label="Select Order"
              value={fields?.sequency_no}
              onChange={(e) => handleChange('sequency_no', e.target.value)}
            >
              <option>Select</option>
              {[...Array(20)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </Form.Select>
            {errorMessages?.sequency_no?.message && (
              <span className="text-danger fs-13">{errorMessages?.sequency_no?.message}</span>
            )}
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group controlId="formServiceType" className="mb-3">
            <Form.Label className="text-dark">Service Type</Form.Label>
            <Form.Select
              name="service_type"
              value={fields.service_type}
              className="border-dark"
              onChange={(e) => handleChange('service_type', e.target.value)}
            >
              <option value="">Select a Service Type</option>
              <option value="prayer">Prayer</option>
              <option value="service">Service</option>
            </Form.Select>
            {errorMessages.service_type?.message && <span className="text-danger">{errorMessages.service_type?.message}</span>}
          </Form.Group>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-12">
          <div className="row">
            <div className="col-md-6">
              <Form.Group controlId="formStartDate">
                <Form.Label className="text-dark">Start Time</Form.Label>
                <Form.Control
                  type="time"
                  value={fields?.start_time ? normalizeTime(fields?.start_time) : fields?.start_time}
                  onChange={(e) => handleChange('start_time', e.target.value)}
                  className="border-dark"
                />
              </Form.Group>
              {errorMessages?.start_time?.message && (
                <span className="text-danger fs-13">{errorMessages?.start_time?.message}</span>
              )}
            </div>
            <div className="col-md-6">
              <Form.Group controlId="formEndDate">
                <Form.Label className="text-dark">End Time</Form.Label>
                <Form.Control
                  type="time"
                  value={fields?.end_time ? normalizeTime(fields?.end_time) : fields?.end_time}
                  onChange={(e) => handleChange('end_time', e.target.value)}
                  className="border-dark"
                />
              </Form.Group>
              {errorMessages?.end_time?.message && (
                <span className="text-danger fs-13">{errorMessages?.end_time?.message}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-12">
          <Form.Group controlId="formServiceDay">
            <Form.Label className="text-dark">Day</Form.Label>
            <Form.Select
              className="border-dark"
              value={Array.isArray(fields?.days) && fields.days.length > 0 ? fields.days[0] : ''}
              onChange={(e) => handleChange('days', e.target.value === '' ? [] : [Number(e.target.value)])}
            >
              <option value="">Select a day</option>
              {WEEKDAYS.map((label, day) => <option key={label} value={day}>{label}</option>)}
            </Form.Select>
          </Form.Group>
          {errorMessages?.days?.message && <span className="text-danger fs-13">{errorMessages.days.message}</span>}
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-12">
          <Form.Group controlId="formHomeNoticeMinutes">
            <Form.Label className="text-dark">Show on Home before start</Form.Label>
            <Form.Select
              value={fields?.home_notice_minutes ?? 15}
              className="border-dark"
              onChange={(e) => handleChange('home_notice_minutes', Number(e.target.value))}
            >
              <option value={0}>At start time</option>
              <option value={5}>5 minutes before</option>
              <option value={10}>10 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
            </Form.Select>
            <Form.Text className="text-muted">The Home screen will show this session during this lead time and until it ends.</Form.Text>
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <Form.Group className="mb-3">
            <Form.Label className="text-dark">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter task description"
              value={fields.description}
              onPaste={handlePaste}
              onChange={(e) => handleChange('description', e.target.value)}
              className="border-dark"
              maxLength={200}
            />
            {errorMessages?.description?.message && (
              <span className="text-danger fs-13">{errorMessages.description?.message}</span>
            )}
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group controlId="status" className="d-flex d-flex justify-content-start align-items-start">
            <Form.Check
              type="checkbox"
              id="status"
              className="border-dark"
              checked={fields?.status}
              value={fields?.status}
              onChange={(e) => handleChange('status', e.target.checked)}
            />
            <Form.Label className="text-dark ms-1"> Status</Form.Label>
            {errorMessages?.status?.message && (
              <span className="text-danger fs-13">{errorMessages?.status?.message}</span>
            )}
          </Form.Group>
        </div>
        <div className="col-md-6"> </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group controlId="status" className="mb-3 d-flex gap=1 d-flex justify-content-start align-items-start">
            <Form.Check
              type="checkbox"
              className="border-dark"
              id="remote"
              checked={fields?.remote}
              value={fields?.remote}
              onChange={(e) => handleChange('remote', e.target.checked)}
            />
            <Form.Label className="text-dark ms-1">Remote</Form.Label>

            {errorMessages?.remote?.message && (
              <span className="text-danger fs-13">{errorMessages?.remote?.message}</span>
            )}
          </Form.Group>
        </div>
        <div className="col-md-6"> </div>
      </div>

      {fields?.remote && (
        <div className="col-md-12">
          <Form.Group controlId="formName" className="mb-3">
            <Form.Label className="text-dark"> Remote Link</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter remote link"
              name="name"
              value={fields?.remote_link}
              onChange={(e) => handleChange('remote_link', e.target.value)}
              className="border-dark"
              maxLength={1000}
            />
            {errorMessages?.remote_link?.message && (
              <span className="text-danger fs-13 ms-2">{errorMessages?.remote_link?.message}</span>
            )}
          </Form.Group>
        </div>
      )}

      <div className="d-flex justify-content-start">
        <Button type="button" variant="primary" onClick={() => handleSubmit()}>
          Save Changes
        </Button>
        {fields?._id && (
          <DeleteConfirmation
            onConfirm={async (id) => {
              handleDelete(id);
            }}
            onCancel={() => { }}
            itemId={fields?._id}
          >
            <Button type="button" className="ms-4" variant="danger">
              Delete
            </Button>
          </DeleteConfirmation>
        )}
      </div>
    </Form>
  );
};

export default RegularServiceForm;
