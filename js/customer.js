// ========== CUSTOMER.JS ==========
// Struktur kolom Google Sheets:
// Index 0: NOMOR
// Index 1: NAMA PERUSAHAAN  
// Index 2: ALAMAT KIRIM FAKTUR
// Index 3: JADWAL KIRIM FAKTUR
// Index 4: PIC
// Index 5: NO HP
// Index 6: KETERANGAN 1 (Email)
// Index 7: KETERANGAN 2 (Catatan)
// Index 8: NAMA PASAR

let allCustomersData = [];

// Load data customer dari API
async function loadCustomers() {
    const tbody = document.getElementById('customerTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7">📡 Memuat data customer...</td></tr>';
    
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getCustomers' })
        });
        const result = await response.json();
        
        console.log('API Response:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            allCustomersData = result.data;
            renderTable(allCustomersData);
        } else {
            tbody.innerHTML = '<tr><td colspan="7">📭 Belum ada data customer</td></tr>';
            document.getElementById('totalData').innerHTML = '📊 Total Data: 0 customer';
        }
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = `<tr><td colspan="7">❌ Gagal memuat data: ${error.message}</td></tr>`;
    }
}

// Render tabel
function renderTable(data) {
    const tbody = document.getElementById('customerTableBody');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">📭 Tidak ada data customer</td></tr>';
        document.getElementById('totalData').innerHTML = '📊 Total Data: 0 customer';
        return;
    }
    
    let html = '';
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        // Mapping index yang BENAR
        const no = (row[0] && row[0] !== '') ? row[0] : (i + 1);
        const nama = (row[1] && row[1] !== '') ? row[1] : '-';
        const alamat = (row[2] && row[2] !== '') ? row[2] : '-';
        const jadwal = (row[3] && row[3] !== '') ? row[3] : '-';      // JADWAL di index 3
        const pic = (row[4] && row[4] !== '') ? row[4] : '-';          // PIC di index 4
        const hp = (row[5] && row[5] !== '') ? row[5] : '-';           // NO HP di index 5
        const email = (row[6] && row[6] !== '') ? row[6] : '-';        // KETERANGAN 1 di index 6
        
        // Gabungan PIC + HP
        let picHp = pic;
        if (pic !== '-' && hp !== '-') {
            picHp = pic + ' - ' + hp;
        } else if (hp !== '-') {
            picHp = hp;
        }
        
        html += `
            <tr data-index="${i}">
                <td>${escapeHtml(String(no))}</td>
                <td class="cell-nama">${escapeHtml(String(nama))}</td>
                <td class="cell-alamat">${escapeHtml(String(alamat))}</td>
                <td class="cell-jadwal">${escapeHtml(String(jadwal))}</td>
                <td class="cell-pic-hp">${escapeHtml(String(picHp))}</td>
                <td class="cell-email">${escapeHtml(String(email))}</td>
                <td>
                    <button class="btn-edit" onclick="editCustomer(${i})">✏️ Edit</button>
                    <button class="btn-hapus" onclick="hapusCustomer(${i})">🗑️ Hapus</button>
                </td>
            </tr>
        `;
    }
    
    tbody.innerHTML = html;
    document.getElementById('totalData').innerHTML = `📊 Total Data: ${data.length} customer`;
    
    // Preview klik baris
    document.querySelectorAll('#customerTableBody tr').forEach(row => {
        row.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            const idx = row.getAttribute('data-index');
            if (idx !== null && allCustomersData[idx]) {
                showPreview(allCustomersData[idx]);
            }
        });
    });
}

// Preview data
function showPreview(row) {
    const nama = (row[1]) ? row[1] : '-';
    const alamat = (row[2]) ? row[2] : '-';
    const jadwal = (row[3]) ? row[3] : '-';
    const pic = (row[4]) ? row[4] : '-';
    const hp = (row[5]) ? row[5] : '-';
    const email = (row[6]) ? row[6] : '-';
    const catatan = (row[7]) ? row[7] : '';
    const namaPasar = (row[8]) ? row[8] : '';
    
    let html = `
        <div><strong>📛 Nama:</strong> ${escapeHtml(String(nama))}</div>
        <div><strong>📍 Alamat:</strong> ${escapeHtml(String(alamat))}</div>
        <div><strong>📅 Jadwal:</strong> ${escapeHtml(String(jadwal))}</div>
        <div><strong>👤 PIC:</strong> ${escapeHtml(String(pic))}</div>
        <div><strong>📞 HP:</strong> ${escapeHtml(String(hp))}</div>
        <div><strong>📧 Email:</strong> ${escapeHtml(String(email))}</div>
    `;
    if (namaPasar && namaPasar !== '-') {
        html += `<div><strong>🏪 Nama Pasar:</strong> ${escapeHtml(String(namaPasar))}</div>`;
    }
    if (catatan && catatan !== '-') {
        html += `<div><strong>📝 Catatan:</strong> ${escapeHtml(String(catatan))}</div>`;
    }
    
    document.getElementById('previewContent').innerHTML = html;
    document.getElementById('previewPanel').style.display = 'block';
}

