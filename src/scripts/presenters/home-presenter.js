// src/scripts/presenters/home-presenter.js
import L from "leaflet";
import { getStories,getReportById } from "../data/api";

export default class HomePresenter {
  constructor() {
    this._map = null;
    this._markers = [];
  }

  async fetchStories(limit = 30) {
    const apiList = await getStories({ size: limit, location: 1 });
    const norm = (d) => ({
      id: d.id,
      title: d.name || "untitled",
      description: d.description || "",
      image: d.photoUrl || "",
      lat: Number(d.lat),
      lng: Number(d.lon),
      createdAt: d.createdAt ? new Date(d.createdAt).getTime() : Date.now(),
    });
    const stories = apiList
      .map(norm)
      .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng));

    // === PRELOAD semua gambar story ===
    stories.forEach((story) => {
      if (story.image) {
        const img = new Image();
        img.src = story.image;
      }
    });

    return stories;
  }

  initMap(containerEl) {
    if (this._map) return this._map;

    this._map = L.map(containerEl, {
      zoomControl: true,
      center: [-2, 118],
      zoom: 5,
    });

    const baseLayers = {
      "🌏 Default": L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "&copy; OpenStreetMap contributors" }
      ),
      "🛰️ Satelit": L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "&copy; Esri, Maxar, Earthstar Geographics" }
      ),
      "🌙 Dark Mode": L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            "&copy; <a href='https://carto.com/'>CARTO</a>, OpenStreetMap contributors",
        }
      ),
    };

    baseLayers["🌏 Default"].addTo(this._map);
    L.control
      .layers(baseLayers, null, { position: "topright" })
      .addTo(this._map);

    // ✅ Safe invalidateSize
    this._map.whenReady(() => {
      setTimeout(() => {
        if (this._map && this._map._container) {
          this._map.invalidateSize();
        }
      }, 200);
      requestAnimationFrame(() => {
        if (this._map && this._map._container) {
          this._map.invalidateSize();
        }
      });
    });

    // ✅ Simpan handler agar bisa dilepas nanti
    this._onResize = () => {
      if (this._map && this._map._container) {
        this._map.invalidateSize();
      }
    };
    window.addEventListener("resize", this._onResize);

    return this._map;
  }

  destroyMap() {
    if (this._map) {
      this._map.remove();
      this._map = null;
    }

    // ✅ Lepas event listener resize agar tidak memanggil map yang sudah null
    if (this._onResize) {
      window.removeEventListener("resize", this._onResize);
      this._onResize = null;
    }
  }

  renderMarkers(items) {
    if (!this._map) return;
    this._markers.forEach((m) => this._map.removeLayer(m));
    this._markers = [];

    const icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [30, 45],
      iconAnchor: [15, 45],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    items.forEach((s) => {
      const popup = `
        <div style="text-align:center;max-width:200px;">
          ${
            s.image
              ? `<img src="${s.image}" alt="Foto story" style="width:100%;border-radius:8px;margin-bottom:6px;">`
              : ""
          }
          <strong style="display:block;font-size:1rem;margin-bottom:4px;">${this._esc(
            s.title
          )}</strong>
          <p style="font-size:0.85rem;color:#555;margin:0;">${this._esc(
            s.description
          )}</p>
        </div>`;
      const marker = L.marker([s.lat, s.lng], { icon }).addTo(this._map);
      marker.bindPopup(popup);
      this._markers.push(marker);
    });

    // ✅ Safe invalidate after render
    setTimeout(() => {
      if (this._map && this._map._container) {
        this._map.invalidateSize();
      }
    }, 300);
  }

  _esc(s) {
    return (s || "")
      .toString()
      .replace(/[<>]/g, (c) => (c === "<" ? "&lt;" : "&gt;"));
  }
}
