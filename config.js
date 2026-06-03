// ========== KONFIGURASI APLIKASI AL ==========
// CUKUP EDIT FILE INI SAAT GANTI URL APPS SCRIPT

const CONFIG = {
    // Gunakan URL Cloudflare Worker Anda
    API_URL: 'https://aplikasi-al.al-asyqy.workers.dev/'
};

// Jangan ubah kode di bawah ini
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}