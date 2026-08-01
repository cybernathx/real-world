const CBT = {
  apiBase: '/api',
  getToken() {
    return localStorage.getItem('cbt_token');
  },
  setToken(token) {
    localStorage.setItem('cbt_token', token);
  },
  getUser() {
    const user = localStorage.getItem('cbt_user');
    return user ? JSON.parse(user) : null;
  },
  setUser(user) {
    localStorage.setItem('cbt_user', JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem('cbt_token');
    localStorage.removeItem('cbt_user');
  },
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = CBT.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  },
  requireAuth(redirectTo = 'login.html') {
    if (!CBT.getToken()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },
  requireAdmin(redirectTo = 'login.html') {
    const user = CBT.getUser();
    if (!CBT.requireAuth(redirectTo) || !user || user.role !== 'admin') {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },
  logout() {
    CBT.clearSession();
    window.location.href = 'login.html';
  },
  attachLogout() {
    const logoutButton = document.querySelector('#logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        CBT.logout();
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CBT.attachLogout();
});
