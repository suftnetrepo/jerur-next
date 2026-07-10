import React, { useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Offcanvas, Row, Spinner } from 'react-bootstrap';
import { validate } from '../../../../validator/validator';
import { ConfirmationDialogue, OkDialogue } from '../../../../src/components/elements/ConfirmDialogue';
import { sermonUiValidator } from '../../../../validator/rules';
import { capitalizeFirstLetter } from '../../../../utils/helpers';

const STATUS_VARIANTS = {
  DRAFT: 'secondary',
  PUBLISHED: 'success',
  ARCHIVED: 'dark'
};

const formatWords = (value, fallback = 'Not available') => {
  if (!value) {
    return fallback;
  }

  return String(value)
    .toLowerCase()
    .split('_')
    .map((word) => capitalizeFirstLetter(word))
    .join(' ');
};

const formatDate = (value) => {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
};

const SummaryField = ({ label, value, muted = false }) => (
  <div>
    <div className="text-muted small fw-semibold mb-1">{label}</div>
    <div className={muted ? 'text-muted' : 'text-dark'}>{value || 'Not available'}</div>
  </div>
);

const getPlayableMedia = (media = {}) => {
  return media.youtubeUrl || media.videoUrl || media.audioUrl || '';
};

const RenderSermonOffcanvas = ({
  show,
  setShow,
  mode,
  handleClose,
  handleChange,
  success,
  handleReset,
  handleSave,
  handleEdit,
  fields,
  sermon,
  loading,
  serviceOptions
}) => {
  const [errorMessages, setErrorMessages] = useState({});

  const isViewMode = mode === 'view';
  const heading = isViewMode ? 'View Sermon' : fields?._id ? 'Edit Sermon' : 'Add Sermon';
  const activeSermon = sermon || {};
  const playableMediaUrl = getPlayableMedia(activeSermon.media);

  const mediaLinks = useMemo(() => {
    return [
      { label: 'YouTube', value: activeSermon.media?.youtubeUrl },
      { label: 'Video', value: activeSermon.media?.videoUrl },
      { label: 'Audio', value: activeSermon.media?.audioUrl },
      { label: 'Thumbnail', value: activeSermon.media?.thumbnail }
    ].filter((item) => item.value);
  }, [activeSermon.media]);

  const resetDialogState = () => {
    setShow(false);
    setErrorMessages({});
    handleReset();
  };

  const handleSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, sermonUiValidator.rules);
    const mediaUrlError = fields.youtubeUrl || fields.videoUrl || fields.audioUrl
      ? undefined
      : 'at least one media URL is required';

    if (validationResult.hasError || mediaUrlError) {
      setErrorMessages({
        ...validationResult.errors,
        ...(mediaUrlError ? { media: { message: mediaUrlError } } : {})
      });
      return;
    }

    if (fields?._id) {
      await handleEdit(fields, fields._id);
      return;
    }

    await handleSave(fields);
  };
  const renderViewMode = () => (
    <div className="d-flex flex-column gap-3">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-3">
          <div className="text-muted small fw-semibold mb-1">Basic Information</div>
          <h5 className="mb-3">{activeSermon.title || 'Untitled Sermon'}</h5>
          <Row className="g-3">
            <Col sm={6}>
              <SummaryField label="Speaker" value={activeSermon.speakerName} />
            </Col>
            <Col sm={6}>
              <SummaryField label="Service" value={activeSermon.serviceId?.title || 'Not assigned'} muted={!activeSermon.serviceId?.title} />
            </Col>
            <Col sm={6}>
              <SummaryField label="Date" value={formatDate(activeSermon.preachedAt)} muted={!activeSermon.preachedAt} />
            </Col>
            <Col sm={6}>
              <SummaryField label="Duration" value={activeSermon.durationMinutes ? `${activeSermon.durationMinutes} mins` : 'Not available'} muted={!activeSermon.durationMinutes} />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-3">
          <div className="mb-3">
            <div className="text-muted small fw-semibold mb-1">Summary</div>
            <div className="small text-dark">{activeSermon.summary || 'No summary added'}</div>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-3">
          <div className="text-muted small fw-semibold mb-3">Media Links</div>
          {playableMediaUrl ? (
            <Button as="a" href={playableMediaUrl} target="_blank" rel="noreferrer" variant="primary" className="mb-3">
              {'\u25b6'} Play Sermon
            </Button>
          ) : null}
          {mediaLinks.length ? (
            <div className="d-flex flex-column gap-2">
              {mediaLinks.map((link) => (
                <a key={link.label} href={link.value} target="_blank" rel="noreferrer" className="small text-decoration-none">
                  {link.label}
                </a>
              ))}
            </div>
          ) : (
            <div className="text-muted small">No media links added</div>
          )}
        </Card.Body>
      </Card>
    </div>
  );

  const renderEditMode = () => (
    <Form>
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="p-3">
          <div className="text-muted small fw-semibold mb-3">Basic Information</div>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="text-dark">Title</Form.Label>
                <Form.Control value={fields.title} onChange={(event) => handleChange('title', event.target.value)} className="border-dark" />
                {errorMessages.title?.message ? <span className="text-danger small">{errorMessages.title.message}</span> : null}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-dark">Speaker</Form.Label>
                <Form.Control value={fields.speakerName} onChange={(event) => handleChange('speakerName', event.target.value)} className="border-dark" />
                {errorMessages.speakerName?.message ? <span className="text-danger small">{errorMessages.speakerName.message}</span> : null}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-dark">Service</Form.Label>
                <Form.Select value={fields.serviceId} onChange={(event) => handleChange('serviceId', event.target.value)} className="border-dark">
                  <option value="">Select a service</option>
                  {serviceOptions.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.title}
                    </option>
                  ))}
                </Form.Select>
                {errorMessages.serviceId?.message ? <span className="text-danger small">{errorMessages.serviceId.message}</span> : null}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-dark">Date Preached</Form.Label>
                <Form.Control type="date" value={fields.preachedAt} onChange={(event) => handleChange('preachedAt', event.target.value)} className="border-dark" />
                {errorMessages.preachedAt?.message ? <span className="text-danger small">{errorMessages.preachedAt.message}</span> : null}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-dark">Duration</Form.Label>
                <Form.Control type="number" min="1" value={fields.durationMinutes} onChange={(event) => handleChange('durationMinutes', event.target.value)} className="border-dark" placeholder="Minutes" />
                {errorMessages.durationMinutes?.message ? <span className="text-danger small">{errorMessages.durationMinutes.message}</span> : null}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-dark">Status</Form.Label>
                <Form.Select value={fields.status} onChange={(event) => handleChange('status', event.target.value)} className="border-dark">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </Form.Select>
                {errorMessages.status?.message ? <span className="text-danger small">{errorMessages.status.message}</span> : null}
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="text-dark">Summary</Form.Label>
                <Form.Control as="textarea" rows={4} value={fields.summary} onChange={(event) => handleChange('summary', event.target.value)} className="border-dark" />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="p-3">
          <div className="text-muted small fw-semibold mb-3">Media</div>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="text-dark">YouTube URL</Form.Label>
                <Form.Control value={fields.youtubeUrl} onChange={(event) => handleChange('youtubeUrl', event.target.value)} className="border-dark" />
                {errorMessages.youtubeUrl?.message ? <span className="text-danger small">{errorMessages.youtubeUrl.message}</span> : null}
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="text-dark">Audio URL</Form.Label>
                <Form.Control value={fields.audioUrl} onChange={(event) => handleChange('audioUrl', event.target.value)} className="border-dark" />
                {errorMessages.audioUrl?.message ? <span className="text-danger small">{errorMessages.audioUrl.message}</span> : null}
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="text-dark">Video URL</Form.Label>
                <Form.Control value={fields.videoUrl} onChange={(event) => handleChange('videoUrl', event.target.value)} className="border-dark" />
                {errorMessages.videoUrl?.message ? <span className="text-danger small">{errorMessages.videoUrl.message}</span> : null}
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="text-dark">Thumbnail URL</Form.Label>
                <Form.Control value={fields.thumbnail} onChange={(event) => handleChange('thumbnail', event.target.value)} className="border-dark" />
                {errorMessages.thumbnail?.message ? <span className="text-danger small">{errorMessages.thumbnail.message}</span> : null}
              </Form.Group>
            </Col>
          </Row>
          {errorMessages.media?.message ? <span className="text-danger small">{errorMessages.media.message}</span> : null}
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-start">
        <Button variant="secondary" className="me-2" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="button" variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </div>
    </Form>
  );

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" style={{ width: '42%', backgroundColor: 'white' }}>
      <Offcanvas.Header closeButton className="border-bottom align-items-start py-3 px-4">
        <div className="d-flex justify-content-between align-items-start w-100 me-3 gap-3">
          <div>
            <Offcanvas.Title className="mb-1">{heading}</Offcanvas.Title>
            <div className="text-muted small">
              {isViewMode ? 'Review sermon details, passages, content, and media.' : 'Capture sermon information for your church sermon library.'}
            </div>
          </div>
          <Badge bg={STATUS_VARIANTS[activeSermon.status || fields.status] || 'secondary'} className="px-3 py-2 rounded-pill align-self-center">
            {formatWords(activeSermon.status || fields.status, 'Draft')}
          </Badge>
        </div>
      </Offcanvas.Header>
      <Offcanvas.Body className="px-4 py-3">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" />
          </div>
        ) : isViewMode ? renderViewMode() : renderEditMode()}
      </Offcanvas.Body>
      {success && !isViewMode ? (
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
              resetDialogState();
            }}
          />
        )
      ) : null}
    </Offcanvas>
  );
};

export default RenderSermonOffcanvas;