import "leaflet/dist/leaflet.css";
import { getStories } from "../../data/api";
import MapPresenter from "./map-presenter";

class MapPage {
  constructor() {
    this.presenter = new MapPresenter();
  }

  async render() {
    return `
    <section aria-labelledby="map-heading" class="container">
      <h1 id="map-heading">Peta Lokasi - Story</h1>
      <div id="map-controls" class="map-controls" role="region" aria-label="Map controls">
        <a href="#/add" class="btn">Tambah Data</a>
        <input id="filter" type="search" placeholder="Filter judul/deskripsi…" aria-label="Filter judul/deskripsi" />
      </div>
      <div class="container" style="gap:1rem;">
        <div id="map" class="map" tabindex="0" style="height:500px;"></div>
        <aside id="list" class="list" aria-live="polite"></aside>
      </div>
    </section>`;
  }

  async afterRender() {
    const data = await this._loadData();
    this.presenter.initMap("map");
    this._renderList(data);
    this.presenter.renderMarkers(data, (item) => this._highlightItem(item.id));

    // Event listener untuk data baru
    window.addEventListener("storyAdded", async () => {
      const newData = await this._loadData();
      this._renderList(newData);
      this.presenter.renderMarkers(newData, (item) => this._highlightItem(item.id));
    });

    // Filter
    const filterEl = document.getElementById("filter");
    if (filterEl) {
      filterEl.addEventListener("input", (e) => this._filterList(e.target.value));
    }
  }

  async _loadData() {
    try {
      return await getStories();
    } catch {
      return [];
    }
  }

  _renderList(data) {
    const listEl = document.getElementById("list");
    listEl.innerHTML = "";
    data.forEach((item) => {
      const el = document.createElement("div");
      el.className = "list-item";
      el.setAttribute("data-id", item.id);
      el.innerHTML = `
        <h1>${item.title}</h1>
        <p>${item.description}</p>
        ${item.image ? `<img src="${item.image}" alt="" style="max-width:80px;"/>` : ""}
      `;
      el.addEventListener("click", () => {
        this.presenter.updateView(item.lat, item.lng);
      });
      listEl.appendChild(el);
    });
  }

  _highlightItem(id) {
    document.querySelectorAll(".list-item").forEach((el) =>
      el.classList.toggle("active", el.dataset.id === id)
    );
  }

  _filterList(query) {
    const items = document.querySelectorAll(".list-item");
    query = query.toLowerCase();
    items.forEach((el) => {
      const text = el.innerText.toLowerCase();
      el.style.display = text.includes(query) ? "block" : "none";
    });
  }
}

export default MapPage;
