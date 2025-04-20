'use client';

import React, { useState } from 'react';
import { validate } from '../../../../../validator/validator';
import { eventValidator } from '@/validator/rules';
import { useEventEdit } from '../../../../../hooks/useEvent';
import { ConfirmationDialogue } from '../../../../../src/components/elements/ConfirmDialogue';
import { useRouter } from 'next/navigation';
import ErrorDialogue from '../../../../../src/components/elements/errorDialogue';
import Button from 'react-bootstrap/Button';
import { MdArrowBack } from 'react-icons/md';
import dynamic from 'next/dynamic';

const Form = dynamic(() => import('../form'), { ssr: false });

const CreateForm = () => {
  const router = useRouter();
  const [errorMessages, setErrorMessages] = useState({});
  const { handleSave, fields, handleChange, success, handleReset, error, handleSelectedAddress } = useEventEdit();

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, eventValidator.rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    const formData = new FormData();
    
    formData.append('title', fields.title);
    formData.append('status', fields.status);
    formData.append('description', fields.description || '');
    formData.append('start_date', fields.start_date);
    formData.append('end_date', fields.end_date);
    formData.append('addressLine1', fields.addressLine1);
    formData.append('county', fields.county);
    formData.append('town', fields.town);
    formData.append('country', fields.country);
    formData.append('postcode', fields.postcode);
    formData.append('completeAddress', fields.completeAddress);
    formData.append('location[type]', fields.location.type);
    formData.append('location', JSON.stringify(fields.location));

    if (fields?.file) {
      formData.append('file', fields.file);
    }

    await handleSave(formData);
  };

  return (
    <>
      <div className="ms-5 me-10 mt-5">
        <div className="card-body">
          <div className="d-flex justify-content-start align-items-center mb-3">
            <Button variant="outline-secondary" onClick={() => router.push(`/protected/church/event`)}>
              <MdArrowBack size={24} /> Back
            </Button>
            <h3 className="card-title ms-2"> New Event</h3>
          </div>
          <Form
            handleChange={handleChange}
            fields={fields}
            handleSubmit={handleSubmit}
            errorMessages={errorMessages}
            handleSelectedAddress={handleSelectedAddress}
          />
        </div>
      </div>
      {success && (
        <ConfirmationDialogue
          show={success}
          onClose={async () => {
            handleReset();
            router.push(`/protected/church/events`);
          }}
          onConfirm={() => handleReset()}
        />
      )}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
    </>
  );
};

export default CreateForm;
