// src/scripts/pages/auth/register-page.js
import RegisterPresenter from './register-presenter.js';

export default class RegisterPage {
  constructor() {
    this.presenter = new RegisterPresenter();
  }

  async render() {
    return `
      <section class="container register-container" aria-labelledby="register-heading">
        <h1 id="register-heading">Daftar Akun</h1>
        <form id="register-form" class="add-form" aria-label="Form registrasi">
          <label for="name">Nama</label>
          <input id="name" name="name" type="text" required aria-required="true" placeholder="Nama kamu" />

          <label for="email">Email</label>
          <input id="email" name="email" type="email" required aria-required="true" placeholder="you@example.com" />

          <label for="password">Password</label>
          <input id="password" name="password" type="password" required aria-required="true" minlength="6" placeholder="Password" />

          <label for="password2">Ulangi Password</label>
          <input id="password2" name="password2" type="password" required aria-required="true" minlength="6" placeholder="Ulangi Password" />

          <button type="submit" class="btn">Daftar</button>
          <p>Sudah punya akun? <a href="#/login">Masuk</a></p>
        </form>
        <p id="register-status" class="status-text" aria-live="polite"></p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('register-form');
    const statusEl = document.getElementById('register-status');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value,
        password2: form.password2.value,
      };

      const validation = this.presenter.validateForm(formData);
      if (!validation.valid) {
        alert(validation.message);
        return;
      }

      statusEl.textContent = 'Membuat akun…';
      const result = await this.presenter.handleRegister(formData);

      statusEl.textContent = result.message;
      if (result.success) location.hash = '#/home';
      else alert(result.message);
    });
  }
}
