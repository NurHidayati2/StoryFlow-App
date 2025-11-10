export default class AboutPresenter {
  constructor(view) {
    this.view = view;
  }

  async init() {
    // Pasang handler navigasi tanpa manipulasi DOM
    this.view.onNavigate = (targetHash) => {
      this.view.navigateTo(targetHash);
    };
  }
}
