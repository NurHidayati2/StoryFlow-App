import L from "leaflet";

export default class MapPresenter {
  constructor() {
    this.map = null;
    this.markers = [];
    this.tileLayers = {};
    this.layerControl = null;
  }

  // Inisialisasi peta
  initMap(container) {
    if (this.map) return;

    // --- Define Basemaps ---
    const openStreet = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "© OpenStreetMap contributors" }
    );

    const darkMode = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { attribution: "© CartoDB, OpenStreetMap contributors" }
    );

    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "© Esri, Earthstar Geographics, Esri, HERE, Garmin, FAO, NOAA, USGS, OpenStreetMap contributors"
      }
    );

    // --- Inisialisasi Map ---
    this.map = L.map(container, {
      center: [-2.5, 118], // Indonesia tengah
      zoom: 5,
      layers: [openStreet]
    });

    // Layer group untuk marker
    this.layerGroup = L.layerGroup().addTo(this.map);

    // --- Kontrol Layer Switch ---
    this.tileLayers = {
      "OpenStreetMap": openStreet,
      "Dark Mode": darkMode,
      "Satelit": satellite
    };

    this.layerControl = L.control.layers(this.tileLayers, {}).addTo(this.map);
  }

  // Tambahkan marker ke peta
  renderMarkers(data, onMarkerClick) {
    this.layerGroup.clearLayers();

    const storyIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -35],
      shadowSize: [41, 41],
    });

    data.forEach(item => {
      const lat = Number(item.lat);
      const lng = Number(item.lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      const marker = L.marker([lat, lng], { icon: storyIcon })
        .addTo(this.layerGroup)
        .bindPopup(`<strong>${this._esc(item.title)}</strong><br>${this._esc(item.description)}`);

      marker.on("click", () => onMarkerClick?.(item));
    });
  }

  // Update posisi & ukuran peta
  updateView(lat, lng, zoom = 13) {
    if (this.map) {
      this.map.setView([lat, lng], zoom);
      setTimeout(() => this.map.invalidateSize(), 500);
    }
  }

  // Escaping HTML
  _esc(s) {
    return (s || "").toString().replace(/[<>]/g, c => c === "<" ? "&lt;" : "&gt;");
  }
}
