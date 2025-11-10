export default class AboutPage {
  constructor() {
    this._onNavigate = null;
  }

  set onNavigate(handler) {
    this._onNavigate = handler;
  }

  async render() {
    return `
      <section class="container about-container">
        <h1>About StoryFlow</h1>
        <div class="about-content">
          <p>
            StoryFlow adalah platform tempat Anda dapat berbagi cerita dan pengalaman hidup
            melalui cerita bergambar yang dapat disertai dengan lokasi dan deskripsi singkat.
            Aplikasi ini memberikan kesempatan kepada setiap pengguna untuk menceritakan kisah
            mereka kepada dunia dalam format yang kreatif dan mudah diakses.
          </p>

          <h2>Fitur Utama</h2>
          <ul class="feature-list">
            <li>📝 <strong>Buat Cerita</strong>: Pengguna dapat menulis cerita dengan berbagai kategori, menambahkan gambar dan lokasi.</li>
            <li>🌍 <strong>Peta Lokasi</strong>: Setiap cerita dapat disertai dengan penanda lokasi di peta.</li>
            <li>🔄 <strong>Berbagi Cerita</strong>: Cerita dapat dibagikan kepada teman-teman atau dijadikan koleksi pribadi.</li>
            <li>🛠 <strong>Alat Interaktif</strong>: Tambahkan foto dan teks dengan berbagai filter dan tema.</li>
          </ul>

          <h2>Tentang Kami</h2>
          <p>
            StoryFlow dikembangkan oleh tim muda yang bersemangat dalam membangun aplikasi sosial
            yang mudah digunakan dan bermanfaat bagi semua orang. Kami percaya setiap orang punya
            cerita yang layak untuk dibagikan kepada dunia.
          </p>

          <button id="btn-home" class="btn">Kembali ke Beranda</button>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const btnHome = document.getElementById("btn-home");
    if (btnHome) {
      btnHome.addEventListener("click", () => {
        if (this._onNavigate) this._onNavigate("#/home");
      });
    }
  }

  navigateTo(hash) {
    location.hash = hash;
  }
}
