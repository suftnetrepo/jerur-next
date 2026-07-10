const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();

const normalizeBaseUrl = (value: string) => (value.endsWith('/') ? value : `${value}/`);

const resolveHost = () => {
  if (typeof window !== 'undefined') {
    const browserApiBase = `${window.location.origin}/api/`;

    if (!configuredBaseUrl) {
      return browserApiBase;
    }

    try {
      const configuredUrl = new URL(configuredBaseUrl);
      const configuredIsLocalhost = ['localhost', '127.0.0.1'].includes(configuredUrl.hostname);
      const browserIsLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

      if (configuredIsLocalhost && browserIsLocalhost && configuredUrl.origin !== window.location.origin) {
        return browserApiBase;
      }
    } catch {
      return browserApiBase;
    }

    return normalizeBaseUrl(configuredBaseUrl);
  }

  return normalizeBaseUrl(configuredBaseUrl || 'https://jerur-next.onrender.com/api/');
};

const HOST = resolveHost();

const VERBS = {
  POST: 'POST',
  GET: 'GET',
  DELETE: 'DELETE',
  PUT: 'PUT'
};

export { VERBS, HOST };
