import React, { useState } from 'react';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { validate } from '../../../../validator/validator';
import { ConfirmationDialogue, OkDialogue } from '../../../../src/components/elements/ConfirmDialogue';
import { memberValidator } from '../../../../validator/rules';

const RenderUserOffcanvas = ({
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

  const resetFields = () => {};

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, memberValidator.rules);

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
            <div className="col-md-6">
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label className="text-dark">Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  value={fields.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="border-dark"
                />
                {errorMessages.email?.message && <span className="text-danger">{errorMessages.email?.message}</span>}
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group controlId="formMobile" className="mb-3">
                <Form.Label className="text-dark">Mobile</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter mobile number"
                  name="mobile"
                  value={fields.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  className="border-dark"
                />
                {errorMessages.mobile?.message && (
                  <span className="text-danger alert-danger">{errorMessages.mobile?.message}</span>
                )}
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group controlId="formRole" className="mb-3">
                <Form.Label className="text-dark">Role</Form.Label>
                <Form.Select
                  name="role"
                  value={fields.role}
                  className="border-dark"
                  onChange={(e) => handleChange('role', e.target.value)}
                >
                  <option value="">Select a role</option>
                  <option value="member">member</option>
                  <option value="volunteer">volunteer</option>
                  <option value="leader">leader</option>
                  <option value="pastor">pastor</option>
                </Form.Select>
                {errorMessages.role?.message && <span className="text-danger">{errorMessages.role?.message}</span>}
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group controlId="formStatus" className="mb-3">
                <Form.Label className="text-dark">Status</Form.Label>
                <Form.Select
                  name="status"
                  value={fields.status}
                  className="border-dark"
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="">Select a status</option>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="provisional">provisional</option>
                  <option value="under discipline">under discipline</option>
                </Form.Select>
                {errorMessages.status?.message && <span className="text-danger">{errorMessages.status?.message}</span>}
              </Form.Group>
            </div>
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

export default RenderUserOffcanvas;
