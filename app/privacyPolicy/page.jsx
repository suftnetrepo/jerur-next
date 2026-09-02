'use client';

import React from 'react';
import { Container, Card } from 'react-bootstrap';

const PrivacyPolicy = () => (
  <Container>
    <Card className='p-10 m-10'>
      <Card.Body>
        <Card.Title>Privacy Policy</Card.Title>
        <Card.Text>
          Jerur is developed and operated by Suftnet. This Privacy Policy explains what information we collect
          through the Jerur mobile app and the jerur.com platform, how we use it, and how you can control it. It
          applies to church members using the app and to church administrators using the web dashboard.
        </Card.Text>

        <h5>1. Information We Collect</h5>
        <p><strong>Member accounts (mobile app).</strong> When you register as a member of a church on Jerur, we collect your
          first name, last name, mobile number, and (optionally) email address. Your PIN is stored as a one-way
          hash — we never store it, or can see it, in plain text.
        </p>
        <p><strong>Church administrator accounts (web dashboard).</strong> Church staff who manage a church on Jerur sign
          in with an email and password to a separate admin account, used to manage that church's content.
        </p>
        <p><strong>Church content.</strong> Church administrators may upload sermons, events, service times, prayer
          times, notifications, and images (church logo, banners, notification flyers, pastor photo) — hosted via
          our image provider, Cloudinary — along with contact details, giving links, and social media links for
          their church.
        </p>
        <p><strong>Activity within the app.</strong> Depending on the features a church has enabled, we may collect:
        </p>
        <ul>
          <li>Attendance you submit for a service, linked to your member account.</li>
          <li>Contact, prayer request, and testimony submissions, including any name, phone number, or message you provide.</li>
          <li>Event registration details you submit for a specific event.</li>
          <li>Donation records a church administrator enters on your behalf for their own record-keeping (name, email, amount, date) — Jerur does not process card payments for individual member giving itself; "Give Online" links take you to your church's own external giving provider.</li>
        </ul>
        <p><strong>Location.</strong> If you tap "Find churches near me" on the church search screen, we request your
          device location for that one lookup, to show nearby churches. We do not access your location at any other
          time, and never in the background.
        </p>
        <p><strong>Data kept only on your device.</strong> Bible/hymn reading preferences (like font size), your own
          notes written in the app, and any prayer-time reminders you set are stored locally on your device only.
          Reminders are scheduled by your device's own notification system — we do not receive a notification token
          and cannot see or send you a push notification from our servers.
        </p>
        <p><strong>Technical/error data.</strong> Our backend uses an error-monitoring tool (Sentry) that may capture
          technical details of a crash or failed request (such as device/browser information and IP address) purely
          to help us find and fix bugs.
        </p>

        <h5>2. How We Use Your Information</h5>
        <ul>
          <li>To create and secure your member or administrator account.</li>
          <li>To provide the features a church has enabled — attendance, events, notifications, prayer times, Bible/hymn content, and giving links.</li>
          <li>To respond to contact, prayer request, testimony, and course-enquiry submissions.</li>
          <li>To detect and prevent fraudulent, abusive, or unauthorized use (e.g. login-attempt limits on your PIN).</li>
          <li>To maintain and improve the reliability of the app and platform.</li>
          <li>To comply with legal obligations.</li>
        </ul>

        <h5>3. Sharing of Information</h5>
        <p>We do not sell your personal information. A church's member, attendance, contact, testimony, and donation
          data is visible only to that church's own administrators — never to other churches on the platform. We
          share information with the service providers who help us run Jerur, each acting on our instructions:
        </p>
        <ul>
          <li><strong>Cloudinary</strong> — hosts images uploaded to the platform.</li>
          <li><strong>Stripe</strong> — processes subscription billing for churches that pay for Jerur; Stripe handles and stores card details, we never see or store full card numbers.</li>
          <li><strong>MongoDB Atlas</strong> — hosts our database.</li>
          <li><strong>Sentry</strong> — error monitoring for our backend, described above.</li>
          <li>Our email delivery provider — for transactional email such as password resets.</li>
        </ul>
        <p>We may also disclose information if required by law, or to protect the rights, safety, or property of
          Jerur, our churches, or their members.
        </p>

        <h5>4. Data Retention</h5>
        <p>We keep your information for as long as your account or your church's subscription is active. If you
          delete your member account — see our <a href="/deleteAccount">Delete Account</a> page for how — we
          permanently delete your profile, mobile number, email, and PIN. Some records, such as service attendance
          already on file, may be retained by your church for its own record-keeping, but are no longer linked to an
          identifiable profile once your account is deleted.
        </p>

        <h5>5. Your Rights</h5>
        <p>
          You have the right to access, correct, or delete your personal data, and, where UK/EU data protection law
          applies, other rights such as restricting or objecting to certain processing. To exercise these rights,
          visit our <a href="/deleteAccount">Delete Account</a> page or contact us at{' '}
          <a href="mailto:info@suftnet.com">info@suftnet.com</a>.
        </p>

        <h5>6. Children</h5>
        <p>
          Jerur is not directed at children under 13, and member registration is intended for church members old
          enough to hold their own account. Any use by younger children as part of a church's own youth ministry
          activities is the responsibility of that church.
        </p>

        <h5>7. Security</h5>
        <p>
          We use industry-standard measures to protect your information, including encrypting data in transit and
          storing your PIN only as a one-way hash, never in plain text.
        </p>

        <h5>8. Changes to This Policy</h5>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices or for legal and
          regulatory compliance. We will notify users of significant updates through the app or website.
        </p>
        <p>For more information or to raise any concerns, please contact us at{' '}
          <a href="mailto:info@suftnet.com">info@suftnet.com</a>.
        </p>
      </Card.Body>
    </Card>
  </Container>
);

export default PrivacyPolicy;
