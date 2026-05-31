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
                        await loadRiwayatTransfer();
                    }
                });
            });
        } else {
            tbody.innerHTML = '</table><td colspan="7">Belum ada riwayat transfer</td><tr>';
        }
    } catch (error) {
        console.error("Gagal:", error);
        tbody.innerHTML = '<tr><td colspan="7">Gagal memuat数据</td></tr>';
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
    
    tbody.innerHTML = '<tr><td colspan="8">Memuat data valas...</td></tr>';
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
                        <td>${tanggal}</td>
                        <td>${noRef}</td>
                        <td>${dariRek}</td>
                        <td>${keRek}</td>
                        <td>${jumlahIDR.toLocaleString('id-ID')}</td>
                        <td>${kurs.toLocaleString('id-ID')}</td>
                        <td>${jumlahDapat.toLocaleString('en-US', {minimumFractionDigits: 2})} ${mataUang}</td>
                        <td>
                            <button class="btn-print-valas" data-index="${i}">🖨️ Print</button>
                        </td>
                    </tr>
                `;
            }
            tbody.innerHTML = html;
            
            window.riwayatValasData = result.data;
            
            document.querySelectorAll('.btn-print-valas').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = btn.getAttribute('data-index');
                    if (window.riwayatValasData && window.riwayatValasData[index]) {
                        printUlangValas(window.riwayatValasData[index]);
                    }
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="8">Belum ada riwayat valas</td></tr>';
        }
    } catch (error) {
        console.error("Gagal memuat riwayat valas:", error);
        tbody.innerHTML = '<tr><td colspan="8">Gagal memuat data valas</td></tr>';
    }
}

// ========== PRINT ULANG TRANSFER (pakai template print-panin/print-bca) ==========
function printUlangTransfer(rowData) {
    const bank = rowData[3] || '-';
    const penerima = rowData[4] || '-';
    const account = rowData[5] || '-';
    const currency = rowData[6] || 'USD';
    const jumlah = parseFloat(rowData[7]) || 0;
    const berita = rowData[10] || '-';
    const tujuan = rowData[11] || '-';
    const noLoa = rowData[2] || '-';
    const rekeningAsal = rowData[12] || '';
    const valueDate = rowData[13] || '-';
    const biayaTelex = rowData[14] || 0;
    const metodeTransfer = rowData[15] || 'SHARE';
    const biayaFullAmount = rowData[16] || 0;
    const totalBiaya = rowData[17] || 0;
    
    let pengirimNama = 'PT SINAR CAHAYA CEMERLANG';
    let norekPengirim = '';
    if (rekeningAsal) {
        const parts = rekeningAsal.split(' - ');
        pengirimNama = parts[0] || pengirimNama;
        norekPengirim = parts[2] || '';
    }
    
    // Fungsi terbilang
    function terbilangAngka(angka, curr) {
        const satuan = ['', 'SATU', 'DUA', 'TIGA', 'EMPAT', 'LIMA', 'ENAM', 'TUJUH', 'DELAPAN', 'SEMBILAN'];
        const belasan = ['SEPULUH', 'SEBELAS', 'DUA BELAS', 'TIGA BELAS', 'EMPAT BELAS', 'LIMA BELAS', 'ENAM BELAS', 'TUJUH BELAS', 'DELAPAN BELAS', 'SEMBILAN BELAS'];
        const puluhan = ['', '', 'DUA PULUH', 'TIGA PULUH', 'EMPAT PULUH', 'LIMA PULUH', 'ENAM PULUH', 'TUJUH PULUH', 'DELAPAN PULUH', 'SEMBILAN PULUH'];
        
        function convert(n) {
            if (n === 0) return '';
            if (n < 10) return satuan[n];
            if (n < 20) return belasan[n - 10];
            if (n < 100) {
                let puluh = Math.floor(n / 10);
                let sisa = n % 10;
                return puluhan[puluh] + (sisa > 0 ? ' ' + satuan[sisa] : '');
            }
            if (n < 1000) {
                let ratus = Math.floor(n / 100);
                let sisa = n % 100;
                return satuan[ratus] + ' RATUS' + (sisa > 0 ? ' ' + convert(sisa) : '');
            }
            if (n < 1000000) {
                let ribu = Math.floor(n / 1000);
                let sisa = n % 1000;
                return convert(ribu) + ' RIBU' + (sisa > 0 ? ' ' + convert(sisa) : '');
            }
            return n.toString();
        }
        
        let bulat = Math.floor(angka);
        let pecahan = Math.round((angka - bulat) * 100);
        let hasil = convert(bulat);
        if (hasil === '') hasil = 'NOL';
        if (pecahan > 0) hasil += ` KOMA ${convert(pecahan)}`;
        return hasil + ' ' + curr;
    }
    
    const terbilang = terbilangAngka(jumlah, currency);
    const formattedJumlah = jumlah.toLocaleString('en-US', {minimumFractionDigits: 2});
    
    const params = new URLSearchParams({
        currency: currency,
        jumlah: jumlah,
        terbilang: terbilang,
        nama: penerima,
        account: account,
        alamat: '-',
        bankName: '-',
        bankAlamat: '-',
        swift: '-',
        country: '-',
        berita: berita,
        tujuan: tujuan,
        noLoa: noLoa,
        norekPengirim: norekPengirim,
        pengirim: pengirimNama,
        biayaTelex: biayaTelex,
        metodeTransfer: metodeTransfer,
        biayaFullAmount: biayaFullAmount,
        totalBiaya: totalBiaya,
        valueDate: valueDate
    }).toString();
    
    const printWindow = window.open(`print/cetak-panin.html?${params}`, '_blank', 'width=450,height=650,scrollbars=yes,resizable=yes');
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
        <div style="font-family: monospace; padding: 20px; width: 105mm; margin: 0 auto;">
            <div style="text-align: center; border-bottom: 2px solid #000; margin-bottom: 15px;">
                <h2>APLIKASI AL</h2>
                <h3>TANDA TERIMA</h3>
                <p>No: ${noTT}</p>
            </div>
            <div><strong>Tanggal:</strong> ${tanggal}</div>
            <div><strong>Dari:</strong> ${dari}</div>
            <div><strong>Kepada:</strong> ${kepada}</div>
            <div><strong>Alamat:</strong> ${alamat}</div>
            <div><strong>Jumlah:</strong> ${jumlah.toLocaleString('id-ID')} ${currency}</div>
            <div><strong>Untuk:</strong> ${untuk}</div>
            <div><strong>Keterangan:</strong> ${keterangan}</div>
            <div style="margin-top: 40px; text-align: right;">
                Penerima,<br><br><u>${kepada}</u>
            </div>
            <div style="margin-top: 20px; text-align: center; font-size: 8pt;">Dicetak dari APLIKASI AL</div>
        </div>
    `;
    
    const printWindow = window.open('', '_blank', 'width=450,height=650,scrollbars=yes,resizable=yes');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Tanda Terima</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Courier New', monospace; margin: 0; padding: 0; }
                @media print { @page { size: A4; margin: 0; } }
            </style>
        </head>
        <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
            <div style="margin-top: 20px; text-align: center; font-size: 9pt;">Dicetak dari APLIKASI AL</div>
        </div>
    `;
    
    const printWindow = window.open('', '_blank', 'width=450,height=650,scrollbars=yes,resizable=yes');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Valas</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Courier New', monospace; margin: 0; padding: 0; }
                @media print { @page { size: A4; margin: 0; } }
            </style>
        </head>
        <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
            loadRiwayatTransfer();
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
            loadRiwayatTT();
        } else {
            alert('Gagal menghapus: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error hapus:', error);
        alert('Error koneksi saat menghapus');
    }
}

// ========== TAB NAVIGATION ==========
document.getElementById('riwayatTransferBtn')?.addEventListener('click', () => {
    document.getElementById('riwayatTransferList').style.display = 'block';
    document.getElementById('riwayatTTList').style.display = 'none';
    document.getElementById('riwayatValasList').style.display = 'none';
    document.getElementById('riwayatTransferBtn').classList.add('active');
    document.getElementById('riwayatTTBtn').classList.remove('active');
    document.getElementById('riwayatValasBtn').classList.remove('active');
    loadRiwayatTransfer();
});

document.getElementById('riwayatTTBtn')?.addEventListener('click', () => {
    document.getElementById('riwayatTransferList').style.display = 'none';
    document.getElementById('riwayatTTList').style.display = 'block';
    document.getElementById('riwayatValasList').style.display = 'none';
    document.getElementById('riwayatTTBtn').classList.add('active');
    document.getElementById('riwayatTransferBtn').classList.remove('active');
    document.getElementById('riwayatValasBtn').classList.remove('active');
    loadRiwayatTT();
});

document.getElementById('riwayatValasBtn')?.addEventListener('click', () => {
    document.getElementById('riwayatTransferList').style.display = 'none';
    document.getElementById('riwayatTTList').style.display = 'none';
    document.getElementById('riwayatValasList').style.display = 'block';
    document.getElementById('riwayatValasBtn').classList.add('active');
    document.getElementById('riwayatTransferBtn').classList.remove('active');
    document.getElementById('riwayatTTBtn').classList.remove('active');
    loadRiwayatValas();
});

// Load awal (transfer)
if (document.getElementById('riwayatTransferBtn')) {
    loadRiwayatTransfer();
}
