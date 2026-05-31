// ========== TRANSFER.JS ==========

// ========== LOAD REKENING DARI GOOGLE SHEETS ==========
let daftarRekening = [];

async function loadRekening() {
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getRekening' })
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            daftarRekening = result.data;
            
            const dariRekening = document.getElementById('dariRekening');
            const keRekening = document.getElementById('keRekening');
            const rekeningAsalTransfer = document.getElementById('rekeningAsalTransfer');
            
            const semuaRekening = (selectEl) => {
                if (selectEl) {
                    selectEl.innerHTML = '<option value="">-- Pilih Rekening --</option>';
                    daftarRekening.forEach(rek => {
                        const option = document.createElement('option');
                        option.value = `${rek.perusahaan} - ${rek.jenisRekening} (${rek.mataUang}) - ${rek.noRekening} - ${rek.bank}`;
                        option.textContent = `${rek.perusahaan} - ${rek.jenisRekening} (${rek.mataUang}) - ${rek.noRekening} - ${rek.bank}`;
                        selectEl.appendChild(option);
                    });
                }
            };
            
            semuaRekening(dariRekening);
            semuaRekening(keRekening);
            semuaRekening(rekeningAsalTransfer);
        }
    } catch(e) {
        console.error('Error load rekening:', e);
    }
}

// ========== HITUNG BIAYA TELEX ==========
const valueDateType = document.getElementById('valueDateType');
const biayaTelexDisplay = document.getElementById('biayaTelexDisplay');
const biayaTelexInput = document.getElementById('biayaTelex');

function hitungBiayaTelex() {
    const type = valueDateType?.value;
    let biaya = 35000;
    
    if (type === 'TODAY') {
        biaya = 50000;
        if (biayaTelexDisplay) {
            biayaTelexDisplay.textContent = 'Rp 50.000';
            biayaTelexDisplay.style.color = '#e74c3c';
        }
    } else {
        biaya = 35000;
        if (biayaTelexDisplay) {
            biayaTelexDisplay.textContent = 'Rp 35.000';
            biayaTelexDisplay.style.color = '#27ae60';
        }
    }
    
    if (biayaTelexInput) biayaTelexInput.value = biaya;
}

if (valueDateType) {
    valueDateType.addEventListener('change', hitungBiayaTelex);
    hitungBiayaTelex();
}

function getValueDateString() {
    const type = valueDateType?.value;
    if (type === 'TODAY') return 'TODAY';
    if (type === 'TOM') return 'TOM (Tomorrow)';
    if (type === 'SPOT') return 'SPOT (2 hari kerja)';
    return '-';
}

// ========== HITUNG BIAYA FULL AMOUNT ==========
const metodeTransfer = document.getElementById('metodeTransfer');
const fullAmountDetail = document.getElementById('fullAmountDetail');
const fullAmountText = document.getElementById('fullAmountText');
const fullAmountBiaya = document.getElementById('fullAmountBiaya');

function hitungFullAmountBiaya(currency, country) {
    if (currency === 'USD' && country === 'USA') return 15;
    if (currency === 'USD') return 26;
    if (currency === 'EUR') return 25;
    return 0;
}

function updateFullAmountInfo() {
    const metode = metodeTransfer?.value;
    const supplierSelect = document.getElementById('supplierSelect');
    const idx = supplierSelect?.value;
    
    if (metode === 'FULL_AMOUNT') {
        if (fullAmountDetail) fullAmountDetail.style.display = 'block';
        if (idx !== "" && suppliers && suppliers[idx]) {
            const supplier = suppliers[idx];
            const biaya = hitungFullAmountBiaya(supplier.currency, supplier.country);
            if (fullAmountBiaya) fullAmountBiaya.value = biaya;
            if (fullAmountText) {
                fullAmountText.innerHTML = `
                    <strong>Biaya Full Amount:</strong> ${biaya} ${supplier.currency}<br>
                    <small>${supplier.currency === 'USD' && supplier.country === 'USA' ? 'Transfer ke USA (USD)' : 
                              supplier.currency === 'USD' ? 'Transfer USD ke luar USA' : 
                              'Transfer EUR'}</small>
                `;
            }
        } else if (fullAmountText) {
            fullAmountText.innerHTML = 'Silakan pilih supplier terlebih dahulu';
        }
    } else {
        if (fullAmountDetail) fullAmountDetail.style.display = 'none';
        if (fullAmountBiaya) fullAmountBiaya.value = 0;
    }
}

if (metodeTransfer) {
    metodeTransfer.addEventListener('change', updateFullAmountInfo);
}

// ========== TAB NAVIGATION ==========
const tabSupplier = document.getElementById('tabSupplier');
const tabValas = document.getElementById('tabValas');
const formSupplier = document.getElementById('formSupplier');
const formValas = document.getElementById('formValas');

// Label untuk No Referensi
const labelNoRefTransfer = document.getElementById('labelNoRefTransfer');
const labelNoRefValas = document.getElementById('labelNoRefValas');

