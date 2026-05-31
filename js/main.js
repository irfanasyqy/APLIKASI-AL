// ========== MAIN.JS ==========
window.onload = function() {
    loadSuppliers();
    let today = new Date().toISOString().slice(0,10);
    if (document.getElementById('ttTanggal')) document.getElementById('ttTanggal').value = today;
    if (document.getElementById('fakturTgl')) document.getElementById('fakturTgl').value = today;
};
