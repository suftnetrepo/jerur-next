'use client';

import React from 'react';
import { Form, Button } from 'react-bootstrap';
import Editor from '../../../../src/components/reuseable/editor';
import 'react-datetime/css/react-datetime.css';
import FindAddress from '../../../share/findAddress';

const EventForm = ({ errorMessages, handleSubmit, handleChange, fields, handleSelectedAddress }) => {
  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    handleChange('description', pastedText);
    e.preventDefault();
  };

  return (
    <Form>
      <div className="row">
        <div className="col-md-6">
          <Form.Group controlId="formName" className="mb-3">
            <Form.Label className="text-dark">Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter event title"
              name="title"
              value={fields?.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="border-dark"
            />
            {errorMessages?.title?.message && (
              <span className="text-danger fs-13 ms-2">{errorMessages?.title?.message}</span>
            )}
          </Form.Group>
        </div>

        <div className="col-md-6"></div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="row">
            <div className="col-md-6">
              <Form.Group controlId="formStartDate">
                <Form.Label className="text-dark">Start Date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={fields?.start_date}
                  onChange={(e) => { handleChange('start_date', e.target.value) }}
                  onBlur={(e)=>   e.target.blur()}
                />
              </Form.Group>
              {errorMessages?.start_date?.message && (
                <span className="text-danger fs-13">{errorMessages?.start_date?.message}</span>
              )}
            </div>
            <div className="col-md-6">
              <Form.Group controlId="formEndDate">
                <Form.Label className="text-dark">End Date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={fields?.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  onBlur={(e)=>   e.target.blur()}
                />
              </Form.Group>
              {errorMessages?.end_date?.message && (
                <span className="text-danger fs-13">{errorMessages?.end_date?.message}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-12">
          <div className="row">
            <div className="col-md-6">
              <FindAddress handleSelectedAddress={handleSelectedAddress} />
              {fields?.completeAddress && <span>{fields.completeAddress}</span>}
            </div>
          </div>
        </div>

        {fields?.completeAddress && (
          <>
            <div className="col-md-12">
              <div className="col-md-6">
                <div className="mb-3">
                  <Form.Group controlId="formAddressLine1" className="mb-3">
                    <Form.Label className="text-dark">AddressLine1</Form.Label>
                    <Form.Control
                      type="addressLine1"
                      placeholder="Enter addressLine1"
                      name="addressLine1"
                      value={fields?.addressLine1}
                      onChange={(e) => handleChange('addressLine1', e.target.value)}
                      className="border-dark"
                    />
                    {errorMessages?.addressLine1?.message && (
                      <span className="text-danger fs-13">{errorMessages?.addressLine1?.message}</span>
                    )}
                  </Form.Group>
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="col-md-6">
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group controlId="formTown" className="mb-3">
                      <Form.Label className="text-dark">Town</Form.Label>
                      <Form.Control
                        type="town"
                        placeholder="Enter town"
                        name="town"
                        value={fields?.town}
                        onChange={(e) => handleChange('town', e.target.value)}
                        className="border-dark"
                      />
                      {errorMessages?.town?.message && (
                        <span className="text-danger fs-13">{errorMessages?.town?.message}</span>
                      )}
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group controlId="formCounty" className="mb-3">
                      <Form.Label className="text-dark">County</Form.Label>
                      <Form.Control
                        type="county"
                        placeholder="Enter county"
                        name="county"
                        value={fields?.county}
                        onChange={(e) => handleChange('county', e.target.value)}
                        className="border-dark"
                      />
                      {errorMessages?.county?.message && (
                        <span className="text-danger fs-13">{errorMessages?.county?.message}</span>
                      )}
                    </Form.Group>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="col-md-6">
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group controlId="formPostcode" className="mb-3">
                      <Form.Label className="text-dark">Post code</Form.Label>
                      <Form.Control
                        type="postcode"
                        placeholder="Enter postcode"
                        name="postcode"
                        value={fields?.postcode}
                        onChange={(e) => handleChange('postcode', e.target.value)}
                        className="border-dark"
                      />
                      {errorMessages?.postcode?.message && (
                        <span className="text-danger fs-13">{errorMessages?.postcode?.message}</span>
                      )}
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group controlId="formCountry" className="mb-3">
                      <Form.Label className="text-dark">Country</Form.Label>
                      <Form.Control
                        type="country"
                        placeholder="Enter country"
                        name="country"
                        value={fields?.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        className="border-dark"
                      />
                      {errorMessages?.country?.message && (
                        <span className="text-danger fs-13">{errorMessages?.country?.message}</span>
                      )}
                    </Form.Group>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="row">
        <div className="col-md-12">
          <Form.Group controlId="formFirstName" className="mb-3 mt-3">
            <Form.Label className="text-dark">Description</Form.Label>
            <Editor
              onChange={(e) => handleChange('description', e)}
              onPaste={handlePaste}
              value={fields?.description}
            />
            {errorMessages?.description?.message && (
              <span className="text-danger fs-13">{errorMessages.description?.message}</span>
            )}
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group controlId="status" className="d-flex d-flex justify-content-start align-items-start">
            <Form.Check
              type="checkbox"
              id="status"
              className="border-dark"
              checked={fields?.status}
              value={fields?.status}
              onChange={(e) => handleChange('status', e.target.checked)}
            />
            <Form.Label className="text-dark ms-1"> Status</Form.Label>
            {errorMessages?.status?.message && (
              <span className="text-danger fs-13">{errorMessages?.status?.message}</span>
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
  );
};

export default EventForm;
