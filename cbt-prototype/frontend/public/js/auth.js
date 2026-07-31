async function submitAuthForm(url, payload) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: CBT.getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      const error = data.error || 'Unable to complete request';
      throw new Error(error);
    }

    CBT.setToken(data.token);
    CBT.setUser(data.user);
    window.location.href = 'dashboard.html';
  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (CBT.getToken()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const loginForm = document.querySelector('#login-form');
  const registerForm = document.querySelector('#register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      await submitAuthForm('/api/auth/login', {
        email: formData.get('email'),
        password: formData.get('password')
      });
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(registerForm);
      await submitAuthForm('/api/auth/register', {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
      });
    });
  }
});
