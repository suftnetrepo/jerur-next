'use client';

import React from 'react';
import { Form, Button } from 'react-bootstrap';
import DeleteConfirmation from '../../../../src/components/elements/ConfirmDialogue';
import FindAddress from '../../../share/findAddress';

const FellowshipForm = ({ errorMessages, handleDelete, handleSubmit, handleChange, fields, handleSelectedAddress }) => {
  return (
    <Form>
      <div className="row">
        <div className="col-md-6">
          <Form.Group controlId="formName" className="mb-3">
            <Form.Label className="text-dark"> Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter fellowsship name"
              name="name"
              value={fields?.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="border-dark"
              maxLength={50}
            />
            {errorMessages?.name?.message && (
              <span className="text-danger fs-13 ms-2">{errorMessages?.name?.message}</span>
            )}
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group controlId="formName" className="mb-3">
            <Form.Label className="text-dark"> Mobile</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter contact mobile"
              name="name"
              value={fields?.mobile}
              onChange={(e) => handleChange('mobile', e.target.value)}
              className="border-dark"
              maxLength={50}
            />
            {errorMessages?.mobile?.message && (
              <span className="text-danger fs-13 ms-2">{errorMessages?.mobile?.message}</span>
            )}
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 mt-2">
          <FindAddress handleSelectedAddress={handleSelectedAddress} />
       
        </div>
        {fields?.completeAddress && <span className='text-dark fs-15 p-4'>{fields.completeAddress}</span>}
      </div>

      {fields?.completeAddress && (
        <div className="row">
          <div className="col-md-12">
              <div className="">
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
      )}

      <div className="row mt-2">
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
        {fields?._id && (
          <DeleteConfirmation
            onConfirm={async (id) => {
              handleDelete(id);
            }}
            onCancel={() => {}}
            itemId={fields?._id}
          >
            <Button type="button" className="ms-4" variant="danger">
              Delete
            </Button>
          </DeleteConfirmation>
        )}
      </div>
    </Form>
  );
};

export default FellowshipForm;
