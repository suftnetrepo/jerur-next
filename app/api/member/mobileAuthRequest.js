/**
 * Keep the public member-auth contract compatible with released mobile apps.
 * Older builds use `nj-api-key`, while newer builds use `x-nj-client-id`.
 */
export function getMobileClientId(req) {
  return req.headers.get('x-nj-client-id') || req.headers.get('nj-api-key');
}

export function getMemberCredentials(body = {}) {
  const rawIdentifier = body.identifier ?? body.email ?? body.mobile ?? body.phone;
  const rawPin = body.pin ?? body.newPin ?? body.new_pin;

  return {
    identifier: rawIdentifier == null ? '' : String(rawIdentifier).trim(),
    pin: rawPin == null ? '' : String(rawPin).trim()
  };
}
