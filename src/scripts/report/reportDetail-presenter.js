import Database from "../data/database.js"; // path benar!

export default class ReportDetailPresenter {
  #reportId;
  #view;
  #apiModel;
  #dbModel;

  constructor(reportId, { view, apiModel, dbModel }) {
    this.#reportId = reportId;
    this.#view = view;
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
  }

  async fetchAndShowDetail() {
    try {
      const result = await this.#apiModel.getReportById(this.#reportId); // pastikan method ini ada!
      const report = result?.data || result; // tergantung shape API Anda
      this.#view.renderReportDetail(report);

      // Cek status bookmark
      const isSaved = await this.isReportBookmarked(report.id);
      this.#view.toggleBookmarkButton(isSaved, report);
    } catch (e) {
      this.#view.renderError("Gagal memuat detail laporan: " + (e?.message || e));
    }
  }

  async saveReportToBookmark(report) {
    try {
      await this.#dbModel.putReport(report);
      this.#view.showBookmarkSuccess('Laporan berhasil disimpan!');
      this.#view.toggleBookmarkButton(true, report);
    } catch (err) {
      this.#view.showBookmarkFail('Gagal menyimpan laporan: ' + err.message);
    }
  }

  async removeReportFromBookmark(id, report) {
    try {
      await this.#dbModel.deleteReport(id);
      this.#view.showBookmarkSuccess('Laporan dihapus!');
      this.#view.toggleBookmarkButton(false, report);
    } catch (err) {
      this.#view.showBookmarkFail('Gagal hapus laporan: ' + err.message);
    }
  }

  async isReportBookmarked(id) {
    const saved = await this.#dbModel.getReport(id);
    return !!saved;
  }
}
