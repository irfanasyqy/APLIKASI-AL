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
            // ========== SIMPAN DATA REKENING LENGKAP DENGAN ALAMAT ==========
            daftarRekening = result.data.map(rek => ({
                no: rek.no || '',
                perusahaan: rek.perusahaan || '',
                jenisRekening: rek.jenisRekening || '',
                noRekening: rek.noRekening || '',
                mataUang: rek.mataUang || '',
                bank: rek.bank || '',
                alamatPenerima: rek.alamatPenerima || '',
                alamatBank: rek.alamatBank || '',
                swift: rek.swift || ''
            }));
            
            console.log('Daftar rekening loaded:', daftarRekening);
            
            const dariRekening = document.getElementById('dariRekening');
            const keRekening = document.getElementById('keRekening');
            const rekeningAsalTransfer = document.getElementById('rekeningAsalTransfer');
            
            // ========== FILTER UNTUK VALAS ==========
            const rekeningIDR = daftarRekening.filter(rek => rek.mataUang === 'IDR');
            const rekeningNonIDR = daftarRekening.filter(rek => rek.mataUang !== 'IDR');
            
            // ========== FUNGSI POPULATE SELECT ==========
            const populateSelect = (selectEl, rekeningList, label) => {
                if (selectEl) {
                    selectEl.innerHTML = `<option value="">-- ${label} --</option>`;
                    rekeningList.forEach((rek, index) => {
                        const option = document.createElement('option');
                        option.value = index;
                        const displayText = `${rek.perusahaan} - ${rek.jenisRekening} (${rek.mataUang}) - ${rek.noRekening} - ${rek.bank}`;
                        option.textContent = displayText;
                        // ========== SIMPAN DATA ALAMAT DI ATTRIBUTE ==========
                        option.dataset.alamatPenerima = rek.alamatPenerima || '';
                        option.dataset.alamatBank = rek.alamatBank || '';
                        option.dataset.swift = rek.swift || '';
                        option.dataset.perusahaan = rek.perusahaan || '';
                        option.dataset.noRekening = rek.noRekening || '';
                        option.dataset.mataUang = rek.mataUang || '';
                        option.dataset.bank = rek.bank || '';
                        selectEl.appendChild(option);
                    });
                }
            };
            
            // ========== TAB TRANSFER KE SUPPLIER ==========
            if (rekeningAsalTransfer) {
                rekeningAsalTransfer.innerHTML = '<option value="">-- Pilih Rekening --</option>';
                daftarRekening.forEach((rek, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = `${rek.perusahaan} - ${rek.jenisRekening} (${rek.mataUang}) - ${rek.noRekening} - ${rek.bank}`;
                    option.dataset.alamatPenerima = rek.alamatPenerima || '';
                    option.dataset.alamatBank = rek.alamatBank || '';
                    option.dataset.swift = rek.swift || '';
                    option.dataset.perusahaan = rek.perusahaan || '';
                    option.dataset.noRekening = rek.noRekening || '';
                    option.dataset.mataUang = rek.mataUang || '';
                    option.dataset.bank = rek.bank || '';
                    rekeningAsalTransfer.appendChild(option);
                });
            }
            
            // ========== TAB PEMBELIAN VALAS ==========
            populateSelect(dariRekening, rekeningIDR, 'Pilih Rekening Sumber (IDR)');
            populateSelect(keRekening, rekeningNonIDR, 'Pilih Rekening Tujuan (Valas)');
        }
    } catch(e) {
        console.error('Error load rekening:', e);
    }
}

// ========== FUNGSI GET REKENING BY INDEX ==========
function getRekeningByIndex(index) {
    if (index === undefined || index === null || index === '') return null;
    const idx = parseInt(index);
    if (isNaN(idx) || idx < 0 || idx >= daftarRekening.length) return null;
    return daftarRekening[idx];
}

