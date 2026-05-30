// ========== RIWAYAT.JS ==========

// Fungsi untuk memformat tanggal
function formatTanggal(timestamp) {
    if (!timestamp) return '-';
    try {
        let date = new Date(timestamp);
        if (isNaN(date.getTime())) return timestamp;
        return date.toLocaleDateString('id-ID');
    } catch(e) {
        return timestamp;
    }
}

// ========== LOAD RIWAYAT TRANSFER ==========
async function loadRiwayatTransfer() {
    const tbody = document.getElementById('riwayatTransferBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7">Memuat data transfer...</td></tr>';
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getRiwayatTransfer' })
        });
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            let html = '';
            for (let i = 0; i < result.data.length; i++) {
                const row = result.data[i];
                const tanggal = formatTanggal(row[1] || row[0]);
                const noLoa = row[2] || '-';
                const bank = row[3] || '-';
                const penerima = row[4] || '-';
                const jumlah = parseFloat(row[7]) || 0;
                const currency = row[6] || '-';
                
                html += `
                    <tr>
                        <td>${tanggal}</td>
                        <td>${noLoa}</td>
                        <td>${bank}</td>
                        <td>${penerima}</td>
                        <td>${jumlah.toLocaleString('id-ID')}</td>
                        <td>${currency}</td>
                        <td>
                            <button class="btn-print-ulang" data-index="${i}" data-type="transfer">🖨️ Print</button>
                            <button class="btn-hapus" data-index="${i}" data-type="transfer">🗑️ Hapus</button>
                        </td>
                    </tr>
                `;
            }
            tbody.innerHTML = html;
            
            window.riwayatTransferData = result.data;
            
            // Event untuk tombol Print
            document.querySelectorAll('.btn-print-ulang[data-type="transfer"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = btn.getAttribute('data-index');
                    if (window.riwayatTransferData && window.riwayatTransferData[index]) {
                        printUlangTransfer(window.riwayatTransferData[index]);
                    }
                });
            });
            
            // Event untuk tombol Hapus
            document.querySelectorAll('.btn-hapus[data-type="transfer"]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const index = btn.getAttribute('data-index');
                    if (confirm('Yakin ingin menghapus data transfer ini?')) {
                        await hapusRiwayatTransfer(index);
                        await loadRiwayatTransfer(); // Refresh tabel
                    }
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="7">Belum ada riwayat transfer</td></tr>';
        }
    } catch (error) {
        console.error("Gagal:", error);
        tbody.innerHTML = '<tr><td colspan="7">Gagal memuat data</td></tr>';
    }
}

// ========== LOAD RIWAYAT TANDA TERIMA ==========
async function loadRiwayatTT() {
    const tbody = document.getElementById('riwayatTTBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7">Memuat data tanda terima...</td></tr>';
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getRiwayatTT' })
        });
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            let html = '';
            for (let i = 0; i < result.data.length; i++) {
                const row = result.data[i];
                const tanggal = formatTanggal(row[2] || row[0]);
                const noTT = row[1] || '-';
                const dari = row[3] || '-';
                const kepada = row[4] || '-';
                const jumlah = parseFloat(row[6]) || 0;
                const currency = row[7] || '-';
                
                html += `
                    <tr>
                        <td>${tanggal}</td>
                        <td>${noTT}</td>
                        <td>${dari}</td>
                        <td>${kepada}</td>
                        <td>${jumlah.toLocaleString('id-ID')}</td>
                        <td>${currency}</td>
                        <td>
                            <button class="btn-print-ulang" data-index="${i}" data-type="tt">🖨️ Print</button>
                            <button class="btn-hapus" data-index="${i}" data-type="tt">🗑️ Hapus</button>
                        </td>
                    </tr>
                `;
            }
            tbody.innerHTML = html;
            
            window.riwayatTTData = result.data;
            
            document.querySelectorAll('.btn-print-ulang[data-type="tt"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = btn.getAttribute('data-index');
                    if (window.riwayatTTData && window.riwayatTTData[index]) {
                        printUlangTT(window.riwayatTTData[index]);
                    }
                });
            });
            
            document.querySelectorAll('.btn-hapus[data-type="tt"]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const index = btn.getAttribute('data-index');
                    if (confirm('Yakin ingin menghapus tanda terima ini?')) {
                        await hapusRiwayatTT(index);
                        await loadRiwayatTT();
                    }
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="7">Belum ada riwayat tanda terima</td></tr>';
        }
    } catch (error) {
        console.error("Gagal:", error);
        tbody.innerHTML = '<tr><td colspan="7">Gagal memuat data</td></tr>';
    }
}

