/* eslint-disable jsx-a11y/alt-text */
'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Tabs, Tab } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { useSettings } from '../../../../hooks/useSettings';
import { validate } from '../../../../validator/validator';
import ErrorDialogue from '../../../../src/components/elements/errorDialogue';
import { OkDialogue } from '../../../../src/components/elements/errorDialogue';
import { useSubscriber } from '../../../../hooks/useSubscriber';
import Contact from './contact';
import Slider from './slider';
import Notification from './notification';
import BankTransfer from './bank-transfer';
import SocialMedia from './social_media';
import Features from './features';
import ConfigPage from './config';
import ClientKeyPage from './client-key';
import Pastor from './others/pastor';
import Prophetic from './others/prophetic';
import NotificationSettings from './others/notification';
import About from './about';
import SubscriptionSettings from './subscription';

const AddressForm = dynamic(() => import('./address'), { ssr: false });

const SettingsPage = () => {
  const { handleSave, handleChange, rules, loading, error, data, fields, success, handleSaveChangePassword } =
    useSettings();
  const { handleCustomerPortalSession } = useSubscriber();
  // Banner (Church.secure_url/public_id) - unchanged from before.
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  // True once the admin clicks the banner's "Remove" - tells the next save
  // to clear the existing Cloudinary banner rather than keep it. Selecting
  // a new file always overrides this if both somehow happen before save
  // (see handleBannerSelect below and updateBulk's own file-wins-over-
  // removal rule server-side).
  const [bannerRemoved, setBannerRemoved] = useState(false);
  // Church logo (Church.logo_url/logo_id) - a fully independent image,
  // same file-select/preview/remove pattern as the banner above.
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('profile');
  const [errorMessages, setErrorMessages] = useState({});
  const [key, setKey] = useState('config');

  useEffect(() => {
    const requestedSection = new URLSearchParams(window.location.search).get('section')?.toLowerCase();
    const settingsSections = {
      address: 'address',
      subscription: 'Subscription'
    };

    if (settingsSections[requestedSection]) {
      setSelectedMenu(settingsSections[requestedSection]);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const handleImageSelect = (selectedFile) => {
    setPreviewUrl(null);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setBannerRemoved(false);
  };

  const handleBannerRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setBannerRemoved(true);
    // Clears the saved-banner preview immediately (the form reads
    // fields.secure_url) - the actual Cloudinary delete only happens once
    // this is actually saved, via the removeBanner flag below.
    handleChange('secure_url', '');
  };

  const handleLogoSelect = (selectedFile) => {
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoFile(selectedFile);
    setLogoPreviewUrl(URL.createObjectURL(selectedFile));
    setLogoRemoved(false);
  };

  const handleLogoRemove = () => {
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setLogoRemoved(true);
    handleChange('logo_url', '');
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
    } else if (bannerRemoved) {
      formData.append('removeBanner', 'true');
    }
    if (logoFile) {
      formData.append('logoFile', logoFile);
    } else if (logoRemoved) {
      formData.append('removeLogo', 'true');
    }
    formData.append('name', fields.name);
    formData.append('email', fields.email);
    formData.append('mobile', fields.mobile);
    formData.append('denomination', fields.denomination || '');
    formData.append('short_message', fields.short_message || '');
    formData.append('verse', fields.verse || '');

    // Deliberately not clearing file/previewUrl/logoFile/logoPreviewUrl
    // here on success (same as before this change): updateBulk only ever
    // returns `true`, never the freshly-saved secure_url/logo_url, so
    // fields.secure_url/logo_url stay stale until the next full fetch -
    // clearing the local blob preview now would make a just-saved
    // image/removal appear to revert instead of staying correct on screen.
    await handleSave(formData);
  };

  const handleCancelAbout = () => {
    setErrorMessages({});
    setFile(null);
    setPreviewUrl(null);
    setBannerRemoved(false);
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setLogoRemoved(false);
    handleChange('name', data?.name ?? '');
    handleChange('email', data?.email ?? '');
    handleChange('mobile', data?.mobile ?? '');
    handleChange('denomination', data?.denomination ?? '');
    handleChange('short_message', data?.short_message ?? '');
    handleChange('verse', data?.verse ?? '');
    handleChange('description', data?.description ?? '');
    handleChange('secure_url', data?.secure_url ?? '');
    handleChange('logo_url', data?.logo_url ?? '');
  };

  const handleSubmit = async (fields) => {
    const body = {
      stripeCustomerId: fields.stripeCustomerId
    };
    const result = await handleCustomerPortalSession(body);
    if (result?.url) window.location.href = result.url;
  };

  const renderContent = (data) => {
    switch (selectedMenu) {
      case 'profile':
        return (
          <About
            fields={fields}
            errorMessages={errorMessages}
            handleChange={handleChange}
            onSubmit={onSubmit}
            onCancel={handleCancelAbout}
            loading={loading}
            previewUrl={previewUrl}
            onImageSelect={handleImageSelect}
            onBannerRemove={handleBannerRemove}
            logoPreviewUrl={logoPreviewUrl}
            onLogoSelect={handleLogoSelect}
            onLogoRemove={handleLogoRemove}
          />
        );
      case 'Subscription':
        return <SubscriptionSettings fields={fields} onManage={handleSubmit} />;
      case 'slider':
        return <Slider />;
      case 'contact':
        return <Contact />;
      case 'address':
        return <AddressForm address={data?.address} />;
      case 'push_notification':
        return <Notification />;
      case 'general':
        return (
          <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
              <Tab eventKey="config" title="General Config">
              <ConfigPage data={data} />
            </Tab>
            <Tab eventKey="bank_transfer" title="Bank Transfer">
              <BankTransfer data={data} />
            </Tab>
            <Tab eventKey="social_media" title="Social Media">
              <SocialMedia data={data} />
            </Tab>
            <Tab eventKey="pastor" title="Pastor">
              <Pastor data={data?.pastor_section} />
            </Tab>
            <Tab eventKey="prophetic" title="Prophetic Theme">
              <Prophetic data={data?.prophetic_focus} />
            </Tab>
            <Tab eventKey="notification" title="Notification">
              <NotificationSettings data={data?.notification} />
            </Tab>

            <Tab eventKey="feature" title="Mobile Features">
              <Features data={data} />
            </Tab>
            <Tab eventKey="client_key" title="Client Secret">
              <ClientKeyPage client_secret={data?.client_secret} />
            </Tab>
          </Tabs>
        );
      default:
        return <h4>Select an option</h4>;
    }
  };

  return (
    <>
      <Row>
        <Col md={2} className="bg-light border-end vh-100 d-flex flex-column align-items-center py-3">
          <div className="w-100 text-center">
           
            <div
              onClick={() => setSelectedMenu('profile')}
              className={`py-1 ps-8 d-flex justify-content-start menu-item ${selectedMenu === 'profile' ? 'active-menu' : ''
                }`}
            >
              About us
            </div>
            <div
              onClick={() => setSelectedMenu('contact')}
              className={`py-1 ps-8 d-flex justify-content-start menu-item ${selectedMenu === 'contact' ? 'active-menu' : ''
                }`}
            >
              Contact
            </div>
            <div
              onClick={() => setSelectedMenu('address')}
              className={`py-1 ps-8 d-flex justify-content-start menu-item ${selectedMenu === 'address' ? 'active-menu' : ''
                }`}
            >
              Address
            </div>
            <div
              onClick={() => setSelectedMenu('slider')}
              className={`py-1 ps-8 d-flex justify-content-start menu-item ${selectedMenu === 'slider' ? 'active-menu' : ''
                }`}
            >
              Slider
            </div>
            {/* <div
              onClick={() => setSelectedMenu('push_notification')}
              className={`py-1 ps-8 d-flex justify-content-start menu-item ${selectedMenu === 'push_notification' ? 'active-menu' : ''
                }`}
            >
              Push Notification
            </div> */}
            <div
              onClick={() => setSelectedMenu('Subscription')}
              className={`py-1 ps-8 d-flex justify-content-start menu-item ${selectedMenu === 'Subscription' ? 'active-menu' : ''
                }`}
            >
              Subscription
            </div>
             <div
              onClick={() => setSelectedMenu('general')}
              className={`py-1 ps-8 d-flex justify-content-start menu-item ${selectedMenu === 'general' ? 'active-menu' : ''
                }`}
            >
              More...
            </div>
          </div>
        </Col>

        <Col md={10} className="p-4">
          {renderContent(fields)}
        </Col>
      </Row>
      {!loading && <span className="overlay__block" />}
      {success && (
        <OkDialogue
          showSuccess={success}
          message={selectedMenu === 'profile' ? 'Church information updated.' : undefined}
          onClose={() => { }}
        />
      )}
      {error && <ErrorDialogue showError={error} onClose={() => { }} />}
    </>
  );
};

export default SettingsPage;