if (tabSupplier && tabValas) {
    tabSupplier.addEventListener('click', () => {
        tabSupplier.classList.add('active');
        tabValas.classList.remove('active');
        if (formSupplier) formSupplier.style.display = 'block';
        if (formValas) formValas.style.display = 'none';
        
        // Ubah label Transfer Supplier menjadi "No LOA"
        if (labelNoRefTransfer) labelNoRefTransfer.innerText = 'No LOA';
    });
    
    tabValas.addEventListener('click', () => {
        tabValas.classList.add('active');
        tabSupplier.classList.remove('active');
        if (formSupplier) formSupplier.style.display = 'none';
        if (formValas) formValas.style.display = 'block';
        
        // Ubah label Valas menjadi "No CEK"
        if (labelNoRefValas) labelNoRefValas.innerText = 'No CEK/LOA';
        
        if (typeof loadRekening === 'function') loadRekening();
    });
}

// ========== HITUNG JUMLAH DAPAT VALAS ==========
const keRekeningValas = document.getElementById('keRekening');
const jumlahValas = document.getElementById('jumlahValas');
const kursValasInput = document.getElementById('kursValas');
const jumlahDibayarIDR = document.getElementById('jumlahDibayarIDR');
const mataUangDisplay = document.getElementById('mataUangDisplay');

function updateMataUangDisplay() {
    const selectedOption = keRekeningValas?.options[keRekeningValas.selectedIndex];
    let mataUang = '';
    if (selectedOption) {
        const text = selectedOption.text;
        if (text.includes('USD')) mataUang = 'USD';
        else if (text.includes('EUR')) mataUang = 'EUR';
        else if (text.includes('JPY')) mataUang = 'JPY';
        else if (text.includes('SGD')) mataUang = 'SGD';
        else mataUang = text.split(' ')[0];
    }
    
    if (mataUang && mataUangDisplay) {
        mataUangDisplay.textContent = `Jumlah dalam ${mataUang}`;
    } else if (mataUangDisplay) {
        mataUangDisplay.textContent = 'Pilih rekening tujuan terlebih dahulu';
    }
    
    hitungJumlahDibayar();
}

function hitungJumlahDibayar() {
    const jumlah = parseFloat(jumlahValas?.value) || 0;
    const kurs = parseFloat(kursValasInput?.value) || 0;
    
    if (kurs > 0 && jumlah > 0) {
        const hasil = jumlah * kurs;
        if (jumlahDibayarIDR) {
            jumlahDibayarIDR.value = 'Rp ' + hasil.toLocaleString('id-ID');
        }
    } else {
        if (jumlahDibayarIDR) {
            jumlahDibayarIDR.value = '';
        }
    }
}

if (keRekeningValas) {
    keRekeningValas.addEventListener('change', updateMataUangDisplay);
}
if (jumlahValas) {
    jumlahValas.addEventListener('input', hitungJumlahDibayar);
}
if (kursValasInput) {
    kursValasInput.addEventListener('input', hitungJumlahDibayar);
}

// ========== FUNGSI TERBILANG ==========
function terbilangAngka(angka, currency) {
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
    return hasil + ' ' + currency;
}

