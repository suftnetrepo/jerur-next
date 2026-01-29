import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';
import { OkDialogue } from '@/src/components/elements/ConfirmDialogue';
import ErrorDialogue from '@/src/components/elements/errorDialogue';
import { validate } from '@/validator/validator';
import { usePastor } from '@/hooks/useSettings';

const Pastor = ({ data }) => {
    const { error, success, fields, rules, handleChange, handleUpdate, handleReset, handleSelect } = usePastor();
    const [errorMessages, setErrorMessages] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);
    const [file, setFile] = useState(null);

    useEffect(() => {
        data && handleSelect(data)
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [data, previewUrl]);

    const handleImageClick = () => {
        document.getElementById('file-input').click();
    };

    const handleFileChange = (e) => {
        setPreviewUrl(null);
        const selectedFile = e.target.files[0];

        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
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
       formData.append('mobile', fields.mobile);
   
       await handleUpdate(formData);
     };

    return (
        <div style={{ marginLeft: 25, width: '40%', backgroundColor: 'white' }}>
            <Form>
                <Row className="mb-3">
                    <Col xs={12} md={4}>
                        <div className="d-flex flex-column justify-content-start align-items-start">
                            <div
                                style={{
                                    width: 150,
                                    height: 150,
                                    borderRadius: '50%',
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
                                        className="img-fluid rounded-circle"
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    />
                                ) : fields.secure_url ? (
                                    <img
                                        src={fields.secure_url}
                                        alt="Avatar"
                                        className="img-fluid rounded-circle"
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/img/blank.png';
                                        }}
                                    />
                                ) : (
                                    <span>150 x 150</span>
                                )}
                            </div>

                            <Button variant="success" className="mb-2 mt-3" onClick={handleImageClick}>
                                Change picture
                            </Button>
                        </div>
                    </Col>
                </Row>
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
                            {errorMessages.title?.message && (
                                <span className="text-danger">{errorMessages.title?.message}</span>
                            )}
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
                                value={fields.first_name}
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
                                value={fields.last_name}
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
                    <div className="col-md-6">
                        <Form.Group controlId="formMobile" className="mb-3">
                            <Form.Label className="text-dark">Mobile</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter mobile number"
                                name="mobile"
                                value={fields.mobile}
                                 onChange={(e) => handleChange('mobile', e.target.value)}
                                className="border-dark"
                            />
                            {errorMessages.mobile?.message && (
                                <span className="text-danger alert-danger">{errorMessages.mobile?.message}</span>
                            )}
                        </Form.Group>
                    </div>
                    <div className="col-md-6">

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
                                value={fields?.description}
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
            {error && <ErrorDialogue showError={error} onClose={() => { }} />}
            <input type="file" id="file-input" accept="image/*" onChange={handleFileChange} hidden />
        </div>
    );
};

export default Pastor;
