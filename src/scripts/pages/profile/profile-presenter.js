// src/scripts/auth/profile-presenter.js
import { getUser, logout } from '../../data/auth.js';

export default class ProfilePresenter {
  constructor() {}

  getUserData() {
    const u = getUser() || {};
    return {
      name: u.name || u.username || (u.email ? u.email.split('@')[0] : 'Pengguna'),
      email: u.email || '',
      role: u.role || 'Storyteller',
      initial: (u.name || u.username || 'U')[0].toUpperCase(),
      photo: u.photo || null,
    };
  }

  handleLogout() {
    logout();
    location.hash = '#/login';
  }
}
