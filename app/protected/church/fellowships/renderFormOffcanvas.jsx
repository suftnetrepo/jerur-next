'use client';

import React, { useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { validate } from '../../../../validator/validator';
import { ConfirmationDialogue, OkDialogue } from '../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import dynamic from 'next/dynamic';
import { fellowshipValidator } from '@/validator/rules';
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
  handleDelete,
  handleSelectedAddress
}) => {
  const [errorMessages, setErrorMessages] = useState({});

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, fellowshipValidator.rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    const { name, mobile, addressLine1, town, county, status, country, postcode, location, completeAddress } = fields;

    const body = {
      name,
      mobile,
      addressLine1,
      town,
      county,
      status,
      country,
      postcode,
      location,
      completeAddress
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
          handleSelectedAddress={handleSelectedAddress}
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
      {error && (
        <ErrorDialogue
          showError={error}
          onClose={() => {
           
            handleReset();
          }}
        />
      )}
    </Offcanvas>
  );
};

export default RenderFormOffcanvas;
