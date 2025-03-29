import React, { useState, useEffect } from 'react';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { validate } from '../../../../validator/validator';
import { categoryValidator } from '../../../../validator/categoryValidator';

const renderCategoryOffcanvas = ({ show, handleClose, editData, handleSave, handleEdit }) => {
  const [errorMessages, setErrorMessages] = useState({});
  const [fields, setFields] = useState(categoryValidator.fields);

  useEffect(() => {
    setFields((pre) => {
      return {
        ...pre,
        ...editData
      };
    });
  }, [editData]);

  const resetFields = () => {
    setFields(categoryValidator.reset());
    if (editData?._id) handleClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFields({
      ...fields,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, categoryValidator.rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    if (editData) {
      handleEdit(fields, editData?._id).then((result) => {
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
        <Offcanvas.Title>{editData ? 'Edit' : 'Add New Category'}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form>
          <div className="row">
            <div className="col-md-12">
              <Form.Group controlId="formName" className="mb-3">
                <Form.Label className="text-dark"> Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  name="name"
                  value={fields.name}
                  onChange={handleChange}
                  className="border-dark"
                />
                {errorMessages.name?.message && <span className="text-danger">{errorMessages.name?.message}</span>}
              </Form.Group>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <Form.Group controlId="formDescription" className="mb-3">
                <Form.Label className="text-dark">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter description"
                  name="description"
                  value={fields.description}
                  onChange={handleChange}
                  className="border-dark"
                />
                {errorMessages.description?.message && (
                  <span className="text-danger">{errorMessages.description?.message}</span>
                )}
              </Form.Group>
            </div>
          </div>

          <Form.Group controlId="formUserStatus" className="mb-3">
            <Form.Check
              type="checkbox"
              label="Status"
              name="status"
              checked={fields.status}
              onChange={handleChange}
              className="text-dark border-dark"
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={() => handleSubmit()}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default renderCategoryOffcanvas;