// ========== PRINT TRANSFER KE SUPPLIER ==========
document.getElementById('btnPrintTransfer')?.addEventListener('click', async function() {
    const idx = document.getElementById('supplierSelect').value;
    if (!idx) { alert('Pilih supplier'); return; }
    const noLoa = document.getElementById('noRefTransfer')?.value.trim();
    if (!noLoa) { alert('No LOA wajib diisi!'); return; }
    const supplier = suppliers[idx];
    const jumlah = parseFloat(document.getElementById('jumlahTransfer').value);
    if (!jumlah) { alert('Masukkan jumlah'); return; }
    
    const rekeningAsalSelect = document.getElementById('rekeningAsalTransfer');
    const rekeningAsalText = rekeningAsalSelect?.options[rekeningAsalSelect.selectedIndex]?.text || '';
    
    let bank = 'PANIN';
    if (rekeningAsalText.toUpperCase().includes('BCA')) {
        bank = 'BCA';
    }
    
    if (!rekeningAsalSelect?.value) {
        alert('Pilih rekening asal terlebih dahulu!');
        return;
    }
    
    const biayaTelexVal = parseInt(document.getElementById('biayaTelex')?.value) || 35000;
    const metodeTransferVal = document.getElementById('metodeTransfer')?.value || 'SHARE';
    const biayaFullAmountVal = parseFloat(document.getElementById('fullAmountBiaya')?.value) || 0;
    const totalBiaya = biayaTelexVal + (metodeTransferVal === 'FULL_AMOUNT' ? biayaFullAmountVal : 0);
    
    const data = {
        type: 'saveTransfer',
        tanggal: new Date().toLocaleDateString(),
        noLoa: document.getElementById('noRefTransfer')?.value || '',
        bankTujuan: bank,
        namaPenerima: supplier.nama,
        accountNumber: supplier.account,
        currency: supplier.currency,
        jumlah: jumlah,
        berita: document.getElementById('beritaTransfer').value,
        tujuan: document.getElementById('tujuanTransfer').value,
        rekeningAsal: rekeningAsalSelect.value,
        valueDate: getValueDateString(),
        biayaTelex: biayaTelexVal,
        metodeTransfer: metodeTransferVal,
        biayaFullAmount: biayaFullAmountVal,
        totalBiaya: totalBiaya
    };
    
    await fetch(CONFIG.API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
    
    const terbilang = terbilangAngka(jumlah, supplier.currency);
    
    const params = new URLSearchParams({
        currency: supplier.currency,
        jumlah: jumlah,
        terbilang: terbilang,
        nama: supplier.nama,
        account: supplier.account,
        alamat: supplier.alamat || '',
        bankName: supplier.bankName || '',
        country: supplier.country || '',
        berita: data.berita || '',
        tujuan: data.tujuan || '',
        noLoa: data.noLoa || '',
        biayaTelex: biayaTelexVal,
        metodeTransfer: metodeTransferVal,
        biayaFullAmount: biayaFullAmountVal,
        totalBiaya: totalBiaya,
        valueDate: data.valueDate
    }).toString();
    
    if (bank === 'PANIN') {
        window.open(`print/print-panin.html?${params}`, '_blank');
    } else {
        window.open(`print/print-bca.html?${params}`, '_blank');
    }
    
    location.reload();
});

// ========== PRINT PEMBELIAN VALAS ==========
document.getElementById('btnPrintValas')?.addEventListener('click', async () => {
    const dariSelect = document.getElementById('dariRekening');
    const keSelect = document.getElementById('keRekening');
    const noRef = document.getElementById('noRefValas')?.value.trim();
    if (!noRef) { alert('No CEK/LOA wajib diisi!'); return; }
    const dariText = dariSelect?.options[dariSelect.selectedIndex]?.text || '';
    const keText = keSelect?.options[keSelect.selectedIndex]?.text || '';
    
    if (!dariSelect?.value || !keSelect?.value) {
        alert('Pilih rekening asal dan tujuan!');
        return;
    }
    
    let bankAsal = 'PANIN';
    if (dariText.toUpperCase().includes('BCA')) {
        bankAsal = 'BCA';
    }
    
    const mataUangTujuan = keText.split(' ')[0] || 'USD';
    const jumlahValasVal = parseFloat(document.getElementById('jumlahValas')?.value) || 0;
    const kurs = parseFloat(document.getElementById('kursValas')?.value) || 0;
    const jumlahIDRVal = jumlahValasVal * kurs;
    const berita = document.getElementById('beritaValas')?.value || '-';
    const tujuan = document.getElementById('tujuanValas')?.value || '-';
    const infoTambahan = document.getElementById('infoTambahanValas')?.value || '-';
    const noRef = document.getElementById('noRefValas')?.value || 'REF-' + new Date().toISOString().slice(0,10).replace(/-/g,'');
    
    if (jumlahValasVal <= 0 || kurs <= 0) {
        alert('Masukkan jumlah valas dan kurs dengan benar!');
        return;
    }
    
    const valasData = {
        type: 'saveValas',
        tanggal: new Date().toLocaleDateString('id-ID'),
        noRef: noRef,
        dariRekening: dariText,
        keRekening: keText,
        jumlahValas: jumlahValasVal,
        mataUang: mataUangTujuan,
        kurs: kurs,
        jumlahIDR: jumlahIDRVal,
        berita: berita,
        tujuan: tujuan,
        infoTambahan: infoTambahan
    };
    
    await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valasData)
    });
    
    const params = new URLSearchParams({
        currency: mataUangTujuan,
        jumlah: jumlahValasVal,
        terbilang: `${jumlahValasVal} ${mataUangTujuan}`,
        nama: 'PEMBELIAN VALAS',
        account: keText,
        alamat: '-',
        bankName: bankAsal === 'PANIN' ? 'BANK PANIN' : 'BANK BCA',
        country: 'INDONESIA',
        berita: berita,
        tujuan: tujuan,
        noLoa: noRef,
        biayaTelex: 0,
        metodeTransfer: 'SHARE',
        biayaFullAmount: 0,
        totalBiaya: 0,
        valueDate: '-'
    }).toString();
    
    if (bankAsal === 'PANIN') {
        window.open(`print/print-panin.html?${params}`, '_blank');
    } else {
        window.open(`print/print-bca.html?${params}`, '_blank');
    }
    
    location.reload();
});

// ========== LOAD REKENING ASAL UNTUK TRANSFER ==========
if (document.getElementById('rekeningAsalTransfer')) {
    loadRekening();
}

// Set default
if (valueDateType) {
    hitungBiayaTelex();
}

// Supplier change update full amount
document.getElementById('supplierSelect')?.addEventListener('change', () => {
    if (metodeTransfer?.value === 'FULL_AMOUNT') {
        updateFullAmountInfo();
    }
});