import React, { useState, useEffect, useRef } from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';
import { OkDialogue } from '../../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../../src/components/elements/errorDialogue';
import { validate } from '../../../../../validator/validator';
import { usePastor } from '../../../../../hooks/useSettings';

const Pastor = ({ data }) => {
  const { error, success, fields, rules, handleChange, handleUpdate, handleReset, handleSelect } = usePastor();
  const [errorMessages, setErrorMessages] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const fileInputRef = useRef(null);

  console.log('Pastor data:', data); // Debugging line to check the data prop
  console.log('Pastor success:', success); // Debugging line to check the fields state

  // Only load data once when component mounts or when data prop changes AND it's a different data
  useEffect(() => {
    if (data && !isDataLoaded) {
      handleSelect(data);
      setIsDataLoaded(true);
      // Reset file and preview when new data is loaded
      setFile(null);
      setPreviewUrl(null);
    }
  }, [data, handleSelect, isDataLoaded]);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.type.startsWith('image/')) {
      // Revoke previous preview URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      // Reset file input value to allow selecting the same file again
      e.target.value = null;
    }
  };

  const onSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    const formData = new FormData();
    formData.append('description', fields.description);
    if (file) {
      formData.append('file', file);
    }
    formData.append('title', fields.title);
    formData.append('first_name', fields.first_name);
    formData.append('last_name', fields.last_name);

    await handleUpdate(formData);
    
    // Reset the data loaded flag to allow reload if needed
    // But keep the fields as they are after successful update
  };

  const handleResetForm = () => {
    handleReset();
    setIsDataLoaded(false);
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <div style={{ marginLeft: 25, width: '55%', backgroundColor: 'white' }}>
      <Row className="mb-3">
        <Col xs={12} md={8}>
          <Form className="pt-16">
            <div className="row">
              <div className="col-md-6">
                <Form.Group controlId="formTitle" className="mb-3">
                  <Form.Label className="text-dark">Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter title"
                    name="title"
                    value={fields?.title ?? ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="border-dark"
                    maxLength={50}
                  />
                  {errorMessages.title?.message && <span className="text-danger">{errorMessages.title?.message}</span>}
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group controlId="formFirstName" className="mb-3">
                  <Form.Label className="text-dark">First Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter first name"
                    name="first_name"
                    value={fields?.first_name ?? ''}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    className="border-dark"
                  />
                  {errorMessages.first_name?.message && (
                    <span className="text-danger">{errorMessages.first_name?.message}</span>
                  )}
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group controlId="formLastName" className="mb-3">
                  <Form.Label className="text-dark">Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter last name"
                    name="last_name"
                    value={fields?.last_name ?? ''}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    className="border-dark"
                  />
                  {errorMessages.last_name?.message && (
                    <span className="text-danger">{errorMessages.last_name?.message}</span>
                  )}
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <Form.Group className="mb-3">
                  <Form.Label className="text-dark">Description</Form.Label>
                  <Form.Control
                    maxLength={500}
                    as="textarea"
                    rows={3}
                    value={fields?.description ?? ''}
                    className="border-dark"
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="d-flex justify-content-start">
              <Button type="button" variant="primary" onClick={() => onSubmit()}>
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                className="ms-2"
                onClick={handleResetForm}
              >
                Reset
              </Button>
            </div>
          </Form>
        </Col>

        <Col xs={12} md={4}>
          <div className="d-flex flex-column justify-content-start align-items-start">
            <div
              style={{
                width: 460,
                height: 579,
                borderRadius: '8%',
                overflow: 'hidden',
                backgroundColor: '#ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
              className="mb-3"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar Preview"
                  className="img-fluid"
                  style={{ width: '460px', height: '579px', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={handleImageClick}
                />
              ) : fields?.secure_url ? (
                <img
                  src={fields.secure_url}
                  alt="Avatar"
                  className="img-fluid"
                  style={{ width: '460px', height: '579px', objectFit: 'cover', cursor: 'pointer' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/img/blank_insert.png';
                  }}
                  onClick={handleImageClick}
                />
              ) : (
                <img
                  src='/img/blank_insert.png'
                  alt="Avatar"
                  className="img-fluid"
                  style={{ width: '460px', height: '579px', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={handleImageClick}
                />
              )}
            </div>
          </div>
        </Col>
      </Row>

      {success && (
        <OkDialogue
          show={success}
          message="Your changes were saved successfully"
          onConfirm={handleResetForm}
        />
      )}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
      <input 
        type="file" 
        id="file-input" 
        ref={fileInputRef}
        accept="image/*" 
        onChange={handleFileChange} 
        hidden 
      />
    </div>
  );
};

export default Pastor;