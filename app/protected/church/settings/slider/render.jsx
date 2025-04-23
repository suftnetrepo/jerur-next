import React, { useState } from 'react';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { ConfirmationDialogue, OkDialogue } from '@/src/components/elements/ConfirmDialogue';
import { sliderValidator } from '@/validator/rules';
import { validate } from '@/validator/validator';
import { ImageUploader } from '@/components/elements/image';

const RenderSliderOffcanvas = ({
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

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    handleChange('description', pastedText);
    e.preventDefault();
  };

  const handleImageChange = (file) => {
    handleChange('file', file);
  };

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, sliderValidator.rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    const formData = new FormData();

    formData.append('title', fields.title);
    formData.append('status', fields.status);
    formData.append('imageOnly', fields.imageOnly);
    formData.append('message', fields.message || '');

    if (fields?.file) {
      formData.append('file', fields.file);
    }

    if (fields._id) {
      handleEdit(formData, fields, fields?._id).then((result) => {
        result && resetFields();
      });
    } else {
      handleSave(formData).then((result) => {
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
              <Form.Group controlId="formName" className="mb-3">
                <Form.Label className="text-dark">Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter event title"
                  name="title"
                  value={fields?.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="border-dark"
                />
                {errorMessages?.title?.message && (
                  <span className="text-danger fs-13 ms-2">{errorMessages?.title?.message}</span>
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
                  placeholder="Enter description"
                  value={fields.message}
                  onPaste={handlePaste}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className="border-dark"
                  maxLength={200}
                />
                {errorMessages?.message?.message && (
                  <span className="text-danger fs-13">{errorMessages.message?.message}</span>
                )}
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <ImageUploader onImageChange={handleImageChange} initialImage={fields?.secure_url} maxSizeMB={2} />
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

          <div className="row mt-2">
            <div className="col-md-6">
              <Form.Group controlId="imageOnly" className="d-flex d-flex justify-content-start align-items-start">
                <Form.Check
                  type="checkbox"
                  id="imageOnly"
                  className="border-dark"
                  checked={fields?.imageOnly}
                  value={fields?.imageOnly}
                  onChange={(e) => handleChange('imageOnly', e.target.checked)}
                />
                <Form.Label className="text-dark ms-1"> Image Only</Form.Label>
                {errorMessages?.imageOnly?.message && (
                  <span className="text-danger fs-13">{errorMessages?.imageOnly?.message}</span>
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
              message="Do you want add another slider?"
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

export default RenderSliderOffcanvas;
