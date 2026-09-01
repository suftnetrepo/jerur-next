'use client';

import React, { useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import { MdImage } from 'react-icons/md';
import { FaChurch } from 'react-icons/fa';
import Select from '../../../../../src/components/reuseable/Select';
import { DENOMINATIONS } from '../../../../../constants/denominations';

// Adapts {id, label} entries from constants/denominations.js to the
// {id, title, value} shape the shared Select component expects (same
// pattern as the Currency dropdown on Settings -> Config) — `title` is
// what's displayed, `value` is what gets saved, and here they
// deliberately differ: the dropdown shows the friendly label but saves
// the stable id, never the label, into Church.denomination. Leading
// placeholder option matters here specifically: `denomination` defaults
// to '' (unset), and without an option whose value is '' a native
// <select> just silently displays the first real option instead,
// visually implying a denomination is selected when none has been saved.
const DENOMINATION_OPTIONS = [
  { id: '', title: 'Select denomination', value: '' },
  ...DENOMINATIONS.map((denomination) => ({
    id: denomination.id,
    title: denomination.label,
    value: denomination.id
  }))
];

const CARD_STYLE = {
  border: '1px solid #ececec',
  borderRadius: 22,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
};

// Shared premium card shell used by every section on this page — same
// border/radius/shadow tokens already established on Settings ->
// Notifications, just a touch more rounded per this page's own spec.
const SettingsCard = ({ title, subtitle, children, style }) => (
  <div className="bg-white p-4" style={{ ...CARD_STYLE, ...style }}>
    <div className="mb-4">
      <h5 className="text-dark fw-bold mb-1">{title}</h5>
      {subtitle && (
        <p className="text-muted mb-0" style={{ fontSize: 13.5 }}>
          {subtitle}
        </p>
      )}
    </div>
    {children}
  </div>
);

const CharCount = ({ value, max }) => (
  <div className="text-end text-muted mt-1" style={{ fontSize: 12 }}>
    {(value ?? '').length}/{max}
  </div>
);

// Layout: one full-width "Church identity" card (logo + core fields),
// then "Your church story" and "Church banner" side by side on desktop
// (~58%/42%, matching the design spec's 55–60%/40–45%), stacking to one
// column below the lg breakpoint. All field names, validation, and the
// underlying upload/remove mechanics are unchanged from before — see
// page.jsx (onSubmit/handleImageSelect/handleLogoSelect/...) and
// churchService.updateBulk for the actual CREATE/EDIT/DELETE lifecycle.
const About = ({
  fields,
  errorMessages,
  handleChange,
  onSubmit,
  onCancel,
  loading,
  previewUrl,
  onImageSelect,
  onBannerRemove,
  logoPreviewUrl,
  onLogoSelect,
  onLogoRemove
}) => {
  const bannerInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const bannerSrc = previewUrl || fields?.secure_url;
  const logoSrc = logoPreviewUrl || fields?.logo_url;

  const handleBannerFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      onImageSelect?.(selectedFile);
    }
    e.target.value = null;
  };

  const handleLogoFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      onLogoSelect?.(selectedFile);
    }
    e.target.value = null;
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="mb-4">
        <h3 className="text-dark fw-bold mb-1">About your church</h3>
        <p className="text-muted mb-0">Manage how your church is presented to members and visitors.</p>
      </div>

      {/* ── Section 1: Church identity ───────────────────────────────── */}
      <SettingsCard
        title="Church identity"
        subtitle="Your primary church information and branding."
        style={{ marginBottom: 24 }}
      >
        {/* Logo editor */}
        <div className="d-flex flex-wrap align-items-center mb-4" style={{ gap: 20 }}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => logoInputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && logoInputRef.current?.click()}
            aria-label="Change church logo"
            style={{
              width: 132,
              height: 132,
              borderRadius: 22,
              backgroundColor: '#F7F7F8',
              border: '1px solid #ececec',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="Church logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 10 }}
              />
            ) : (
              <FaChurch size={38} color="#c9ccd1" />
            )}
          </div>

          <div>
            <div className="text-dark fw-semibold mb-1">Church logo</div>
            <div className="text-muted mb-2" style={{ fontSize: 13, maxWidth: 320 }}>
              Used across your church profile and member app.
            </div>
            <div className="d-flex" style={{ gap: 10 }}>
              <Button variant="outline-primary" size="sm" onClick={() => logoInputRef.current?.click()}>
                Change logo
              </Button>
              {logoSrc && (
                <Button variant="outline-danger" size="sm" onClick={() => onLogoRemove?.()}>
                  Remove
                </Button>
              )}
            </div>
            <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoFileChange} hidden />
          </div>
        </div>

        <hr style={{ borderColor: '#f1f1f1' }} className="mb-4" />

        {/* Core fields — responsive two-column, collapses to one on small screens */}
        <Form>
          <div className="row">
            <div className="col-md-6">
              <Form.Group controlId="formChurchName" className="mb-3">
                <Form.Label className="text-dark">Church Name</Form.Label>
                <Form.Control
                  type="text"
                  value={fields?.name ?? ''}
                  className="border-dark"
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                {errorMessages?.name?.message && (
                  <span className="text-danger fs-13">{errorMessages?.name?.message}</span>
                )}
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group controlId="formDenomination" className="mb-3">
                <Form.Label className="text-dark">Denomination</Form.Label>
                <Select
                  options={DENOMINATION_OPTIONS}
                  value={fields?.denomination ?? ''}
                  onChange={(value) => handleChange('denomination', value)}
                />
                {errorMessages?.denomination?.message && (
                  <span className="text-danger fs-13">{errorMessages?.denomination?.message}</span>
                )}
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label className="text-dark">Email</Form.Label>
                <Form.Control
                  type="text"
                  maxLength={50}
                  value={fields?.email ?? ''}
                  readOnly
                  className="border-dark"
                  onChange={(e) => handleChange('email', e.target.value)}
                />
                {errorMessages?.email?.message && (
                  <span className="text-danger fs-13">{errorMessages?.email?.message}</span>
                )}
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group controlId="formMobile" className="mb-3">
                <Form.Label className="text-dark">Mobile</Form.Label>
                <Form.Control
                  type="text"
                  maxLength={50}
                  value={fields?.mobile ?? ''}
                  className="border-dark"
                  onChange={(e) => handleChange('mobile', e.target.value)}
                />
                {errorMessages?.mobile?.message && (
                  <span className="text-danger fs-13">{errorMessages?.mobile?.message}</span>
                )}
              </Form.Group>
            </div>
          </div>
        </Form>
      </SettingsCard>

      {/* ── Sections 2 & 3: story + banner, side by side on desktop ──── */}
      <div className="row">
        <div className="col-lg-7 mb-4">
          <SettingsCard
            title="Your church story"
            subtitle="Help members and visitors understand who you are."
            style={{ height: '100%' }}
          >
            <Form.Group controlId="formShortMessage" className="mb-4">
              <Form.Label className="text-dark">Short Message</Form.Label>
              <Form.Control
                maxLength={55}
                type="text"
                placeholder="A place to belong, grow and encounter God."
                value={fields?.short_message ?? ''}
                className="border-dark"
                onChange={(e) => handleChange('short_message', e.target.value)}
              />
              <div className="d-flex justify-content-between align-items-start mt-1">
                <span className="text-muted" style={{ fontSize: 12 }}>
                  A short welcome shown over your church banner.
                </span>
                <span className="text-muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                  {(fields?.short_message ?? '').length}/55
                </span>
              </div>
              {errorMessages?.short_message?.message && (
                <span className="text-danger fs-13">{errorMessages?.short_message?.message}</span>
              )}
            </Form.Group>

            <Form.Group controlId="formVerse" className="mb-4">
              <Form.Label className="text-dark">Verse</Form.Label>
              <Form.Control
                maxLength={30}
                type="text"
                placeholder="Matthew 18:20"
                value={fields?.verse ?? ''}
                className="border-dark"
                onChange={(e) => handleChange('verse', e.target.value)}
              />
               <div className="d-flex justify-content-between align-items-start mt-1">
                <span className="text-muted" style={{ fontSize: 12 }}>
                 The verse that represents your church's mission and values in the short message. i.e Matthew 18:20
                </span>
                 <CharCount value={fields?.verse} max={30} />
              </div>

              {errorMessages?.verse?.message && (
                <span className="text-danger fs-13">{errorMessages?.verse?.message}</span>
              )}
            </Form.Group>

            <Form.Group controlId="formDescription" className="mb-0">
              <Form.Label className="text-dark">Description</Form.Label>
              <Form.Control
                maxLength={500}
                as="textarea"
                rows={6}
                value={fields?.description ?? ''}
                className="border-dark"
                style={{ padding: 14 }}
                onChange={(e) => handleChange('description', e.target.value)}
              />
              <CharCount value={fields?.description} max={500} />
              {errorMessages?.description?.message && (
                <span className="text-danger fs-13">{errorMessages?.description?.message}</span>
              )}
            </Form.Group>
          </SettingsCard>
        </div>

        <div className="col-lg-5 mb-4">
          <SettingsCard
            title="Church banner"
            subtitle="This image appears prominently on your church's home experience."
            style={{ height: '100%' }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid #ececec',
                backgroundColor: '#F7F7F8',
                cursor: 'pointer'
              }}
              role="button"
              tabIndex={0}
              onClick={() => bannerInputRef.current?.click()}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && bannerInputRef.current?.click()}
              aria-label="Change church banner"
            >
              <div style={{ position: 'absolute', inset: 0 }}>
                {bannerSrc ? (
                  <img
                    src={bannerSrc}
                    alt="Church banner"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <MdImage size={40} color="#c9ccd1" />
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex mt-3" style={{ gap: 10 }}>
              <Button variant="outline-primary" size="sm" onClick={() => bannerInputRef.current?.click()}>
                Change banner
              </Button>
              {bannerSrc && (
                <Button variant="outline-danger" size="sm" onClick={() => onBannerRemove?.()}>
                  Remove
                </Button>
              )}
            </div>
            <div className="text-muted mt-2" style={{ fontSize: 12 }}>
              Recommended: a high-quality landscape image.
            </div>
            <input type="file" accept="image/*" ref={bannerInputRef} onChange={handleBannerFileChange} hidden />
          </SettingsCard>
        </div>
      </div>

      {/* ── Save area ────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-end" style={{ gap: 10 }}>
        <Button variant="outline-secondary" disabled={loading} onClick={() => onCancel?.()}>
          Cancel
        </Button>
        <Button variant="primary" disabled={loading} onClick={() => onSubmit()}>
          {loading ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
};

export default About;
