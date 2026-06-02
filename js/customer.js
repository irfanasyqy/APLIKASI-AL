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
                
                // A: NOMOR (kolom 0)
                const no = row[0] || i + 1;
                
                // B: NAMA PERUSAHAAN (kolom 1)
                const nama = escapeHtml(row[1] || '-');
                
                // C: ALAMAT KIRIM FAKTUR (kolom 2)
                const alamat = escapeHtml(row[2] || '-');
                
                // D: JADWAL KIRIM FAKTUR (kolom 3)
                const jadwal = escapeHtml(row[3] || '-');
                
                // E: PIC (kolom 4)
                const pic = escapeHtml(row[4] || '-');
                
                // F: NO HP (kolom 5)
                const hp = escapeHtml(row[5] || '-');
                
                // Gabungan PIC + HP
                let picHp = pic;
                if (pic !== '-' && hp !== '-') {
                    picHp = pic + ' - ' + hp;
                } else if (hp !== '-') {
                    picHp = hp;
                }
                
                // G: KETERANGAN 1 / Email (kolom 6)
                const email = escapeHtml(row[6] || '-');
                
                html += `
                    <tr data-id="${i}" 
                        data-nama="${nama}" 
                        data-alamat="${alamat}" 
                        data-jadwal="${jadwal}" 
                        data-pic="${pic}" 
                        data-hp="${hp}" 
                        data-email="${email}"
                        data-catatan="${escapeHtml(row[8] || '')}">
                        <td>${no}</td>
                        <td>${nama}</td>
                        <td>${alamat}</td>
                        <td>${jadwal}</td>
                        <td>${picHp}</td>
                        <td>${email}</td>
                        <td>
                            <button class="btn-edit" onclick="editCustomer(${i})">✏️ Edit</button>
                            <button class="btn-hapus" onclick="hapusCustomerConfirm(${i}, '${nama.replace(/'/g, "\\'")}')">🗑️ Hapus</button>
                        </td>
                    </table>
                `;
            }
            tbody.innerHTML = html;
            
            document.getElementById('totalData').innerHTML = `📊 Total Data: ${result.data.length} customer`;
            
            // Preview saat baris diklik
            document.querySelectorAll('#customerTableBody tr').forEach(row => {
                row.addEventListener('click', (e) => {
                    if (e.target.tagName === 'BUTTON') return;
                    
                    const nama = row.getAttribute('data-nama') || '-';
                    const alamat = row.getAttribute('data-alamat') || '-';
                    const jadwal = row.getAttribute('data-jadwal') || '-';
                    const pic = row.getAttribute('data-pic') || '-';
                    const hp = row.getAttribute('data-hp') || '-';
                    const email = row.getAttribute('data-email') || '-';
                    
                    const previewHtml = `
                        <div><strong>📛 Nama:</strong> ${nama}</div>
                        <div><strong>📍 Alamat:</strong> ${alamat}</div>
                        <div><strong>📅 Jadwal:</strong> ${jadwal}</div>
                        <div><strong>👤 PIC:</strong> ${pic}</div>
                        <div><strong>📞 HP:</strong> ${hp}</div>
                        <div><strong>📧 Email:</strong> ${email}</div>
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

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    const text = String(str);
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
        document.getElementById('namaCustomer').value = data[1] || '';
        document.getElementById('alamatCustomer').value = data[2] || '';
        document.getElementById('jadwalCustomer').value = data[3] || '';
        document.getElementById('picCustomer').value = data[4] || '';
        document.getElementById('hpCustomer').value = data[5] || '';
        document.getElementById('emailCustomer').value = data[6] || '';
        document.getElementById('catatanCustomer').value = data[8] || '';
    } else if (row) {
        document.getElementById('editId').value = row.getAttribute('data-id');
        document.getElementById('namaCustomer').value = row.getAttribute('data-nama') || '';
        document.getElementById('alamatCustomer').value = row.getAttribute('data-alamat') || '';
        document.getElementById('jadwalCustomer').value = row.getAttribute('data-jadwal') || '';
        document.getElementById('picCustomer').value = row.getAttribute('data-pic') || '';
        document.getElementById('hpCustomer').value = row.getAttribute('data-hp') || '';
        document.getElementById('emailCustomer').value = row.getAttribute('data-email') || '';
        document.getElementById('catatanCustomer').value = row.getAttribute('data-catatan') || '';
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
        alamat: document.getElementById('alamatCustomer').value.trim(),
        jadwal: document.getElementById('jadwalCustomer').value.trim(),
        pic: document.getElementById('picCustomer').value.trim(),
        hp: document.getElementById('hpCustomer').value.trim(),
        email: document.getElementById('emailCustomer').value.trim(),
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
    document.getElementById('alamatCustomer').value = '';
    document.getElementById('jadwalCustomer').value = '';
    document.getElementById('picCustomer').value = '';
    document.getElementById('hpCustomer').value = '';
    document.getElementById('emailCustomer').value = '';
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