'use client';

import React from 'react';
import { Container, Card } from 'react-bootstrap';

const DeleteAccount = () => (
  <Container>
    <Card className='p-10 m-10'>
      <Card.Body>
        <Card.Title>Delete Your Jerur Account</Card.Title>
        <Card.Text>
          Jerur is developed by Suftnet. This page explains how to permanently delete your member account and the
          personal data associated with it, whether or not you still have the app installed.
        </Card.Text>

        <h5>1. Delete from within the app (fastest)</h5>
        <ol>
          <li>Open the Jerur app and sign in.</li>
          <li>Tap the account icon in the top-right corner of the Home screen.</li>
          <li>Go to <strong>Account</strong>, then tap <strong>Delete Account</strong>.</li>
          <li>Confirm when prompted.</li>
        </ol>
        <p>
          Your membership profile and login details are deleted immediately. This action cannot be undone.
        </p>

        <h5>2. Request deletion without the app</h5>
        <p>
          If you no longer have the app installed, email{' '}
          <a href="mailto:info@suftnet.com?subject=Delete%20my%20Jerur%20account">info@suftnet.com</a> with the
          subject &ldquo;Delete my Jerur account&rdquo; and include:
        </p>
        <ul>
          <li>Your full name</li>
          <li>The mobile number you registered with</li>
          <li>The name of your church/campus in the app</li>
        </ul>
        <p>
          We will verify your request and delete your account within 30 days, and confirm by email once it&rsquo;s
          done.
        </p>

        <h5>3. What gets deleted</h5>
        <p>Deleting your account permanently removes:</p>
        <ul>
          <li>Your profile (first name, last name, email, mobile number)</li>
          <li>Your login PIN</li>
          <li>Your membership record with your church</li>
        </ul>

        <h5>4. What we keep, and why</h5>
        <p>
          Service attendance records already on file may be retained by your church for its own record-keeping, but
          are no longer linked to an identifiable profile once your account is deleted. Public church content you
          didn&rsquo;t author — announcements, sermons, service schedules — is unaffected, since it isn&rsquo;t your
          personal data.
        </p>

        <p>
          Questions about this process? Contact us at{' '}
          <a href="mailto:info@suftnet.com">info@suftnet.com</a>.
        </p>
      </Card.Body>
    </Card>
  </Container>
);

export default DeleteAccount;
