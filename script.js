// ========== script.js ==========
// API_URL sekarang diambil dari config.js (file terpisah)

let suppliers = [];

let currentLayoutPanin = {
    nama: 'kiri-atas',
    jumlah: 'kanan-atas',
    loa: 'kanan-atas'
};
let currentLayoutBca = {
    nama: 'kanan',
    jumlah: 'tengah-besar'
};

// ========== LOAD DATA ==========
async function loadSuppliers() {
    try {
        const res = await fetch(`${CONFIG.API_URL}?type=getSuppliers`);
        const result = await res.json();
        if (result.success) {
            suppliers = result.data;
            updateDropdowns();
            renderSupplierTable();
        }
    } catch(e) { console.error(e); }
}

function updateDropdowns() {
    const options = '<option value="">-- Pilih --</option>' + suppliers.map((s,i) => `<option value="${i}">${s.nama}</option>`).join('');
    const selects = ['supplierSelect', 'ttSupplierSelect', 'labelSupplierSelect', 'editSupplierSelect', 'fakturSupplierSelect'];
    selects.forEach(id => { let el = document.getElementById(id); if(el) el.innerHTML = options; });
}

function renderSupplierTable() {
    let tbody = document.getElementById('supplierTableBody');
    if(!tbody) return;
    if(!suppliers.length) { tbody.innerHTML = '<tr><td colspan="7">Tidak ada数据</td></tr>'; return; }
    tbody.innerHTML = suppliers.map(s => `<tr><td>${s.no||'-'}</td><td>${s.nama||'-'}</td><td>${s.account||'-'}</td><td>${s.currency||'-'}</td><td>${s.bankName||'-'}</td><td>${s.swift||'-'}</td><td>${s.country||'-'}</td></tr>`).join('');
}

// ========== BANK SELECTION ==========
function setupBankSelection() {
    document.querySelectorAll('.bank-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.bank-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            document.getElementById('selectedBank').value = card.getAttribute('data-bank');
        });
    });
}

