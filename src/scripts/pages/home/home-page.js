// src/scripts/pages/home/home-page.js
import "leaflet/dist/leaflet.css";
import { showLoader, hideLoader } from "../loader.js";
import Swal from "sweetalert2";
import HomePresenter from "../../presenters/home-presenter";
import { getStories, sendTestNotification } from "../../data/api";
import MapPresenter from "../map/map-presenter.js";
import Database from "../../data/database.js";

export default class HomePage {
  constructor() {
    this.presenter = new HomePresenter();
    this._mapPresenter = null;
    this._bookmarkedIds = new Set();
  }

  async render() {
  return `
    <section class="container home">
      <div class="home-actions">
        <a href="#/add" class="btn-add-story">
          <svg class="ico" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Add Story
        </a>
        <button id="btn-show-bookmark" type="button" class="btn-bookmark-toggle">Tampilkan Bookmark</button>
        <button id="btn-show-all" type="button" class="btn-bookmark-toggle" style="display:none;">Tampilkan Semua Cerita</button>
        <button id="btn-refresh" type="button" class="btn-refresh-story" aria-label="Muat ulang" style="margin-left:8px;">
          <svg class="ico" viewBox="0 0 24 24" fill="none">
            <path d="M4.5 12A7.5 7.5 0 0 1 20 9m0 0V4m0 5h-5"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M19.5 12A7.5 7.5 0 0 1 4 15m0 0v5m0-5h5"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="home-filters">
        <input id="story-search" class="search-bar-centered" type="text" placeholder="Cari judul atau deskripsi...">
      </div>
      <div class="hero-banner">
        <div class="hero-left">
          <img class="hero-logo" src="/logo.png" alt="Logo StoryFlow" />
          <h1 class="brand-title">StoryFlow</h1>
        </div>
        <p class="hero-sub">Cerita Terbaru</p>
      </div>
      <div class="stories-strip">
        <div id="stories-row" class="stories-row" tabindex="0" aria-live="polite"></div>
      </div>
      <div class="map-wrap">
        <div id="home-map" class="map-view" style="height:430px;"></div>
      </div>
    </section>`;
}

  async afterRender() {
    const row = document.getElementById("stories-row");
    const mapEl = document.getElementById("home-map");
    const btnRefresh = document.getElementById("btn-refresh");
    const btnShowBookmark = document.getElementById("btn-show-bookmark");
    const btnShowAll = document.getElementById("btn-show-all");
    const searchInput = document.getElementById("story-search");
    this._mapPresenter = new MapPresenter();

    // Ambil data bookmark ID dari DB
    const loadBookmarkIds = async () => {
      const bookmarks = await Database.getAllReports();
      this._bookmarkedIds = new Set(bookmarks.map((item) => item.id));
    };

    let currentMode = "all"; // "bookmark" atau "all"
    let storyRawItems = []; // simpan semua item yang tampil di mode sedang aktif
    let searchQuery = ""; // keyword search aktif

    function renderWithSearch(items) {
      let filtered = items;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = items.filter(
          (story) =>
            (story.title || "").toLowerCase().includes(q) ||
            (story.description || "").toLowerCase().includes(q)
        );
      }
      this._lastRenderItems = filtered;
      this._renderCards(row, this._lastRenderItems);
    }

