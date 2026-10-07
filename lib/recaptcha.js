import crypto from 'crypto';

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const REGISTRATION_PROOF_TTL_SECONDS = 15 * 60;
const DEFAULT_MIN_SCORE = 0.5;

const minScore = () => {
  const configured = Number.parseFloat(process.env.RECAPTCHA_MIN_SCORE);
  return Number.isFinite(configured) ? configured : DEFAULT_MIN_SCORE;
};

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url');

const proofSecret = () => {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('Registration proof secret is not configured');
  return secret;
};

const signatureFor = (payload) => (
  crypto.createHmac('sha256', proofSecret()).update(payload).digest('base64url')
);

export async function verifyRecaptchaToken(token, { remoteIp, action } = {}) {
  if (!process.env.SECRET_KEY) {
    throw new Error('reCAPTCHA secret key is not configured');
  }

  if (!token || typeof token !== 'string') return false;

  const body = new URLSearchParams({
    secret: process.env.SECRET_KEY,
    response: token
  });
  if (remoteIp) body.set('remoteip', remoteIp);

  const response = await fetch(RECAPTCHA_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store'
  });

  if (!response.ok) throw new Error('Unable to verify reCAPTCHA');

  const result = await response.json();
  if (result?.success !== true) return false;

  // reCAPTCHA v3: reject tokens minted for another action or scored as likely bots.
  if (action && result.action !== action) return false;
  return typeof result.score === 'number' && result.score >= minScore();
}

export function createRegistrationProof({ email, stripeCustomerId, subscriptionId }) {
  const payload = base64UrlEncode(JSON.stringify({
    email: email.trim().toLowerCase(),
    stripeCustomerId,
    subscriptionId,
    expiresAt: Math.floor(Date.now() / 1000) + REGISTRATION_PROOF_TTL_SECONDS
  }));

  return `${payload}.${signatureFor(payload)}`;
}

export function verifyRegistrationProof(token, expected) {
  if (!token || typeof token !== 'string') return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expectedSignature = signatureFor(payload);
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    suppliedBuffer.length !== expectedBuffer.length
    || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) return false;

  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return claims.expiresAt >= Math.floor(Date.now() / 1000)
      && claims.email === expected.email.trim().toLowerCase()
      && claims.stripeCustomerId === expected.stripeCustomerId
      && claims.subscriptionId === expected.subscriptionId;
  } catch {
    return false;
  }
}