// ========== CEK APAKAH PERLU KURS (UNTUK TRANSFER VALAS) ==========
function checkNeedKurs() {
    const supplierSelect = document.getElementById('supplierSelect');
    const rekeningAsalSelect = document.getElementById('rekeningAsalTransfer');
    const kursGroup = document.getElementById('kursTransferGroup');
    const kursCurrencyTarget = document.getElementById('kursCurrencyTarget');
    const currencyDisplay = document.getElementById('currencyDisplay');
    
    if (!supplierSelect?.value || !rekeningAsalSelect?.value) {
        if (kursGroup) kursGroup.style.display = 'none';
        return;
    }
    
    const idx = supplierSelect.value;
    const supplier = suppliers[idx];
    const rekeningAsalText = rekeningAsalSelect.options[rekeningAsalSelect.selectedIndex]?.text || '';
    
    // Ambil mata uang dari rekening asal (format: "... (USD) ...")
    let mataUangRekeningAsal = 'IDR';
    const matchCurrency = rekeningAsalText.match(/\(([A-Z]{3})\)/);
    if (matchCurrency) mataUangRekeningAsal = matchCurrency[1];
    
    const needKurs = (mataUangRekeningAsal === 'IDR' && supplier.currency !== 'IDR');
    
    if (kursGroup) {
        kursGroup.style.display = needKurs ? 'flex' : 'none';
    }
    if (kursCurrencyTarget && supplier) {
        kursCurrencyTarget.innerText = supplier.currency;
    }
    if (currencyDisplay && supplier) {
        currencyDisplay.value = supplier.currency;
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
        
        if (labelNoRefTransfer) labelNoRefTransfer.innerText = 'No LOA';
    });
    
    tabValas.addEventListener('click', () => {
        tabValas.classList.add('active');
        tabSupplier.classList.remove('active');
        if (formSupplier) formSupplier.style.display = 'none';
        if (formValas) formValas.style.display = 'block';
        
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
    if (pecahan > 0) hasil += ` KOMA ${convert(pecahan)}`;
    return hasil + ' ' + currency;
}

// ========== EKSTRAK MATA UANG & BANK DARI REKENING ASAL ==========
function getCurrencyFromRekeningText(rekeningText) {
    if (!rekeningText) return 'IDR';
    if (rekeningText.toUpperCase().includes('USD')) return 'USD';
    if (rekeningText.toUpperCase().includes('EUR')) return 'EUR';
    if (rekeningText.toUpperCase().includes('IDR')) return 'IDR';
    return 'IDR';
}

function getBankPengirimFromRekeningText(rekeningText) {
    if (!rekeningText) return 'PANIN';
    if (rekeningText.toUpperCase().includes('BCA')) return 'BCA';
    if (rekeningText.toUpperCase().includes('PANIN')) return 'PANIN';
    return 'PANIN';
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
    const rekeningAsalValue = rekeningAsalSelect?.value || '';
    
    if (!rekeningAsalSelect?.value) {
        alert('Pilih rekening asal terlebih dahulu!');
        return;
    }
    
    // Ambil bank pengirim dari rekening asal
    const bankPengirim = getBankPengirimFromRekeningText(rekeningAsalText);
    
    const biayaTelexVal = parseInt(document.getElementById('biayaTelex')?.value) || 35000;
    const metodeTransferVal = document.getElementById('metodeTransfer')?.value || 'SHARE';
    const biayaFullAmountVal = parseFloat(document.getElementById('fullAmountBiaya')?.value) || 0;
    const totalBiaya = biayaTelexVal + (metodeTransferVal === 'FULL_AMOUNT' ? biayaFullAmountVal : 0);
    
    // Ambil mata uang rekening asal
    const mataUangRekeningAsal = getCurrencyFromRekeningText(rekeningAsalText);
    
    // Hitung kurs dan jumlahIDR jika rekening asal IDR dan currency tujuan bukan IDR
    let kurs = 0;
    let jumlahIDR = 0;
    if (mataUangRekeningAsal === 'IDR' && supplier.currency !== 'IDR') {
        const kursInput = document.getElementById('kursTransfer')?.value;
        if (kursInput) {
            kurs = parseFloat(kursInput);
        } else {
            alert('Kurs wajib diisi untuk transaksi valas (IDR ke ' + supplier.currency + ')');
            return;
        }
        jumlahIDR = jumlah * kurs;
    }
    
    const data = {
        type: 'saveTransfer',
        tanggal: new Date().toLocaleDateString('id-ID'),
        tanggalISO: new Date().toISOString(),
        noLoa: noLoa,
        bankTujuan: supplier.bankName || '-',  // Bank asing supplier
        namaPenerima: supplier.nama,
        accountNumber: supplier.account,
        currency: supplier.currency,
        jumlah: jumlah,
        berita: document.getElementById('beritaTransfer').value || '',
        tujuan: document.getElementById('tujuanTransfer').value || '',
        rekeningAsal: rekeningAsalValue,  // Format: Nama - Jenis (MataUang) - NoRek - Bank
        valueDate: getValueDateString(),
        biayaTelex: biayaTelexVal,
        metodeTransfer: metodeTransferVal,
        biayaFullAmount: biayaFullAmountVal,
        totalBiaya: totalBiaya,
        kurs: kurs,
        jumlahIDR: jumlahIDR
    };
    
    // Kirim ke Google Sheet via API
    try {
        await fetch(CONFIG.API_URL, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data) 
        });
    } catch(e) {
        console.error('Error saving transfer:', e);
    }
    
    const terbilang = terbilangAngka(jumlah, supplier.currency);
    
    // Parse rekening asal untuk mendapatkan nama pengirim dan norek
    const rekeningParts = rekeningAsalValue.split(' - ');
    const pengirimNama = rekeningParts[0] || 'PT SINAR CAHAYA CEMERLANG';
    const norekPengirim = rekeningParts[2] || '';
    
    const params = new URLSearchParams({
        currency: supplier.currency,
        jumlah: jumlah,
        terbilang: terbilang,
        nama: supplier.nama,
        account: supplier.account,
        alamat: supplier.alamat || '',
        bankName: supplier.bankName || '',
        bankAlamat: supplier.bankAlamat || '',
        swift: supplier.swift || '',
        country: supplier.country || '',
        berita: data.berita,
        tujuan: data.tujuan,
        noLoa: data.noLoa,
        norekPengirim: norekPengirim,
        pengirim: pengirimNama,
        valueDate: data.valueDate,
        biayaTelex: biayaTelexVal,
        metodeTransfer: metodeTransferVal,
        biayaFullAmount: biayaFullAmountVal,
        totalBiaya: totalBiaya,
        kurs: kurs,
        jumlahIDR: jumlahIDR,
        jenis: 'transfer'
    }).toString();
    
    // Buka window print berdasarkan BANK PENGIRIM (bukan bank tujuan)
    const printWindow = window.open(bankPengirim === 'PANIN' ? `../print/print-panin.html?${params}` : `../print/print-bca.html?${params}`, '_blank');
    
    if (!printWindow) {
        alert('Pop-up diblokir! Harap izinkan pop-up untuk aplikasi ini.');
    }
    
    // Refresh halaman setelah delay
    setTimeout(() => {
        location.reload();
    }, 1000);
});

