import React, { useState } from 'react';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { ConfirmationDialogue, OkDialogue } from '@/src/components/elements/ConfirmDialogue';
import { contactValidator } from '@/validator/rules';
import { validate } from '@/validator/validator';

const RenderContactOffcanvas = ({
  show,
  setShow,
  handleClose,
  handleChange,
  handleSave,
  handleReset,
  handleEdit,
  success,
  fields
}) => {
  const [errorMessages, setErrorMessages] = useState({});

  const resetFields = () => {};

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, contactValidator.rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    if (fields._id) {
      handleEdit(fields, fields?._id).then((result) => {
        result && resetFields();
      });
    } else {
      handleSave(fields).then((result) => {
        result && resetFields();
      });
    }
  };

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" style={{ width: '30%', backgroundColor: 'white' }}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title></Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form>
          <div className="row">
            <div className="col-md-12">
              <Form.Group controlId="formTitle" className="mb-3">
                <Form.Label className="text-dark">Title</Form.Label>
                <Form.Select
                  name="title"
                  value={fields.title}
                  className="border-dark"
                  onChange={(e) => handleChange('title', e.target.value)}
                >
                  <option value="">Select a title</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Leader">Leader</option>
                  <option value="Pastor">Pastor</option>
                </Form.Select>
                {errorMessages.title?.message && <span className="text-danger">{errorMessages.title?.message}</span>}
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group controlId="formFirstName" className="mb-3">
                <Form.Label className="text-dark">First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter first name"
                  name="first_name"
                  value={fields.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  className="border-dark"
                  maxLength={50}
                />
                {errorMessages.first_name?.message && (
                  <span className="text-danger">{errorMessages.first_name?.message}</span>
                )}
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group controlId="formLastName" className="mb-3">
                <Form.Label className="text-dark">Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter last name"
                  name="last_name"
                  value={fields.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className="border-dark"
                  maxLength={50}
                />
                {errorMessages.last_name?.message && (
                  <span className="text-danger">{errorMessages.last_name?.message}</span>
                )}
              </Form.Group>
            </div>
          </div>

          <div className="row">
           
            <div className="col-md-6">
              <Form.Group controlId="formPhone" className="mb-3">
                <Form.Label className="text-dark">Phone</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter phone number"
                  name="phone"
                  value={fields.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="border-dark"
                  maxLength={50}
                />
                {errorMessages.phone?.message && (
                  <span className="text-danger alert-danger">{errorMessages.phone?.message}</span>
                )}
              </Form.Group>
            </div>
            <div className="col-md-6">
             
             </div>
          </div>

          <div className="row mt-2">
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

          <div className="d-flex justify-content-start">
            <Button variant="secondary" className="me-2" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={() => handleSubmit()}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
      {success && (
        <>
          {fields?._id ? (
            <OkDialogue
              show={success}
              message="Your changes was save successfully"
              onConfirm={() => {
                setShow(false);
                handleReset();
              }}
            />
          ) : (
            <ConfirmationDialogue
              show={success}
              message='Do you want add another contact?'
              onClose={async () => {
                setShow(false);
                handleReset();
              }}
              onConfirm={() => {
                handleReset();
              }}
            />
          )}
        </>
      )}
    </Offcanvas>
  );
};

export default RenderContactOffcanvas;
