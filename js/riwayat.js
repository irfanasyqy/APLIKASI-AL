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
                        </td>
                    </tr>
                `;
            }
            tbody.innerHTML = html;
            
            // Simpan data riwayat ke variabel global
            window.riwayatTransferData = result.data;
            
            // Tambahkan event listener untuk tombol print
            document.querySelectorAll('.btn-print-ulang[data-type="transfer"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = btn.getAttribute('data-index');
                    if (window.riwayatTransferData && window.riwayatTransferData[index]) {
                        printUlangTransfer(window.riwayatTransferData[index]);
                    }
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="7">Belum ada riwayat transfer</td></tr>';
        }
    } catch (error) {
        console.error("Gagal memuat riwayat transfer:", error);
        tbody.innerHTML = '<tr><td colspan="7">Gagal memuat data transfer</td></tr>';
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
                        </td>
                    </tr>
                `;
            }
            tbody.innerHTML = html;
            
            window.riwayatTTData = result.data;
            
            document.querySelectorAll('.btn-print-ulang[data-type="tt"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = btn.getAttribute('data-index');
                    if (window.riwayatTTData && window.riwayatTTData[index]) {
                        printUlangTT(window.riwayatTTData[index]);
                    }
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="7">Belum ada riwayat tanda terima</td></tr>';
        }
    } catch (error) {
        console.error("Gagal memuat riwayat tanda terima:", error);
        tbody.innerHTML = '<tr><td colspan="7">Gagal memuat data tanda terima</td></tr>';
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