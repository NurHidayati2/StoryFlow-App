import { login } from "../../data/auth.js";

export default class LoginPresenter {
  constructor(view) {
    this.view = view;
  }

  async init() {
    this.view.onSubmit = async ({ email, password }) => {
      if (!email || !password) {
        return this.view.showError("Email dan password wajib diisi!");
      }

      try {
        this.view.showStatus("Memproses login…");
        this.view.showLoading();

        await login({ email, password });

        this.view.hideLoading();
        this.view.showStatus("Login berhasil. Mengalihkan…");
        await this.view.showSuccess("Selamat datang kembali 💙");

        location.hash = "#/home";
      } catch (err) {
        console.error(err);
        this.view.hideLoading();
        this.view.showStatus("Login gagal.");
        this.view.showError(err.message);
      } finally {
        this.view.hideLoading();
      }
    };
  }
}