// ========== PRINT TRANSFER ==========
// ========== PRINT TRANSFER (PANIN & BCA) ==========
document.getElementById('btnPrintTransfer')?.addEventListener('click', async () => {
    const idx = document.getElementById('supplierSelect').value;
    if (!idx) { alert('Pilih supplier dulu!'); return; }
    const supplier = suppliers[idx];
    const jumlah = parseFloat(document.getElementById('jumlahTransfer').value);
    if (!jumlah || jumlah <= 0) { alert('Masukkan jumlah transfer!'); return; }
    
    const bank = document.getElementById('selectedBank').value;
    const data = {
        type: 'saveTransfer',
        tanggal: new Date().toLocaleDateString('id-ID'),
        noLoa: document.getElementById('noCekLoa').value,
        bankTujuan: bank,
        namaPenerima: supplier.nama,
        accountNumber: supplier.account,
        currency: supplier.currency,
        jumlah: jumlah,
        berita: document.getElementById('beritaTransfer').value,
        tujuan: document.getElementById('tujuanTransfer').value
    };
    
    // Simpan ke Google Sheets
    await fetch(CONFIG.API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
    
    // Generate print content sesuai bank
    let printHtml = '';
    if (bank === 'PANIN') {
        printHtml = generatePaninPrint(supplier, data, jumlah);
        document.getElementById('paninPrintContent').innerHTML = printHtml;
        const originalBody = document.body.innerHTML;
        document.body.innerHTML = document.getElementById('printAreaPanin').innerHTML;
        window.print();
        document.body.innerHTML = originalBody;
    } else {
        printHtml = generateBcaPrint(supplier, data, jumlah);
        document.getElementById('bcaPrintContent').innerHTML = printHtml;
        const originalBody = document.body.innerHTML;
        document.body.innerHTML = document.getElementById('printAreaBca').innerHTML;
        window.print();
        document.body.innerHTML = originalBody;
    }
    location.reload();
});

// ========== GENERATE PRINT BANK PANIN ==========
function generatePaninPrint(supplier, data, jumlah) {
    const formattedJumlah = jumlah.toLocaleString('en-US', {minimumFractionDigits: 2});
    const terbilang = `${terbilangAngka(jumlah)} ${supplier.currency}`;
    
    return `
        <div class="panin-print">
            <div class="panin-jumlah-atas">${supplier.currency} ${formattedJumlah}</div>
            <div class="panin-terbilang">${terbilang}</div>
            
            <div class="panin-dua-kolom">
                <div class="panin-kiri">
                    <div class="panin-nama">${supplier.nama || '-'}</div>
                    <div class="panin-account">${supplier.account || '-'}</div>
                    <div class="panin-alamat">${supplier.alamat || '-'}</div>
                    <div class="panin-spacer"></div>
                    <div class="panin-bank-name">${supplier.bankName || '-'}</div>
                    <div class="panin-iban">IBAN : ${supplier.account || '-'}</div>
                    <div class="panin-swift">SWIFT: ${supplier.swift || '-'}</div>
                    <div class="panin-negara">${supplier.country || '-'}</div>
                    <div class="panin-spacer"></div>
                    <div class="panin-berita">${data.berita || 'PAYMENT FOR BUYING MACHINE'}</div>
                    <div class="panin-no-dokumen">PAYMENT DOC NO ${data.noLoa || 'FC26102950'}</div>
                    <div class="panin-spacer"></div>
                    <div class="panin-pengirim">PT. SINAR CAHAYA CEMERLANG</div>
                    <div class="panin-deretan-angka">0 7 9 6 0 0 0 6 6 5</div>
                </div>
                
                <div class="panin-kanan">
                    <div class="panin-ref-row">
                        <span class="panin-ref-kode">B084235</span>
                        <span class="panin-ref-nomor">${data.noLoa || '0796000665'}</span>
                        <span class="panin-ref-jumlah">${supplier.currency} ${formattedJumlah}</span>
                    </div>
                    <div class="panin-jumlah-tengah">${supplier.currency} ${formattedJumlah}</div>
                    <div class="panin-biaya-row">
                        <div class="panin-biaya-item">${supplier.currency} ${formattedJumlah}</div>
                        <div class="panin-biaya-item">${supplier.currency} 25</div>
                        <div class="panin-biaya-item">IDR. 50,000</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========== GENERATE PRINT BANK BCA ==========
function generateBcaPrint(supplier, data, jumlah) {
    const formattedJumlah = jumlah.toLocaleString('en-US', {minimumFractionDigits: 2});
    const terbilang = `${terbilangAngka(jumlah)} ${supplier.currency}`;
    
    return `
        <div class="bca-print">
            <div class="bca-header">BANK BCA</div>
            <div class="bca-jumlah-besar">${supplier.currency} ${formattedJumlah}</div>
            <div class="bca-terbilang">${terbilang}</div>
            <div class="bca-penerima">Penerima: ${supplier.nama}</div>
            <div class="bca-account">Account: ${supplier.account}</div>
            <div class="bca-bank">Bank: ${supplier.bankName} (${supplier.swift})</div>
            <div class="bca-tujuan">Tujuan: ${data.tujuan || '-'}</div>
            <div class="bca-berita">Berita: ${data.berita || '-'}</div>
            <div class="bca-ref">Ref: ${data.noLoa || '-'}</div>
        </div>
    `;
}

// ========== FUNGSI TERBILANG ANGKA ==========
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
        return n.toString();
    }
    
    let bulat = Math.floor(angka);
    let pecahan = Math.round((angka - bulat) * 100);
    let hasil = convert(bulat);
    if (hasil === '') hasil = 'NOL';
    if (pecahan > 0) {
        hasil += ` KOMA ${pecahan}`;
    }
    return hasil;
}

// ========== LAYOUT EDITOR ==========
function loadLayouts() {
    let saved = localStorage.getItem('al_layout_panin');
    if(saved) currentLayoutPanin = JSON.parse(saved);
    saved = localStorage.getItem('al_layout_bca');
    if(saved) currentLayoutBca = JSON.parse(saved);
    if(document.getElementById('posNamaPanin')) {
        document.getElementById('posNamaPanin').value = currentLayoutPanin.nama;
        document.getElementById('posJumlahPanin').value = currentLayoutPanin.jumlah;
        document.getElementById('posLoaPanin').value = currentLayoutPanin.loa;
        document.getElementById('posNamaBca').value = currentLayoutBca.nama;
        document.getElementById('posJumlahBca').value = currentLayoutBca.jumlah;
    }
}

function previewPanin() {
    currentLayoutPanin = {
        nama: document.getElementById('posNamaPanin').value,
        jumlah: document.getElementById('posJumlahPanin').value,
        loa: document.getElementById('posLoaPanin').value
    };
    document.getElementById('previewContent').innerHTML = `
        <div class="preview-field ${currentLayoutPanin.nama}">🏢 PT Maju Global</div>
        <div class="preview-field ${currentLayoutPanin.jumlah}">💰 USD 10,000</div>
        ${currentLayoutPanin.loa !== 'Tidak' ? `<div class="preview-field ${currentLayoutPanin.loa}">📄 LOA-001</div>` : ''}
    `;
    document.getElementById('layoutPreview').style.display = 'block';
}

function previewBca() {
    currentLayoutBca = {
        nama: document.getElementById('posNamaBca').value,
        jumlah: document.getElementById('posJumlahBca').value
    };
    document.getElementById('previewContent').innerHTML = `
        <div class="preview-field ${currentLayoutBca.nama}">🏢 PT Maju Global</div>
        <div class="preview-field ${currentLayoutBca.jumlah}">💰 USD 10,000</div>
    `;
    document.getElementById('layoutPreview').style.display = 'block';
}

function saveLayouts() {
    localStorage.setItem('al_layout_panin', JSON.stringify(currentLayoutPanin));
    localStorage.setItem('al_layout_bca', JSON.stringify(currentLayoutBca));
    alert('Layout tersimpan!');
}

// ========== MAIN MENU ==========
function setupMainMenu() {
    let mainMenu = document.getElementById('mainMenu');
    if(!mainMenu) return;
    let menuContents = document.querySelectorAll('.menu-content');
    let menuMap = {
        transfer: 'menuTransfer', supplier: 'menuSupplier', tandaTerima: 'menuTandaTerima',
        cetakLabel: 'menuCetakLabel', editData: 'menuEditData', riwayat: 'menuRiwayat',
        tukarFaktur: 'menuTukarFaktur', layoutEditor: 'menuLayoutEditor'
    };
    document.querySelectorAll('.menu-card').forEach(card => {
        card.addEventListener('click', () => {
            let menuId = menuMap[card.getAttribute('data-menu')];
            if(menuId) {
                mainMenu.style.display = 'none';
                menuContents.forEach(m => m.style.display = 'none');
                document.getElementById(menuId).style.display = 'block';
            }
        });
    });
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            mainMenu.style.display = 'grid';
            menuContents.forEach(m => m.style.display = 'none');
        });
    });
}

function setupLayoutTabs() {
    let paninBtn = document.getElementById('layoutPaninBtn');
    let bcaBtn = document.getElementById('layoutBcaBtn');
    if(!paninBtn) return;
    paninBtn.addEventListener('click', () => {
        paninBtn.classList.add('active');
        bcaBtn.classList.remove('active');
        document.getElementById('layoutPaninEditor').style.display = 'block';
        document.getElementById('layoutBcaEditor').style.display = 'none';
        document.getElementById('layoutPreview').style.display = 'none';
    });
    bcaBtn.addEventListener('click', () => {
        bcaBtn.classList.add('active');
        paninBtn.classList.remove('active');
        document.getElementById('layoutPaninEditor').style.display = 'none';
        document.getElementById('layoutBcaEditor').style.display = 'block';
        document.getElementById('layoutPreview').style.display = 'none';
    });
}

// ========== INIT ==========
window.onload = () => {
    setupBankSelection();
    setupMainMenu();
    setupLayoutTabs();
    loadLayouts();
    loadSuppliers();
    document.getElementById('previewPaninBtn')?.addEventListener('click', previewPanin);
    document.getElementById('previewBcaBtn')?.addEventListener('click', previewBca);
    document.getElementById('saveLayoutBtn')?.addEventListener('click', saveLayouts);
    let today = new Date().toISOString().slice(0,10);
    if(document.getElementById('ttTanggal')) document.getElementById('ttTanggal').value = today;
};