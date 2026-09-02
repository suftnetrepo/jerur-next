'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Spinner } from 'react-bootstrap';

const RECOVERY_PATH = '/protected/church/billing-recovery';

export default function ChurchEntitlementGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState({ loading: true, error: '', hasAccess: null });

  const checkEntitlement = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));

    try {
      const response = await fetch('/api/stripe/entitlement', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.status === 401) {
        router.replace(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'Unable to verify your subscription.');
      }

      setState({ loading: false, error: '', hasAccess: result.data.hasAccess });
    } catch (error) {
      setState({
        loading: false,
        error: error.message || 'Unable to verify your subscription.',
        hasAccess: null
      });
    }
  }, [router]);

  useEffect(() => {
    checkEntitlement();
  }, [checkEntitlement]);

  useEffect(() => {
    if (state.loading || state.error || state.hasAccess === null) return;

    if (!state.hasAccess && pathname !== RECOVERY_PATH) {
      router.replace(RECOVERY_PATH);
    } else if (state.hasAccess && pathname === RECOVERY_PATH) {
      router.replace('/protected/church/dashboard');
    }
  }, [pathname, router, state.error, state.hasAccess, state.loading]);

  const redirectPending = (
    (state.hasAccess === false && pathname !== RECOVERY_PATH)
    || (state.hasAccess === true && pathname === RECOVERY_PATH)
  );

  if (state.loading || redirectPending) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-white">
        <Spinner animation="border" role="status" style={{ color: '#078f95' }} />
        <span className="mt-3 text-muted small">Checking your Jerur subscription…</span>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white px-3">
        <div className="text-center" style={{ maxWidth: 440 }}>
          <h1 className="h4 text-dark">We couldn’t verify your subscription</h1>
          <p className="text-muted">{state.error}</p>
          <Button type="button" onClick={checkEntitlement} style={{ background: '#078f95', borderColor: '#078f95' }}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return children;
}
