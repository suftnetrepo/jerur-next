'use client';

import React, { useState } from 'react';
import { Badge, Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import {
  BsArrowUpRight,
  BsCalendar3,
  BsCheckCircleFill,
  BsClockHistory,
  BsCreditCard2Front,
  BsShieldCheck
} from 'react-icons/bs';
import { dateFormatted } from '../../../../../utils/helpers';
import styles from './subscription.module.scss';

const STATUS_PRESENTATION = {
  active: { label: 'Active', tone: 'success' },
  trialing: { label: 'Free trial', tone: 'info' },
  past_due: { label: 'Payment due', tone: 'warning' },
  canceled: { label: 'Cancelled', tone: 'secondary' },
  incomplete: { label: 'Incomplete', tone: 'warning' }
};

const formatPlanName = (plan) => {
  if (!plan) return 'Jerur subscription';
  return String(plan)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const BillingDate = ({ icon: Icon, label, value }) => (
  <div className={styles.dateCard}>
    <span className={styles.dateIcon}><Icon /></span>
    <div>
      <span className={styles.dateLabel}>{label}</span>
      <strong>{value ? dateFormatted(value) : 'Not available'}</strong>
    </div>
  </div>
);

export default function SubscriptionSettings({ fields, onManage }) {
  const [openingPortal, setOpeningPortal] = useState(false);
  const normalizedStatus = String(fields?.status || '').toLowerCase();
  const status = STATUS_PRESENTATION[normalizedStatus] || {
    label: normalizedStatus ? formatPlanName(normalizedStatus) : 'Not available',
    tone: 'secondary'
  };
  const isTrial = normalizedStatus === 'trialing';

  const handleManage = async () => {
    if (openingPortal) return;
    setOpeningPortal(true);
    try {
      await onManage(fields);
    } finally {
      setOpeningPortal(false);
    }
  };

  return (
    <section className={styles.wrapper} aria-labelledby="subscription-heading">
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Billing &amp; plan</span>
          <h4 id="subscription-heading">Subscription</h4>
          <p>Review your Jerur plan and manage billing securely through Stripe.</p>
        </div>
        <div className={styles.secureLabel}><BsShieldCheck /> Secure billing</div>
      </div>

      <Card className={styles.planCard}>
        <Card.Body className="p-0">
          <div className={styles.planHero}>
            <div className={styles.planIcon}><BsCreditCard2Front /></div>
            <div className={styles.planIdentity}>
              <span>Your current plan</span>
              <h5>{formatPlanName(fields?.plan)}</h5>
              <p>Everything your church needs to manage, engage and grow its community.</p>
            </div>
            <Badge pill bg={status.tone} className={styles.statusBadge}>
              <BsCheckCircleFill /> {status.label}
            </Badge>
          </div>

          <div className={styles.planBody}>
            <Row className="g-3">
              <Col md={6}>
                <BillingDate
                  icon={isTrial ? BsClockHistory : BsCalendar3}
                  label={isTrial ? 'Trial started' : 'Billing period started'}
                  value={isTrial ? fields?.trial_start : fields?.startDate}
                />
              </Col>
              <Col md={6}>
                <BillingDate
                  icon={BsCalendar3}
                  label={isTrial ? 'Trial ends' : 'Current period ends'}
                  value={isTrial ? fields?.trial_end : fields?.endDate}
                />
              </Col>
            </Row>

            <div className={styles.portalPanel}>
              <div>
                <strong>Manage your subscription</strong>
                <p>Update payment details, view invoices or make changes to your plan in the secure Stripe portal.</p>
              </div>
              <Button type="button" className={styles.portalButton} disabled={openingPortal} onClick={handleManage}>
                {openingPortal ? (
                  <><Spinner size="sm" className="me-2" />Opening portal…</>
                ) : (
                  <>Manage billing <BsArrowUpRight /></>
                )}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className={styles.supportNote}>
        <BsShieldCheck /> Payments and billing details are handled securely by Stripe. Jerur does not store your card details.
      </div>
    </section>
  );
}
