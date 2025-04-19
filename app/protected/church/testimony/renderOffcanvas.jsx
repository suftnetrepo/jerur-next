import React, { useState } from 'react';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { validate } from '../../../../validator/validator';
import { ConfirmationDialogue, OkDialogue } from '../../../../src/components/elements/ConfirmDialogue';
import { testimoniesValidator } from '@/validator/rules';

const RenderTestimonyOffcanvas = ({
  show,
  setShow,
  handleClose,
  handleChange,
  success,
  handleReset,
  handleSave,
  handleEdit,
  fields
}) => {
  const [errorMessages, setErrorMessages] = useState({});

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    handleChange('description', pastedText);
    e.preventDefault();
  };

  const resetFields = () => {};

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, testimoniesValidator.rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    if (fields?._id) {
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
                />
                {errorMessages.last_name?.message && (
                  <span className="text-danger">{errorMessages.last_name?.message}</span>
                )}
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
                  placeholder="Ente description"
                  value={fields.description}
                  onPaste={handlePaste}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="border-dark"
                  maxLength={1000}
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

export default RenderTestimonyOffcanvas;
