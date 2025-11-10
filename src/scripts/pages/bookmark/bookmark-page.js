import Database from "../../data/database.js"; // pastikan lokasi ini sesuai project Anda

class BookmarkPage {
  constructor() {
    this.presenter = null;
    this._bookmarksRaw = [];
    this._filteredBookmarks = [];
  }

  async render() {
    return `
      <section class="bookmark-container">
        <h1>Bookmark Laporan</h1>
        <div class="bookmark-filters">
          <input type="text" id="bookmark-search" class="input-filter" placeholder="Cari judul atau deskripsi...">
          <select id="bookmark-sort" class="input-filter">
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="az">A-Z Judul</option>
            <option value="za">Z-A Judul</option>
          </select>
        </div>
        <div id="bookmark-list"></div>
      </section>
    `;
  }

  async afterRender() {
    this._els = {
      list: document.getElementById("bookmark-list"),
      search: document.getElementById("bookmark-search"),
      sort: document.getElementById("bookmark-sort"),
    };

    // Render bookmark pertama kali
    await this.reloadBookmarks();

    // Event untuk search (skilled)
    this._els.search.addEventListener("input", () => this.applyFilterSort());
    this._els.sort.addEventListener("change", () => this.applyFilterSort());
  }

  async reloadBookmarks() {
    this._bookmarksRaw = await Database.getAllReports();
    this.applyFilterSort();
  }

  applyFilterSort() {
    // --- FILTER / SEARCH
    const qs = (this._els.search.value || "").toLowerCase();
    let filtered = this._bookmarksRaw.filter(
      (item) =>
        (item.title || "").toLowerCase().includes(qs) ||
        (item.description || "").toLowerCase().includes(qs)
    );
    // --- SORTING
    const sort = this._els.sort.value;
    if (sort === "az") {
      filtered = filtered.slice().sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sort === "za") {
      filtered = filtered.slice().sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    } else if (sort === "oldest") {
      filtered = filtered.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === "newest") {
      filtered = filtered.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    this._filteredBookmarks = filtered;
    this.renderBookmarkList();
  }

  renderBookmarkList() {
    if (!this._filteredBookmarks.length) {
      this._els.list.innerHTML = "<p>Tidak ada bookmark laporan.</p>";
      return;
    }
    this._els.list.innerHTML = this._filteredBookmarks
      .map(
        (item) => `
        <div class="bookmark-item">
          <h3>${item.title || item.name}</h3>
          <p>${item.description || ""}</p>
          <small>${(item.createdAt ? new Date(item.createdAt).toLocaleString("id-ID") : "")}</small><br>
          <button class="btn-delete-bookmark" data-id="${item.id}">Hapus</button>
        </div>
      `
      )
      .join("");

    // Rebind event Hapus
    this._els.list.querySelectorAll(".btn-delete-bookmark").forEach((btn) => {
      btn.addEventListener("click", () => this.removeBookmark(btn.dataset.id));
    });
  }

  async showBookmarkList() {
    let list = await Database.getAllReports();
    const searchVal = this._els.search.value.trim().toLowerCase();
    if (searchVal) {
      list = list.filter((item) =>
        (item.title || item.name || "").toLowerCase().includes(searchVal)
      );
    }
    if (!list.length) {
      this._els.list.innerHTML = "<p>Tidak ada bookmark laporan.</p>";
      return;
    }
    this._els.list.innerHTML = list
      .map(
        (item) => `
        <div class="bookmark-item">
          <h3>${item.title || item.name}</h3>
          <p>${item.description || ""}</p>
          <button class="btn-delete-bookmark" data-id="${
            item.id
          }">Hapus</button>
        </div>
      `
      )
      .join("");

    // Bind event hapus (delete)
    this._els.list.querySelectorAll(".btn-delete-bookmark").forEach((btn) => {
      btn.addEventListener("click", () => this.removeBookmark(btn.dataset.id));
    });
  }

  async removeBookmark(id) {
    await Database.deleteReport(id);
    this.showBookmarkList();
    alert("Bookmark berhasil dihapus.");
  }
}

export default BookmarkPage;
