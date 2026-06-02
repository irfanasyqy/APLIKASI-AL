// ========== CUSTOMER.JS ==========
// Versi lengkap dengan semua fitur (Tambah, Edit, Hapus, Preview, Total Data)

// Konfigurasi API endpoint
const CUSTOMER_API_URL = CONFIG.CUSTOMER_API_URL || CONFIG.API_URL;

// =====================================================
// LOAD DATA CUSTOMER DARI GOOGLE SHEET
// =====================================================
async function loadCustomers() {
    const tbody = document.getElementById('customerTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7">📡 Memuat data customer...</td></tr></tr>';
    
    try {
        const response = await fetch(CUSTOMER_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getCustomers' })
        });
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            let html = '';
            for (let i = 0; i < result.data.length; i++) {
                const row = result.data[i];
                const no = i + 1;
                const timestamp = row[0] || '';
                const nama = row[1] || '-';
                const email = row[2] || '-';
                const telepon = row[3] || '-';
                const alamat = row[4] || '-';
                const kota = row[5] || '-';
                const catatan = row[6] || '';
                
                html += `
                    <tr data-id="${i}" 
                        data-nama="${escapeHtml(nama)}" 
                        data-email="${escapeHtml(email)}" 
                        data-telepon="${escapeHtml(telepon)}" 
                        data-alamat="${escapeHtml(alamat)}" 
                        data-kota="${escapeHtml(kota)}"
                        data-catatan="${escapeHtml(catatan)}">
                        <td>${no}</td>
                        <td>${escapeHtml(nama)}</td>
                        <td>${escapeHtml(email)}</td>
                        <td>${escapeHtml(telepon)}</td>
                        <td>${escapeHtml(alamat)}</td>
                        <td>${escapeHtml(kota)}</td>
                        <td>
                            <button class="btn-edit" onclick="editCustomer(${i})">✏️ Edit</button>
                            <button class="btn-hapus" onclick="hapusCustomerConfirm(${i}, '${escapeHtml(nama)}')">🗑️ Hapus</button>
                        </td>
                    </tr>
                `;
            }
            tbody.innerHTML = html;
            
            // Update total data
            const totalSpan = document.getElementById('totalData');
            if (totalSpan) {
                totalSpan.innerHTML = `📊 Total Data: ${result.data.length} customer`;
            }
            
            // Tambahkan event preview saat baris diklik
            document.querySelectorAll('#customerTableBody tr').forEach(row => {
                row.addEventListener('click', (e) => {
                    // Jangan trigger jika yang diklik adalah tombol
                    if (e.target.tagName === 'BUTTON') return;
                    showPreview(row);
                });
            });
            
            // Simpan data ke window untuk akses global
            window.customersData = result.data;
            
        } else {
            tbody.innerHTML = '<tr><td colspan="7">📭 Belum ada data customer</td></tr></tr>';
            const totalSpan = document.getElementById('totalData');
            if (totalSpan) {
                totalSpan.innerHTML = '📊 Total Data: 0 customer';
            }
        }
    } catch (error) {
        console.error('Gagal load customer:', error);
        tbody.innerHTML = `<tr><td colspan="7">❌ Gagal memuat data customer: ${error.message}</td></tr></tr>`;
        const totalSpan = document.getElementById('totalData');
        if (totalSpan) {
            totalSpan.innerHTML = '❌ Error: Gagal memuat data';
        }
    }
}

