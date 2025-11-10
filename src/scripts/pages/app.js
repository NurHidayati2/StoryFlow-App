import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { isAuthenticated, logout, getUser } from "../data/auth.js";
import { hideLoader } from "./loader.js";

export async function applyViewTransition(contentEl, pageInstance) {
  if (!contentEl) return;
  contentEl.classList.remove("loaded");
  await new Promise((r) => setTimeout(r, 50));
  if (pageInstance && typeof pageInstance.afterRender === "function") {
    await pageInstance.afterRender();
  }
  requestAnimationFrame(() => contentEl.classList.add("loaded"));
}

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    window.addEventListener("hashchange", async () => {
      await this.renderPage();
    });
    window.addEventListener("DOMContentLoaded", async () => {
      this._renderNavAuth();
      await this.renderPage();
      
    });
    window.addEventListener("authchange", () => this._renderNavAuth());

    if (this.#drawerButton && this.#navigationDrawer) {
      this.#drawerButton.addEventListener("click", () => {
        const open =
          this.#navigationDrawer.getAttribute("data-open") === "true";
        this.#navigationDrawer.setAttribute("data-open", (!open).toString());
        this.#navigationDrawer.classList.toggle("open", !open);
      });
    }
  }

  _renderNavAuth() {
  const navList = document.getElementById('nav-list');
  if (!navList) return;

  let authLi = document.getElementById('nav-auth');
  if (!authLi) {
    authLi = document.createElement('li');
    authLi.id = 'nav-auth';
    authLi.className = 'nav-auth';
    navList.appendChild(authLi);
  }

  const isLoginPage = window.location.hash.includes("login"); // Menentukan apakah kita berada di halaman login

  if (isLoginPage) {
    // Menyembunyikan tombol Beranda, Profil, dan Tentang jika di halaman login
    document.querySelectorAll('.beranda, .profil, .tentang').forEach(button => {
      button.classList.add('hidden');
    });

    authLi.innerHTML = `
      <a class="chip chip--outline" href="#/register">Daftar Sekarang</a>
      <a class="chip chip--pink" href="#/login">Login</a>
    `;
  } else {
    if (isAuthenticated()) {
      const user = getUser();
      authLi.innerHTML = `
        <span class="hello">Hai, ${user?.name || user?.email || 'pengguna'}</span>
        <a class="chip" href="#/profile">Profil</a>
        <a id="logout-btn" class="chip chip--outline" href="#">Logout</a>
      `;
      authLi.querySelector('#logout-btn')?.addEventListener('click', () => {
        logout();
        location.hash = '#/login';
      });
    } else {
      // 👇 Register dan Login tampil lebih dulu, lalu Login di sebelah kanan
      authLi.innerHTML = `
        <a class="chip chip--outline" href="#/register">Daftar</a>
        <a class="chip chip--pink" href="#/login">Login</a>
      `;
    }
  }
}

  async renderPage() {
    const route = getActiveRoute(window.location.hash);
    const routeObj = routes[route] || routes["/"];
    if (routeObj.requireAuth && !isAuthenticated()) {
      location.hash = "#/login";
      return;
    }

    if (this.#content && routeObj.view?.render) {
      this.#content.innerHTML = await routeObj.view.render();
      // tandai menu aktif
      document
        .querySelectorAll(".nav-list a")
        .forEach((a) => a.removeAttribute("aria-current"));
      const active =
        document.querySelector(`.nav-list a[href="#${route}"]`) ||
        document.querySelector(
          `.nav-list a[href="${window.location.hash || "#/"}"]`
        );
      if (active) active.setAttribute("aria-current", "page");

      await applyViewTransition(this.#content, routeObj.view);
    }
    if (routeObj.presenter?.init) {
      try {
        await routeObj.presenter.init();
      } catch (e) {
        console.error("Presenter init error:", e);
      }
    }
  }
}

export default App;
