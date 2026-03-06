'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faProjectDiagram,
    faCogs,
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { signIn, getCsrfToken } from 'next-auth/react';
import { useSubscriber } from '../../../hooks/useSubscriber';

const PASSWORD = '12345!';

function CheckoutSuccess() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { handleVerifySubscriptionStatus } = useSubscriber();
    const [csrfToken, setCsrfToken] = useState('');
    const stripeCustomerId = searchParams.get('stripeCustomerId');
    const email = searchParams.get('email');
    const plan = searchParams.get('plan') || 'Basic Plan';
    const amount = searchParams.get('amount') || '£50';

    const [status, setStatus] = useState('processing');
    // processing | active | failed

    useEffect(() => {
        getCsrfToken().then(setCsrfToken);
    }, []);

    useEffect(() => {
        if (!stripeCustomerId) return;

        let retryCount = 0;

        const checkStatus = async () => {
            try {
                const data = await handleVerifySubscriptionStatus(stripeCustomerId);

                if (data.active) {
                    setStatus('active');

                    await signIn('credentials', {
                        redirect: false,
                        email,
                        password: PASSWORD,
                        csrfToken
                    });

                    router.push('/protected/church/dashboard');
                }

                retryCount++;
                if (retryCount > 15) {
                    setStatus('failed');
                }

            } catch (err) {
                setStatus('failed');
            }
        };

        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);

    }, [stripeCustomerId]);

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Container>
                <Row className="justify-content-center">
                    <Col lg={7} md={9}>
                        <Card className="shadow-lg border-0 text-center" style={{ borderRadius: 20 }}>
                            <Card.Body className="p-5">

                                {/* Icon Circle */}
                                <div
                                    className="d-flex justify-content-center align-items-center mb-4"
                                    style={{
                                        width: 90,
                                        height: 90,
                                        borderRadius: '50%',
                                        background: '#e7f5ff',
                                        margin: '0 auto',
                                    }}
                                >
                                    {status === 'processing' && (
                                        <FontAwesomeIcon icon={faCogs} size="2x" className="text-primary" spin />
                                    )}

                                    {status === 'active' && (
                                        <FontAwesomeIcon icon={faProjectDiagram} size="2x" className="text-primary" />
                                    )}

                                    {status === 'failed' && (
                                        <FontAwesomeIcon icon={faUser} size="2x" className="text-danger" />
                                    )}
                                </div>

                                {/* Title */}
                                <h2 className="fw-bold mb-3">
                                    {status === 'processing' && 'Processing Your Subscription...'}
                                    {status === 'active' && 'Subscription Activated 🎉'}
                                    {status === 'failed' && 'Activation Failed'}
                                </h2>

                                {/* Subtitle */}
                                <p className="text-muted mb-4">
                                    {status === 'processing' &&
                                        'We are confirming your payment and activating your account.'}

                                    {status === 'active' &&
                                        'Your account is ready. Redirecting to dashboard...'}

                                    {status === 'failed' &&
                                        'Something went wrong. Please contact support.'}
                                </p>

                                {/* Details */}
                                <Card className="border-0 bg-light mb-4" style={{ borderRadius: 12 }}>
                                    <Card.Body>
                                        <Row>
                                            <Col md={4}>
                                                <small className="text-muted d-block">Plan</small>
                                                <span className="fw-semibold">
                                                    <FontAwesomeIcon icon={faProjectDiagram} className="me-2 text-primary" />
                                                    {plan}
                                                </span>
                                            </Col>

                                            <Col md={4}>
                                                <small className="text-muted d-block">Amount</small>
                                                <span className="fw-semibold">
                                                    {amount}
                                                </span>
                                            </Col>

                                            <Col md={4}>
                                                <small className="text-muted d-block">Customer ID</small>
                                                <Badge bg="secondary">
                                                    {stripeCustomerId}
                                                </Badge>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* Button if failed */}
                                {status === 'failed' && (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-100 rounded-pill"
                                        onClick={() => router.push('/')}
                                    >
                                        <FontAwesomeIcon icon={faHome} className="me-2" />
                                        Go to Homepage
                                    </Button>
                                )}

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccess />
    </Suspense>
  );
}