// ========== LOAD RIWAYAT VALAS ==========
async function loadRiwayatValas() {
    const tbody = document.getElementById('riwayatValasBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="8">Memuat data valas...</td><\/tr>';
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getRiwayatValas' })
        });
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            let html = '';
            for (let i = 0; i < result.data.length; i++) {
                const row = result.data[i];
                const tanggal = formatTanggal(row[1] || row[0]);
                const noRef = row[2] || '-';
                const dariRek = row[3] || '-';
                const keRek = row[4] || '-';
                const jumlahIDR = parseFloat(row[5]) || 0;
                const kurs = parseFloat(row[6]) || 0;
                const jumlahDapat = parseFloat(row[7]) || 0;
                const mataUang = row[8] || '-';
                
                html += `
                    <tr>
                        <td>${tanggal}<\/td>
                        <td>${noRef}<\/td>
                        <td>${dariRek}<\/td>
                        <td>${keRek}<\/td>
                        <td>${jumlahIDR.toLocaleString('id-ID')}<\/td>
                        <td>${kurs.toLocaleString('id-ID')}<\/td>
                        <td>${jumlahDapat.toLocaleString('en-US', {minimumFractionDigits: 2})} ${mataUang}<\/td>
                        <td>
                            <button class="btn-print-valas" data-index="${i}">🖨️ Print<\/button>
                        <\/td>
                    <\/tr>
                `;
            }
            tbody.innerHTML = html;
            
            window.riwayatValasData = result.data;
            
            // Event untuk tombol print valas
            document.querySelectorAll('.btn-print-valas').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = btn.getAttribute('data-index');
                    if (window.riwayatValasData && window.riwayatValasData[index]) {
                        printUlangValas(window.riwayatValasData[index]);
                    }
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="8">Belum ada riwayat valas<\/td><\/tr>';
        }
    } catch (error) {
        console.error("Gagal memuat riwayat valas:", error);
        tbody.innerHTML = '<tr><td colspan="8">Gagal memuat data valas<\/td><\/tr>';
    }
}

// ========== PRINT ULANG VALAS ==========
function printUlangValas(rowData) {
    const tanggal = rowData[1] || '-';
    const noRef = rowData[2] || '-';
    const dariRek = rowData[3] || '-';
    const keRek = rowData[4] || '-';
    const jumlahIDR = parseFloat(rowData[5]) || 0;
    const kurs = parseFloat(rowData[6]) || 0;
    const jumlahDapat = parseFloat(rowData[7]) || 0;
    const mataUang = rowData[8] || '-';
    const berita = rowData[9] || '-';
    
    const printContent = `
        <div style="font-family: monospace; padding: 20px; width: 105mm; margin: 0 auto;">
            <div style="text-align: center; border-bottom: 2px solid #000; margin-bottom: 15px;">
                <h2>APLIKASI AL</h2>
                <h3>BUKTI PEMBELIAN VALAS</h3>
            </div>
            <div><strong>Tanggal:</strong> ${tanggal}</div>
            <div><strong>No Ref:</strong> ${noRef}</div>
            <div style="margin-top: 15px;"><strong>Detail Transaksi:</strong></div>
            <div>Dari Rekening: ${dariRek}</div>
            <div>Ke Rekening: ${keRek}</div>
            <div>Jumlah Dibayar: IDR ${jumlahIDR.toLocaleString('id-ID')}</div>
            <div>Kurs: 1 ${mataUang} = IDR ${kurs.toLocaleString('id-ID')}</div>
            <div style="font-size: 14pt; font-weight: bold; margin: 10px 0;">
                Jumlah Dapat: ${jumlahDapat.toLocaleString('en-US', {minimumFractionDigits: 2})} ${mataUang}
            </div>
            <div><strong>Berita:</strong> ${berita}</div>
            <div style="margin-top: 20px; text-align: center; font-size: 9pt;">
                Dicetak dari APLIKASI AL
            </div>
        </div>
    `;
    
    const originalBody = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalBody;
    location.reload();
}

