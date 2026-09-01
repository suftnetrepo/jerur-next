'use client';

import React from 'react';
import { Form, Button } from 'react-bootstrap';
import FindAddress from '../../../share/findAddress';
import { ImageUploader } from '../../../../src/components/elements/image';

const EventForm = ({
  errorMessages,
  handleSubmit,
  handleChange,
  fields,
  handleSelectedAddress,
  churchAddress,
  churchAddressLoading,
  handleAddressSourceChange
}) => {

  const handleImageChange = (file) => {
    handleChange('file', file);
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
                  onChange={(e) => {
                    handleChange('start_date', e.target.value);
                  }}
                  onBlur={(e) => e.target.blur()}
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
                  onBlur={(e) => e.target.blur()}
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
              <Form.Label className="text-dark mb-2">Event location</Form.Label>
              <div className="d-flex flex-column flex-sm-row gap-2 mb-3">
                <label
                  htmlFor="event-address-church"
                  className="d-flex align-items-start gap-2 p-3 rounded-3 flex-fill"
                  style={{
                    border: fields?.use_church_address ? '1px solid #55b3c9' : '1px solid #dee2e6',
                    background: fields?.use_church_address ? '#f5fbfa' : '#fff',
                    cursor: churchAddressLoading || !churchAddress?.completeAddress ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Form.Check
                    type="radio"
                    id="event-address-church"
                    name="event-address-source"
                    checked={Boolean(fields?.use_church_address)}
                    disabled={churchAddressLoading || !churchAddress?.completeAddress}
                    onChange={() => handleAddressSourceChange(true)}
                  />
                  <span>
                    <span className="d-block text-dark fw-medium">Church address</span>
                    <span className="d-block text-muted mt-1" style={{ fontSize: 12 }}>
                      {churchAddressLoading
                        ? 'Loading church address…'
                        : churchAddress?.completeAddress || 'No church address configured in Settings.'}
                    </span>
                  </span>
                </label>

                <label
                  htmlFor="event-address-external"
                  className="d-flex align-items-start gap-2 p-3 rounded-3 flex-fill"
                  style={{
                    border: !fields?.use_church_address ? '1px solid #55b3c9' : '1px solid #dee2e6',
                    background: !fields?.use_church_address ? '#f5fbfa' : '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <Form.Check
                    type="radio"
                    id="event-address-external"
                    name="event-address-source"
                    checked={!fields?.use_church_address}
                    onChange={() => handleAddressSourceChange(false)}
                  />
                  <span>
                    <span className="d-block text-dark fw-medium">External address</span>
                    <span className="d-block text-muted mt-1" style={{ fontSize: 12 }}>
                      Search for a different event location.
                    </span>
                  </span>
                </label>
              </div>

              {!churchAddressLoading && !churchAddress?.completeAddress && (
                <div className="alert alert-info py-2 px-3 mb-3" role="status">
                  <span>Add the church address before using it for an event. </span>
                  <a href="/protected/church/settings?section=address" className="alert-link">
                    Set church address
                  </a>
                </div>
              )}

              {!fields?.use_church_address && (
                <FindAddress handleSelectedAddress={handleSelectedAddress} showToggle={false} />
              )}
              {fields?.completeAddress && (
                <div className="mt-2 p-2 rounded-2 text-dark" style={{ background: '#f8f9fa', fontSize: 13 }}>
                  {fields.completeAddress}
                </div>
              )}
            </div>
          </div>
        </div>

        {fields?.completeAddress && !fields?.use_church_address && (
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
          <ImageUploader
            onImageChange={handleImageChange}
            initialImage={fields?.secure_url}
            maxSizeMB={2} 
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <Form.Group controlId="formFirstName" className="mb-3 mt-3">
            <Form.Label className="text-dark">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Enter description"
              value={fields?.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="border-dark"
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
