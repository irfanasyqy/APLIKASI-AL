// ========== CUSTOMER.JS ==========

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
        
        if (result.success && result.data && result.data.length > 0) {
            let html = '';
            for (let i = 0; i < result.data.length; i++) {
                const row = result.data[i];
                const no = i + 1;
                // Gunakan escapeHtml yang sudah diperbaiki
                const nama = escapeHtml(row[1] || row.Nama || '-');
                const email = escapeHtml(row[2] || row.Email || '-');
                const telepon = escapeHtml(row[3] || row.Telepon || '-');
                const alamat = escapeHtml(row[4] || row.Alamat || '-');
                const kota = escapeHtml(row[5] || row.Kota || '-');
                
                html += `
                    <tr data-id="${i}" 
                        data-nama="${nama}" 
                        data-email="${email}" 
                        data-telepon="${telepon}" 
                        data-alamat="${alamat}" 
                        data-kota="${kota}">
                        <td>${no}</td>
                        <td>${nama}</td>
                        <td>${email}</td>
                        <td>${telepon}</td>
                        <td>${alamat}</td>
                        <td>${kota}</td>
                        <td>
                            <button class="btn-edit" onclick="editCustomer(${i})">✏️ Edit</button>
                            <button class="btn-hapus" onclick="hapusCustomerConfirm(${i}, '${nama}')">🗑️ Hapus</button>
                        </td>
                    </tr>
                `;
            }
            tbody.innerHTML = html;
            
            document.getElementById('totalData').innerHTML = `📊 Total Data: ${result.data.length} customer`;
            
            // Preview saat baris diklik
            document.querySelectorAll('#customerTableBody tr').forEach(row => {
                row.addEventListener('click', (e) => {
                    if (e.target.tagName === 'BUTTON') return;
                    
                    const nama = row.getAttribute('data-nama') || '-';
                    const email = row.getAttribute('data-email') || '-';
                    const telepon = row.getAttribute('data-telepon') || '-';
                    const alamat = row.getAttribute('data-alamat') || '-';
                    const kota = row.getAttribute('data-kota') || '-';
                    
                    const previewHtml = `
                        <div><strong>📛 Nama:</strong> ${nama}</div>
                        <div><strong>📧 Email:</strong> ${email}</div>
                        <div><strong>📞 Telepon:</strong> ${telepon}</div>
                        <div><strong>📍 Alamat:</strong> ${alamat}</div>
                        <div><strong>🏙️ Kota:</strong> ${kota}</div>
                    `;
                    document.getElementById('previewContent').innerHTML = previewHtml;
                    document.getElementById('previewPanel').style.display = 'block';
                });
            });
            
            window.customersData = result.data;
        } else {
            tbody.innerHTML = '<tr><td colspan="7">📭 Belum ada data customer</td></tr>';
            document.getElementById('totalData').innerHTML = '📊 Total Data: 0 customer';
        }
    } catch (error) {
        console.error('Gagal load customer:', error);
        tbody.innerHTML = `<tr><td colspan="7">❌ Gagal memuat data: ${error.message}</td></tr>`;
    }
}

// ========== ESCAPE HTML YANG SUDAH DIPERBAIKI ==========
function escapeHtml(str) {
    // Handle jika str bukan string
    if (str === null || str === undefined) return '';
    // Konversi ke string
    const text = String(str);
    // Escape karakter berbahaya
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function editCustomer(index) {
    const row = document.querySelector(`#customerTableBody tr[data-id="${index}"]`);
    if (!row && window.customersData && window.customersData[index]) {
        const data = window.customersData[index];
        document.getElementById('editId').value = index;
        document.getElementById('namaCustomer').value = data[1] || data.Nama || '';
        document.getElementById('emailCustomer').value = data[2] || data.Email || '';
        document.getElementById('teleponCustomer').value = data[3] || data.Telepon || '';
        document.getElementById('alamatCustomer').value = data[4] || data.Alamat || '';
        document.getElementById('kotaCustomer').value = data[5] || data.Kota || '';
        document.getElementById('catatanCustomer').value = data[6] || '';
    } else if (row) {
        document.getElementById('editId').value = row.getAttribute('data-id');
        document.getElementById('namaCustomer').value = row.getAttribute('data-nama') || '';
        document.getElementById('emailCustomer').value = row.getAttribute('data-email') || '';
        document.getElementById('teleponCustomer').value = row.getAttribute('data-telepon') || '';
        document.getElementById('alamatCustomer').value = row.getAttribute('data-alamat') || '';
        document.getElementById('kotaCustomer').value = row.getAttribute('data-kota') || '';
        document.getElementById('catatanCustomer').value = '';
    }
    document.getElementById('formTitle').innerText = '✏️ Edit Customer';
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('customerForm').style.display = 'block';
}

function hapusCustomerConfirm(index, nama) {
    if (confirm(`⚠️ Yakin ingin menghapus customer "${nama}"?\n\nTINDAKAN INI TIDAK DAPAT DIBATALKAN!`)) {
        hapusCustomer(index);
    }
}

async function hapusCustomer(index) {
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'deleteCustomer', rowIndex: index })
        });
        const result = await response.json();
        if (result.success) {
            alert('✅ Data berhasil dihapus!');
            await loadCustomers();
            document.getElementById('previewPanel').style.display = 'none';
        } else {
            alert('❌ Gagal menghapus: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error hapus:', error);
        alert('❌ Error koneksi saat menghapus');
    }
}

async function simpanCustomer() {
    const editId = document.getElementById('editId').value;
    const nama = document.getElementById('namaCustomer').value.trim();
    if (!nama) {
        alert('⚠️ Nama customer wajib diisi!');
        return;
    }
    
    const data = {
        type: 'saveCustomer',
        id: editId || undefined,
        nama: nama,
        email: document.getElementById('emailCustomer').value.trim(),
        telepon: document.getElementById('teleponCustomer').value.trim(),
        alamat: document.getElementById('alamatCustomer').value.trim(),
        kota: document.getElementById('kotaCustomer').value.trim(),
        catatan: document.getElementById('catatanCustomer').value.trim()
    };
    
    const btnSimpan = document.getElementById('btnSimpan');
    const originalText = btnSimpan.innerText;
    btnSimpan.innerText = '💾 MENYIMPAN...';
    btnSimpan.disabled = true;
    
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
            await loadCustomers();
        } else {
            alert('❌ Gagal menyimpan: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error simpan:', error);
        alert('❌ Error koneksi saat menyimpan');
    } finally {
        btnSimpan.innerText = originalText;
        btnSimpan.disabled = false;
    }
}

function tutupForm() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('customerForm').style.display = 'none';
    document.getElementById('editId').value = '';
    document.getElementById('namaCustomer').value = '';
    document.getElementById('emailCustomer').value = '';
    document.getElementById('teleponCustomer').value = '';
    document.getElementById('alamatCustomer').value = '';
    document.getElementById('kotaCustomer').value = '';
    document.getElementById('catatanCustomer').value = '';
    document.getElementById('formTitle').innerText = '➕ Tambah Customer';
    document.getElementById('previewPanel').style.display = 'none';
}

// Event listeners
document.getElementById('btnTambahCustomer')?.addEventListener('click', () => {
    tutupForm();
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('customerForm').style.display = 'block';
});

document.getElementById('btnSimpan')?.addEventListener('click', simpanCustomer);
document.getElementById('btnBatal')?.addEventListener('click', tutupForm);
document.getElementById('overlay')?.addEventListener('click', tutupForm);

// Load awal
if (document.getElementById('customerTableBody')) {
    loadCustomers();
}