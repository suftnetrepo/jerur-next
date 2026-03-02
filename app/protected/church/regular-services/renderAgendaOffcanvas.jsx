'use client';

import React, { useState, useEffect } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { validate } from '../../../../validator/validator';
import { ConfirmationDialogue, OkDialogue } from '../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import dynamic from 'next/dynamic';
import { regularAgendaValidator } from '../../../../validator/rules';
import { useRegularServiceAgenda } from '../../../../hooks/useRegularServiceAgenda';
import { IoCloseCircle } from 'react-icons/io5';
import AgendaTable from './agendaTable';
const Form = dynamic(() => import('./agendaForm'), { ssr: false });

const RenderAgendaOffcanvas = ({ show, setShow, selectedServiceId }) => {
  const [errorMessages, setErrorMessages] = useState({});
  const {
    handleChange,
    handleEdit,
    handleSave,
    handleFetch,
    handleSelect,
    handleReset,
    handleDelete,
    data,
    error,
    fields,
    success
  } = useRegularServiceAgenda();

  useEffect(() => {
    selectedServiceId && handleFetch(selectedServiceId);
  }, [selectedServiceId]);

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, regularAgendaValidator.rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    const { description, sequency_no, start_time, status, title, end_time } = fields;

    const body = {
      description,
      sequency_no,
      start_time,
      status,
      title,
      end_time
    };

    if (fields?._id) {
      await handleEdit(body, fields._id, fields);
    } else {
      await handleSave({ serviceId: selectedServiceId, ...body });
    }
  };

  return (
    <Offcanvas
      show={show}
      onHide={() => setShow(false)}
      placement="end"
      style={{ width: '32%', backgroundColor: 'white' }}
    >
      <Offcanvas.Header className="d-flex flex-row justify-content-between align-items-center">
        <h4>Service Agenda</h4>
        <IoCloseCircle size={48} color="#333333" className="pointer ms-2" onClick={() => setShow(false)} />
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form handleChange={handleChange} fields={fields} handleSubmit={handleSubmit} errorMessages={errorMessages} />
        <div className="m-4"></div>
        <AgendaTable
          agenda={data}
          serviceId={selectedServiceId}
          handleSelect={handleSelect}
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
                handleReset();
              }}
            />
          ) : (
            <ConfirmationDialogue
              show={success}
              onClose={async () => {
             
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

export default RenderAgendaOffcanvas;
