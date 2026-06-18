// ========== RIWAYAT.JS ==========
console.log('✅ riwayat.js loaded!');

// ========== DEBUG CONFIG ==========
const DEBUG = {
    enabled: true, // Set false untuk matikan semua log
    cache: true,   // Log cache
    api: true,     // Log API
    render: true,  // Log render
    print: true    // Log print
};

// ========== HELPER FUNCTION ==========
function safeToString(value) {
    if (value === null || value === undefined) return '';
    return String(value);
}

// ========== FUNGSI LOG SATU UNTUK SEMUA ==========
function log(message, type = 'info', data = null) {
    if (!DEBUG.enabled) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}]`;
    
    let shouldLog = true;
    switch(type) {
        case 'cache': shouldLog = DEBUG.cache; break;
        case 'api': shouldLog = DEBUG.api; break;
        case 'render': shouldLog = DEBUG.render; break;
        case 'print': shouldLog = DEBUG.print; break;
        default: shouldLog = true;
    }
    
    if (!shouldLog) return;
    
    const styles = {
        info: 'color: #3498db; font-weight: bold;',
        success: 'color: #27ae60; font-weight: bold;',
        warning: 'color: #f39c12; font-weight: bold;',
        error: 'color: #e74c3c; font-weight: bold;',
        cache: 'color: #9b59b6; font-weight: bold;',
        api: 'color: #1abc9c; font-weight: bold;',
        render: 'color: #2ecc71; font-weight: bold;',
        print: 'color: #e67e22; font-weight: bold;'
    };
    
    const style = styles[type] || styles.info;
    
    if (data) {
        console.log(`%c${prefix} ${message}`, style, data);
    } else {
        console.log(`%c${prefix} ${message}`, style);
    }
}

// ========== GLOBAL VARIABLES ==========
window.daftarRekening = [];
let transferData = [];
let currentTransferData = [];
let ttData = [];
let valasData = [];
let isRekeningLoaded = false;

// ========== CACHE CONFIGURATION ==========
const CACHE_CONFIG = {
    REKENING: {
        key: 'cache_rekening',
        expiry: 10 * 60 * 1000 // 10 menit
    },
    TRANSFER: {
        key: 'cache_transfer',
        expiry: 5 * 60 * 1000 // 5 menit
    },
    TT: {
        key: 'cache_tt',
        expiry: 5 * 60 * 1000 // 5 menit
    },
    VALAS: {
        key: 'cache_valas',
        expiry: 5 * 60 * 1000 // 5 menit
    }
};

// ========== CACHE FUNCTIONS ==========
function saveToCache(key, data) {
    try {
        const cacheData = {
            timestamp: Date.now(),
            data: data
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
        log(`💾 Data disimpan ke cache: ${key} (${data?.length || 0} item)`, 'cache');
    } catch(e) {
        log(`⚠️ Gagal menyimpan cache ${key}: ${e.message}`, 'warning');
    }
}

function getFromCache(key, expiry) {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) {
            log(`📭 Cache kosong: ${key}`, 'cache');
            return null;
        }
        
        const cacheData = JSON.parse(cached);
        const isExpired = (Date.now() - cacheData.timestamp) > expiry;
        
        if (isExpired) {
            log(`⏰ Cache expired: ${key} (${Math.round((Date.now() - cacheData.timestamp) / 60000)} menit)`, 'cache');
            localStorage.removeItem(key);
            return null;
        }
        
        log(`✅ Cache ditemukan: ${key} (${cacheData.data?.length || 0} item, ${Math.round((Date.now() - cacheData.timestamp) / 1000)} detik)`, 'cache');
        return cacheData.data;
    } catch(e) {
        log(`⚠️ Gagal mengambil cache ${key}: ${e.message}`, 'warning');
        return null;
    }
}

function clearCache(key = null) {
    if (key) {
        localStorage.removeItem(key);
        log(`🗑️ Cache dihapus: ${key}`, 'cache');
    } else {
        Object.values(CACHE_CONFIG).forEach(config => {
            localStorage.removeItem(config.key);
        });
        log('🗑️ Semua cache dihapus', 'cache');
    }
}

// ========== DATA ALAMAT MANUAL (GLOBAL) ==========
window.ALAMAT_MANUAL = {
    '1222': { alamatPenerima: 'Jl. Gunung Sahari 2 No. 7, Jakarta Pusat', alamatBank: 'Jl. Garuda No. 1, Jakarta Pusat', swift: '' },
    '1223': { alamatPenerima: 'Jl. Gunung Sahari 2 No. 7, Jakarta Pusat', alamatBank: 'Jl. Wahid Hasyim No. 10, Jakarta Pusat', swift: '' },
    '1224': { alamatPenerima: 'Jl. Gunung Sahari 2 No. 7, Jakarta Pusat', alamatBank: 'Jl. Garuda No. 1, Jakarta Pusat', swift: '' },
    '1234': { alamatPenerima: 'Jl. Gunung Sahari 2 No. 7, Jakarta Pusat', alamatBank: 'Jl. Garuda No. 1, Jakarta Pusat', swift: '' },
    '1233': { alamatPenerima: 'Jl. Gunung Sahari 2 No. 7, Jakarta Pusat', alamatBank: 'Jl. Garuda No. 1, Jakarta Pusat', swift: '' },
    '1243': { alamatPenerima: 'Jl. Gunung Sahari 2 No. 7, Jakarta Pusat', alamatBank: 'Jl. Wahid Hasyim No. 10, Jakarta Pusat', swift: '' },
    '1253': { alamatPenerima: 'Jl. Gunung Sahari 2 No. 7, Jakarta Pusat', alamatBank: 'Jl. Garuda No. 1, Jakarta Pusat', swift: '' }
};

// ========== FUNGSI TERBILANG ==========
function terbilang(angka) {
    angka = Math.floor(Math.abs(angka));
    const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    
    if (angka < 12) return bilangan[angka];
    else if (angka < 20) return bilangan[angka - 10] + ' Belas';
    else if (angka < 100) {
        const puluhan = Math.floor(angka / 10);
        const sisa = angka % 10;
        if (sisa === 0) return bilangan[puluhan] + ' Puluh';
        return bilangan[puluhan] + ' Puluh ' + bilangan[sisa];
    } else if (angka < 200) return 'Seratus ' + terbilang(angka - 100);
    else if (angka < 1000) {
        const ratusan = Math.floor(angka / 100);
        const sisa = angka % 100;
        if (sisa === 0) return bilangan[ratusan] + ' Ratus';
        return bilangan[ratusan] + ' Ratus ' + terbilang(sisa);
    } else if (angka < 2000) return 'Seribu ' + terbilang(angka - 1000);
    else if (angka < 1000000) {
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
    if (bulat === 0 && desimal === 0) return `NOL ${mataUang.toUpperCase()}`;
    let hasil = bulat > 0 ? terbilang(bulat) : 'Nol';
    if (desimal > 0) hasil += ' KOMA ' + terbilang(desimal);
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

// ========== LOAD REKENING DENGAN CACHE ==========
async function loadRekening(forceRefresh = false) {
    const config = CACHE_CONFIG.REKENING;
    
    if (!forceRefresh) {
        const cachedData = getFromCache(config.key, config.expiry);
        if (cachedData) {
            window.daftarRekening = cachedData;
            isRekeningLoaded = true;
            log('📋 Data rekening dari CACHE', 'cache');
            populateRekeningSelects();
            return window.daftarRekening;
        }
    }
    
    try {
        log('🔄 Fetching data rekening dari API...', 'api');
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getRekening' })
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            log(`📊 Data API diterima: ${result.data.length} rekening`, 'api');
            
            window.daftarRekening = result.data.map((rek, index) => {
                const noRekening = String(rek.noRekening || rek['No Rekening'] || '');
                const bank = rek.bank || rek.Bank || '';
                const alamat = window.ALAMAT_MANUAL ? window.ALAMAT_MANUAL[noRekening] : null;
                
                let alamatPenerima = '-', alamatBank = '-', swift = '';
                
                if (alamat) {
                    alamatPenerima = alamat.alamatPenerima || '-';
                    alamatBank = alamat.alamatBank || '-';
                    swift = alamat.swift || '';
                }
                
                if (alamatPenerima === '-') {
                    alamatPenerima = 'Jl. Gunung Sahari 2 No. 7, Jakarta Pusat';
                    alamatBank = bank.toUpperCase().includes('BCA') 
                        ? 'Jl. Wahid Hasyim No. 10, Jakarta Pusat' 
                        : 'Jl. Garuda No. 1, Jakarta Pusat';
                }
                
                return {
                    no: rek.no || rek.No || String(index + 1),
                    perusahaan: rek.perusahaan || rek.Perusahaan || '',
                    jenisRekening: rek.jenisRekening || rek['Jenis Rekening'] || '',
                    noRekening: noRekening,
                    mataUang: rek.mataUang || rek['Mata Uang'] || '',
                    bank: bank,
                    alamatPenerima: alamatPenerima,
                    alamatBank: alamatBank,
                    swift: swift
                };
            });
            
            saveToCache(config.key, window.daftarRekening);
            isRekeningLoaded = true;
            log('✅ Data rekening selesai diproses', 'success');
            populateRekeningSelects();
            return window.daftarRekening;
        }
    } catch(e) {
        log(`❌ Error load rekening: ${e.message}`, 'error');
    }
    return [];
}

function populateRekeningSelects() {
    const dariRekening = document.getElementById('dariRekening');
    const keRekening = document.getElementById('keRekening');
    const rekeningAsalTransfer = document.getElementById('rekeningAsalTransfer');
    
    const rekeningIDR = window.daftarRekening.filter(rek => rek.mataUang === 'IDR');
    const rekeningNonIDR = window.daftarRekening.filter(rek => rek.mataUang !== 'IDR');
    
    if (rekeningAsalTransfer) {
        populateSelect(rekeningAsalTransfer, window.daftarRekening, 'Pilih Rekening');
    }
    if (dariRekening) {
        populateSelect(dariRekening, rekeningIDR, 'Pilih Rekening Asal (IDR)');
    }
    if (keRekening) {
        populateSelect(keRekening, rekeningNonIDR, 'Pilih Rekening Tujuan (Valas)');
    }
}

function populateSelect(selectEl, rekeningList, label) {
    if (!selectEl) return;
    selectEl.innerHTML = `<option value="">-- ${label} --</option>`;
    rekeningList.forEach((rek) => {
        const option = document.createElement('option');
        const displayText = `${rek.perusahaan} - ${rek.jenisRekening} (${rek.mataUang}) - ${rek.noRekening} - ${rek.bank}`;
        option.value = displayText;
        option.textContent = displayText;
        option.dataset.alamatPenerima = rek.alamatPenerima || '-';
        option.dataset.alamatBank = rek.alamatBank || '-';
        option.dataset.swift = rek.swift || '-';
        option.dataset.perusahaan = rek.perusahaan || '';
        option.dataset.noRekening = rek.noRekening || '';
        option.dataset.mataUang = rek.mataUang || '';
        option.dataset.bank = rek.bank || '';
        selectEl.appendChild(option);
    });
}

// ========== LOAD RIWAYAT TRANSFER DENGAN CACHE ==========
async function loadRiwayatTransfer(forceRefresh = false) {
    const config = CACHE_CONFIG.TRANSFER;
    const tbody = document.getElementById('riwayatTransferBody');
    if (!tbody) {
        log('❌ Element riwayatTransferBody tidak ditemukan', 'error');
        return;
    }
    
    if (!forceRefresh) {
        const cachedData = getFromCache(config.key, config.expiry);
        if (cachedData) {
            transferData = cachedData;
            currentTransferData = [...transferData];
            log(`📋 Data transfer dari CACHE: ${transferData.length} item`, 'cache');
            renderTransferTable(currentTransferData);
            return;
        }
    }
    
    tbody.innerHTML = '<tr><td colspan="7">Memuat data transfer...</td></tr>';
    try {
        log('🔄 Fetching data transfer dari API...', 'api');
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getRiwayatTransfer' })
        });
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            transferData = result.data;
            currentTransferData = [...transferData];
            log(`📊 Data transfer dari API: ${transferData.length} item`, 'api');
            saveToCache(config.key, transferData);
            renderTransferTable(currentTransferData);
        } else {
            log('📭 Tidak ada data transfer', 'info');
            tbody.innerHTML = '<tr><td colspan="7">Belum ada riwayat transfer</td></tr>';
        }
    } catch (error) {
        log(`❌ Gagal load transfer: ${error.message}`, 'error');
        tbody.innerHTML = '<tr><td colspan="7">Gagal memuat data: ' + error.message + '</td></tr>';
    }
}

// ========== LOAD RIWAYAT TANDA TERIMA DENGAN CACHE ==========
async function loadRiwayatTT(forceRefresh = false) {
    const config = CACHE_CONFIG.TT;
    const tbody = document.getElementById('riwayatTTBody');
    if (!tbody) {
        log('❌ Element riwayatTTBody tidak ditemukan', 'error');
        return;
    }
    
    if (!forceRefresh) {
        const cachedData = getFromCache(config.key, config.expiry);
        if (cachedData) {
            ttData = cachedData;
            log(`📋 Data TT dari CACHE: ${ttData.length} item`, 'cache');
            renderTTTable(ttData);
            return;
        }
    }
    
    tbody.innerHTML = '<tr><td colspan="7">Memuat data tanda terima...</td></tr>';
    try {
        log('🔄 Fetching data TT dari API...', 'api');
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getRiwayatTT' })
        });
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            ttData = result.data;
            log(`📊 Data TT dari API: ${ttData.length} item`, 'api');
            saveToCache(config.key, ttData);
            renderTTTable(ttData);
        } else {
            log('📭 Tidak ada data TT', 'info');
            tbody.innerHTML = '<tr><td colspan="7">Belum ada riwayat tanda terima</td></tr>';
        }
    } catch (error) {
        log(`❌ Gagal load TT: ${error.message}`, 'error');
        tbody.innerHTML = '<tr><td colspan="7">Gagal memuat data: ' + error.message + '</td></tr>';
    }
}

// ========== LOAD RIWAYAT VALAS DENGAN CACHE ==========
async function loadRiwayatValas(forceRefresh = false) {
    const config = CACHE_CONFIG.VALAS;
    const tbody = document.getElementById('riwayatValasBody');
    if (!tbody) {
        log('❌ Element riwayatValasBody tidak ditemukan', 'error');
        return;
    }
    
    if (!forceRefresh) {
        const cachedData = getFromCache(config.key, config.expiry);
        if (cachedData) {
            valasData = cachedData;
            log(`📋 Data valas dari CACHE: ${valasData.length} item`, 'cache');
            renderValasTable(valasData);
            return;
        }
    }
    
    tbody.innerHTML = '<tr><td colspan="8">Memuat data valas...</td></tr>';
    try {
        log('🔄 Fetching data valas dari API...', 'api');
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getRiwayatValas' })
        });
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            valasData = result.data;
            log(`📊 Data valas dari API: ${valasData.length} item`, 'api');
            saveToCache(config.key, valasData);
            renderValasTable(valasData);
        } else {
            log('📭 Tidak ada data valas', 'info');
            tbody.innerHTML = '<tr><td colspan="8">Belum ada riwayat valas</td></tr>';
        }
    } catch (error) {
        log(`❌ Gagal load Valas: ${error.message}`, 'error');
        tbody.innerHTML = '<tr><td colspan="8">Gagal memuat data: ' + error.message + '</td></tr>';
    }
}

// ========== RENDER FUNCTIONS ==========
function renderTransferTable(data) {
    const tbody = document.getElementById('riwayatTransferBody');
    if (!tbody) return;
    log(`🖥️ Render transfer table: ${data?.length || 0} data`, 'render');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Tidak ada data</td></tr>';
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
            if (currentTransferData[idx]) printUlangTransfer(currentTransferData[idx]);
        });
    });
    document.querySelectorAll('.btn-hapus-transfer').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.getAttribute('data-index'));
            if (confirm('Yakin ingin menghapus data transfer ini?')) {
                await hapusRiwayatTransfer(idx);
                await loadRiwayatTransfer(true);
            }
        });
    });
}

function renderTTTable(data) {
    const tbody = document.getElementById('riwayatTTBody');
    if (!tbody) return;
    log(`🖥️ Render TT table: ${data?.length || 0} data`, 'render');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Tidak ada data</td></tr>';
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
                await loadRiwayatTT(true);
            }
        });
    });
}

function renderValasTable(data) {
    const tbody = document.getElementById('riwayatValasBody');
    if (!tbody) return;
    log(`🖥️ Render Valas table: ${data?.length || 0} data`, 'render');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Tidak ada data</td></tr>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const tanggal = formatTanggal(row.tanggal || row[1]);
        const noReferensi = row.no_referensi || row[2] || '-';
        const dariRekening = row.dari_rekening || row[3] || '-';
        const keRekening = row.ke_rekening || row[4] || '-';
        const jumlahIDR = parseFloat(row.jumlah_idr || row[5]) || 0;
        const kurs = parseFloat(row.kurs || row[7]) || 0;
        const jumlahDapat = parseFloat(row.jumlah_dapat || row[8]) || 0;
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
                await loadRiwayatValas(true);
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
    log('🖨️ Print Transfer', 'print', rowData);
    const penerima = rowData[4] || '-';
    const account = rowData[5] || '-';
    const currency = rowData[6] || 'USD';
    const jumlah = rowData[7] || 0;
    const berita = rowData[8] || '-';
    const tujuan = rowData[9] || '-';
    const noLoa = rowData[2] || '-';
    const rekeningAsal = safeToString(rowData[10] || '');
    const metodeTransfer = rowData[11] || 'SHARE';
    const biayaFullAmount = parseFloat(rowData[12]) || 0;
    const biayaTelex = parseFloat(rowData[13]) || 0;
    const kurs = parseFloat(rowData[14]) || 0;
    const jumlahIDR = parseFloat(rowData[15]) || 0;
    const bankPenerima = rowData[3] || '-';
    const terbilangText = terbilangPrint(jumlah, currency);
    
    let alamat = '-', bankAlamat = '-', swift = '-', country = '-';
    if (typeof suppliers === 'undefined' || !suppliers || suppliers.length === 0) {
        if (typeof loadSuppliers === 'function') {
            await loadSuppliers();
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (typeof suppliers !== 'undefined' && suppliers && suppliers.length) {
        const supplier = suppliers.find(s => s.nama === penerima);
        if (supplier) {
            alamat = supplier.alamat || '-';
            bankAlamat = supplier.bankAlamat || '-';
            swift = supplier.swift || '-';
            country = supplier.country || '-';
        }
    }
    
    let bankPengirim = 'PANIN', norekPengirim = '', pengirimNama = 'PT SINAR CAHAYA CEMERLANG';
    
    if (rekeningAsal && rekeningAsal !== '' && rekeningAsal !== '-') {
        if (rekeningAsal.toUpperCase().includes('BCA')) {
            bankPengirim = 'BCA';
        }
        const parts = rekeningAsal.split(' - ');
        if (parts[0]) pengirimNama = parts[0];
        const matchNorek = rekeningAsal.match(/\d{4,}/);
        if (matchNorek) norekPengirim = matchNorek[0];
    }
    
    const params = new URLSearchParams({
        currency, jumlah, terbilang: terbilangText, nama: penerima, account,
        alamat, bankName: bankPenerima, bankAlamat, swift, country,
        berita, tujuan, noLoa, norekPengirim, pengirim: pengirimNama,
        valueDate: rowData[1] || '-', biayaTelex, metodeTransfer, biayaFullAmount,
        totalBiaya: biayaTelex + (metodeTransfer === 'FULL_AMOUNT' ? biayaFullAmount : 0),
        kurs, jumlahIDR, jenis: 'transfer'
    }).toString();
    const printUrl = bankPengirim === 'PANIN' ? `../print/print-panin.html?${params}` : `../print/print-bca.html?${params}`;
    log(`🖨️ Print URL: ${printUrl}`, 'print');
    
    try {
        const printWindow = window.open(printUrl, '_blank');
        if (!printWindow) alert('Pop-up diblokir! Harap izinkan pop-up untuk aplikasi ini.');
    } catch (error) {
        log(`❌ Error print: ${error.message}`, 'error');
        alert('Gagal membuka halaman print: ' + error.message);
    }
}

function printUlangTT(rowData) {
    log('🖨️ Print TT', 'print', rowData);
    const noTT = rowData[1] || '-';
    const tanggal = rowData[2] || '-';
    const dari = rowData[3] || '-';
    const kepada = rowData[4] || '-';
    const alamat = rowData[5] || '-';
    const jumlah = parseFloat(rowData[6]) || 0;
    const currency = rowData[7] || '-';
    const untuk = rowData[8] || '-';
    const keterangan = rowData[9] || '-';
    const params = new URLSearchParams({ noTT, tanggal, dari, kepada, alamat, jumlah, currency, untuk, keterangan }).toString();
    const printUrl = `../print/print-tt.html?${params}`;
    log(`🖨️ Print URL TT: ${printUrl}`, 'print');
    const printWindow = window.open(printUrl, '_blank');
    if (!printWindow) alert('Pop-up diblokir! Harap izinkan pop-up untuk aplikasi ini.');
}

async function printUlangValas(rowData) {
    log('🖨️ Print Valas', 'print', rowData);
    const tanggal = rowData[1] || '-';
    const noRef = rowData[2] || '-';
    const dariRekeningText = rowData[3] || '';
    const keRekeningText = rowData[4] || '';
    const jumlahValas = parseFloat(rowData[5]) || 0;
    const mataUang = rowData[6] || 'USD';
    const kurs = parseFloat(rowData[7]) || 0;
    const jumlahIDR = parseFloat(rowData[8]) || 0;
    const berita = rowData[9] || '';
    const tujuan = rowData[10] || '';
    const infoTambahan = rowData[11] || '-';
    
    let rekeningData = window.daftarRekening || [];
    if (!rekeningData || rekeningData.length === 0) {
        log('⏳ Menunggu data rekening...', 'info');
        if (typeof loadRekening === 'function') {
            await loadRekening(false);
        }
        await new Promise(resolve => setTimeout(resolve, 300));
        rekeningData = window.daftarRekening || [];
    }
    
    let rekeningAsal = null, norekPengirim = '', namaPengirim = 'PT SINAR CAHAYA CEMERLANG';
    let bankPengirim = 'PANIN', alamatPengirim = '-', alamatBankPengirim = '-', swiftPengirim = '-';
    
    if (dariRekeningText && dariRekeningText !== '') {
        rekeningAsal = rekeningData.find(rek => {
            const displayText = `${rek.perusahaan} - ${rek.jenisRekening} (${rek.mataUang}) - ${rek.noRekening} - ${rek.bank}`;
            return displayText === dariRekeningText;
        });
        if (rekeningAsal) {
            namaPengirim = rekeningAsal.perusahaan || 'PT SINAR CAHAYA CEMERLANG';
            norekPengirim = rekeningAsal.noRekening || '';
            bankPengirim = rekeningAsal.bank && rekeningAsal.bank.toUpperCase().includes('BCA') ? 'BCA' : 'PANIN';
            alamatPengirim = rekeningAsal.alamatPenerima || '-';
            alamatBankPengirim = rekeningAsal.alamatBank || '-';
            swiftPengirim = rekeningAsal.swift || '-';
        }
    }
    
    let rekeningTujuan = null, norekTujuan = '', namaPenerima = 'PEMBELIAN VALAS';
    let bankTujuan = 'PANIN', alamatPenerima = '-', alamatBankTujuan = '-', swiftTujuan = '-';
    
    if (keRekeningText && keRekeningText !== '') {
        rekeningTujuan = rekeningData.find(rek => {
            const displayText = `${rek.perusahaan} - ${rek.jenisRekening} (${rek.mataUang}) - ${rek.noRekening} - ${rek.bank}`;
            return displayText === keRekeningText;
        });
        if (rekeningTujuan) {
            namaPenerima = rekeningTujuan.perusahaan || 'PEMBELIAN VALAS';
            norekTujuan = rekeningTujuan.noRekening || '';
            bankTujuan = rekeningTujuan.bank || 'PANIN';
            alamatPenerima = rekeningTujuan.alamatPenerima || '-';
            alamatBankTujuan = rekeningTujuan.alamatBank || '-';
            swiftTujuan = rekeningTujuan.swift || '-';
        }
    }
    
    log('=== DATA REKENING ASAL ===', 'print', { namaPengirim, norekPengirim, bankPengirim, alamatPengirim, alamatBankPengirim });
    log('=== DATA REKENING TUJUAN ===', 'print', { namaPenerima, norekTujuan, bankTujuan, alamatPenerima, alamatBankTujuan });
    
    const terbilangText = terbilangPrint(jumlahValas, mataUang);
    const params = new URLSearchParams({
        currency: mataUang, jumlah: jumlahValas, terbilang: terbilangText,
        nama: namaPenerima, account: norekTujuan, alamat: alamatPenerima,
        bankName: bankTujuan, bankAlamat: alamatBankTujuan, swift: swiftTujuan,
        country: 'INDONESIA', norekPengirim, pengirim: namaPengirim,
        alamatPengirim, alamatBankPengirim, swiftPengirim,
        berita, tujuan, noLoa: noRef, biayaTelex: 0, metodeTransfer: 'SHARE',
        biayaFullAmount: 0, totalBiaya: 0, valueDate: '-',
        kurs, jumlahIDR, jenis: 'valas', infoTambahan, tanggal
    }).toString();
    
    const printUrl = bankPengirim === 'PANIN' ? `../print/print-panin.html?${params}` : `../print/print-bca.html?${params}`;
    log(`🖨️ URL Print: ${printUrl}`, 'print');
    const printWindow = window.open(printUrl, '_blank');
    if (!printWindow) alert('Pop-up diblokir! Harap izinkan pop-up untuk aplikasi ini.');
}

// ========== DELETE FUNCTIONS ==========
async function hapusRiwayatTransfer(index) {
    const rowData = transferData[index];
    if (!rowData) return;
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'deleteRiwayatTransfer', rowIndex: index, timestamp: rowData[0], noLoa: rowData[2] })
        });
        const result = await response.json();
        if (result.success) { log('✅ Data transfer berhasil dihapus', 'success'); await loadRiwayatTransfer(true); }
        else { log(`❌ Gagal menghapus: ${result.error}`, 'error'); alert('Gagal menghapus: ' + (result.error || 'Unknown error')); }
    } catch (error) { log(`❌ Error hapus: ${error.message}`, 'error'); alert('Error koneksi saat menghapus'); }
}

async function hapusRiwayatTT(index) {
    const rowData = ttData[index];
    if (!rowData) return;
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'deleteRiwayatTT', rowIndex: index, id: rowData.id || rowData[0] })
        });
        const result = await response.json();
        if (result.success) { log('✅ Data TT berhasil dihapus', 'success'); await loadRiwayatTT(true); }
        else { log(`❌ Gagal menghapus: ${result.error}`, 'error'); alert('Gagal menghapus: ' + (result.error || 'Unknown error')); }
    } catch (error) { log(`❌ Error hapus TT: ${error.message}`, 'error'); alert('Error koneksi saat menghapus'); }
}

async function hapusRiwayatValas(index) {
    const rowData = valasData[index];
    if (!rowData) return;
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'deleteRiwayatValas', rowIndex: index, id: rowData.id || rowData[0] })
        });
        const result = await response.json();
        if (result.success) { log('✅ Data Valas berhasil dihapus', 'success'); await loadRiwayatValas(true); }
        else { log(`❌ Gagal menghapus: ${result.error}`, 'error'); alert('Gagal menghapus: ' + (result.error || 'Unknown error')); }
    } catch (error) { log(`❌ Error hapus Valas: ${error.message}`, 'error'); alert('Error koneksi saat menghapus'); }
}

// ========== TAB NAVIGATION ==========
function initTabs() {
    log('initTabs dipanggil', 'render');
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
            loadRiwayatTransfer(false);
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
            loadRiwayatTT(false);
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
            loadRiwayatValas(false);
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
    if (btnExportTransfer) btnExportTransfer.addEventListener('click', () => log('Export Transfer: ' + transferData.length + ' data', 'info'));
    if (btnExportTT) btnExportTT.addEventListener('click', () => log('Export TT: ' + ttData.length + ' data', 'info'));
    if (btnExportValas) btnExportValas.addEventListener('click', () => log('Export Valas: ' + valasData.length + ' data', 'info'));
}

// ========== TAMBAHKAN TOMBOL CACHE ==========
function addCacheControl() {
    const cacheGroup = document.getElementById('cacheGroup');
    
    if (cacheGroup) {
        cacheGroup.innerHTML = `
            <button onclick="clearCache(); loadRiwayatTransfer(true); loadRiwayatTT(true); loadRiwayatValas(true); loadRekening(true);" 
                    class="btn btn-refresh-all">
                🔄 Refresh All
            </button>
            <button onclick="clearCache('${CACHE_CONFIG.REKENING.key}'); loadRekening(true);" 
                    class="btn btn-refresh-rekening">
                🔄 Rekening
            </button>
            <button onclick="clearCache('${CACHE_CONFIG.TRANSFER.key}'); loadRiwayatTransfer(true);" 
                    class="btn btn-refresh-transfer">
                🔄 Transfer
            </button>
            <button onclick="DEBUG.enabled = !DEBUG.enabled; this.textContent = DEBUG.enabled ? '🔊 Debug' : '🔇 Debug'; log('Debug mode: ' + (DEBUG.enabled ? 'ON' : 'OFF'), 'info');" 
                    class="btn btn-debug">
                🔊 Debug
            </button>
            <button onclick="openAlamatEditor()" 
                    class="btn btn-edit-alamat">
                ✏️ Edit Alamat
            </button>
        `;
        log('✅ Tombol cache ditambahkan', 'success');
    } else {
        // Fallback
        const toolbar = document.querySelector('.toolbar-container');
        if (toolbar) {
            const newCacheGroup = document.createElement('div');
            newCacheGroup.className = 'cache-group';
            newCacheGroup.id = 'cacheGroup';
            newCacheGroup.innerHTML = `
                <button onclick="clearCache(); loadRiwayatTransfer(true); loadRiwayatTT(true); loadRiwayatValas(true); loadRekening(true);" 
                        class="btn btn-refresh-all">
                    🔄 Refresh All
                </button>
                <button onclick="clearCache('${CACHE_CONFIG.REKENING.key}'); loadRekening(true);" 
                        class="btn btn-refresh-rekening">
                    🔄 Rekening
                </button>
                <button onclick="clearCache('${CACHE_CONFIG.TRANSFER.key}'); loadRiwayatTransfer(true);" 
                        class="btn btn-refresh-transfer">
                    🔄 Transfer
                </button>
                <button onclick="DEBUG.enabled = !DEBUG.enabled; this.textContent = DEBUG.enabled ? '🔊 Debug' : '🔇 Debug'; log('Debug mode: ' + (DEBUG.enabled ? 'ON' : 'OFF'), 'info');" 
                        class="btn btn-debug">
                    🔊 Debug
                </button>
                <button onclick="openAlamatEditor()" 
                        class="btn btn-edit-alamat">
                    ✏️ Edit Alamat
                </button>
            `;
            toolbar.appendChild(newCacheGroup);
            log('✅ Tombol cache ditambahkan di toolbar', 'success');
        }
    }
}

// ========== EXPOSE KE GLOBAL ==========
window.clearCache = clearCache;
window.loadRiwayatTransfer = loadRiwayatTransfer;
window.loadRiwayatTT = loadRiwayatTT;
window.loadRiwayatValas = loadRiwayatValas;
window.loadRekening = loadRekening;
window.DEBUG = DEBUG;
window.log = log;

// ========== INISIALISASI ==========
document.addEventListener('DOMContentLoaded', function() {
    log('🚀 DOM ready, memulai inisialisasi...', 'info');
    
    // Load alamat manual dari localStorage
    loadAlamatManualFromStorage();
    
    initTabs();
    setupSearchButtons();
    setupExportButtons();
    addCacheControl();
    
    loadRiwayatTransfer(false);
    
    setTimeout(() => {
        loadRekening(false);
    }, 500);
});

// ========== ALAMAT EDITOR ==========
function openAlamatEditor() {
    log('📝 Membuka Alamat Editor', 'info');
    
    // Ambil data alamat saat ini
    const alamatData = window.ALAMAT_MANUAL || {};
    
    // Buat modal
    const modal = document.createElement('div');
    modal.id = 'alamatEditorModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    // Buat konten modal
    let tableRows = '';
    const sortedKeys = Object.keys(alamatData).sort();
    
    sortedKeys.forEach(noRekening => {
        const data = alamatData[noRekening];
        tableRows += `
            <tr>
                <td><strong>${noRekening}</strong></td>
                <td>${data.perusahaan || '-'}</td>
                <td>
                    <input type="text" class="alamat-input" data-key="${noRekening}" data-field="alamatPenerima" 
                           value="${data.alamatPenerima || ''}" style="width: 100%; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px;">
                </td>
                <td>
                    <input type="text" class="alamat-input" data-key="${noRekening}" data-field="alamatBank" 
                           value="${data.alamatBank || ''}" style="width: 100%; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px;">
                </td>
                <td>
                    <input type="text" class="alamat-input" data-key="${noRekening}" data-field="swift" 
                           value="${data.swift || ''}" style="width: 100%; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px;">
                </td>
            </tr>
        `;
    });
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 90%;
            width: 800px;
            max-height: 90vh;
            overflow: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2 style="margin: 0;">✏️ Edit Alamat Manual</h2>
                <button onclick="closeAlamatEditor()" style="
                    background: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    font-size: 18px;
                    cursor: pointer;
                ">×</button>
            </div>
            
            <p style="color: #666; margin-bottom: 10px;">Edit alamat untuk setiap rekening. Perubahan akan disimpan ke LocalStorage.</p>
            
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 8px 10px; text-align: left; border-bottom: 2px solid #dee2e6;">No Rek</th>
                            <th style="padding: 8px 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Perusahaan</th>
                            <th style="padding: 8px 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Alamat Penerima</th>
                            <th style="padding: 8px 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Alamat Bank</th>
                            <th style="padding: 8px 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Swift</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                <button onclick="closeAlamatEditor()" style="
                    padding: 8px 20px;
                    background: #95a5a6;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Batal</button>
                <button onclick="saveAlamatManual()" style="
                    padding: 8px 20px;
                    background: #27ae60;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">💾 Simpan Perubahan</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Tambahkan event listener untuk close dengan ESC
    document.addEventListener('keydown', handleEscKey);
}

function closeAlamatEditor() {
    const modal = document.getElementById('alamatEditorModal');
    if (modal) {
        modal.remove();
    }
    document.removeEventListener('keydown', handleEscKey);
}

function handleEscKey(e) {
    if (e.key === 'Escape') {
        closeAlamatEditor();
    }
}

function saveAlamatManual() {
    log('💾 Menyimpan perubahan alamat...', 'info');
    
    // Ambil semua input
    const inputs = document.querySelectorAll('.alamat-input');
    const updatedData = {};
    
    inputs.forEach(input => {
        const key = input.dataset.key;
        const field = input.dataset.field;
        
        if (!updatedData[key]) {
            updatedData[key] = {
                alamatPenerima: '',
                alamatBank: '',
                swift: ''
            };
        }
        updatedData[key][field] = input.value;
    });
    
    // Tambahkan perusahaan dari data lama
    const oldData = window.ALAMAT_MANUAL || {};
    Object.keys(updatedData).forEach(key => {
        if (oldData[key]) {
            updatedData[key].perusahaan = oldData[key].perusahaan || '';
        }
    });
    
    // Simpan ke window
    window.ALAMAT_MANUAL = updatedData;
    
    // Simpan ke localStorage
    try {
        localStorage.setItem('alamatManual', JSON.stringify(updatedData));
        log('✅ Alamat manual disimpan ke localStorage', 'success');
    } catch(e) {
        log('⚠️ Gagal menyimpan ke localStorage: ' + e.message, 'warning');
    }
    
    // Tutup modal
    closeAlamatEditor();
    
    // Refresh data rekening
    loadRekening(true);
    
    alert('✅ Alamat manual berhasil disimpan!');
}

// ========== LOAD ALAMAT MANUAL DARI LOCALSTORAGE ==========
function loadAlamatManualFromStorage() {
    try {
        const stored = localStorage.getItem('alamatManual');
        if (stored) {
            const data = JSON.parse(stored);
            // Merge dengan data default
            const defaultData = window.ALAMAT_MANUAL || {};
            window.ALAMAT_MANUAL = { ...defaultData, ...data };
            log('✅ Alamat manual dimuat dari localStorage', 'cache');
            return true;
        }
    } catch(e) {
        log('⚠️ Gagal load alamat dari localStorage: ' + e.message, 'warning');
    }
    return false;
}

// ========== EXPOSE KE GLOBAL ==========
window.openAlamatEditor = openAlamatEditor;
window.closeAlamatEditor = closeAlamatEditor;
window.saveAlamatManual = saveAlamatManual;
window.loadAlamatManualFromStorage = loadAlamatManualFromStorage;

log('✅ riwayat.js selesai dimuat', 'success');