// ========== RIWAYAT.JS ==========
console.log('✅ riwayat.js loaded!');

// ========== FUNGSI TERBILANG (HARUS DI PALING ATAS) ==========
function terbilang(angka) {
    // Pastikan angka adalah number bulat
    angka = Math.floor(Math.abs(angka));
    
    const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    
    if (angka < 12) {
        return bilangan[angka];
    } else if (angka < 20) {
        return bilangan[angka - 10] + ' Belas';
    } else if (angka < 100) {
        const puluhan = Math.floor(angka / 10);
        const sisa = angka % 10;
        if (sisa === 0) return bilangan[puluhan] + ' Puluh';
        return bilangan[puluhan] + ' Puluh ' + bilangan[sisa];
    } else if (angka < 200) {
        return 'Seratus ' + terbilang(angka - 100);
    } else if (angka < 1000) {
        const ratusan = Math.floor(angka / 100);
        const sisa = angka % 100;
        if (sisa === 0) return bilangan[ratusan] + ' Ratus';
        return bilangan[ratusan] + ' Ratus ' + terbilang(sisa);
    } else if (angka < 2000) {
        return 'Seribu ' + terbilang(angka - 1000);
    } else if (angka < 1000000) {
        const ribuan = Math.floor(angka / 1000);
        const sisa = angka % 1000;
        if (sisa === 0) return terbilang(ribuan) + ' Ribu';
        if (ribuan === 1) return 'Seribu ' + terbilang(sisa);
        return terbilang(ribuan) + ' Ribu ' + terbilang(sisa);
    } else if (angka < 1000000000) {
        const jutaan = Math.floor(angka / 1000000);
        const sisa = angka % 1000000;
        if (sisa === 0) return terbilang(jutaan) + ' Juta';
        if (jutaan === 1) return 'Satu Juta ' + terbilang(sisa);
        return terbilang(jutaan) + ' Juta ' + terbilang(sisa);
    } else if (angka < 1000000000000) {
        const milyaran = Math.floor(angka / 1000000000);
        const sisa = angka % 1000000000;
        if (sisa === 0) return terbilang(milyaran) + ' Milyar';
        if (milyaran === 1) return 'Satu Milyar ' + terbilang(sisa);
        return terbilang(milyaran) + ' Milyar ' + terbilang(sisa);
    }
    return angka.toLocaleString('id-ID');
}

function prosesAngkaIndonesia(input) {
    let angka;
    
    if (typeof input === 'string') {
        // Format: "1.000,26" -> 1000.26
        let bersih = input.replace(/\./g, '');
        bersih = bersih.replace(/,/g, '.');
        angka = parseFloat(bersih) || 0;
    } else {
        angka = parseFloat(input) || 0;
    }
    
    let angkaStr = angka.toFixed(2);
    let parts = angkaStr.split('.');
    let bulat = parseInt(parts[0]) || 0;
    let desimal = parseInt(parts[1]) || 0;
    
    return { bulat, desimal };
}

function terbilangDenganKoma(jumlah, mataUang) {
    const { bulat, desimal } = prosesAngkaIndonesia(jumlah);
    
    if (bulat === 0 && desimal === 0) {
        return `NOL ${mataUang.toUpperCase()}`;
    }
    
    let hasil = '';
    
    if (bulat > 0) {
        hasil = terbilang(bulat);
    } else {
        hasil = 'Nol';
    }
    
    if (desimal > 0) {
        hasil += ' KOMA ' + terbilang(desimal);
    }
    
    switch(mataUang.toUpperCase()) {
        case 'USD': hasil += ' DOLAR AS'; break;
        case 'EUR': hasil += ' EURO'; break;
        case 'SGD': hasil += ' DOLAR SINGAPURA'; break;
        case 'GBP': hasil += ' POUNDSTERLING'; break;
        case 'JPY': hasil += ' YEN JEPANG'; break;
        case 'CNY': hasil += ' YUAN CHINA'; break;
        case 'AUD': hasil += ' DOLAR AUSTRALIA'; break;
        case 'HKD': hasil += ' DOLAR HONGKONG'; break;
        case 'MYR': hasil += ' RINGGIT MALAYSIA'; break;
        case 'IDR': hasil += ' RUPIAH'; break;
        default: hasil += ` ${mataUang.toUpperCase()}`;
    }
    
    return hasil;
}

function terbilangPrint(jumlah, mataUang) {
    return terbilangDenganKoma(jumlah, mataUang).toUpperCase();
}

// ========== FUNGSI FORMAT TANGGAL ==========
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

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

