import React from 'react';
import Link from 'next/link';
import { Container } from 'react-bootstrap';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="footer border-top px-sm-2"
      style={{ background: '#fff', borderColor: '#e9edf3' }}
    >
      <Container
        fluid
        className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3"
        style={{ minHeight: 72, paddingTop: 14, paddingBottom: 14 }}
      >
        <div className="d-flex align-items-center gap-3">
          <span
            className="d-inline-flex align-items-center justify-content-center fw-bold"
            aria-hidden="true"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              color: '#fff',
              background: 'linear-gradient(135deg, #2f5af0 0%, #5146d9 100%)',
              boxShadow: '0 5px 14px rgba(47, 90, 240, 0.2)'
            }}
          >
            J
          </span>
          <div style={{ lineHeight: 1.35 }}>
            <div className="fw-semibold" style={{ color: '#263548', fontSize: 13 }}>
              Jerur Church Management
            </div>
            <div style={{ color: '#7a8797', fontSize: 11 }}>
              © {currentYear} Jerur. All rights reserved.
            </div>
          </div>
        </div>

        <nav className="d-flex align-items-center gap-3" aria-label="Footer navigation">
          <Link className="text-decoration-none" style={{ color: '#667487', fontSize: 12 }} href="/contact">
            Support
          </Link>
          <Link className="text-decoration-none" style={{ color: '#667487', fontSize: 12 }} href="/privacyPolicy">
            Privacy
          </Link>
          <Link className="text-decoration-none" style={{ color: '#667487', fontSize: 12 }} href="/termsAndCondition">
            Terms
          </Link>
          <span className="d-none d-md-inline" style={{ width: 1, height: 18, background: '#e3e8ef' }} />
          <a
            className="text-decoration-none d-none d-md-inline"
            style={{ color: '#8793a2', fontSize: 11 }}
            href="https://suftnet.com"
            target="_blank"
            rel="noreferrer"
          >
            Built by Suftnet
          </a>
        </nav>
      </Container>
    </footer>
  );
}
