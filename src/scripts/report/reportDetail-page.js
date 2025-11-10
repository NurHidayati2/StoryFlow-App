import ReportDetailPresenter from "./reportDetail-presenter.js";
import Database from "../data/database.js";
import CityCareAPI from "../data/api.js"; // atau apiModel Anda

export default class ReportDetailPage {
  constructor(reportId) {
    this.reportId = reportId;
    this.presenter = null;
    this._currentReport = null;
  }

  async render() {
    // Sediakan area untuk konten dan info/tombol bookmark
    return `
      <section class="report-detail-page">
        <div id="report-detail-content">Memuat detail laporan...</div>
        <div id="bookmark-action"></div>
        <div id="report-status"></div>
      </section>
    `;
  }

  async afterRender() {
    this.presenter = new ReportDetailPresenter(this.reportId, {
      view: this,
      apiModel: CityCareAPI, // atau model API Anda
      dbModel: Database,
    });
    await this.presenter.fetchAndShowDetail();
  }

  // UI Metode:
  renderReportDetail(report) {
    this._currentReport = report; // simpan!
    document.getElementById("report-detail-content").innerHTML = `
      <h2>${report.title}</h2>
      <p>${report.description}</p>
      <img src="${report.image || "/logo.png"}" style="max-width:320px;">
      <small>Dibuat: ${new Date(report.createdAt).toLocaleString("id-ID")}</small>
    `;
  }

  toggleBookmarkButton(isBookmarked, report) {
    const container = document.getElementById("bookmark-action");
    if (!container) return;
    if (isBookmarked) {
      container.innerHTML = `<button id="btn-remove-bookmark">Hapus Bookmark</button>`;
      document.getElementById("btn-remove-bookmark")
        .onclick = () => this.presenter.removeReportFromBookmark(report.id, report);
    } else {
      container.innerHTML = `<button id="btn-save-bookmark">Simpan ke Bookmark</button>`;
      document.getElementById("btn-save-bookmark")
        .onclick = () => this.presenter.saveReportToBookmark(report);
    }
  }

  showBookmarkSuccess(message) {
    document.getElementById("report-status").textContent = message;
  }
  showBookmarkFail(message) {
    document.getElementById("report-status").textContent = message;
  }

  renderError(message) {
    document.getElementById("report-detail-content").innerHTML = `<p style="color:red">${message}</p>`;
  }
}
