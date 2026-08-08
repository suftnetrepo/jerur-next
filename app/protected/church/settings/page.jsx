/* eslint-disable jsx-a11y/alt-text */
'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, InputGroup, Tabs, Tab } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { dateFormatted, encrypt, decrypt } from '../../../../utils/helpers';
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

const AddressForm = dynamic(() => import('./address'), { ssr: false });

const SettingsPage = () => {
  const { handleSave, handleChange, handleSeeds, rules, loading, error, data, fields, success, handleSaveChangePassword } =
    useSettings();
  const { handleCustomerPortalSession } = useSubscriber();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState('profile');
  const [errorMessages, setErrorMessages] = useState({});
  const [file, setFile] = useState(null);
  const [key, setKey] = useState('bank_transfer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageSelect = (selectedFile) => {
    setPreviewUrl(null);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
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
    formData.append('name', fields.name);
    formData.append('email', fields.email);
    formData.append('mobile', fields.mobile);
    formData.append('denomination', fields.denomination || '');
    formData.append('short_message', fields.short_message || '');
    formData.append('verse', fields.verse || '');

    await handleSave(formData);
  };

  const handleSubmit = (fields) => {
    const body = {
      stripeCustomerId: fields.stripeCustomerId
    };
    handleCustomerPortalSession(body).then((result) => {
      if (result?.url) {
        if (result?.url) {
          window.location.href = result.url;
        }
      }
    });
  };

  const handleSavePassword = async (fields) => {
    await handleSaveChangePassword({ password: fields.password });
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
            handleSeeds={handleSeeds}
            previewUrl={previewUrl}
            onImageSelect={handleImageSelect}
          />
        );
      case 'Subscription':
        return (
          <Form>
            <Row className="mb-4">
              <h4>Subscription </h4>
            </Row>
            <Row className="mb-1">
              <Col md={6}>
                <Row className="mb-1">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-dark">Plan</Form.Label>
                      <Form.Control type="text" readOnly value={fields?.plan} />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label className="text-dark">Status</Form.Label>
                      <Form.Control type="text" readOnly value={fields?.status} />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Row>

            {fields?.status !== 'trialing' && (
              <Row>
                <Col md={6}>
                  <Row className="mb-3">
                    <Col>
                      <Form.Group>
                        <Form.Label className="text-dark">Start Date</Form.Label>
                        <Form.Control type="text" readOnly value={dateFormatted(fields?.startDate)} />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label className="text-dark">End Date</Form.Label>
                        <Form.Control type="text" readOnly value={dateFormatted(fields?.endDate)} />
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
              </Row>
            )}

            {fields?.status === 'trialing' && (
              <Row>
                <Col md={6}>
                  <Row className="mb-1">
                    <Col>
                      <Form.Group>
                        <Form.Label className="text-dark">Trial Start</Form.Label>
                        <Form.Control
                          type="text"
                          readOnly
                          value={dateFormatted(fields?.trial_start)}
                          className="border-dark"
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label className="text-dark">Trial End</Form.Label>
                        <Form.Control type="text" readOnly value={dateFormatted(fields?.trial_end)} />
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
              </Row>
            )}

            <div className="d-flex justify-content-start">
              <Button type="button" variant="primary" onClick={() => handleSubmit(fields)}>
                Go to Stripe Portal
              </Button>
            </div>
          </Form>
        );
      case 'ChangePassword':
        return (
          <Form>
            <Row className="mb-4">
              <h4>Change Password </h4>
            </Row>
            <Row className="mb-1">
              <Col md={6}>
                <Row className="mb-1">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-dark">New Password</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          value={fields.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          placeholder="Enter your password"
                          maxLength={20}
                        />
                        <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? 'Hide' : 'Show'}
                        </Button>
                      </InputGroup>{' '}
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label className="text-dark">Confirm Password</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={fields.confirm_password}
                          maxLength={20}
                          onChange={(e) => handleChange('confirm_password', e.target.value)}
                          placeholder="Confirm your password"
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? 'Hide' : 'Show'}
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Row>

            <div className="d-flex justify-content-start">
              <Button
                type="button"
                variant="primary"
                disabled={
                  fields.password !== fields.confirm_password ||
                  fields.password.length === 0 ||
                  fields.confirm_password.length === 0
                }
                onClick={() => handleSavePassword(fields)}
              >
                Save Changes
              </Button>
            </div>
          </Form>
        );
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
            <Tab eventKey="config" title="Other Configurations">
              <ConfigPage data={data} />
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
      {success && <OkDialogue showSuccess={success} onClose={() => { }} />}
      {error && <ErrorDialogue showError={error} onClose={() => { }} />}
    </>
  );
};

export default SettingsPage;
