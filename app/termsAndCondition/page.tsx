'use client';

import React from 'react';
import { Container, Card } from 'react-bootstrap';

const TermsAndConditions = () => (
  <Container className="my-4">
    <Card>
      <Card.Body>
        <Card.Title>Terms and Conditions</Card.Title>
        <Card.Text>
          Welcome to Jerur, a church management platform and mobile app developed and operated by Suftnet. By
          creating an account, or by using the Jerur app or the jerur.com dashboard, you agree to these Terms and
          Conditions. Please read them carefully.
        </Card.Text>

        <h5>1. The Service</h5>
        <p>
          Jerur lets churches manage their own content — sermons, events, service and prayer times, notifications,
          attendance, and member/contact records — and lets their members access that content, register attendance,
          submit prayer requests and testimonies, and use personal tools like the Bible reader, hymn book, and
          notes through the Jerur app.
        </p>

        <h5>2. Accounts</h5>
        <p>
          Church members register with a mobile number and a PIN; church administrators sign in with an email and
          password on the web dashboard. You're responsible for the information you provide and for keeping your
          PIN or password confidential. Do not share your login credentials or use another person's account.
        </p>

        <h5>3. Church Subscriptions</h5>
        <p>
          Some Jerur features are available to churches under a paid subscription, billed through our payment
          processor, Stripe, on the terms and pricing shown on our Pricing page at the time of purchase. Non-payment
          may result in restricted access to subscription features. Subscription fees are non-refundable except
          where required by law.
        </p>

        <h5>4. Acceptable Use</h5>
        <p>You agree not to:</p>
        <ul>
          <li>Submit false attendance, testimony, contact, or event registration information.</li>
          <li>Post or submit content that is unlawful, harassing, hateful, or otherwise harmful to others.</li>
          <li>Attempt to access another member's or church's account or data without authorization.</li>
          <li>Interfere with or disrupt the operation of the app or platform, including by attempting to bypass PIN/login protections.</li>
        </ul>

        <h5>5. Content</h5>
        <p>
          Churches retain ownership of the sermons, events, images, and other content they upload to Jerur. By
          uploading content, a church grants us a license to host, store, and display it to that church's own
          members through the app and platform, solely to provide the service. Members retain ownership of their
          own submissions (testimonies, prayer requests, contact messages) on the same basis.
        </p>

        <h5>6. Third-Party Links and Services</h5>
        <p>
          "Give Online" links, WOFBI course pages, and social media links may take you to services operated by your
          church or by third parties, which are governed by their own terms and privacy policies — we are not
          responsible for those external services.
        </p>

        <h5>7. Account Deletion and Termination</h5>
        <p>
          You may delete your member account at any time — see our <a href="/deleteAccount">Delete Account</a> page
          for how. We may suspend or terminate access to the app or platform, for a member or a church, for breach
          of these Terms, non-payment of subscription fees, or where we reasonably believe it necessary to protect
          Jerur, other churches, or their members.
        </p>

        <h5>8. Disclaimer and Limitation of Liability</h5>
        <p>
          Jerur is provided "as is." While we work to keep the app and platform reliable, we do not guarantee
          uninterrupted or error-free service, and we are not liable for any damages or losses arising from your use
          of Jerur, including service interruptions, or disputes between a church and its members, to the fullest
          extent permitted by law.
        </p>

        <h5>9. Changes to These Terms</h5>
        <p>
          We may update these Terms and Conditions from time to time to reflect changes in our practices or for
          legal and regulatory compliance. We will notify users of significant changes through the app or website;
          continued use of Jerur after a change takes effect constitutes acceptance of the updated Terms.
        </p>

        <h5>10. Governing Law</h5>
        <p>These Terms are governed by the laws of England and Wales.</p>

        <p>For questions or further clarification, contact us at{' '}
          <a href="mailto:info@suftnet.com">info@suftnet.com</a>.
        </p>
      </Card.Body>
    </Card>
  </Container>
);

export default TermsAndConditions;