// =====================================================
// FUNGSI ESCAPE HTML (MENCEGAH XSS)
// =====================================================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// =====================================================
// TAMPILKAN PREVIEW DATA SAAT BARIS DIKLIK
// =====================================================
function showPreview(row) {
    const nama = row.getAttribute('data-nama') || '-';
    const email = row.getAttribute('data-email') || '-';
    const telepon = row.getAttribute('data-telepon') || '-';
    const alamat = row.getAttribute('data-alamat') || '-';
    const kota = row.getAttribute('data-kota') || '-';
    const catatan = row.getAttribute('data-catatan') || '-';
    
    const previewHtml = `
        <div style="display: grid; grid-template-columns: 100px 1fr; gap: 8px;">
            <div><strong>📛 Nama:</strong></div><div>${nama}</div>
            <div><strong>📧 Email:</strong></div><div>${email}</div>
            <div><strong>📞 Telepon:</strong></div><div>${telepon}</div>
            <div><strong>📍 Alamat:</strong></div><div>${alamat}</div>
            <div><strong>🏙️ Kota:</strong></div><div>${kota}</div>
            <div><strong>📝 Catatan:</strong></div><div>${catatan}</div>
        </div>
    `;
    
    const previewContent = document.getElementById('previewContent');
    const previewPanel = document.getElementById('previewPanel');
    
    if (previewContent && previewPanel) {
        previewContent.innerHTML = previewHtml;
        previewPanel.style.display = 'block';
    }
}

// =====================================================
// EDIT CUSTOMER
// =====================================================
function editCustomer(index) {
    // Coba ambil dari DOM terlebih dahulu
    const row = document.querySelector(`#customerTableBody tr[data-id="${index}"]`);
    
    if (row) {
        document.getElementById('editId').value = row.getAttribute('data-id');
        document.getElementById('namaCustomer').value = row.getAttribute('data-nama') || '';
        document.getElementById('emailCustomer').value = row.getAttribute('data-email') || '';
        document.getElementById('teleponCustomer').value = row.getAttribute('data-telepon') || '';
        document.getElementById('alamatCustomer').value = row.getAttribute('data-alamat') || '';
        document.getElementById('kotaCustomer').value = row.getAttribute('data-kota') || '';
        document.getElementById('catatanCustomer').value = row.getAttribute('data-catatan') || '';
    } else if (window.customersData && window.customersData[index]) {
        // Fallback ke data array
        const data = window.customersData[index];
        document.getElementById('editId').value = index;
        document.getElementById('namaCustomer').value = data[1] || '';
        document.getElementById('emailCustomer').value = data[2] || '';
        document.getElementById('teleponCustomer').value = data[3] || '';
        document.getElementById('alamatCustomer').value = data[4] || '';
        document.getElementById('kotaCustomer').value = data[5] || '';
        document.getElementById('catatanCustomer').value = data[6] || '';
    }
    
    document.getElementById('formTitle').innerText = '✏️ Edit Customer';
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('customerForm').style.display = 'block';
}

// =====================================================
// KONFIRMASI HAPUS CUSTOMER
// =====================================================
function hapusCustomerConfirm(index, nama) {
    if (confirm(`⚠️ Yakin ingin menghapus customer berikut?\n\n📛 Nama: ${nama}\n\n❌ TINDAKAN INI TIDAK DAPAT DIBATALKAN!`)) {
        hapusCustomer(index);
    }
}

// =====================================================
// HAPUS CUSTOMER DARI GOOGLE SHEET
// =====================================================
async function hapusCustomer(index) {
    try {
        const response = await fetch(CUSTOMER_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': application/json },
            body: JSON.stringify({ 
                type: 'deleteCustomer', 
                rowIndex: index
            })
        });
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Data berhasil dihapus!');
            await loadCustomers();
            // Sembunyikan preview panel
            const previewPanel = document.getElementById('previewPanel');
            if (previewPanel) previewPanel.style.display = 'none';
        } else {
            alert('❌ Gagal menghapus: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error hapus:', error);
        alert('❌ Error koneksi saat menghapus data');
    }
}

