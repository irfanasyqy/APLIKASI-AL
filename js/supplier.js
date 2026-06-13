// ========== SUPPLIER.JS ==========
// Halaman Data Supplier dengan Edit & Hapus

// ========== DEKLARASI VARIABEL MODAL ==========
const modal = document.getElementById('supplierModal');
const modalTitle = document.getElementById('modalTitle');
const modalEditId = document.getElementById('modalEditId');
const btnAddSupplier = document.getElementById('btnAddSupplier');
const modalClose = document.querySelector('.modal-close');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalSaveBtn = document.getElementById('modalSaveBtn');

// Override renderSupplierTable untuk menampilkan tombol edit & hapus
function renderSupplierTable() {
    let tbody = document.getElementById('supplierTableBody');
    if (!tbody) return;
    if (suppliers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Tidak ada data supplier</td><tr>';
        return;
    }
    let html = '';
    for (let i = 0; i < suppliers.length; i++) {
        let s = suppliers[i];
        html += '<tr>';
        html += '<td>' + (s.no || '-') + '</td>';
        html += '<td>' + (s.nama || '-') + '</td>';
        html += '<td>' + (s.account || '-') + '</td>';
        html += '<td>' + (s.currency || '-') + '</td>';
        html += '<td>' + (s.bankName || '-') + '</td>';
        html += '<td>' + (s.swift || '-') + '</td>';
        html += '<td>' + (s.country || '-') + '</td>';
        html += '<td>';
        html += '<button class="btn-edit" data-id="' + i + '">✏️ Edit</button> ';
        html += '<button class="btn-delete" data-id="' + i + '">🗑️ Hapus</button>';
        html += '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
    
    // Event listener untuk tombol Edit
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            editSupplier(id);
        });
    });
    
    // Event listener untuk tombol Hapus
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            deleteSupplier(id);
        });
    });
}

// Buka modal untuk tambah supplier
if (btnAddSupplier) {
    btnAddSupplier.addEventListener('click', () => {
        modalTitle.textContent = '➕ Tambah Supplier Baru';
        modalEditId.value = '';
        
        // Reset semua field (tanpa kolom No)
        document.getElementById('modalNama').value = '';
        document.getElementById('modalAccount').value = '';
        document.getElementById('modalCurrency').value = 'USD';
        document.getElementById('modalAlamat').value = '';
        document.getElementById('modalBankName').value = '';
        document.getElementById('modalBankAlamat').value = '';
        document.getElementById('modalSwift').value = '';
        document.getElementById('modalCountry').value = '';
        
        if (modal) modal.style.display = 'flex';
    });
}

// Fungsi edit supplier
function editSupplier(id) {
    const s = suppliers[id];
    if (!s) return;
    
    modalTitle.textContent = '✏️ Edit Supplier';
    modalEditId.value = id;
    
    // Isi semua field (tanpa kolom No)
    document.getElementById('modalNama').value = s.nama || '';
    document.getElementById('modalAccount').value = s.account || '';
    document.getElementById('modalCurrency').value = s.currency || 'USD';
    document.getElementById('modalAlamat').value = s.alamat || '';
    document.getElementById('modalBankName').value = s.bankName || '';
    document.getElementById('modalBankAlamat').value = s.bankAlamat || '';
    document.getElementById('modalSwift').value = s.swift || '';
    document.getElementById('modalCountry').value = s.country || '';
    
    if (modal) modal.style.display = 'flex';
}

// Fungsi hapus supplier
async function deleteSupplier(id) {
    const s = suppliers[id];
    if (!s) return;
    
    if (!confirm(`Yakin ingin menghapus supplier "${s.nama}"?`)) return;
    
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                type: 'deleteSupplier', 
                supplierId: id,
                nama: s.nama,
                account: s.account
            })
        });
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Supplier berhasil dihapus!');
            if (typeof loadSuppliers === 'function') loadSuppliers();
        } else {
            alert('❌ Gagal menghapus: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error koneksi saat menghapus supplier');
    }
}

// Tutup modal
function closeModal() {
    if (modal) modal.style.display = 'none';
    
    // Reset form (tanpa kolom No)
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

// Event listener modal
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);

// Klik di luar modal
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Simpan supplier (tambah atau edit)
if (modalSaveBtn) {
    modalSaveBtn.addEventListener('click', async () => {
        const nama = document.getElementById('modalNama').value.trim();
        if (!nama) {
            alert('Nama supplier wajib diisi!');
            return;
        }
        
        const editId = modalEditId.value;
        const isEdit = editId !== '';
        
        // Data supplier (tanpa nomor)
        const supplierData = {
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
        
        // Jika edit, kirim editId
        if (isEdit) {
            supplierData.editId = editId;
            supplierData.oldNama = suppliers[editId]?.nama;
        }
        
        modalSaveBtn.disabled = true;
        modalSaveBtn.textContent = '⏳ Menyimpan...';
        
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplierData)
            });
            const result = await response.json();
            
            if (result.success) {
                alert(isEdit ? '✅ Supplier berhasil diupdate!' : '✅ Supplier berhasil ditambahkan!');
                closeModal();
                if (typeof loadSuppliers === 'function') loadSuppliers();
            } else {
                alert('❌ Gagal: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error koneksi saat menyimpan supplier');
        } finally {
            modalSaveBtn.disabled = false;
            modalSaveBtn.textContent = '💾 Simpan';
        }
    });
}

// Panggil loadSuppliers saat halaman dimuat
if (document.getElementById('supplierTableBody')) {
    if (typeof loadSuppliers === 'function') {
        loadSuppliers();
    }
}