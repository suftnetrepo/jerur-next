import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { OkDialogue } from '@/src/components/elements/ConfirmDialogue';
import { useSocialMedia } from '@/hooks/useSettings';

const SocialMedia = ({data}) => {
  const { error, success, fields, handleChange, handleSave, handleReset, handleSelect } = useSocialMedia();
  const [errorMessages, setErrorMessages] = useState({});

  useEffect(()=> {
    data && handleSelect(data)
  },[data])

  const resetFields = () => {};

  const handleSubmit = async () => {
    setErrorMessages({});

    handleSave(fields).then((result) => {
      result && resetFields();
    });
  };


  return (
    <div style={{ width: '30%', backgroundColor: 'white' }}>
      <Form>
        <div className="row">
          <div className="col-md-12">
            <Form.Group controlId="formFacebook" className="mb-3">
              <Form.Label className="text-dark">Facebook Link</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter facebook link"
                name="facebook_url"
                value={fields.facebook_url}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                className="border-dark"
                maxLength={50}
              />
              {errorMessages.facebook_url?.message && (
                <span className="text-danger">{errorMessages.facebook_url?.message}</span>
              )}
            </Form.Group>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Form.Group controlId="formInstagram" className="mb-3">
              <Form.Label className="text-dark">Instagram Link</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter instagram link"
                name="instagram_url"
                value={fields.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                className="border-dark"
                maxLength={50}
              />
              {errorMessages.instagram_url?.message && (
                <span className="text-danger">{errorMessages.instagram_url?.message}</span>
              )}
            </Form.Group>
          </div>
        </div>
       

        <div className="row">
          <div className="col-md-12">
            <Form.Group controlId="formYoutube" className="mb-3">
              <Form.Label className="text-dark">Youtube Link</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter youtube link"
                name="reference"
                value={fields.youtube_url}
                onChange={(e) => handleChange('youtube_url', e.target.value)}
                className="border-dark"
                maxLength={50}
              />
              {errorMessages.youtube_url?.message && (
                <span className="text-danger alert-danger">{errorMessages.youtube_url?.message}</span>
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

export default SocialMedia;
