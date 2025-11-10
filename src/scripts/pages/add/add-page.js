import L from "leaflet";
import AddPresenter from "../add/add-presenter.js";
import { showLocalNotification } from "../../index.js";

class AddPage {
  constructor() {
    this.presenter = new AddPresenter({
      onSubmit: (data) => this._handleSubmit(data),
      onCameraOpen: () => this._toggleCameraUI(true),
      onCameraClose: () => this._toggleCameraUI(false),
      onCapture: (file) => (this._els.image.files = file),
      onPickLocation: (lat, lng) => {
        this._els.lat.value = lat;
        this._els.lng.value = lng;
      },
    });
  }

  async render() {
    return `
      <section class="add-page-section" aria-labelledby="add-heading">
  <h1 id="add-heading">Tambah Data Story</h1>

  <div id="form-status" aria-live="polite" class="sr-only"></div>

  <form id="add-form" class="add-form" aria-label="Form tambah data">
    <label for="title">Judul</label>
    <input id="title" name="title" required />

    <label for="description">Deskripsi</label>
    <textarea id="description" name="description" required></textarea>

    <label for="image">Gambar (opsional)</label>
    <input id="image" name="image" type="file" accept="image/*" />

    <div class="camera-controls">
      <button type="button" id="open-camera" class="btn">Gunakan Kamera</button>
      <button type="button" id="capture" class="btn" disabled>Ambil Foto</button>
      <button type="button" id="close-camera" class="btn" disabled>Tutup Kamera</button>
    </div>

    <div id="camera-area" style="display:none;">
      <video id="video" autoplay playsinline style="max-width:100%;"></video>
      <canvas id="canvas" style="display:none;"></canvas>
    </div>

    <p style="margin:8px 0 6px 0;font-weight:700;color:#3b3558;">Pilih lokasi pada peta di bawah</p>
    <div id="pick-map" style="height:300px;"></div>

    <div class="coordinates">
        <div class="form-group coordinate-input">
          <label for="latitude">Latitude</label>
          <input type="text" id="latitude" placeholder="Koordinat Latitude">
        </div>
        <div class="form-group coordinate-input">
          <label for="longitude">Longitude</label>
          <input type="text" id="longitude" placeholder="Koordinat Longitude">
        </div>
      </div>
    </div>

    <button type="submit" class="btn">Kirim</button>
  </form>
</section>

    `;
  }

  async afterRender() {
    this._cacheEls();
    this._bindUIEvents();
    this.presenter.initMapPicker(this._els.map);

    window.addEventListener("hashchange", () => this.destroy());
  }

  _cacheEls() {
    this._els = {
      form: document.getElementById("add-form"),
      title: document.getElementById("title"),
      description: document.getElementById("description"),
      image: document.getElementById("image"),
      open: document.getElementById("open-camera"),
      capture: document.getElementById("capture"),
      close: document.getElementById("close-camera"),
      video: document.getElementById("video"),
      canvas: document.getElementById("canvas"),
      cameraArea: document.getElementById("camera-area"),
      lat: document.getElementById("latitude"), // <-- Disini diganti
      lng: document.getElementById("longitude"), // <-- Disini diganti
      map: document.getElementById("pick-map"),
    };
  }

  _bindUIEvents() {
    this._els.open.addEventListener("click", () =>
      this.presenter.startCamera(this._els.video)
    );
    this._els.capture.addEventListener("click", () =>
      this.presenter.capturePhoto(this._els.video, this._els.canvas)
    );
    this._els.close.addEventListener("click", () =>
      this.presenter.stopCamera()
    );
    this._els.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {
        title: this._els.title.value.trim(),
        description: this._els.description.value.trim(),
        lat: parseFloat(this._els.lat.value),
        lng: parseFloat(this._els.lng.value),
        file: this._els.image.files?.[0],
      };
      this.presenter.submit(data);
    });
  }

  _toggleCameraUI(isActive) {
    this._els.cameraArea.style.display = isActive ? "block" : "none";
    this._els.capture.disabled = !isActive;
    this._els.close.disabled = !isActive;
    this._els.open.disabled = isActive;
  }

  async _handleSubmit(data) {
  console.log("Form data siap dikirim:", data);
  try {
    const result = await this.presenter.submit(data);
    console.log("✅ Story berhasil dibuat:", result);

    window.dispatchEvent(new Event("storyAdded"));

    await showLocalNotification(
      "Story berhasil dibuat 🎉",
      `Deskripsi: ${data.description}`
    );

    // pindahkan halaman setelah notifikasi tampil
    window.location.hash = "#/home";
  } catch (err) {
    console.error("❌ Gagal menambahkan story:", err);
  }
}

  destroy() {
    this.presenter.stopCamera();
  }
}

export default AddPage;
