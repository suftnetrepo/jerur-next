'use client';

import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Switch } from '@mui/material';
import { MdCampaign, MdEvent, MdSell, MdMenuBook, MdWavingHand, MdWarning, MdSmartDisplay } from 'react-icons/md';
import { OkDialogue } from '../../../../../src/components/elements/ConfirmDialogue';
import ErrorDialogue from '../../../../../src/components/elements/errorDialogue';
import { validate } from '../../../../../validator/validator';
import { useNotification } from '../../../../../hooks/useSettings';
import ImageUploadPanel from '../../../../../src/components/reuseable/ImageUploadPanel';
import Select from '../../../../../src/components/reuseable/Select';
import { NOTIFICATION_TYPES, PRIORITY_OPTIONS } from '../../../../../constants/notificationTypes';
import NotificationPreview from './NotificationPreview';

// Maps the string icon identifiers in constants/notificationTypes.js to
// their react-icons/md component - same pattern as features/index.jsx's
// FEATURE_ICONS.
const TYPE_ICONS = {
  campaign: MdCampaign,
  event: MdEvent,
  sell: MdSell,
  menu_book: MdMenuBook,
  waving_hand: MdWavingHand,
  warning: MdWarning,
  smart_display: MdSmartDisplay
};

// One neutral selected/unselected treatment for every type card, regardless
// of which type it is - the type's own brand color (constants/notificationTypes.js)
// is reserved for the preview badge, not this picker. Matches the mock.
const SELECTED_COLOR = '#0D9488';
const SELECTED_BG = '#F0FDFA';
const UNSELECTED_COLOR = '#9CA3AF';
const UNSELECTED_BORDER = '#E5E7EB';

const NotificationTypeCard = ({ type, selected, onSelect }) => {
  const Icon = TYPE_ICONS[type.icon];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(type.id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(type.id)}
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{
        width: 108,
        minHeight: 88,
        borderRadius: 12,
        cursor: 'pointer',
        padding: '12px 8px',
        border: `1.5px solid ${selected ? SELECTED_COLOR : UNSELECTED_BORDER}`,
        backgroundColor: selected ? SELECTED_BG : '#fff',
        transition: 'border-color .15s ease, background-color .15s ease'
      }}
    >
      {Icon && <Icon size={22} color={selected ? SELECTED_COLOR : UNSELECTED_COLOR} />}
      <span className="mt-2" style={{ fontSize: 12.5, fontWeight: 600, color: selected ? SELECTED_COLOR : '#6b7280' }}>
        {type.label}
      </span>
    </div>
  );
};

