import React from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';
import ImageUploadPanel from '../../../../../src/components/reuseable/ImageUploadPanel';
import Select from '../../../../../src/components/reuseable/Select';
import { DENOMINATIONS } from '../../../../../constants/denominations';

// Adapts {id, label} entries from constants/denominations.js to the
// {id, title, value} shape the shared Select component expects (same
// pattern as the Currency dropdown on Settings -> Config) — `title` is
// what's displayed, `value` is what gets saved, and here they
// deliberately differ: the dropdown shows the friendly label but saves
// the stable id, never the label, into Church.denomination. Leading
// placeholder option matters here specifically: `denomination` defaults
// to '' (unset), and without an option whose value is '' a native
// <select> just silently displays the first real option instead,
// visually implying a denomination is selected when none has been saved.
const DENOMINATION_OPTIONS = [
  { id: '', title: 'Select denomination', value: '' },
  ...DENOMINATIONS.map((denomination) => ({
    id: denomination.id,
    title: denomination.label,
    value: denomination.id
  }))
];

// Layout mirrors the Pastor settings tab (others/pastor.jsx): form fields on
// the left, image upload on the right, same container width/spacing/grid.
const About = ({ fields, errorMessages, handleChange, onSubmit, handleSeeds, previewUrl, onImageSelect }) => {
  return (
    <div style={{ marginLeft: 25, width: '55%', backgroundColor: 'white' }}>
      <Row className="mb-3">
        <Col xs={12} md={8}>
          <Form className="pt-16">
            <div className="row">
              <div className="col-md-6">
                <Form.Group controlId="formChurchName" className="mb-3">
                  <Form.Label className="text-dark">Church Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={fields?.name ?? ''}
                    className="border-dark"
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                  {errorMessages?.name?.message && (
                    <span className="text-danger fs-13">{errorMessages?.name?.message}</span>
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
                    maxLength={50}
                    value={fields?.email ?? ''}
                    readOnly
                    className="border-dark"
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                  {errorMessages?.email?.message && (
                    <span className="text-danger fs-13">{errorMessages?.email?.message}</span>
                  )}
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group controlId="formMobile" className="mb-3">
                  <Form.Label className="text-dark">Mobile</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={50}
                    value={fields?.mobile ?? ''}
                    className="border-dark"
                    onChange={(e) => handleChange('mobile', e.target.value)}
                  />
                  {errorMessages?.mobile?.message && (
                    <span className="text-danger fs-13">{errorMessages?.mobile?.message}</span>
                  )}
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group controlId="formDenomination" className="mb-3">
                  <Form.Label className="text-dark">Denomination</Form.Label>
                  <Select
                    options={DENOMINATION_OPTIONS}
                    value={fields?.denomination ?? ''}
                    onChange={(value) => handleChange('denomination', value)}
                  />
                  {errorMessages?.denomination?.message && (
                    <span className="text-danger fs-13">{errorMessages?.denomination?.message}</span>
                  )}
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <Form.Group className="mb-3">
                  <Form.Label className="text-dark">Description</Form.Label>
                  <Form.Control
                    maxLength={500}
                    as="textarea"
                    rows={3}
                    value={fields?.description ?? ''}
                    className="border-dark"
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="d-flex justify-content-start">
              <Button type="button" variant="primary" onClick={() => onSubmit()}>
                Save Changes
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <Button type="button" variant="secondary" className="ms-2" onClick={() => handleSeeds()}>
                  Seeds
                </Button>
              )}
            </div>
          </Form>
        </Col>

        <Col xs={12} md={4}>
          <ImageUploadPanel
            previewUrl={previewUrl}
            imageUrl={fields?.secure_url}
            onFileSelect={onImageSelect}
            alt="Church Logo"
          />
        </Col>
      </Row>
    </div>
  );
};

export default About;
