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

if (tabSupplier && tabValas) {
    tabSupplier.addEventListener('click', () => {
        tabSupplier.classList.add('active');
        tabValas.classList.remove('active');
        if (formSupplier) formSupplier.style.display = 'block';
        if (formValas) formValas.style.display = 'none';
    });
    
    tabValas.addEventListener('click', () => {
        tabValas.classList.add('active');
        tabSupplier.classList.remove('active');
        if (formSupplier) formSupplier.style.display = 'none';
        if (formValas) formValas.style.display = 'block';
        if (typeof loadRekening === 'function') loadRekening();
    });
}

// ========== HITUNG JUMLAH DAPAT VALAS ==========
const jumlahIDR = document.getElementById('jumlahIDR');
const kursValas = document.getElementById('kursValas');
const keRekening = document.getElementById('keRekening');
const jumlahDapat = document.getElementById('jumlahDapat');

function hitungJumlahDapat() {
    const idr = parseFloat(jumlahIDR?.value) || 0;
    const kurs = parseFloat(kursValas?.value) || 0;
    const selectedOption = keRekening?.options[keRekening.selectedIndex];
    const mataUang = selectedOption ? selectedOption.text.split(' ')[0] : 'USD';
    
    if (kurs > 0 && idr > 0) {
        const hasil = idr / kurs;
        if (jumlahDapat) jumlahDapat.value = hasil.toLocaleString('en-US', {minimumFractionDigits: 2}) + ' ' + mataUang;
    } else {
        if (jumlahDapat) jumlahDapat.value = '';
    }
}

if (jumlahIDR) jumlahIDR.addEventListener('input', hitungJumlahDapat);
if (kursValas) kursValas.addEventListener('input', hitungJumlahDapat);
if (keRekening) keRekening.addEventListener('change', hitungJumlahDapat);