// ========== UPDATE TAB NAVIGATION ==========
// Override event listener untuk tabs (tambahkan valas)
const riwayatTransferBtn = document.getElementById('riwayatTransferBtn');
const riwayatTTBtn = document.getElementById('riwayatTTBtn');
const riwayatValasBtn = document.getElementById('riwayatValasBtn');
const riwayatTransferList = document.getElementById('riwayatTransferList');
const riwayatTTList = document.getElementById('riwayatTTList');
const riwayatValasList = document.getElementById('riwayatValasList');

if (riwayatTransferBtn) {
    riwayatTransferBtn.addEventListener('click', () => {
        riwayatTransferBtn.classList.add('active');
        riwayatTTBtn.classList.remove('active');
        riwayatValasBtn.classList.remove('active');
        riwayatTransferList.style.display = 'block';
        riwayatTTList.style.display = 'none';
        riwayatValasList.style.display = 'none';
        loadRiwayatTransfer();
    });
}

if (riwayatTTBtn) {
    riwayatTTBtn.addEventListener('click', () => {
        riwayatTTBtn.classList.add('active');
        riwayatTransferBtn.classList.remove('active');
        riwayatValasBtn.classList.remove('active');
        riwayatTransferList.style.display = 'none';
        riwayatTTList.style.display = 'block';
        riwayatValasList.style.display = 'none';
        loadRiwayatTT();
    });
}

if (riwayatValasBtn) {
    riwayatValasBtn.addEventListener('click', () => {
        riwayatValasBtn.classList.add('active');
        riwayatTransferBtn.classList.remove('active');
        riwayatTTBtn.classList.remove('active');
        riwayatTransferList.style.display = 'none';
        riwayatTTList.style.display = 'none';
        riwayatValasList.style.display = 'block';
        loadRiwayatValas();
    });
}

// Load awal (transfer)
if (document.getElementById('riwayatTransferBtn')) {
    loadRiwayatTransfer();
}

// ========== HAPUS RIWAYAT TRANSFER ==========
async function hapusRiwayatTransfer(index) {
    const rowData = window.riwayatTransferData[index];
    if (!rowData) return;
    
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                type: 'deleteRiwayatTransfer', 
                rowIndex: index,
                timestamp: rowData[0],
                noLoa: rowData[2]
            })
        });
        const result = await response.json();
        if (result.success) {
            alert('Data berhasil dihapus');
        } else {
            alert('Gagal menghapus: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error hapus:', error);
        alert('Error koneksi saat menghapus');
    }
}

// ========== HAPUS RIWAYAT TANDA TERIMA ==========
async function hapusRiwayatTT(index) {
    const rowData = window.riwayatTTData[index];
    if (!rowData) return;
    
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                type: 'deleteRiwayatTT', 
                rowIndex: index,
                timestamp: rowData[0],
                noTT: rowData[1]
            })
        });
        const result = await response.json();
        if (result.success) {
            alert('Data berhasil dihapus');
        } else {
            alert('Gagal menghapus: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error hapus:', error);
        alert('Error koneksi saat menghapus');
    }
}

