// src/scripts/auth/profile-page.js
import ProfilePresenter from './profile-presenter.js';

export default class ProfilePage {
  constructor() {
    this.presenter = new ProfilePresenter();
  }

  async render() {
    const user = this.presenter.getUserData();

    return `
      <section class="container profile" aria-labelledby="profile-heading">
        <h1 id="profile-heading" class="sr-only">Profil</h1>

        <article class="profile-card" aria-labelledby="profile-name">
          <div class="profile-left">
            <div class="profile-avatar ${user.photo ? 'img' : ''}" 
                 ${user.photo ? `style="background: center / cover no-repeat url('${user.photo}');"` : ''}>
              <span>${user.initial}</span>
            </div>
            <div class="profile-meta">
              <h2 id="profile-name" class="profile-name">${user.name}</h2>
              <p class="profile-role">${user.role}</p>
              <p class="profile-email muted">${user.email}</p>
            </div>
          </div>

          <button type="button" id="logout-btn" class="btn-logout-outline" aria-label="Keluar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" 
                    fill="none" stroke="currentColor" stroke-width="2" 
                    stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 17l5-5-5-5M21 12H9" 
                    fill="none" stroke="currentColor" stroke-width="2" 
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Logout</span>
          </button>
        </article>
      </section>
    `;
  }

  async afterRender() {
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', () => this.presenter.handleLogout());
  }
}
