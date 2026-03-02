import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { OkDialogue } from '../../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../../src/components/elements/errorDialogue';
import { validate } from '../../../../../validator/validator';
import { useConfig } from '../../../../../hooks/useSettings';
import CurrencyDropdown from '../../../../../src/components/reuseable/CurrencyDropdown';
import { configValidator } from '../../../../../validator/rules';
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
            <Form.Group controlId="formPrayer_request_email" className="mb-3">
              <Form.Label className="text-dark">Prayer Request Email</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter prayer request email"
                name="prayer_request_email"
                value={fields.prayer_request_email}
                onChange={(e) => handleChange('prayer_request_email', e.target.value)}
                className="border-dark"
                maxLength={50}
              />
              {errorMessages.prayer_request_email?.message && (
                <span className="text-danger">{errorMessages.prayer_request_email?.message}</span>
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
