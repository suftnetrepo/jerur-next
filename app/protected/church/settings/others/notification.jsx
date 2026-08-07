import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { OkDialogue } from '../../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../../src/components/elements/errorDialogue';
import { validate } from '../../../../../validator/validator';
import { useNotification } from '../../../../../hooks/useSettings';

const NotificationSettings = ({ data }) => {
  const { error, success, fields, rules, loading, handleChange, handleUpdate, handleReset, handleSelect } =
    useNotification();
  const [errorMessages, setErrorMessages] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (data && !isDataLoaded) {
      handleSelect(data);
      setIsDataLoaded(true);
    }
  }, [data, handleSelect, isDataLoaded]);

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    handleUpdate(fields).then((result) => {
      result && handleReset();
    });
  };

  return (
    <div style={{ marginLeft: 25, width: '40%', backgroundColor: 'white' }}>
      <Form>
        <div className="row">
          <div className="col-md-12">
            <Form.Group controlId="formNotificationTitle" className="mb-3">
              <Form.Label className="text-dark">Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter notification title"
                name="title"
                value={fields?.title ?? ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="border-dark"
                maxLength={100}
              />
              {errorMessages.title?.message && <span className="text-danger">{errorMessages.title?.message}</span>}
            </Form.Group>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Form.Group controlId="formNotificationMessage" className="mb-3">
              <Form.Label className="text-dark">Short Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter notification message"
                value={fields?.message ?? ''}
                onChange={(e) => handleChange('message', e.target.value)}
                className="border-dark"
                maxLength={300}
              />
              {errorMessages.message?.message && (
                <span className="text-danger">{errorMessages.message?.message}</span>
              )}
            </Form.Group>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Group controlId="formNotificationExpiryDate" className="mb-3">
              <Form.Label className="text-dark">Expiry Date</Form.Label>
              <Form.Control
                type="date"
                value={fields?.expiry_date ?? ''}
                onChange={(e) => handleChange('expiry_date', e.target.value)}
                className="border-dark"
              />
              {errorMessages.expiry_date?.message && (
                <span className="text-danger">{errorMessages.expiry_date?.message}</span>
              )}
            </Form.Group>
          </div>
          <div className="col-md-6"></div>
        </div>

        <div className="d-flex justify-content-start">
          <Button type="button" variant="primary" disabled={loading} onClick={() => handleSubmit()}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Form>
      {success && (
        <OkDialogue
          show={success}
          message="Notification saved successfully."
          onConfirm={() => {
            handleReset();
          }}
        />
      )}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
    </div>
  );
};

export default NotificationSettings;
