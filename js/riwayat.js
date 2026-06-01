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
    
    tbody.innerHTML = '<tr><td colspan="9">Memuat data transfer......</td></tr>';
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
                const metode = row[12] || 'SHARE';  // Kolom 12: Metode Transfer
                const biayaFull = parseFloat(row[13]) || 0; // Kolom 13: Biaya Full Amount
                
                html += `
                    <tr>
                        <td>${tanggal}</td>
                        <td>${noLoa}</td>
                        <td>${bank}</td>
                        <td>${penerima}</td>
                        <td>${jumlah.toLocaleString('id-ID')}</td>
                        <td>${currency}</td>
                        <td>${metode}</td>
                        <td>${biayaFull.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
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
            tbody.innerHTML = '<tr><td colspan="9">Belum ada riwayat transfer</td></tr>';
        }
    } catch (error) {
        console.error("Gagal:", error);
        tbody.innerHTML = '<tr><td colspan="9">Gagal memuat data</td></tr>';
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

function printUlangTransfer(rowData) {
    // Ambil data dari rowData (RiwayatTransfer)
    const bankTujuan = rowData[3] || '-';
    const penerima = rowData[4] || '-';
    const account = rowData[5] || '-';
    const currency = rowData[6] || 'USD';
    const jumlah = parseFloat(rowData[7]) || 0;
    const berita = rowData[8] || '-';
    const tujuan = rowData[9] || '-';
    const noLoa = rowData[2] || '-';
    const rekeningAsal = rowData[10] || '';
    
    // Data tambahan (kolom 11-16)
    const metodeTransfer = rowData[11] || 'SHARE';
    const biayaFullAmount = parseFloat(rowData[12]) || 0;
    const biayaTelex = parseFloat(rowData[13]) || 0;
    const kurs = parseFloat(rowData[14]) || 0;
    const jumlahIDR = parseFloat(rowData[15]) || 0;
    
    // ========== HITUNG JUMLAH AKHIR & SHOW BIAYA FULL ==========
    let jumlahAkhir = jumlah;
    let showBiayaFull = false;
    if (metodeTransfer === 'FULL_AMOUNT') {
        jumlahAkhir = jumlah + biayaFullAmount;
        showBiayaFull = true;
    }
    
    // ========== DETEKSI BANK PENGIRIM, MATA UANG, DLL ==========
    let bankPengirim = 'PANIN';
    let pengirimNama = 'PT SINAR CAHAYA CEMERLANG';
    let norekPengirim = '';
    let mataUangRekeningAsal = 'IDR';
    
    if (rekeningAsal && rekeningAsal !== '-') {
        // Deteksi bank (BCA atau PANIN)
        if (rekeningAsal.toUpperCase().includes('BCA')) {
            bankPengirim = 'BCA';
        } else if (rekeningAsal.toUpperCase().includes('PANIN')) {
            bankPengirim = 'PANIN';
        }
        
        // Ambil nama perusahaan
        const parts = rekeningAsal.split(' - ');
        if (parts[0]) pengirimNama = parts[0].trim();
        
        // Ambil mata uang dari dalam kurung (EUR) atau (USD)
        const matchCurrency = rekeningAsal.match(/\(([A-Z]{3})\)/);
        if (matchCurrency) {
            mataUangRekeningAsal = matchCurrency[1];
        }
        
        // Ambil no rekening (angka 4 digit atau lebih)
        const matchNorek = rekeningAsal.match(/\d{4,}/);
        if (matchNorek) {
            norekPengirim = matchNorek[0];
        }
    }
    
    // Tentukan jenis transaksi
    let jenisTransaksi = 'transfer';
    if (mataUangRekeningAsal === 'IDR' && currency !== 'IDR') {
        jenisTransaksi = 'valas';
    }
    if (rekeningAsal.toUpperCase().includes('VALAS')) {
        jenisTransaksi = 'valas';
    }
    
    // Hitung total biaya
    let totalBiaya = biayaTelex;
    if (showBiayaFull) {
        totalBiaya = biayaTelex + biayaFullAmount;
    }
    
    // DEBUG
    console.log('=== DEBUG PRINT TRANSFER ===');
    console.log('rekeningAsal:', rekeningAsal);
    console.log('bankPengirim:', bankPengirim);
    console.log('mataUangRekeningAsal:', mataUangRekeningAsal);
    console.log('jenisTransaksi:', jenisTransaksi);
    
    // ========== FUNGSI TERBILANG ==========
    function terbilangAngka(angka, curr) {
        if (angka === 0) return 'NOL ' + curr;
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
                if (sisa === 0) return puluhan[puluh];
                return puluhan[puluh] + ' ' + satuan[sisa];
            }
            if (n < 1000) {
                let ratus = Math.floor(n / 100);
                let sisa = n % 100;
                let ratusText = (ratus === 1) ? 'SERATUS' : satuan[ratus] + ' RATUS';
                if (sisa === 0) return ratusText;
                return ratusText + ' ' + convert(sisa);
            }
            if (n < 1000000) {
                let ribu = Math.floor(n / 1000);
                let sisa = n % 1000;
                let ribuText = (ribu === 1) ? 'SERIBU' : convert(ribu) + ' RIBU';
                if (sisa === 0) return ribuText;
                return ribuText + ' ' + convert(sisa);
            }
            return n.toString();
        }
        
        let bulat = Math.floor(angka);
        let pecahan = Math.round((angka - bulat) * 100);
        let hasil = convert(bulat);
        if (hasil === '') hasil = 'NOL';
        if (pecahan > 0) {
            let pecahanText = convert(pecahan);
            hasil += ' KOMA ' + (pecahanText === '' ? 'NOL' : pecahanText);
        }
        return hasil + ' ' + curr;
    }
    
    const terbilang = terbilangAngka(jumlah, currency);
    console.log('Terbilang:', terbilang);
    
    // ========== FORMAT ANGKA ==========
    const formatAngka = (angka, curr) => {
        if (curr === 'IDR') {
            return angka.toLocaleString('id-ID', {minimumFractionDigits: 0, maximumFractionDigits: 0});
        } else {
            return angka.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
        }
    };
    
    const formatKurs = (k) => {
        return k.toLocaleString('id-ID', {minimumFractionDigits: 0, maximumFractionDigits: 0});
    };
    
    const formattedJumlah = formatAngka(jumlah, currency);
    const formattedJumlahAkhir = formatAngka(jumlahAkhir, currency);
    const formattedBiayaFull = formatAngka(biayaFullAmount, currency);
    const formattedBiayaTelex = biayaTelex.toLocaleString('id-ID', {minimumFractionDigits: 0});
    const formattedKurs = formatKurs(kurs);
    const formattedJumlahIDR = formatAngka(jumlahIDR, 'IDR');
    
    let formattedBiayaFullIDR = '0';
    let formattedJumlahAkhirIDR = '0';
    if (kurs > 0 && showBiayaFull) {
        formattedBiayaFullIDR = formatAngka(biayaFullAmount * kurs, 'IDR');
    }
    if (jenisTransaksi === 'valas' && kurs > 0) {
        formattedJumlahAkhirIDR = formatAngka(jumlahAkhir * kurs, 'IDR');
    }
    
    const norekFormat = norekPengirim.split('').join(' ');
    
    // ========== BUILD RINCIAN BIAYA ==========
    let rincianHtml = '';
    let jumlahAkhirDisplay = '';
    let keteranganBiaya = '';
    
    if (jenisTransaksi === 'valas') {
        let rows = `
            <tr>
                <td class="currency-col">${currency} ${formattedJumlah}</td>
                <td class="kurs-col">${formattedKurs}</td>
                <td class="jumlah-col">IDR ${formattedJumlahIDR}</td>
            </tr>
        `;
        if (showBiayaFull) {
            rows += `
                <tr>
                    <td class="currency-col">${currency} ${formattedBiayaFull}</td>
                    <td class="kurs-col">${formattedKurs}</td>
                    <td class="jumlah-col">IDR ${formattedBiayaFullIDR}</td>
                </tr>
            `;
        }
        if (biayaTelex > 0) {
            rows += `
                <tr class="telex-row">
                    <td class="currency-col"></td>
                    <td class="kurs-col"></td>
                    <td class="jumlah-col">IDR ${formattedBiayaTelex}</td>
                </tr>
            `;
        }
        rows += `
            <tr class="total-row">
                <td class="currency-col"></td>
                <td class="kurs-col"></td>
                <td class="jumlah-col">IDR ${formattedJumlahAkhirIDR}</td>
            </tr>
        `;
        rincianHtml = `<table style="margin-left: auto;">${rows}</table>`;
        jumlahAkhirDisplay = `${currency} ${formattedJumlahAkhir}<br>(IDR ${formattedJumlahAkhirIDR})`;
        keteranganBiaya = `Transfer valas IDR → ${currency} | 1 ${currency} = IDR ${formattedKurs}`;
        if (showBiayaFull) keteranganBiaya += ` | Full amount include`;
        if (biayaTelex > 0) keteranganBiaya += ` | Biaya telex IDR ${formattedBiayaTelex}`;
    } else {
        let rows = `
            <tr>
                <td class="currency-col"></td>
                <td class="kurs-col"></td>
                <td class="jumlah-col">${currency} ${formattedJumlah}</td>
            </tr>
        `;
        if (showBiayaFull) {
            rows += `
                <tr>
                    <td class="currency-col"></td>
                    <td class="kurs-col"></td>
                    <td class="jumlah-col">${currency} ${formattedBiayaFull}</td>
                </tr>
            `;
        }
        if (biayaTelex > 0 && mataUangRekeningAsal === 'IDR') {
            rows += `
                <tr class="telex-row">
                    <td class="currency-col"></td>
                    <td class="kurs-col"></td>
                    <td class="jumlah-col">IDR ${formattedBiayaTelex}</td>
                </tr>
            `;
        }
        if (showBiayaFull) {
            rows += `
                <tr class="total-row">
                    <td class="currency-col"></td>
                    <td class="kurs-col"></td>
                    <td class="jumlah-col">${currency} ${formattedJumlahAkhir}</td>
                </tr>
            `;
        }
        rincianHtml = `<table style="margin-left: auto;">${rows}</table>`;
        jumlahAkhirDisplay = showBiayaFull ? `${currency} ${formattedJumlahAkhir}` : `${currency} ${formattedJumlah}`;
        keteranganBiaya = `Transfer ${mataUangRekeningAsal} → ${currency}`;
        if (showBiayaFull) keteranganBiaya += ` | Full amount include`;
        if (biayaTelex > 0 && mataUangRekeningAsal === 'IDR') keteranganBiaya += ` | Biaya telex IDR ${formattedBiayaTelex} (terpisah)`;
    }
    
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
        valueDate: rowData[1] || '-',
        biayaTelex: biayaTelex,
        metodeTransfer: metodeTransfer,
        biayaFullAmount: biayaFullAmount,
        totalBiaya: totalBiaya,
        kurs: kurs,
        jumlahIDR: jumlahIDR,
        jenis: jenisTransaksi
    }).toString();
    
    // ========== TENTUKAN PRINT URL ==========
    let printUrl;
    console.log('bankPengirim untuk print:', bankPengirim);
    
    if (bankPengirim === 'PANIN') {
        printUrl = `../print/print-panin.html?${params}`;
        console.log('Menggunakan print-panin.html');
    } else {
        printUrl = `../print/print-bca.html?${params}`;
        console.log('Menggunakan print-bca.html');
    }
    
    const printWindow = window.open(printUrl, '_blank');
    if (!printWindow) {
        alert('Pop-up diblokir! Harap izinkan pop-up untuk aplikasi ini.');
    }
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
    
    // Ekstrak mata uang dari rekening asal
    let mataUangRekeningAsal = 'IDR';
    if (dariRek) {
        const match = dariRek.match(/\(([A-Z]{3})\)/);
        if (match) mataUangRekeningAsal = match[1];
    }
    
    const terbilang = `${jumlahDapat.toLocaleString('en-US', {minimumFractionDigits: 2})} ${mataUang}`;
    
    const params = new URLSearchParams({
        currency: mataUang,
        jumlah: jumlahDapat,
        terbilang: terbilang,
        nama: 'PEMBELIAN VALAS',
        account: keRek,
        alamat: '-',
        bankName: '-',
        bankAlamat: '-',
        swift: '-',
        country: '-',
        berita: berita,
        tujuan: '-',
        noLoa: noRef,
        norekPengirim: dariRek,
        pengirim: dariRek.split(' - ')[0] || 'PT SINAR CAHAYA CEMERLANG',
        valueDate: tanggal,
        biayaTelex: 0,
        metodeTransfer: 'SHARE',
        biayaFullAmount: 0,
        totalBiaya: 0,
        kurs: kurs,
        jumlahIDR: jumlahIDR,
        jenis: 'valas'
    }).toString();
    
    const printUrl = `../print/print-panin.html?${params}`;
    const printWindow = window.open(printUrl, '_blank', 'width=450,height=650,scrollbars=yes,resizable=yes');
    
    if (!printWindow) {
        alert('Pop-up diblokir! Harap izinkan pop-up untuk aplikasi ini.');
    }
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