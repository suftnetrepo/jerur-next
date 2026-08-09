import React, { useState } from 'react';
import { Badge, Button, Card, Col, Form, Offcanvas, Row, Spinner } from 'react-bootstrap';
import { validate } from '../../../../validator/validator';
import { ConfirmationDialogue, OkDialogue } from '../../../../src/components/elements/ConfirmDialogue';
import { articleUiValidator } from '../../../../validator/rules';
import { ImageUploader } from '../../../../src/components/elements/image';
import RichTextEditor from '../../../../src/components/reuseable/RichTextEditor';

const STATUS_VARIANTS = {
  draft: 'secondary',
  published: 'success'
};

const capitalize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

const RenderArticleOffcanvas = ({
  show,
  setShow,
  handleClose,
  handleChange,
  success,
  handleReset,
  handleSave,
  handleEdit,
  fields,
  loading
}) => {
  const [errorMessages, setErrorMessages] = useState({});

  const heading = fields?._id ? 'Edit Article' : 'Add Article';

  const resetDialogState = () => {
    setShow(false);
    setErrorMessages({});
    handleReset();
  };

  const handleImageChange = (file) => {
    handleChange('file', file);
  };

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, articleUiValidator.rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    if (fields?._id) {
      await handleEdit(fields, fields._id, fields.file);
      return;
    }

    await handleSave(fields, fields.file);
  };

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" style={{ width: '42%', backgroundColor: 'white' }}>
      <Offcanvas.Header closeButton className="border-bottom align-items-start py-3 px-4">
        <div className="d-flex justify-content-between align-items-start w-100 me-3 gap-3">
          <div>
            <Offcanvas.Title className="mb-1">{heading}</Offcanvas.Title>
            <div className="text-muted small">Share a Christian article for your members to read in the mobile app.</div>
          </div>
          <Badge bg={STATUS_VARIANTS[fields?.status] || 'secondary'} className="px-3 py-2 rounded-pill align-self-center">
            {capitalize(fields?.status || 'draft')}
          </Badge>
        </div>
      </Offcanvas.Header>
      <Offcanvas.Body className="px-4 py-3">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <Form>
            <Card className="border-0 shadow-sm mb-3">
              <Card.Body className="p-3">
                <div className="text-muted small fw-semibold mb-3">Hero Image</div>
                <ImageUploader onImageChange={handleImageChange} initialImage={fields?.secure_url} maxSizeMB={2} />
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-3">
              <Card.Body className="p-3">
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="text-dark">Title</Form.Label>
                      <Form.Control
                        value={fields.title}
                        maxLength={150}
                        onChange={(event) => handleChange('title', event.target.value)}
                        className="border-dark"
                      />
                      {errorMessages.title?.message ? <span className="text-danger small">{errorMessages.title.message}</span> : null}
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="text-dark">Summary</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        maxLength={300}
                        value={fields.summary}
                        onChange={(event) => handleChange('summary', event.target.value)}
                        className="border-dark"
                      />
                      <div className="form-text">Shown on the mobile app's article list. {fields.summary?.length || 0}/300 characters.</div>
                      {errorMessages.summary?.message ? <span className="text-danger small">{errorMessages.summary.message}</span> : null}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-dark">Status</Form.Label>
                      <Form.Select value={fields.status} onChange={(event) => handleChange('status', event.target.value)} className="border-dark">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-3">
              <Card.Body className="p-3">
                <div className="text-muted small fw-semibold mb-3">Content</div>
                <RichTextEditor
                  key={fields._id || 'new'}
                  value={fields.content}
                  onChange={(html) => handleChange('content', html)}
                />
                {errorMessages.content?.message ? <span className="text-danger small">{errorMessages.content.message}</span> : null}
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-start">
              <Button variant="secondary" className="me-2" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleSubmit}>
                Save Article
              </Button>
            </div>
          </Form>
        )}
      </Offcanvas.Body>
      {success ? (
        fields?._id ? (
          <OkDialogue
            show={success}
            message="Your changes was save successfully"
            onConfirm={resetDialogState}
          />
        ) : (
          <ConfirmationDialogue
            show={success}
            onClose={async () => {
              resetDialogState();
            }}
            onConfirm={() => {
              handleReset();
            }}
          />
        )
      ) : null}
    </Offcanvas>
  );
};

export default RenderArticleOffcanvas;
