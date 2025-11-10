// src/scripts/pages/Loader.js
export function showLoader(container = document.body) {
  if (document.getElementById("page-loader")) return;

  const loader = document.createElement("div");
  loader.id = "page-loader";
  loader.innerHTML = `
    <div class="loader-backdrop">
      <div class="loader-spinner">
        <div class="spinner-circle"></div>
        <p class="loader-text">Memuat...</p>
      </div>
    </div>
  `;

  // mulai transparan dulu untuk efek fade-in
  loader.style.opacity = "0";
  container.appendChild(loader);

  // jeda sedikit agar transisi halus
  requestAnimationFrame(() => {
    loader.style.transition = "opacity 0.4s ease";
    loader.style.opacity = "1";
  });
}

export function hideLoader() {
  const loader = document.getElementById("page-loader");
  if (loader) {
    loader.style.opacity = "0";
    loader.style.transition = "opacity 0.4s ease";
    setTimeout(() => {
      if (document.body.contains(loader)) loader.remove();
    }, 500); // cukup 0.5 detik aman
  }
}

