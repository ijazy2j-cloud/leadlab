// Auth is handled by SSO in production. In local dev, the backend mock middleware
// defaults to the first seeded user. No client-side user state is stored.

// TODO: IT to provide the SSO logout URL.
export const LOGOUT_URL = '/logout';
