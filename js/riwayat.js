// ========== RIWAYAT.JS ==========
document.getElementById('riwayatTransferBtn')?.addEventListener('click', function() {
    document.getElementById('riwayatTransferList').style.display = 'block';
    document.getElementById('riwayatTTList').style.display = 'none';
    this.classList.add('active');
    document.getElementById('riwayatTTBtn').classList.remove('active');
});

document.getElementById('riwayatTTBtn')?.addEventListener('click', function() {
    document.getElementById('riwayatTransferList').style.display = 'none';
    document.getElementById('riwayatTTList').style.display = 'block';
    this.classList.add('active');
    document.getElementById('riwayatTransferBtn').classList.remove('active');
});