// Filter pencarian
function filterCustomers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderTable(allCustomersData);
        return;
    }
    
    const filtered = allCustomersData.filter(row => {
        const nama = (row[1] || '').toLowerCase();
        const alamat = (row[2] || '').toLowerCase();
        const jadwal = (row[3] || '').toLowerCase();
        const pic = (row[4] || '').toLowerCase();
        const hp = (row[5] || '').toLowerCase();
        
        return nama.includes(searchTerm) || alamat.includes(searchTerm) || 
               jadwal.includes(searchTerm) || pic.includes(searchTerm) || hp.includes(searchTerm);
    });
    
    renderTable(filtered);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Edit customer
function editCustomer(index) {
    const row = allCustomersData[index];
    if (!row) return;
    
    document.getElementById('editId').value = index;
    document.getElementById('namaCustomer').value = row[1] || '';
    document.getElementById('alamatCustomer').value = row[2] || '';
    document.getElementById('jadwalCustomer').value = row[3] || '';
    document.getElementById('picCustomer').value = row[4] || '';
    document.getElementById('hpCustomer').value = row[5] || '';
    document.getElementById('emailCustomer').value = row[6] || '';
    document.getElementById('catatanCustomer').value = row[7] || '';
    document.getElementById('namaPasarCustomer').value = row[8] || '';
    
    document.getElementById('formTitle').innerText = '✏️ Edit Customer';
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('customerForm').style.display = 'block';
}

// Hapus customer
async function hapusCustomer(index) {
    const row = allCustomersData[index];
    const nama = (row[1]) ? row[1] : 'customer';
    
    if (!confirm(`⚠️ Yakin ingin menghapus "${nama}"?`)) return;
    
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'deleteCustomer', rowIndex: index })
        });
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Data berhasil dihapus!');
            loadCustomers();
            document.getElementById('previewPanel').style.display = 'none';
        } else {
            alert('❌ Gagal menghapus');
        }
    } catch (error) {
        alert('❌ Error koneksi');
    }
}

// Simpan customer
async function simpanCustomer() {
    const editId = document.getElementById('editId').value;
    const nama = document.getElementById('namaCustomer').value.trim();
    
    if (!nama) {
        alert('⚠️ Nama customer wajib diisi!');
        return;
    }
    
    const data = {
        type: 'saveCustomer',
        nama: nama,
        alamat: document.getElementById('alamatCustomer').value.trim(),
        jadwal: document.getElementById('jadwalCustomer').value.trim(),
        pic: document.getElementById('picCustomer').value.trim(),
        hp: document.getElementById('hpCustomer').value.trim(),
        email: document.getElementById('emailCustomer').value.trim(),
        catatan: document.getElementById('catatanCustomer').value.trim(),
        namaPasar: document.getElementById('namaPasarCustomer').value.trim()
    };
    
    if (editId !== '') {
        data.id = parseInt(editId);
    }
    
    const btn = document.getElementById('btnSimpan');
    const originalText = btn.innerText;
    btn.innerText = '💾 MENYIMPAN...';
    btn.disabled = true;
    
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Data berhasil disimpan!');
            tutupForm();
            loadCustomers();
        } else {
            alert('❌ Gagal menyimpan: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        alert('❌ Error koneksi: ' + error.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// Tutup form
function tutupForm() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('customerForm').style.display = 'none';
    document.getElementById('editId').value = '';
    document.getElementById('namaCustomer').value = '';
    document.getElementById('alamatCustomer').value = '';
    document.getElementById('jadwalCustomer').value = '';
    document.getElementById('picCustomer').value = '';
    document.getElementById('hpCustomer').value = '';
    document.getElementById('emailCustomer').value = '';
    document.getElementById('catatanCustomer').value = '';
    document.getElementById('namaPasarCustomer').value = '';
    document.getElementById('formTitle').innerText = '➕ Tambah Customer';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadCustomers();
    
    const btnTambah = document.getElementById('btnTambahCustomer');
    const btnSimpan = document.getElementById('btnSimpan');
    const btnBatal = document.getElementById('btnBatal');
    const overlay = document.getElementById('overlay');
    const searchInput = document.getElementById('searchInput');
    
    if (btnTambah) {
        btnTambah.addEventListener('click', function() {
            tutupForm();
            overlay.style.display = 'block';
            document.getElementById('customerForm').style.display = 'block';
        });
    }
    
    if (btnSimpan) btnSimpan.addEventListener('click', simpanCustomer);
    if (btnBatal) btnBatal.addEventListener('click', tutupForm);
    if (overlay) overlay.addEventListener('click', tutupForm);
    if (searchInput) searchInput.addEventListener('input', filterCustomers);
});