import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { OkDialogue } from '../../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../../src/components/elements/errorDialogue';
import { useConfig } from '../../../../../hooks/useSettings';
import Select from '../../../../../src/components/reuseable/Select';

const ConfigPage = ({ data }) => {
  const { error, success, fields, rules, handleChange, handleSave, handleReset, handleSelect } = useConfig();
  const [errorMessages, setErrorMessages] = useState({});

  useEffect(() => {
    data && handleSelect(data);
  }, [data]);

  const resetFields = () => {};

  const handleSubmit = async () => {
    handleSave(fields).then((result) => {
      result && resetFields();
    });
  };

  const currencies = [
    { id: 1, title: 'US Dollar', value: 'USD' },
    { id: 2, title: 'Euro', value: 'EUR' },
    { id: 3, title: 'British Pound', value: 'GBP' },
    { id: 4, title: 'Japanese Yen', value: 'JPY' },
    { id: 5, title: 'Indian Rupee', value: 'INR' }
  ];

  return (
    <div style={{ marginLeft: 25, width: '40%', backgroundColor: 'white' }}>
      <Form>
        <div className="row">
          <div className="col-md-12">
            <Form.Group controlId="formCurrency" className="mb-3">
              <Form.Label className="text-dark">Currency</Form.Label>
              <Select options={currencies} value={fields.currency} onChange={(j) => handleChange('currency', j)} />
              {errorMessages.currency?.message && (
                <span className="text-danger">{errorMessages.currency?.message}</span>
              )}
            </Form.Group>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Form.Group controlId="formSupport_email" className="mb-3">
              <Form.Label className="text-dark">Support Email</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter support email"
                name="support_email"
                value={fields.support_email}
                onChange={(e) => handleChange('support_email', e.target.value)}
                className="border-dark"
                maxLength={50}
              />
              {errorMessages.support_email?.message && (
                <span className="text-danger">{errorMessages.support_email?.message}</span>
              )}
            </Form.Group>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Form.Group controlId="formDonation" className="mb-3">
              <Form.Label className="text-dark">Donation Url</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter donation url"
                name="giving_url"
                value={fields.giving_url}
                onChange={(e) => handleChange('giving_url', e.target.value)}
                className="border-dark"
                maxLength={50}
              />
              {errorMessages.giving_url?.message && (
                <span className="text-danger alert-danger">{errorMessages.giving_url?.message}</span>
              )}
            </Form.Group>
          </div>
          <div className="col-md-6"></div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Form.Group controlId="formConferenceLink" className="mb-3">
              <Form.Label className="text-dark">Conference Link</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Zoom, Teams or other conference link for remote services"
                name="conference_link"
                value={fields.conference_link}
                onChange={(e) => handleChange('conference_link', e.target.value)}
                className="border-dark"
              />
              {errorMessages.conference_link?.message && (
                <span className="text-danger alert-danger">{errorMessages.conference_link?.message}</span>
              )}
            </Form.Group>
          </div>
          <div className="col-md-6"></div>
        </div>

        <div className="row mt-2">
          <div className="col-md-6">
            <Form.Group controlId="isSearchable" className="d-flex d-flex justify-content-start align-items-start">
              <Form.Check
                type="checkbox"
                id="isSearchable"
                className="border-dark"
                checked={fields?.isSearchable}
                value={fields?.isSearchable}
                onChange={(e) => handleChange('isSearchable', e.target.checked)}
              />
              <Form.Label className="text-dark ms-1"> is Searchable</Form.Label>
              {errorMessages?.isSearchable?.message && (
                <span className="text-danger fs-13">{errorMessages?.isSearchable?.message}</span>
              )}
            </Form.Group>
          </div>
          <div className="col-md-6"> </div>
        </div>

        <div className="d-flex justify-content-start">
          <Button type="button" variant="primary" onClick={() => handleSubmit()}>
            Save Changes
          </Button>
        </div>
      </Form>
      {success && (
        <OkDialogue
          show={success}
          message="Your changes was save successfully"
          onConfirm={() => {
            handleReset();
          }}
        />
      )}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
    </div>
  );
};

export default ConfigPage;