// ========== PRINT ULANG TRANSFER ==========
function printUlangTransfer(rowData) {
    const tanggal = rowData[1] || '-';
    const bank = rowData[3] || '-';
    const penerima = rowData[4] || '-';
    const account = rowData[5] || '-';
    const currency = rowData[6] || 'USD';
    const jumlah = parseFloat(rowData[7]) || 0;
    const admin = parseFloat(rowData[8]) || 0;
    const total = parseFloat(rowData[9]) || 0;
    const berita = rowData[10] || '-';
    const tujuan = rowData[11] || '-';
    const noLoa = rowData[2] || '-';
    
    function terbilangSederhana(angka, curr) {
        return Math.floor(angka).toLocaleString() + ' ' + curr;
    }
    
    let printContent = '';
    
    if (bank === 'PANIN') {
        printContent = `
            <div style="font-family: 'Courier New', monospace; font-size: 10pt; width: 100%; padding: 10mm;">
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 13pt; font-weight: bold;">${currency} ${jumlah.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                    <div style="font-size: 9pt; border-bottom: 1px dashed #ccc; padding-bottom: 8px;">${terbilangSederhana(jumlah, currency)}</div>
                </div>
                <div style="display: flex; gap: 30px; justify-content: space-between;">
                    <div style="flex: 2;">
                        <div style="font-weight: bold;">${penerima}</div>
                        <div>${account}</div>
                        <div style="height: 8px;"></div>
                        <div>${berita}</div>
                        <div>${tujuan}</div>
                        <div style="height: 8px;"></div>
                        <div style="font-weight: bold;">PT. SINAR CAHAYA CEMERLANG</div>
                        <div style="letter-spacing: 5px; font-size: 11pt; margin-top: 5px;">0 7 9 6 0 0 0 6 6 5</div>
                    </div>
                    <div style="flex: 1; text-align: right;">
                        <div>${currency} ${jumlah.toLocaleString()}</div>
                        <div>${currency} ${admin.toLocaleString()}</div>
                        <div><strong>Total: ${currency} ${total.toLocaleString()}</strong></div>
                    </div>
                </div>
                <div style="margin-top: 15px; text-align: center; font-size: 8pt;">Dicetak ulang dari Riwayat - ${new Date().toLocaleString()}</div>
            </div>
        `;
    } else {
        printContent = `
            <div style="font-family: 'Courier New', monospace; text-align: center; padding: 20px;">
                <h2>BANK BCA</h2>
                <div style="font-size: 18pt; font-weight: bold;">${currency} ${jumlah.toLocaleString()}</div>
                <div>Penerima: ${penerima}</div>
                <div>Account: ${account}</div>
                <div>Berita: ${berita}</div>
                <div>Tujuan: ${tujuan}</div>
                <div>LOA: ${noLoa}</div>
                <div style="margin-top: 15px; font-size: 8pt;">Dicetak ulang dari Riwayat - ${new Date().toLocaleString()}</div>
            </div>
        `;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Ulang - ${bank}</title>
            <style>
                body { margin: 0; padding: 0; }
                @media print {
                    body { margin: 0; padding: 0; }
                }
            </style>
        </head>
        <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ========== PRINT ULANG TANDA TERIMA ==========
function printUlangTT(rowData) {
    const noTT = rowData[1] || '-';
    const tanggal = rowData[2] || '-';
    const dari = rowData[3] || '-';
    const kepada = rowData[4] || '-';
    const alamat = rowData[5] || '-';
    const jumlah = parseFloat(rowData[6]) || 0;
    const currency = rowData[7] || '-';
    const untuk = rowData[8] || '-';
    const keterangan = rowData[9] || '-';
    
    const printContent = `
        <div style="font-family: monospace; padding: 20px;">
            <h2 style="text-align: center;">TANDA TERIMA</h2>
            <p><strong>No:</strong> ${noTT}</p>
            <p><strong>Tanggal:</strong> ${tanggal}</p>
            <p><strong>Dari:</strong> ${dari}</p>
            <p><strong>Kepada:</strong> ${kepada}</p>
            <p><strong>Alamat:</strong> ${alamat}</p>
            <p><strong>Jumlah:</strong> ${jumlah.toLocaleString('id-ID')} ${currency}</p>
            <p><strong>Untuk:</strong> ${untuk}</p>
            <p><strong>Keterangan:</strong> ${keterangan}</p>
            <br><br>
            <p style="text-align: right;">Penerima,<br><br><u>${kepada}</u></p>
            <div style="margin-top: 20px; text-align: center; font-size: 8pt;">Dicetak ulang dari Riwayat - ${new Date().toLocaleString()}</div>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Ulang - Tanda Terima ${noTT}</title>
            <style>
                body { font-family: monospace; margin: 0; padding: 0; }
                @media print {
                    body { margin: 0; padding: 0; }
                }
            </style>
        </head>
        <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ========== TAB NAVIGATION ==========
document.getElementById('riwayatTransferBtn')?.addEventListener('click', () => {
    document.getElementById('riwayatTransferList').style.display = 'block';
    document.getElementById('riwayatTTList').style.display = 'none';
    document.getElementById('riwayatTransferBtn').classList.add('active');
    document.getElementById('riwayatTTBtn').classList.remove('active');
    loadRiwayatTransfer();
});

document.getElementById('riwayatTTBtn')?.addEventListener('click', () => {
    document.getElementById('riwayatTransferList').style.display = 'none';
    document.getElementById('riwayatTTList').style.display = 'block';
    document.getElementById('riwayatTTBtn').classList.add('active');
    document.getElementById('riwayatTransferBtn').classList.remove('active');
    loadRiwayatTT();
});

// Load awal
if (document.getElementById('riwayatTransferBtn')) {
    loadRiwayatTransfer();
}