// ========== PRINT PEMBELIAN VALAS ==========
document.getElementById('btnPrintValas')?.addEventListener('click', async () => {
    const dariSelect = document.getElementById('dariRekening');
    const keSelect = document.getElementById('keRekening');
    
    const noRef = document.getElementById('noRefValas')?.value.trim();
    if (!noRef) {
        alert('No CEK/LOA wajib diisi!');
        return;
    }
    
    // ========== AMBIL INDEX DARI SELECT ==========
    const dariIndex = dariSelect?.value;
    const keIndex = keSelect?.value;
    
    if (!dariIndex || !keIndex) {
        alert('Pilih rekening asal dan tujuan!');
        return;
    }
    
    // ========== AMBIL DATA REKENING DARI ARRAY ==========
    const dariRek = daftarRekening[parseInt(dariIndex)];
    const keRek = daftarRekening[parseInt(keIndex)];
    
    if (!dariRek || !keRek) {
        alert('Data rekening tidak ditemukan!');
        return;
    }
    
    // ========== BUAT TEXT UNTUK DISPLAY ==========
    const dariText = `${dariRek.perusahaan} - ${dariRek.jenisRekening} (${dariRek.mataUang}) - ${dariRek.noRekening} - ${dariRek.bank}`;
    const keText = `${keRek.perusahaan} - ${keRek.jenisRekening} (${keRek.mataUang}) - ${keRek.noRekening} - ${keRek.bank}`;
    
    // ========== AMBIL DATA UNTUK PRINT ==========
    const bankPengirim = dariRek.bank && dariRek.bank.toUpperCase().includes('BCA') ? 'BCA' : 'PANIN';
    const namaPenerima = keRek.perusahaan || 'PEMBELIAN VALAS';
    const mataUangTujuan = keRek.mataUang || 'USD';
    const norekTujuan = keRek.noRekening || '';
    const alamatPenerima = keRek.alamatPenerima || '';
    const alamatBank = keRek.alamatBank || '';
    const swiftCode = keRek.swift || '';
    const norekPengirim = dariRek.noRekening || '';
    const namaPengirim = dariRek.perusahaan || 'PT SINAR CAHAYA CEMERLANG';
    
    console.log('=== DATA REKENING TUJUAN ===');
    console.log('Nama:', namaPenerima);
    console.log('No Rek:', norekTujuan);
    console.log('Alamat:', alamatPenerima);
    console.log('Bank Alamat:', alamatBank);
    console.log('Swift:', swiftCode);
    
    const jumlahValasVal = parseFloat(document.getElementById('jumlahValas')?.value) || 0;
    const kurs = parseFloat(document.getElementById('kursValas')?.value) || 0;
    const jumlahIDRVal = jumlahValasVal * kurs;
    const berita = document.getElementById('beritaValas')?.value || '';
    const tujuan = document.getElementById('tujuanValas')?.value || '';
    const infoTambahan = document.getElementById('infoTambahanValas')?.value || '-';
    
    if (jumlahValasVal <= 0) {
        alert('Masukkan jumlah valas dengan benar!');
        return;
    }
    if (kurs <= 0) {
        alert('Kurs wajib diisi!');
        return;
    }
    
    // ========== DATA VALAS UNTUK DISIMPAN ==========
    const valasData = {
        type: 'saveValas',
        tanggal: new Date().toLocaleDateString('id-ID'),
        tanggalISO: new Date().toISOString(),
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
    
    // ========== SIMPAN KE DATABASE ==========
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(valasData)
        });
        const result = await response.json();
        if (result.success) {
            console.log('✅ Valas tersimpan!');
        } else {
            console.warn('⚠️ Gagal menyimpan valas:', result.error);
        }
    } catch(e) {
        console.error('❌ Error saving valas:', e);
    }
    
    // ========== PRINT ==========
    const terbilang = terbilangAngka(jumlahValasVal, mataUangTujuan);
    
    const params = new URLSearchParams({
        currency: mataUangTujuan,
        jumlah: jumlahValasVal,
        terbilang: terbilang,
        nama: namaPenerima,
        account: norekTujuan,
        alamat: alamatPenerima,
        bankName: bankPengirim === 'PANIN' ? 'BANK PANIN' : 'BANK BCA',
        bankAlamat: alamatBank,
        swift: swiftCode,
        country: 'INDONESIA',
        berita: berita,
        tujuan: tujuan,
        noLoa: noRef,
        norekPengirim: norekPengirim,
        pengirim: namaPengirim,
        biayaTelex: 0,
        metodeTransfer: 'SHARE',
        biayaFullAmount: 0,
        totalBiaya: 0,
        valueDate: '-',
        kurs: kurs,
        jumlahIDR: jumlahIDRVal,
        jenis: 'valas'
    }).toString();
    
    console.log('URL Print:', `../print/print-panin.html?${params}`);
    
    const printWindow = window.open(bankPengirim === 'PANIN' ? `../print/print-panin.html?${params}` : `../print/print-bca.html?${params}`, '_blank');
    
    if (!printWindow) {
        alert('Pop-up diblokir! Harap izinkan pop-up untuk aplikasi ini.');
    }
    
    setTimeout(() => {
        location.reload();
    }, 1000);
});

// ========== LOAD REKENING ASAL UNTUK TRANSFER ==========
if (document.getElementById('rekeningAsalTransfer')) {
    loadRekening();
}

// Set default
if (valueDateType) {
    hitungBiayaTelex();
}

// ========== EVENT LISTENER UNTUK KURS DINAMIS ==========
document.getElementById('supplierSelect')?.addEventListener('change', () => {
    if (metodeTransfer?.value === 'FULL_AMOUNT') {
        updateFullAmountInfo();
    }
    checkNeedKurs();  // Cek perlu kurs atau tidak
});

document.getElementById('rekeningAsalTransfer')?.addEventListener('change', () => {
    checkNeedKurs();  // Cek perlu kurs atau tidak
});

// Inisialisasi
setTimeout(() => {
    checkNeedKurs();
}, 100);