export function getCurrentUserId() {
  return localStorage.getItem('userId');
}

export function setCurrentUserId(id) {
  localStorage.setItem('userId', id);
}

export function clearCurrentUser() {
  localStorage.removeItem('userId');
}

export function isLoggedIn() {
  return Boolean(getCurrentUserId());
}
