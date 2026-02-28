import React, { useState, useEffect } from 'react';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { validate } from '../../../../validator/validator';
import { ConfirmationDialogue, OkDialogue } from '../../../../src/components/elements/ConfirmDialogue';
import { registerValidator } from '../../../../validator/rules';
import { IoCloseCircle } from 'react-icons/io5';
import RegisterTable from './registerTable';
import { useEventRegister } from '../../../../hooks/useEventRegister';

const RenderRegisterOffcanvas = ({ show, setShow, selectedEventId }) => {
  const [errorMessages, setErrorMessages] = useState({});
  const { handleChange, handleSave, handleFetch, handleReset, handleDelete, data, error, fields, success } =
    useEventRegister();

  useEffect(() => {
    selectedEventId && handleFetch(selectedEventId);
  }, [selectedEventId]);

  const resetFields = () => {};

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, registerValidator.rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    if (fields?._id) {
      handleEdit(fields, fields?._id).then((result) => {
        result && resetFields();
      });
    } else {
      handleSave({ ...fields, eventId: selectedEventId }).then((result) => {
        result && resetFields();
      });
    }
  };

  return (
    <Offcanvas
      show={show}
      onHide={() => setShow(false)}
      placement="end"
      style={{ width: '40%', backgroundColor: 'white' }}
    >
      <Offcanvas.Header className="d-flex flex-row justify-content-between align-items-center">
        <h4>Event Register</h4>
        <IoCloseCircle size={48} color="#333333" className="pointer ms-2 me-4" onClick={() => setShow(false)} />
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
                  type="text"
                  placeholder="Enter email address"
                  name="first_name"
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
                {errorMessages.mobile?.message && <span className="text-danger">{errorMessages.mobile?.message}</span>}
              </Form.Group>
            </div>
          </div>

          <RegisterTable data={data} eventId={selectedEventId} handleDelete={handleDelete} />

          <div className="d-flex justify-content-start">
            <Button variant="secondary" className="me-2" onClick={() => setShow(false)}>
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

export default RenderRegisterOffcanvas;
