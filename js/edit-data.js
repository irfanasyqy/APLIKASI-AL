// ========== EDIT-DATA.JS ==========
document.getElementById('editSupplierSelect')?.addEventListener('change', function(e) {
    let s = suppliers[e.target.value];
    if (s) {
        document.getElementById('editForm').style.display = 'block';
        document.getElementById('editNo').value = s.no || '';
        document.getElementById('editNama').value = s.nama || '';
        document.getElementById('editAccount').value = s.account || '';
        document.getElementById('editAlamat').value = s.alamat || '';
        document.getElementById('editBankName').value = s.bankName || '';
        document.getElementById('editSwift').value = s.swift || '';
    }
});

document.getElementById('btnUpdateSupplier')?.addEventListener('click', function() {
    alert('Edit data: Silakan edit langsung di Google Sheets Anda.');
});
