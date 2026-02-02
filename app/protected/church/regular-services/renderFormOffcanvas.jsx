'use client';

import React, { useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { validate } from '../../../../validator/validator';
import { ConfirmationDialogue, OkDialogue } from '../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import dynamic from 'next/dynamic';
import { regularServiceValidator } from '@/validator/rules';
const Form = dynamic(() => import('./form'), { ssr: false });

const RenderFormOffcanvas = ({
  show,
  setShow,
  error,
  fields,
  success,
  handleChange,
  handleEdit,
  handleSave,
  handleReset,
  handleDelete
}) => {
  const [errorMessages, setErrorMessages] = useState({});

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, regularServiceValidator.rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    const { description, remote, sequency_no, remote_link, start_time, status, title, end_time, service_type } = fields;

    const body = {
      description,
      remote,
      sequency_no,
      remote_link,
      start_time,
      status,
      title,
      end_time,
      service_type
    };

    if (fields?._id) {
      await handleEdit(body, fields._id, fields);
    } else {
      await handleSave(body);
    }
  };

  return (
    <Offcanvas
      show={show}
      onHide={() => setShow(false)}
      placement="end"
      style={{ width: '30%', backgroundColor: 'white' }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title></Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form
          handleChange={handleChange}
          fields={fields}
          handleSubmit={handleSubmit}
          errorMessages={errorMessages}
          handleDelete={handleDelete}
        />
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
      {error && <ErrorDialogue showError={error} onClose={() => { 
        handleReset()  
        setShow(false)}} />}
    </Offcanvas>
  );
};

export default RenderFormOffcanvas;
