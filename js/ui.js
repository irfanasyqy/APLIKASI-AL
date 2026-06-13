// ========== UI.JS ==========
// Hanya untuk UI utility yang tidak ada di supplier.js

// ========== SUPPLIER INFO ==========
document.getElementById('supplierSelect')?.addEventListener('change', function(e) {
    let idx = e.target.value;
    if (idx === "") {
        document.getElementById('supplierInfo').style.display = 'none';
        document.getElementById('currencyDisplay').value = '';
        return;
    }
    let s = suppliers[idx];
    document.getElementById('supplierInfo').innerHTML = '<strong>' + (s.nama || '-') + '</strong><br>Account: ' + (s.account || '-') + '<br>Bank: ' + (s.bankName || '-') + ' (' + (s.swift || '-') + ')';
    document.getElementById('supplierInfo').style.display = 'block';
    document.getElementById('currencyDisplay').value = s.currency || '';
});

// ========== TT SUPPLIER INFO ==========
document.getElementById('ttSupplierSelect')?.addEventListener('change', function(e) {
    let idx = e.target.value;
    if (idx === "") return;
    let s = suppliers[idx];
    if (s) {
        document.getElementById('ttKepada').value = s.nama || '';
        document.getElementById('ttAlamat').value = s.alamat || '';
        document.getElementById('ttCurrency').value = s.currency || '';
    }
});

// ========== FAKTUR SUPPLIER INFO ==========
document.getElementById('fakturSupplierSelect')?.addEventListener('change', function(e) {
    let idx = e.target.value;
    if (idx === "") return;
    let s = suppliers[idx];
    if (s) document.getElementById('fakturCurrency').value = s.currency || '';
});

// ========== SEARCH SUPPLIER ==========
const searchInput = document.getElementById('searchSupplier');
const supplierSelect = document.getElementById('supplierSelect');
const searchResultDiv = document.getElementById('supplierSearchResult');

if (searchInput && supplierSelect) {
    searchInput.addEventListener('input', function(e) {
        const keyword = e.target.value.toLowerCase().trim();
        
        // Pastikan suppliers sudah ter-load
        if (typeof suppliers === 'undefined' || !suppliers.length) {
            if (searchResultDiv) searchResultDiv.innerHTML = '⏳ Memuat data supplier...';
            return;
        }
        
        if (keyword === '') {
            // Reset ke semua supplier
            if (typeof updateDropdowns === 'function') {
                updateDropdowns();
            } else {
                // Fallback: reload halaman atau panggil loadSuppliers
                if (typeof loadSuppliers === 'function') loadSuppliers();
            }
            if (searchResultDiv) searchResultDiv.innerHTML = '';
            return;
        }
        
        // Filter supplier berdasarkan keyword
        const filtered = suppliers.filter(s => 
            (s.nama && s.nama.toLowerCase().includes(keyword)) ||
            (s.account && s.account.toString().toLowerCase().includes(keyword)) ||
            (s.bankName && s.bankName.toLowerCase().includes(keyword)) ||
            (s.no && s.no.toString().includes(keyword))
        );
        
        if (filtered.length === 0) {
            supplierSelect.innerHTML = '<option value="">-- Tidak ada supplier yang cocok --</option>';
            if (searchResultDiv) searchResultDiv.innerHTML = '⚠️ Tidak ditemukan supplier untuk "' + keyword + '"';
        } else {
            let options = '<option value="">-- Pilih Supplier --</option>';
            for (let i = 0; i < filtered.length; i++) {
                const supplierId = filtered[i].id !== undefined ? filtered[i].id : i;
                options += `<option value="${supplierId}">${filtered[i].nama} (${filtered[i].currency})</option>`;
            }
            supplierSelect.innerHTML = options;
            if (searchResultDiv) searchResultDiv.innerHTML = `✅ Ditemukan ${filtered.length} supplier`;
        }
    });
}