// =====================================================
// SIMPAN CUSTOMER (TAMBAH / EDIT)
// =====================================================
async function simpanCustomer() {
    const editId = document.getElementById('editId').value;
    const nama = document.getElementById('namaCustomer').value.trim();
    
    // Validasi
    if (!nama) {
        alert('⚠️ Nama customer wajib diisi!');
        document.getElementById('namaCustomer').focus();
        return;
    }
    
    // Validasi email (opsional tapi format harus benar)
    const email = document.getElementById('emailCustomer').value.trim();
    if (email && !isValidEmail(email)) {
        alert('⚠️ Format email tidak valid!');
        document.getElementById('emailCustomer').focus();
        return;
    }
    
    const data = {
        type: 'saveCustomer',
        id: editId || undefined,
        nama: nama,
        email: email,
        telepon: document.getElementById('teleponCustomer').value.trim(),
        alamat: document.getElementById('alamatCustomer').value.trim(),
        kota: document.getElementById('kotaCustomer').value.trim(),
        catatan: document.getElementById('catatanCustomer').value.trim()
    };
    
    // Tampilkan loading
    const btnSimpan = document.getElementById('btnSimpan');
    const originalText = btnSimpan.innerText;
    btnSimpan.innerText = '💾 MENYIMPAN...';
    btnSimpan.disabled = true;
    
    try {
        const response = await fetch(CUSTOMER_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Data berhasil disimpan!');
            tutupForm();
            await loadCustomers();
        } else {
            alert('❌ Gagal menyimpan: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error simpan:', error);
        alert('❌ Error koneksi saat menyimpan data');
    } finally {
        btnSimpan.innerText = originalText;
        btnSimpan.disabled = false;
    }
}

// =====================================================
// VALIDASI EMAIL
// =====================================================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// =====================================================
// TUTUP FORM POPUP
// =====================================================
function tutupForm() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('customerForm').style.display = 'none';
    
    // Reset form
    document.getElementById('editId').value = '';
    document.getElementById('namaCustomer').value = '';
    document.getElementById('emailCustomer').value = '';
    document.getElementById('teleponCustomer').value = '';
    document.getElementById('alamatCustomer').value = '';
    document.getElementById('kotaCustomer').value = '';
    document.getElementById('catatanCustomer').value = '';
    document.getElementById('formTitle').innerText = '➕ Tambah Customer';
    
    // Optional: reset preview panel (tidak wajib)
    // const previewPanel = document.getElementById('previewPanel');
    // if (previewPanel) previewPanel.style.display = 'none';
}

// =====================================================
// RESET FORM (BERSIHKAN SEMUA)
// =====================================================
function resetForm() {
    tutupForm();
    // Optional: reload data
    loadCustomers();
}

// =====================================================
// EVENT LISTENERS
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    // Tombol Tambah Customer
    const btnTambah = document.getElementById('btnTambahCustomer');
    if (btnTambah) {
        btnTambah.addEventListener('click', () => {
            tutupForm();
            document.getElementById('overlay').style.display = 'block';
            document.getElementById('customerForm').style.display = 'block';
        });
    }
    
    // Tombol Simpan
    const btnSimpan = document.getElementById('btnSimpan');
    if (btnSimpan) {
        btnSimpan.addEventListener('click', simpanCustomer);
    }
    
    // Tombol Batal
    const btnBatal = document.getElementById('btnBatal');
    if (btnBatal) {
        btnBatal.addEventListener('click', tutupForm);
    }
    
    // Overlay (klik di luar form)
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', tutupForm);
    }
    
    // Tombol Enter pada form
    const formInputs = document.querySelectorAll('#customerForm input');
    formInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                simpanCustomer();
            }
        });
    });
    
    // Load data awal
    if (document.getElementById('customerTableBody')) {
        loadCustomers();
    }
});

// =====================================================
// EXPORT FUNCTIONS KE GLOBAL (UNTUK ONCLICK DI HTML)
// =====================================================
window.editCustomer = editCustomer;
window.hapusCustomerConfirm = hapusCustomerConfirm;
window.tutupForm = tutupForm;
window.simpanCustomer = simpanCustomer;