// ========== UI.JS ==========
// ========== SUPPLIER INFO ==========
document.getElementById('supplierSelect')?.addEventListener('change', function(e) {
    let idx = e.target.value;
    if (idx === "") {
        document.getElementById('supplierInfo').style.display = 'none';
        document.getElementById('currencyDisplay').value = '';
        return;
    }
    let s = suppliers[idx];
    document.getElementById('supplierInfo').innerHTML = '<strong>' + s.nama + '</strong><br>Account: ' + (s.account || '-') + '<br>Bank: ' + (s.bankName || '-') + ' (' + (s.swift || '-') + ')';
    document.getElementById('supplierInfo').style.display = 'block';
    document.getElementById('currencyDisplay').value = s.currency || '';
});

// ========== TT SUPPLIER INFO ==========
document.getElementById('ttSupplierSelect')?.addEventListener('change', function(e) {
    let s = suppliers[e.target.value];
    if (s) {
        document.getElementById('ttKepada').value = s.nama || '';
        document.getElementById('ttAlamat').value = s.alamat || '';
        document.getElementById('ttCurrency').value = s.currency || '';
    }
});

// ========== FAKTUR SUPPLIER INFO ==========
document.getElementById('fakturSupplierSelect')?.addEventListener('change', function(e) {
    let s = suppliers[e.target.value];
    if (s) document.getElementById('fakturCurrency').value = s.currency || '';
});

// ========== SEARCH SUPPLIER ==========
const searchInput = document.getElementById('searchSupplier');
const supplierSelect = document.getElementById('supplierSelect');
const searchResultDiv = document.getElementById('supplierSearchResult');

if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const keyword = e.target.value.toLowerCase().trim();
        
        if (keyword === '') {
            // Reset ke semua supplier
            if (typeof updateDropdowns === 'function') updateDropdowns();
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
                options += `<option value="${filtered[i].id}">${filtered[i].nama} (${filtered[i].currency})</option>`;
            }
            supplierSelect.innerHTML = options;
            if (searchResultDiv) searchResultDiv.innerHTML = `✅ Ditemukan ${filtered.length} supplier`;
        }
    });
}

// ========== MODAL TAMBAH SUPPLIER ==========
const modal = document.getElementById('supplierModal');
const btnAddSupplier = document.getElementById('btnAddSupplier');
const modalClose = document.querySelector('.modal-close');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalSaveBtn = document.getElementById('modalSaveBtn');

// Buka modal
if (btnAddSupplier) {
    btnAddSupplier.addEventListener('click', () => {
        if (modal) modal.style.display = 'flex';
    });
}

// Tutup modal
function closeModal() {
    if (modal) modal.style.display = 'none';
    // Reset form
    const modalNama = document.getElementById('modalNama');
    const modalAccount = document.getElementById('modalAccount');
    const modalCurrency = document.getElementById('modalCurrency');
    const modalAlamat = document.getElementById('modalAlamat');
    const modalBankName = document.getElementById('modalBankName');
    const modalBankAlamat = document.getElementById('modalBankAlamat');
    const modalSwift = document.getElementById('modalSwift');
    const modalCountry = document.getElementById('modalCountry');
    
    if (modalNama) modalNama.value = '';
    if (modalAccount) modalAccount.value = '';
    if (modalCurrency) modalCurrency.value = 'USD';
    if (modalAlamat) modalAlamat.value = '';
    if (modalBankName) modalBankName.value = '';
    if (modalBankAlamat) modalBankAlamat.value = '';
    if (modalSwift) modalSwift.value = '';
    if (modalCountry) modalCountry.value = '';
}

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);

// Klik di luar modal
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Simpan supplier baru
if (modalSaveBtn) {
    modalSaveBtn.addEventListener('click', async () => {
        const nama = document.getElementById('modalNama').value.trim();
        if (!nama) {
            alert('Nama supplier wajib diisi!');
            return;
        }
        
        const newSupplier = {
            type: 'saveSupplier',
            nama: nama,
            account: document.getElementById('modalAccount').value,
            currency: document.getElementById('modalCurrency').value,
            alamat: document.getElementById('modalAlamat').value,
            bankName: document.getElementById('modalBankName').value,
            bankAlamat: document.getElementById('modalBankAlamat').value,
            swift: document.getElementById('modalSwift').value,
            country: document.getElementById('modalCountry').value
        };
        
        // Disable tombol sambil loading
        modalSaveBtn.disabled = true;
        modalSaveBtn.textContent = '⏳ Menyimpan...';
        
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSupplier)
            });
            const result = await response.json();
            
            if (result.success) {
                alert('✅ Supplier berhasil ditambahkan!');
                closeModal();
                if (typeof loadSuppliers === 'function') loadSuppliers(); // Refresh data supplier
            } else {
                alert('❌ Gagal: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error koneksi saat menyimpan supplier');
        } finally {
            modalSaveBtn.disabled = false;
            modalSaveBtn.textContent = '💾 Simpan Supplier';
        }
    });
}