// ========== PRINT TRANSFER KE SUPPLIER ==========
document.getElementById('btnPrintTransfer')?.addEventListener('click', async function() {
    let idx = document.getElementById('supplierSelect').value;
    if (!idx) { alert('Pilih supplier'); return; }
    let supplier = suppliers[idx];
    let jumlah = parseFloat(document.getElementById('jumlahTransfer').value);
    if (!jumlah) { alert('Masukkan jumlah'); return; }
    
    let bank = document.getElementById('selectedBank').value;
    let biayaTelexVal = parseInt(document.getElementById('biayaTelex')?.value) || 35000;
    let metodeTransferVal = document.getElementById('metodeTransfer')?.value || 'SHARE';
    let biayaFullAmountVal = parseFloat(document.getElementById('fullAmountBiaya')?.value) || 0;
    let totalBiaya = biayaTelexVal + (metodeTransferVal === 'FULL_AMOUNT' ? biayaFullAmountVal : 0);
    
    let data = {
        type: 'saveTransfer',
        tanggal: new Date().toLocaleDateString(),
        noLoa: document.getElementById('noCekLoa').value,
        bankTujuan: bank,
        namaPenerima: supplier.nama,
        accountNumber: supplier.account,
        currency: supplier.currency,
        jumlah: jumlah,
        berita: document.getElementById('beritaTransfer').value,
        tujuan: document.getElementById('tujuanTransfer').value,
        rekeningAsal: document.getElementById('rekeningAsalTransfer')?.value || '',
        valueDate: getValueDateString(),
        biayaTelex: biayaTelexVal,
        metodeTransfer: metodeTransferVal,
        biayaFullAmount: biayaFullAmountVal,
        totalBiaya: totalBiaya
    };
    
    await fetch(CONFIG.API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
    
    let printContent = '';
    
    if (bank === 'PANIN') {
        function terbilangAngka(angka) {
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
            return hasil + ' ' + supplier.currency;
        }
        
        let terbilang = terbilangAngka(jumlah);
        
        printContent = `
            <div style="font-family: 'Courier New', monospace; font-size: 10pt; width: 100%;">
                <div style="margin-bottom: 10px;">
                    <div style="font-size: 14pt; font-weight: bold;">${supplier.currency} ${jumlah.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                    <div style="font-size: 9pt; border-bottom: 1px dashed #ccc; padding-bottom: 8px;">${terbilang}</div>
                </div>
                <div style="display: flex; gap: 30px; justify-content: space-between;">
                    <div style="flex: 2;">
                        <div style="font-weight: bold;">${supplier.nama}</div>
                        <div>${supplier.account}</div>
                        <div>${supplier.alamat || '-'}</div>
                        <div style="height: 8px;"></div>
                        <div style="font-weight: bold;">${supplier.bankName || '-'}</div>
                        <div>${supplier.country || '-'}</div>
                        <div style="height: 8px;"></div>
                        <div>${data.berita || '-'}</div>
                        <div>${data.tujuan || '-'}</div>
                        <div style="height: 8px;"></div>
                        <div style="font-weight: bold;">PT. SINAR CAHAYA CEMERLANG</div>
                        <div style="letter-spacing: 5px; font-size: 11pt; margin-top: 5px;">0 7 9 6 0 0 0 6 6 5</div>
                    </div>
                    <div style="flex: 1; text-align: right;">
                        <div style="margin-bottom: 15px;">
                            <span>B084235</span>
                            <span style="margin-left: 10px;">${data.noLoa || '0796000665'}</span>
                            <span style="margin-left: 10px;">${supplier.currency} ${jumlah.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div style="font-size: 13pt; font-weight: bold; margin-bottom: 15px;">${supplier.currency} ${jumlah.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        <div>${supplier.currency} ${jumlah.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        <div>${supplier.currency} 25</div>
                        <div>IDR. 50,000</div>
                        <div style="margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 5px;">
                            <div>Value Date: ${data.valueDate}</div>
                            <div>Biaya Telex: IDR ${data.biayaTelex.toLocaleString('id-ID')}</div>
                            ${data.metodeTransfer === 'FULL_AMOUNT' ? `<div>Biaya Full Amount: ${data.biayaFullAmount} ${supplier.currency}</div>` : '<div>Metode: SHARE</div>'}
                            <div><strong>Total Biaya: IDR ${data.totalBiaya.toLocaleString('id-ID')}</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        printContent = `
            <div style="font-family: 'Courier New', monospace; text-align: center; padding: 20px;">
                <h2>BANK BCA</h2>
                <div style="font-size: 18pt; font-weight: bold;">${jumlah.toLocaleString('en-US', {minimumFractionDigits: 2})} ${supplier.currency}</div>
                <div><strong>Penerima:</strong> ${supplier.nama}</div>
                <div><strong>Account:</strong> ${supplier.account}</div>
                <div><strong>Bank:</strong> ${supplier.bankName}</div>
                <div><strong>SWIFT:</strong> ${supplier.swift}</div>
                <div><strong>LOA:</strong> ${data.noLoa || '-'}</div>
                <div><strong>Berita:</strong> ${data.berita || '-'}</div>
                <div><strong>Tujuan:</strong> ${data.tujuan || '-'}</div>
                <div style="margin-top: 10px; border-top: 1px solid #ccc; padding-top: 5px;">
                    <div>Value Date: ${data.valueDate}</div>
                    <div>Biaya Telex: IDR ${data.biayaTelex.toLocaleString('id-ID')}</div>
                    ${data.metodeTransfer === 'FULL_AMOUNT' ? `<div>Biaya Full Amount: ${data.biayaFullAmount} ${supplier.currency}</div>` : '<div>Metode: SHARE</div>'}
                </div>
            </div>
        `;
    }
    
    let printDiv = bank === 'PANIN' ? document.getElementById('paninPrintContent') : document.getElementById('bcaPrintContent');
    printDiv.innerHTML = printContent;
    let original = document.body.innerHTML;
    document.body.innerHTML = document.getElementById(bank === 'PANIN' ? 'printAreaPanin' : 'printAreaBca').innerHTML;
    window.print();
    document.body.innerHTML = original;
    location.reload();
});

// ========== PRINT PEMBELIAN VALAS ==========
document.getElementById('btnPrintValas')?.addEventListener('click', async () => {
    const dariSelect = document.getElementById('dariRekening');
    const keSelect = document.getElementById('keRekening');
    
    const dariText = dariSelect?.options[dariSelect.selectedIndex]?.text || '';
    const keText = keSelect?.options[keSelect.selectedIndex]?.text || '';
    const keValue = keSelect?.value || '';
    
    if (!dariSelect?.value || !keSelect?.value) {
        alert('Pilih rekening asal dan tujuan!');
        return;
    }
    
    const mataUangTujuan = keValue.split(' - ')[0] || 'USD';
    const jumlahIDRVal = parseFloat(document.getElementById('jumlahIDR')?.value) || 0;
    const kurs = parseFloat(document.getElementById('kursValas')?.value) || 0;
    const jumlahDapatVal = jumlahIDRVal / kurs;
    const berita = document.getElementById('beritaValas')?.value || '-';
    const tujuan = document.getElementById('tujuanValas')?.value || '-';
    const infoTambahan = document.getElementById('infoTambahanValas')?.value || '-';
    const noRef = document.getElementById('noRefValas')?.value || 'REF-' + new Date().toISOString().slice(0,10).replace(/-/g,'');
    
    if (jumlahIDRVal <= 0 || kurs <= 0) {
        alert('Masukkan jumlah IDR dan Kurs dengan benar!');
        return;
    }
    
    const valasData = {
        type: 'saveValas',
        tanggal: new Date().toLocaleDateString('id-ID'),
        noRef: noRef,
        dariRekening: dariText,
        keRekening: keText,
        jumlahIDR: jumlahIDRVal,
        kurs: kurs,
        jumlahDapat: jumlahDapatVal,
        mataUang: mataUangTujuan,
        berita: berita,
        tujuan: tujuan,
        infoTambahan: infoTambahan
    };
    
    await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valasData)
    });
    
    const printContent = `
        <div style="font-family: monospace; padding: 20px; width: 105mm; margin: 0 auto;">
            <div style="text-align: center; border-bottom: 2px solid #000; margin-bottom: 15px;">
                <h2>APLIKASI AL</h2>
                <h3>BUKTI PEMBELIAN VALAS</h3>
            </div>
            <div><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}</div>
            <div><strong>No Ref:</strong> ${noRef}</div>
            <div style="margin-top: 15px;"><strong>Detail Transaksi:</strong></div>
            <div>Dari Rekening: ${dariText}</div>
            <div>Ke Rekening: ${keText}</div>
            <div>Jumlah Dibayar: IDR ${jumlahIDRVal.toLocaleString('id-ID')}</div>
            <div>Kurs: 1 ${mataUangTujuan} = IDR ${kurs.toLocaleString('id-ID')}</div>
            <div style="font-size: 14pt; font-weight: bold; margin: 10px 0;">
                Jumlah Dapat: ${jumlahDapatVal.toLocaleString('en-US', {minimumFractionDigits: 2})} ${mataUangTujuan}
            </div>
            <div><strong>Berita:</strong> ${berita}</div>
            ${tujuan !== '-' ? `<div><strong>Tujuan Transfer:</strong> ${tujuan}</div>` : ''}
            ${infoTambahan !== '-' ? `<div><strong>Info Tambahan:</strong> ${infoTambahan}</div>` : ''}
            <div style="margin-top: 20px; text-align: center; font-size: 9pt;">Dicetak dari APLIKASI AL</div>
        </div>
    `;
    
    const originalBody = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalBody;
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
const supplierSelect = document.getElementById('supplierSelect');
if (supplierSelect) {
    supplierSelect.addEventListener('change', () => {
        if (metodeTransfer?.value === 'FULL_AMOUNT') {
            updateFullAmountInfo();
        }
    });
}