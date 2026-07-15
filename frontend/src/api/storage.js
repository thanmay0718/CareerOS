const AUTH_KEY = 'careeros.auth.v1';

export function readAuthSession() {
  try {
    const rawValue = localStorage.getItem(AUTH_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

export function writeAuthSession(session) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_KEY);
}

