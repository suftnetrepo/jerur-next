import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { OkDialogue } from '@/src/components/elements/ConfirmDialogue';
import ErrorDialogue from '@/src/components/elements/errorDialogue';
import { validate } from '@/validator/validator';
import { useBankTransfer } from '@/hooks/useSettings';

const BankTransfer = ({data}) => {
  const { error, success, fields, rules, handleChange, handleSave, handleReset, handleSelect } = useBankTransfer();
  const [errorMessages, setErrorMessages] = useState({});

  useEffect(()=> {
    data && handleSelect(data)
  },[data])

  const resetFields = () => {};

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    handleSave(fields).then((result) => {
      result && resetFields();
    });
  };

  return (
    <div style={{ width: '50%', backgroundColor: 'white' }}>
      <Form>
        <div className="row">
          <div className="col-md-12">
            <Form.Group controlId="formBankname" className="mb-3">
              <Form.Label className="text-dark">Bank name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter bank name"
                name="bank_name"
                value={fields.bank_name}
                onChange={(e) => handleChange('bank_name', e.target.value)}
                className="border-dark"
                maxLength={50}
              />
              {errorMessages.bank_name?.message && (
                <span className="text-danger">{errorMessages.bank_name?.message}</span>
              )}
            </Form.Group>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Group controlId="formSortcode" className="mb-3">
              <Form.Label className="text-dark">Sort code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter sort code"
                name="sort_code"
                value={fields.sort_code}
                onChange={(e) => handleChange('sort_code', e.target.value)}
                className="border-dark"
                maxLength={50}
              />
              {errorMessages.sort_code?.message && (
                <span className="text-danger">{errorMessages.sort_code?.message}</span>
              )}
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group controlId="formAccountNumber" className="mb-3">
              <Form.Label className="text-dark">Account number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter account number"
                name="last_name"
                value={fields.account_number}
                onChange={(e) => handleChange('account_number', e.target.value)}
                className="border-dark"
                maxLength={50}
              />
              {errorMessages.account_number?.message && (
                <span className="text-danger">{errorMessages.account_number?.message}</span>
              )}
            </Form.Group>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Form.Group controlId="formReference" className="mb-3">
              <Form.Label className="text-dark">Reference</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter reference"
                name="reference"
                value={fields.reference}
                onChange={(e) => handleChange('reference', e.target.value)}
                className="border-dark"
                maxLength={50}
              />
              {errorMessages.reference?.message && (
                <span className="text-danger alert-danger">{errorMessages.reference?.message}</span>
              )}
            </Form.Group>
          </div>
          <div className="col-md-6"></div>
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

export default BankTransfer;
