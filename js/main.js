// ========== MAIN.JS ==========
// Utility functions yang dipakai banyak halaman

// Format Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(angka);
}

// Format Tanggal Indonesia
function formatTanggal(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
}

// Set default tanggal hari ini
function setDefaultDate(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = new Date().toISOString().slice(0, 10);
    }
}