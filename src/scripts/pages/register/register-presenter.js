// src/scripts/pages/auth/register-presenter.js
import { register } from '../../data/auth.js';

export default class RegisterPresenter {
  constructor() {}

  validateForm({ name, email, password, password2 }) {
    if (name.trim().length < 3)
      return { valid: false, message: 'Nama minimal 3 karakter.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return { valid: false, message: 'Email tidak valid.' };
    if (password.length < 6)
      return { valid: false, message: 'Password minimal 6 karakter.' };
    if (password !== password2)
      return { valid: false, message: 'Konfirmasi password tidak sama.' };

    return { valid: true, message: '' };
  }

  async handleRegister({ name, email, password }) {
    try {
      await register({ name, email, password });
      return { success: true, message: 'Berhasil daftar. Mengalihkan…' };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message || 'Registrasi gagal.' };
    }
  }
}