// ========== GLOBAL VARIABLES ==========
let transferData = [];
let currentTransferData = [];
let ttData = [];
let valasData = [];

// ========== LOAD RIWAYAT TRANSFER ==========
async function loadRiwayatTransfer() {
    console.log('loadRiwayatTransfer dipanggil');
    const tbody = document.getElementById('riwayatTransferBody');
    if (!tbody) {
        console.error('Element riwayatTransferBody tidak ditemukan');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="7">Memuat data transfer...</td></tr>';
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getRiwayatTransfer' })
        });
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            transferData = result.data;
            currentTransferData = [...transferData];
            renderTransferTable(currentTransferData);
        } else {
            tbody.innerHTML = '<tr><td colspan="7">Belum ada riwayat transfer</td></tr>';
        }
    } catch (error) {
        console.error("Gagal load transfer:", error);
        tbody.innerHTML = '<tr><td colspan="7">Gagal memuat data: ' + error.message + '</td></tr>';
    }
}

function renderTransferTable(data) {
    const tbody = document.getElementById('riwayatTransferBody');
    if (!tbody) return;
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Tidak ada数据</td></tr>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const tanggal = formatTanggal(row[1] || row[0]);
        const noLoa = row[2] || '-';
        const bank = row[3] || '-';
        const penerima = row[4] || '-';
        const jumlah = parseFloat(row[7]) || 0;
        const currency = row[6] || '-';
        
        html += `
            <tr>
                <td>${escapeHtml(tanggal)}</td>
                <td>${escapeHtml(noLoa)}</td>
                <td>${escapeHtml(bank)}</td>
                <td>${escapeHtml(penerima)}</td>
                <td>${jumlah.toLocaleString('id-ID')}</td>
                <td>${escapeHtml(currency)}</td>
                <td>
                    <button class="btn-print-transfer" data-index="${i}">🖨️ Print</button>
                    <button class="btn-hapus-transfer" data-index="${i}">🗑️ Hapus</button>
                 </td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
    
    document.querySelectorAll('.btn-print-transfer').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-index'));
            if (currentTransferData[idx]) {
                printUlangTransfer(currentTransferData[idx]);
            }
        });
    });
    
    document.querySelectorAll('.btn-hapus-transfer').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.getAttribute('data-index'));
            if (confirm('Yakin ingin menghapus data transfer ini?')) {
                await hapusRiwayatTransfer(idx);
                await loadRiwayatTransfer();
            }
        });
    });
}

// ========== LOAD RIWAYAT TANDA TERIMA (TT) ==========
async function loadRiwayatTT() {
    console.log('loadRiwayatTT dipanggil');
    const tbody = document.getElementById('riwayatTTBody');
    if (!tbody) {
        console.error('Element riwayatTTBody tidak ditemukan');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="7">Memuat data tanda terima...</td></tr>';
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getRiwayatTT' })
        });
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            ttData = result.data;
            renderTTTable(ttData);
        } else {
            tbody.innerHTML = '<tr><td colspan="7">Belum ada riwayat tanda terima</td></tr>';
        }
    } catch (error) {
        console.error("Gagal load TT:", error);
        tbody.innerHTML = '<tr><td colspan="7">Gagal memuat data: ' + error.message + '</td></tr>';
    }
}

function renderTTTable(data) {
    const tbody = document.getElementById('riwayatTTBody');
    if (!tbody) return;
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Tidak ada数据</td></tr>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const tanggal = formatTanggal(row.tanggal || row[0]);
        const noTT = row.no_tt || row[1] || '-';
        const dari = row.dari || row[2] || '-';
        const kepada = row.kepada || row[3] || '-';
        const jumlah = parseFloat(row.jumlah || row[4]) || 0;
        const currency = row.currency || row[5] || '-';
        
        html += `
            <tr>
                <td>${escapeHtml(tanggal)}</td>
                <td>${escapeHtml(noTT)}</td>
                <td>${escapeHtml(dari)}</td>
                <td>${escapeHtml(kepada)}</td>
                <td>${jumlah.toLocaleString('id-ID')}</td>
                <td>${escapeHtml(currency)}</td>
                <td>
                    <button class="btn-print-tt" data-index="${i}">🖨️ Print</button>
                    <button class="btn-hapus-tt" data-index="${i}">🗑️ Hapus</button>
                 </td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
    
    document.querySelectorAll('.btn-print-tt').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-index'));
            if (ttData[idx]) printUlangTT(ttData[idx]);
        });
    });
    
    document.querySelectorAll('.btn-hapus-tt').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.getAttribute('data-index'));
            if (confirm('Yakin ingin menghapus data tanda terima ini?')) {
                await hapusRiwayatTT(idx);
                await loadRiwayatTT();
            }
        });
    });
}

