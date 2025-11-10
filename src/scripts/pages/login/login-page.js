export default class LoginPage {
  constructor() {
    this._onSubmit = null;
  }

  set onSubmit(handler) {
    this._onSubmit = handler;
  }

  async render() {
  return `
    <section class="container login-container" aria-labelledby="login-heading">
      <h1 id="login-heading">Masuk</h1>
      <form id="login-form" aria-label="Form login">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required placeholder="you@example.com" />

        <label for="password">Password</label>
        <input id="password" name="password" type="password" required minlength="6" placeholder="Password" />

        <button type="submit" class="btn btn-login">Masuk</button>
        <p>Belum punya akun? <a href="#/register">Daftar</a></p>
      </form>
      <p id="login-status" class="status-text" aria-live="polite"></p>
    </section>
  `;
}

  async afterRender() {
    const form = document.getElementById("login-form");
    const emailEl = document.getElementById("email");
    const passEl = document.getElementById("password");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this._onSubmit) {
        this._onSubmit({
          email: emailEl.value.trim(),
          password: passEl.value,
        });
      }
    });

    const btnRegister = document.getElementById("btn-register");
    btnRegister?.addEventListener("click", () => (location.hash = "#/register"));
  }

  showStatus(message) {
    const statusEl = document.getElementById("login-status");
    if (statusEl) statusEl.textContent = message || "";
  }

  showLoading() {
    import("../../pages/loader.js").then(({ showLoader }) =>
      showLoader(document.body)
    );
  }

  hideLoading() {
    import("../../pages/loader.js").then(({ hideLoader }) => hideLoader());
  }

  async showSuccess(message = "Berhasil Login!") {
    const Swal = (await import("sweetalert2")).default;
    Swal.fire({
      icon: "success",
      title: message,
      showConfirmButton: false,
      timer: 1800,
    });
  }

  async showError(message) {
    const Swal = (await import("sweetalert2")).default;
    Swal.fire({
      icon: "error",
      title: "Login Gagal",
      text: message || "Periksa kembali email dan password kamu.",
      confirmButtonColor: "#66ccff",
    });
  }
}