    const loadApiStories = async () => {
      try {
        showLoader(document.body);
        await loadBookmarkIds();
        const items = await this.presenter.fetchStories();
        // Hapus yang sudah di-bookmark dari home!
        const filtered = items.filter(
          (item) => !this._bookmarkedIds.has(item.id)
        );
        storyRawItems = filtered.slice(0, 12); // simpan cache story asli yg tampil
        renderWithSearch.call(this, storyRawItems);
        this._lastRenderItems = filtered.slice(0, 12);
        this._renderCards(row, this._lastRenderItems);
        currentMode = "all";
        btnShowBookmark.style.display = "";
        btnShowAll.style.display = "none";
        if (mapEl && !this._mapPresenter._map) {
          this._mapPresenter.initMap(mapEl);
          this._mapPresenter.renderMarkers(filtered.slice(0, 20));
          if (this._mapPresenter._map) this._mapPresenter._map.invalidateSize();
        }
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Cerita 😢",
          text: e.message || "Terjadi kesalahan saat memuat data.",
          confirmButtonColor: "#66ccff",
        });
      } finally {
        hideLoader();
      }
    };

    const loadBookmarks = async () => {
      const bookmarks = await Database.getAllReports();
      this._bookmarkedIds = new Set(bookmarks.map((item) => item.id));
      storyRawItems = bookmarks; // simpan cache story bookmark
      renderWithSearch.call(this, storyRawItems);
      this._lastRenderItems = bookmarks;
      this._renderCards(row, this._lastRenderItems);
      currentMode = "bookmark";
      btnShowBookmark.style.display = "none";
      btnShowAll.style.display = "";
    };

    searchInput?.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderWithSearch.call(this, storyRawItems);
    });

    await loadApiStories();

    btnRefresh?.addEventListener("click", loadApiStories);
    btnShowBookmark?.addEventListener("click", loadBookmarks);
    btnShowAll?.addEventListener("click", loadApiStories);

    window.addEventListener("storyAdded", loadApiStories);

    // ✅ Pastikan saat hash kembali ke #/home, map diperbarui lagi
    window.addEventListener("hashchange", async () => {
      if (location.hash === "#/home") {
        const mainContent = document.getElementById("main-content");
        mainContent.innerHTML = await this.render();
        await this.afterRender();

        this.presenter.destroyMap();
        await new Promise((r) => setTimeout(r, 200));
        this.presenter.initMap(document.getElementById("home-map"));
        const items = await this.presenter.fetchStories();
        this.presenter.renderMarkers(items.slice(0, 20));
        if (this.presenter._map) this.presenter._map.invalidateSize();
      } else {
        this.presenter.destroyMap();
      }
    });

    row?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight")
        row.scrollBy({ left: 240, behavior: "smooth" });
      if (e.key === "ArrowLeft")
        row.scrollBy({ left: -240, behavior: "smooth" });
    });

    row?.addEventListener("click", async (e) => {
      if (e.target.classList.contains("btn-bookmark")) {
        const id = e.target.dataset.id;
        let story = this._lastRenderItems?.find((s) => s.id === id);
        if (!story) story = await Database.getReport(id);
        if (!story) return Swal.fire("Data tidak ditemukan", "", "warning");

        if (this._bookmarkedIds.has(id)) {
          // HAPUS dari bookmark mode, tapi jangan reload semua!
          await Database.deleteReport(id);
          this._bookmarkedIds.delete(id);

          if (currentMode === "bookmark") {
            // Hilangkan dari this._lastRenderItems dan render ulang/sekali
            this._lastRenderItems = this._lastRenderItems.filter(
              (s) => s.id !== id
            );
            this._renderCards(row, this._lastRenderItems);
            // Tambahkan data ke home stories (tapi jangan reload, cukup broadcast custom event)
            window.dispatchEvent(
              new CustomEvent("restoreHomeStory", { detail: story })
            );
          }
        } else {
          // Tambahkan ke bookmark, hapus dari home
          await Database.putReport(story);
          this._bookmarkedIds.add(id);
          if (currentMode === "all") {
            this._lastRenderItems = this._lastRenderItems.filter(
              (s) => s.id !== id
            );
            this._renderCards(row, this._lastRenderItems);
          }
        }
      }
    });
    window.addEventListener("restoreHomeStory", (e) => {
      if (currentMode === "all" && e.detail) {
        if (!this._lastRenderItems.find((s) => s.id === e.detail.id)) {
          this._lastRenderItems.unshift(e.detail);
          this._renderCards(row, this._lastRenderItems);
        }
      }
    });
  }
  _renderCards(container, items) {
    const esc = (s = "") =>
      s.replace(/[<>]/g, (c) => (c === "<" ? "&lt;" : "&gt;"));
    const formatDate = (ts) => {
      const d = new Date(ts);
      const tanggal = d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const waktu = d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return { tanggal, waktu };
    };

    container.innerHTML =
      items && items.length
        ? items
            .map((s) => {
              const { tanggal, waktu } = formatDate(s.createdAt);
              const isBookmarked =
                this._bookmarkedIds.has && this._bookmarkedIds.has(s.id);
              return `
        <article class="story-card" tabindex="0">
          <div class="thumb">
            <img src="${s.image}" alt="Story ${esc(s.title)}"
                onerror="this.onerror=null;this.src='/logo.png';" />
          </div>
          <div class="story-info">
            <h4 class="story-title">${esc(s.title)}</h4>
            <p class="story-date">📅 ${tanggal}<br>🕓 ${waktu} WIB</p>
            <p class="story-desc">${esc(s.description).slice(0, 60)}...</p>
          </div>
          <div class="story-actions">
            <button 
              class="btn-bookmark" 
              data-id="${esc(s.id)}">${
                isBookmarked ? "Hapus Bookmark" : "Tambah ke Bookmark"
              }</button>
          </div>
        </article>
      `;
            })
            .join("")
        : `<p>Tidak ada cerita ditemukan.</p>`;
  }
}