// ========== LOAD RIWAYAT VALAS ==========
async function loadRiwayatValas() {
    console.log('loadRiwayatValas dipanggil');
    const tbody = document.getElementById('riwayatValasBody');
    if (!tbody) {
        console.error('Element riwayatValasBody tidak ditemukan');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="8">Memuat data valas...</td></tr>';
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getRiwayatValas' })
        });
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            valasData = result.data;
            renderValasTable(valasData);
        } else {
            tbody.innerHTML = '<tr><td colspan="8">Belum ada riwayat valas</td></tr>';
        }
    } catch (error) {
        console.error("Gagal load Valas:", error);
        tbody.innerHTML = '<tr><td colspan="8">Gagal memuat data: ' + error.message + '</td></tr>';
    }
}

function renderValasTable(data) {
    const tbody = document.getElementById('riwayatValasBody');
    if (!tbody) return;
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Tidak ada数据</td></tr>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const tanggal = formatTanggal(row.tanggal || row[0]);
        const noReferensi = row.no_referensi || row[1] || '-';
        const dariRekening = row.dari_rekening || row[2] || '-';
        const keRekening = row.ke_rekening || row[3] || '-';
        const jumlahIDR = parseFloat(row.jumlah_idr || row[4]) || 0;
        const kurs = parseFloat(row.kurs || row[5]) || 0;
        const jumlahDapat = parseFloat(row.jumlah_dapat || row[6]) || 0;
        
        html += `
            <tr>
                <td>${escapeHtml(tanggal)}</td>
                <td>${escapeHtml(noReferensi)}</td>
                <td>${escapeHtml(dariRekening)}</td>
                <td>${escapeHtml(keRekening)}</td>
                <td>${jumlahIDR.toLocaleString('id-ID')}</td>
                <td>${kurs.toLocaleString('id-ID')}</td>
                <td>${jumlahDapat.toLocaleString('id-ID')}</td>
                <td>
                    <button class="btn-print-valas" data-index="${i}">🖨️ Print</button>
                    <button class="btn-hapus-valas" data-index="${i}">🗑️ Hapus</button>
                 </td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
    
    document.querySelectorAll('.btn-print-valas').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-index'));
            if (valasData[idx]) printUlangValas(valasData[idx]);
        });
    });
    
    document.querySelectorAll('.btn-hapus-valas').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.getAttribute('data-index'));
            if (confirm('Yakin ingin menghapus data valas ini?')) {
                await hapusRiwayatValas(idx);
                await loadRiwayatValas();
            }
        });
    });
}

// ========== FUNGSI SEARCH ==========
function applySearch() {
    const keyword = document.getElementById('searchKeyword')?.value.toLowerCase().trim() || '';
    const dateFrom = document.getElementById('searchDateFrom')?.value;
    const dateTo = document.getElementById('searchDateTo')?.value;
    const currency = document.getElementById('searchCurrency')?.value;
    
    let filtered = [...transferData];
    
    if (keyword) {
        filtered = filtered.filter(row => {
            const noLoa = (row[2] || '').toLowerCase();
            const penerima = (row[4] || '').toLowerCase();
            const bank = (row[3] || '').toLowerCase();
            return noLoa.includes(keyword) || penerima.includes(keyword) || bank.includes(keyword);
        });
    }
    
    if (dateFrom) {
        filtered = filtered.filter(row => {
            const tgl = row[1] || '';
            const parts = tgl.split('/');
            if (parts.length === 3) {
                const rowDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                return rowDate >= dateFrom;
            }
            return true;
        });
    }
    
    if (dateTo) {
        filtered = filtered.filter(row => {
            const tgl = row[1] || '';
            const parts = tgl.split('/');
            if (parts.length === 3) {
                const rowDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                return rowDate <= dateTo;
            }
            return true;
        });
    }
    
    if (currency) {
        filtered = filtered.filter(row => row[6] === currency);
    }
    
    currentTransferData = filtered;
    renderTransferTable(currentTransferData);
}

function resetSearch() {
    if (document.getElementById('searchKeyword')) document.getElementById('searchKeyword').value = '';
    if (document.getElementById('searchDateFrom')) document.getElementById('searchDateFrom').value = '';
    if (document.getElementById('searchDateTo')) document.getElementById('searchDateTo').value = '';
    if (document.getElementById('searchCurrency')) document.getElementById('searchCurrency').value = '';
    currentTransferData = [...transferData];
    renderTransferTable(currentTransferData);
}

// ========== PRINT FUNCTIONS ==========
async function printUlangTransfer(rowData) {
    console.log('Printing transfer:', rowData);
    
    const penerima = rowData[4] || '-';
    const account = rowData[5] || '-';
    const currency = rowData[6] || 'USD';
    const jumlah = rowData[7] || 0;
    const berita = rowData[8] || '-';
    const tujuan = rowData[9] || '-';
    const noLoa = rowData[2] || '-';
    const rekeningAsal = rowData[10] || '';
    const metodeTransfer = rowData[11] || 'SHARE';
    const biayaFullAmount = parseFloat(rowData[12]) || 0;
    const biayaTelex = parseFloat(rowData[13]) || 0;
    const kurs = parseFloat(rowData[14]) || 0;
    const jumlahIDR = parseFloat(rowData[15]) || 0;
    const bankPenerima = rowData[3] || '-';
    
    // Buat terbilang
    const terbilangText = terbilangPrint(jumlah, currency);
    console.log('Terbilang:', terbilangText);
    
    // Cari supplier untuk alamat
    let alamat = '-';
    let bankAlamat = '-';
    let swift = '-';
    let country = '-';
    
    // Tunggu suppliers jika belum ada
    if (typeof suppliers === 'undefined' || !suppliers || suppliers.length === 0) {
        console.log('Menunggu data supplier...');
        if (typeof loadSuppliers === 'function') {
            await loadSuppliers();
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Cari supplier berdasarkan nama penerima
    if (typeof suppliers !== 'undefined' && suppliers && suppliers.length) {
        const supplier = suppliers.find(s => s.nama === penerima);
        if (supplier) {
            alamat = supplier.alamat || '-';
            bankAlamat = supplier.bankAlamat || '-';
            swift = supplier.swift || '-';
            country = supplier.country || '-';
            console.log('✅ Supplier ditemukan:', penerima, 'Alamat:', alamat);
        } else {
            console.log('⚠️ Supplier tidak ditemukan:', penerima);
        }
    } else {
        console.log('⚠️ Data supplier belum tersedia');
    }
    
    // Deteksi bank pengirim
    let bankPengirim = 'PANIN';
    let norekPengirim = '';
    let pengirimNama = 'PT SINAR CAHAYA CEMERLANG';
    
    if (rekeningAsal && rekeningAsal !== '-') {
        if (rekeningAsal.toUpperCase().includes('BCA')) {
            bankPengirim = 'BCA';
        }
        const parts = rekeningAsal.split(' - ');
        if (parts[0]) pengirimNama = parts[0];
        const matchNorek = rekeningAsal.match(/\d{4,}/);
        if (matchNorek) norekPengirim = matchNorek[0];
    }
    
    // Buat parameter URL
    const params = new URLSearchParams({
        currency: currency,
        jumlah: jumlah,
        terbilang: terbilangText,
        nama: penerima,
        account: account,
        alamat: alamat,
        bankName: bankPenerima,
        bankAlamat: bankAlamat,
        swift: swift,
        country: country,
        berita: berita,
        tujuan: tujuan,
        noLoa: noLoa,
        norekPengirim: norekPengirim,
        pengirim: pengirimNama,
        valueDate: rowData[1] || '-',
        biayaTelex: biayaTelex,
        metodeTransfer: metodeTransfer,
        biayaFullAmount: biayaFullAmount,
        totalBiaya: biayaTelex + (metodeTransfer === 'FULL_AMOUNT' ? biayaFullAmount : 0),
        kurs: kurs,
        jumlahIDR: jumlahIDR,
        jenis: 'transfer'
    }).toString();
    
    let printUrl;
    if (bankPengirim === 'PANIN') {
        printUrl = `../print/print-panin.html?${params}`;
    } else {
        printUrl = `../print/print-bca.html?${params}`;
    }
    
    console.log('Print URL:', printUrl);
    
    try {
        const printWindow = window.open(printUrl, '_blank');
        if (!printWindow) {
            alert('Pop-up diblokir! Harap izinkan pop-up untuk aplikasi ini.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal membuka halaman print: ' + error.message);
    }
}

function printUlangTT(rowData) {
    console.log('Printing TT:', rowData);
    alert('Fitur print Tanda Terima sedang dalam pengembangan');
}

function printUlangValas(rowData) {
    console.log('Printing Valas:', rowData);
    alert('Fitur print Valas sedang dalam pengembangan');
}

// ========== DELETE FUNCTIONS ==========
async function hapusRiwayatTransfer(index) {
    const rowData = transferData[index];
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
            alert('Data transfer berhasil dihapus');
            await loadRiwayatTransfer();
        } else {
            alert('Gagal menghapus: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error hapus:', error);
        alert('Error koneksi saat menghapus');
    }
}

async function hapusRiwayatTT(index) {
    const rowData = ttData[index];
    if (!rowData) return;
    
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                type: 'deleteRiwayatTT', 
                rowIndex: index,
                id: rowData.id || rowData[0]
            })
        });
        const result = await response.json();
        if (result.success) {
            alert('Data Tanda Terima berhasil dihapus');
            await loadRiwayatTT();
        } else {
            alert('Gagal menghapus: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error hapus TT:', error);
        alert('Error koneksi saat menghapus');
    }
}

async function hapusRiwayatValas(index) {
    const rowData = valasData[index];
    if (!rowData) return;
    
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                type: 'deleteRiwayatValas', 
                rowIndex: index,
                id: rowData.id || rowData[0]
            })
        });
        const result = await response.json();
        if (result.success) {
            alert('Data Valas berhasil dihapus');
            await loadRiwayatValas();
        } else {
            alert('Gagal menghapus: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error hapus Valas:', error);
        alert('Error koneksi saat menghapus');
    }
}

// ========== TAB NAVIGATION ==========
function initTabs() {
    console.log('initTabs dipanggil');
    const transferBtn = document.getElementById('riwayatTransferBtn');
    const ttBtn = document.getElementById('riwayatTTBtn');
    const valasBtn = document.getElementById('riwayatValasBtn');
    const transferList = document.getElementById('riwayatTransferList');
    const ttList = document.getElementById('riwayatTTList');
    const valasList = document.getElementById('riwayatValasList');
    const searchContainer = document.getElementById('searchContainer');
    
    if (transferBtn) {
        transferBtn.addEventListener('click', () => {
            transferBtn.classList.add('active');
            ttBtn?.classList.remove('active');
            valasBtn?.classList.remove('active');
            transferList.style.display = 'block';
            ttList.style.display = 'none';
            valasList.style.display = 'none';
            if (searchContainer) searchContainer.style.display = 'flex';
            loadRiwayatTransfer();
        });
    }
    
    if (ttBtn) {
        ttBtn.addEventListener('click', () => {
            ttBtn.classList.add('active');
            transferBtn?.classList.remove('active');
            valasBtn?.classList.remove('active');
            transferList.style.display = 'none';
            ttList.style.display = 'block';
            valasList.style.display = 'none';
            if (searchContainer) searchContainer.style.display = 'none';
            loadRiwayatTT();
        });
    }
    
    if (valasBtn) {
        valasBtn.addEventListener('click', () => {
            valasBtn.classList.add('active');
            transferBtn?.classList.remove('active');
            ttBtn?.classList.remove('active');
            transferList.style.display = 'none';
            ttList.style.display = 'none';
            valasList.style.display = 'block';
            if (searchContainer) searchContainer.style.display = 'none';
            loadRiwayatValas();
        });
    }
}

// ========== SETUP BUTTONS ==========
function setupSearchButtons() {
    const btnSearch = document.getElementById('btnSearch');
    const btnReset = document.getElementById('btnReset');
    if (btnSearch) btnSearch.addEventListener('click', applySearch);
    if (btnReset) btnReset.addEventListener('click', resetSearch);
}

function setupExportButtons() {
    const btnExportTransfer = document.getElementById('btnExportTransfer');
    const btnExportTT = document.getElementById('btnExportTT');
    const btnExportValas = document.getElementById('btnExportValas');
    
    if (btnExportTransfer) {
        btnExportTransfer.addEventListener('click', () => {
            alert('Export Transfer: ' + transferData.length + ' data siap diexport');
        });
    }
    if (btnExportTT) {
        btnExportTT.addEventListener('click', () => {
            alert('Export TT: ' + ttData.length + ' data siap diexport');
        });
    }
    if (btnExportValas) {
        btnExportValas.addEventListener('click', () => {
            alert('Export Valas: ' + valasData.length + ' data siap diexport');
        });
    }
}

// ========== INISIALISASI ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready, memulai inisialisasi...');
    initTabs();
    setupSearchButtons();
    setupExportButtons();
    loadRiwayatTransfer();
});

console.log('✅ riwayat.js selesai dimuat');