const NotificationSettings = ({ data }) => {
  const { error, success, fields, rules, loading, handleChange, handleUpdate, handleReset, handleSelect } =
    useNotification();
  const [errorMessages, setErrorMessages] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // True once the admin clicks the image's "x" - tells the next save to
  // clear the existing Cloudinary image rather than keep it. A newly
  // selected file (handleImageSelect) always overrides this if both
  // somehow happen before the next save.
  const [imageRemoved, setImageRemoved] = useState(false);

  useEffect(() => {
    if (data && !isDataLoaded) {
      handleSelect(data);
      setIsDataLoaded(true);
    }
  }, [data, handleSelect, isDataLoaded]);

  // Clean up the in-progress preview URL on unmount / when it changes.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageSelect = (selectedFile) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setImageRemoved(false);
  };

  const handleImageRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setImageRemoved(true);
    // Clears the saved-image preview immediately (form + live preview both
    // read fields.secure_url) - the actual Cloudinary delete only happens
    // once this is actually saved, via the removeImage flag below.
    handleChange('secure_url', '');
  };

  const buildFormData = (statusOverride) => {
    const formData = new FormData();
    formData.append('type', fields.type);
    formData.append('title', fields.title);
    formData.append('message', fields.message);
    formData.append('conference_link', fields.conference_link || '');
    formData.append('priority', fields.priority);
    formData.append('status', String(statusOverride ?? fields.status));
    formData.append('start_date', fields.start_date || '');
    formData.append('expiry_date', fields.expiry_date || '');
    if (file) {
      formData.append('file', file);
    } else if (imageRemoved) {
      formData.append('removeImage', 'true');
    }
    return formData;
  };

  // Reuses the same Church.notification.status field for both buttons -
  // "Save as Draft" forces it off (configured, not yet visible to
  // members), "Publish" forces it on. No separate draft field: the mock's
  // Draft/Publish split maps directly onto the existing Enabled/Disabled
  // switch rather than introducing new schema.
  const handleSubmit = async (statusOverride) => {
    setErrorMessages({});
    const validationResult = validate(fields, rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    const formData = buildFormData(statusOverride);
    handleUpdate(formData).then((result) => {
      if (result) {
       
      }
    });
  };

  const handleCancel = () => {
    setErrorMessages({});
    setFile(null);
    setPreviewUrl(null);
    setImageRemoved(false);
    handleSelect(data || {});
  };

  return (
    <div className="me-5" style={{ maxWidth: '80%' }}>
      <div className="row">
        <div className="col-lg-7 mb-4">
          <div
            className="bg-white p-4"
            style={{ border: '1px solid #ececec', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >


            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="text-dark fw-semibold">Notification Type</Form.Label>
                <div className="d-flex flex-wrap" style={{ gap: 10 }}>
                  {NOTIFICATION_TYPES.map((type) => (
                    <NotificationTypeCard
                      key={type.id}
                      type={type}
                      selected={fields.type === type.id}
                      onSelect={(id) => handleChange('type', id)}
                    />
                  ))}
                </div>
              </Form.Group>

              <Form.Group controlId="formNotificationTitle" className="mb-3">
                <Form.Label className="text-dark">Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter notification title"
                  value={fields?.title ?? ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="border-dark"
                  maxLength={100}
                />
                {errorMessages.title?.message && <span className="text-danger">{errorMessages.title?.message}</span>}
              </Form.Group>

              <Form.Group controlId="formNotificationMessage" className="mb-4">
                <Form.Label className="text-dark">Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter notification message"
                  value={fields?.message ?? ''}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className="border-dark"
                  maxLength={300}
                />
                {errorMessages.message?.message && (
                  <span className="text-danger">{errorMessages.message?.message}</span>
                )}
              </Form.Group>

              <Form.Group controlId="formNotificationConferenceLink" className="mb-4">
                <Form.Label className="text-dark">Conference Link (Optional)</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={fields?.conference_link ?? ''}
                  onChange={(e) => handleChange('conference_link', e.target.value)}
                  className="border-dark"
                  maxLength={2048}
                />
                <Form.Text className="text-muted">
                  Add a Zoom, Teams, Google Meet or other conference URL.
                </Form.Text>
                {errorMessages.conference_link?.message && (
                  <div className="text-danger">{errorMessages.conference_link.message}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="text-dark d-block">Notification Image (Optional)</Form.Label>
                <ImageUploadPanel
                  previewUrl={previewUrl}
                  imageUrl={fields?.secure_url}
                  onFileSelect={handleImageSelect}
                  onRemove={handleImageRemove}
                  alt="Notification"
                  width={300}
                  height={170}
                  borderRadius="12px"
                />
              </Form.Group>

              <div className="row mb-4">
                <div className="col-md-6">
                  <Form.Group controlId="formNotificationPriority">
                    <Form.Label className="text-dark">Priority</Form.Label>
                    <Select
                      options={PRIORITY_OPTIONS}
                      value={fields?.priority ?? 'normal'}
                      onChange={(value) => handleChange('priority', value)}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Label className="text-dark d-block">Status</Form.Label>
                  <div className="d-flex align-items-center">
                    <Switch
                      checked={!!fields?.status}
                      onChange={(e) => handleChange('status', e.target.checked)}
                      color="primary"
                      inputProps={{ 'aria-label': 'Toggle notification status' }}
                    />
                    <span className="text-dark">{fields?.status ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <Form.Group controlId="formNotificationStartDate">
                    <Form.Label className="text-dark">Start Date (Optional)</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={fields?.start_date ?? ''}
                      onChange={(e) => handleChange('start_date', e.target.value)}
                      className="border-dark"
                    />
                    {errorMessages.start_date?.message && (
                      <span className="text-danger">{errorMessages.start_date?.message}</span>
                    )}
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group controlId="formNotificationExpiryDate">
                    <Form.Label className="text-dark">Expiry Date (Optional)</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={fields?.expiry_date ?? ''}
                      onChange={(e) => handleChange('expiry_date', e.target.value)}
                      className="border-dark"
                    />
                    {errorMessages.expiry_date?.message && (
                      <span className="text-danger">{errorMessages.expiry_date?.message}</span>
                    )}
                  </Form.Group>
                </div>
              </div>

              <div className="d-flex justify-content-start" style={{ gap: 10 }}>
                <Button type="button" variant="outline-secondary" disabled={loading} onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="button" variant="outline-primary" disabled={loading} onClick={() => handleSubmit(false)}>
                  Save as Draft
                </Button>
                <Button type="button" variant="primary" disabled={loading} onClick={() => handleSubmit(true)}>
                  {loading ? 'Publishing...' : 'Publish'}
                </Button>
              </div>
            </Form>
          </div>
        </div>

        <div className="col-lg-5">
          <NotificationPreview fields={fields} previewUrl={previewUrl} />
        </div>
      </div>

      {success && (
        <OkDialogue
          show={success}
          message="Notification saved successfully."
          onConfirm={() => {
            handleReset();
          }}
        />
      )}
      {error && <ErrorDialogue showError={error} onClose={() => {}} />}
    </div>
  );
};

export default NotificationSettings;
