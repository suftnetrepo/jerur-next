'use client';

import React, { useState } from 'react';
import { validate } from '../../../../../../validator/validator';
import { useRouter, useParams } from 'next/navigation';
import { useEventEdit } from '../../../../../../hooks/useEvent';
import ErrorDialogue from '../../../../../../src/components/elements/errorDialogue';
import { OkDialogue } from '../../../../../../src/components/elements/ConfirmDialogue';
import Button from 'react-bootstrap/Button';
import { MdArrowBack } from 'react-icons/md';
import { eventValidator } from '@/validator/rules';
import dynamic from 'next/dynamic';

const Form = dynamic(() => import('../../form'), { ssr: false });

const EditForm = () => {
  const { id } = useParams();
  const router = useRouter();
  const [errorMessages, setErrorMessages] = useState({});
  const { handleEdit, fields, handleChange, success, error, handleReset, handleSelectedAddress } = useEventEdit(id);

  const resetFields = () => {
    handleReset();
    router.push(`/protected/church/events`);
  };

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
   
    await handleEdit(formData, id);
  };

  return (
    <>
      <div className="ms-5 me-10 mt-5">
        <div className="card-body">
          <div className="d-flex justify-content-start align-items-center mb-3">
            <Button variant="outline-secondary" onClick={() => router.push(`/protected/church/events`)}>
              <MdArrowBack size={24} /> Back
            </Button>
            <h3 className="card-title ms-2">Edit Event</h3>
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
      {success && <OkDialogue show={success} onConfirm={() => resetFields()} />}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
    </>
  );
};

export default EditForm;
