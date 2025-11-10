import L from "leaflet";
import { addStory } from "../../data/api";
import { showLoader, hideLoader } from "../../pages/loader.js";
import { alertSuccess, alertError } from "../../utils/alert.js";

export default class AddPresenter {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this._map = null;
    this._stream = null;
  }

  // --- Kamera ---
  async startCamera(videoEl) {
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoEl.srcObject = this._stream;
      this.callbacks.onCameraOpen?.(); // ini akan aktifkan tombol capture & close
    } catch (err) {
      await alertError("Kamera Gagal", err.message);
    }
  }

  stopCamera() {
    if (this._stream) {
      this._stream.getTracks().forEach((t) => t.stop());
      this._stream = null;
    }
    this.callbacks.onCameraClose?.(); // ini akan nonaktifkan tombol capture/close
  }

  async capturePhoto(videoEl, canvasEl) {
    if (!this._stream) return;
    const ctx = canvasEl.getContext("2d");
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    ctx.drawImage(videoEl, 0, 0);
    const blob = await new Promise((r) => canvasEl.toBlob(r, "image/png"));
    const file = new File([blob], "capture.png", { type: "image/png" });
    const dt = new DataTransfer();
    dt.items.add(file);
    this.callbacks.onCapture?.(dt.files);
    await alertSuccess("Berhasil!", "Foto berhasil diambil ✅");

    this.stopCamera();
  }

  // --- Peta Picker ---
  initMapPicker(mapEl) {
    this._map = L.map(mapEl).setView([-2, 118], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(this._map);

    const icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [30, 40],
      iconAnchor: [15, 40],
    });

    this._map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (this._picker) this._map.removeLayer(this._picker);
      this._picker = L.marker([lat, lng], { icon }).addTo(this._map);
      this.callbacks.onPickLocation?.(lat.toFixed(6), lng.toFixed(6));
    });

    setTimeout(() => this._map.invalidateSize(), 250);
  }

  // --- Submit ---
  async submit({ title, description, lat, lng, file }) {
    if (title.length < 3)
      return alertError("Judul terlalu pendek", "Minimal 3 karakter.");
    if (description.length < 10)
      return alertError("Deskripsi terlalu singkat", "Minimal 10 karakter.");
    if (Number.isNaN(lat) || Number.isNaN(lng))
      return alertError(
        "Lokasi belum dipilih",
        "Klik pada peta untuk memilih lokasi."
      );
    if (!file)
      return alertError(
        "Tidak ada gambar",
        "Ambil atau pilih foto terlebih dahulu."
      );

    try {
      showLoader(document.body);
      const response = await addStory({ description, file, lat, lng });
      hideLoader();
      await alertSuccess("Berhasil!", "Cerita berhasil dikirim 🎉");
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.active?.postMessage({
            type: "NEW_STORY",
            payload: {
              title,
              description,
              icon: "/logo.png",
            },
          });
        });
      }
      window.location.hash = "#/home";

      setTimeout(() => {
        window.dispatchEvent(new Event("storyAdded"));
      }, 300);
    } catch (err) {
      hideLoader();
      await alertError("Gagal Mengirim", err.message);
    } finally {
      hideLoader();
    }
  }
}
