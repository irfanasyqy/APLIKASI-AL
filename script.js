// 🔴 GANTI DENGAN URL APPS SCRIPT ANDA NANTI 🔴
const API_URL = 'https://script.google.com/macros/s/AKfycbyTQ6zuy4n78DsIB2lKlsWRBz1lw4aXlCjzd59lXqH6bj5kT_ZsV4_vxL5UEbWne9ue/exec';
let suppliers = [];
let selectedSupplier = null;

// ========== UTILITY ==========
function formatNumber(angka) {
    return new Intl.NumberFormat('id-ID').format(angka || 0);
}

// ========== LOAD SUPPLIER DARI GOOGLE SHEETS ==========
async function loadSuppliers() {
    try {
        const res = await fetch(`${API_URL}?type=getSuppliers`);
        const result = await res.json();
        if (result.success) {
            suppliers = result.data;
            updateAllSupplierDropdowns();
            renderSupplierTable();
        } else {
            console.error('Gagal load supplier:', result.error);
        }
    } catch (e) {
        console.error('Error fetch:', e);
    }
}

function updateAllSupplierDropdowns() {
    const options = '<option value="">-- Pilih Supplier --</option>' +
        suppliers.map((s, idx) => `<option value="${idx}">${s.no} - ${s.nama} (${s.currency})</option>`).join('');
    
    const selectIds = ['supplierSelect', 'ttSupplierSelect', 'labelSupplierSelect', 'editSupplierSelect', 'fakturSupplierSelect'];
    selectIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = options;
    });
}

// ========== RENDER TABEL SUPPLIER ==========
function renderSupplierTable() {
    const tbody = document.getElementById('supplierTableBody');
    if (!tbody) return;
    if (!suppliers.length) {
        tbody.innerHTML = '<tr><td colspan="7">Belum ada data supplier</td></tr>';
        return;
    }
    tbody.innerHTML = suppliers.map(s => `
        <tr>
            <td>${s.no || '-'}</td>
            <td>${s.nama || '-'}</td>
            <td>${s.account || '-'}</td>
            <td>${s.currency || '-'}</td>
            <td>${s.bankName || '-'}</td>
            <td>${s.swift || '-'}</td>
            <td>${s.country || '-'}</td>
        </tr>
    `).join('');
}

// ========== HANDLER SUPPLIER INFO (TRANSFER) ==========
document.getElementById('supplierSelect')?.addEventListener('change', (e) => {
    const idx = e.target.value;
    if (idx === "") {
        document.getElementById('supplierInfo').style.display = 'none';
        document.getElementById('currencyDisplay').value = '';
        return;
    }
    const s = suppliers[idx];
    document.getElementById('supplierInfo').innerHTML = `<strong>${s.nama}</strong><br>Account: ${s.account}<br>Bank: ${s.bankName} (${s.swift})<br>Negara: ${s.country}`;
    document.getElementById('supplierInfo').style.display = 'block';
    document.getElementById('currencyDisplay').value = s.currency;
    selectedSupplier = s;
});

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

// ========== TRANSFER + PRINT ==========
document.getElementById('btnPrintTransfer')?.addEventListener('click', async () => {
    const idx = document.getElementById('supplierSelect').value;
    if (!idx) return alert('Pilih supplier dulu');
    const supplier = suppliers[idx];
    const jumlah = parseFloat(document.getElementById('jumlahTransfer').value);
    if (!jumlah) return alert('Masukkan jumlah transfer');

    const data = {
        type: 'saveTransfer',
        tanggal: new Date().toLocaleDateString('id-ID'),
        noLoa: document.getElementById('noCekLoa').value,
        bankTujuan: document.getElementById('selectedBank').value,
        namaPenerima: supplier.nama,
        accountNumber: supplier.account,
        currency: supplier.currency,
        jumlah: jumlah,
        berita: document.getElementById('beritaTransfer').value,
        tujuan: document.getElementById('tujuanTransfer').value
    };

    await fetch(API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
    
    // Preview Print

    if (data.bankTujuan === 'PANIN') {
        // Buka file print-panin.html dengan data sebagai parameter
        const url = `print-panin.html?nama=${encodeURIComponent(supplier.nama)}&account=${encodeURIComponent(supplier.account)}&loa=${encodeURIComponent(data.noLoa)}&jumlah=${jumlah}&currency=${supplier.currency}`;
        window.open(url, '_blank');
    } 
    else {
        const url = `print-bca.html?nama=${encodeURIComponent(supplier.nama)}&account=${encodeURIComponent(supplier.account)}&jumlah=${jumlah}&currency=${supplier.currency}`;
        window.open(url, '_blank');
    }
});

// ========== TANDA TERIMA ==========
document.getElementById('ttSupplierSelect')?.addEventListener('change', (e) => {
    const s = suppliers[e.target.value];
    if (s) {
        document.getElementById('ttKepada').value = s.nama;
        document.getElementById('ttAlamat').value = `${s.alamat || ''} ${s.country || ''}`;
        document.getElementById('ttCurrency').value = s.currency;
    }
});

document.getElementById('btnPrintTT')?.addEventListener('click', () => {
    const ttData = {
        no: document.getElementById('ttNo').value || `TT-${Date.now()}`,
        tanggal: document.getElementById('ttTanggal').value || new Date().toISOString().slice(0,10),
        dari: document.getElementById('ttDari').value,
        kepada: document.getElementById('ttKepada').value,
        alamat: document.getElementById('ttAlamat').value,
        jumlah: document.getElementById('ttJumlah').value,
        currency: document.getElementById('ttCurrency').value,
        untuk: document.getElementById('ttUntuk').value,
        keterangan: document.getElementById('ttKeterangan').value
    };
    const printHtml = `<div>No: ${ttData.no}</div><div>Tanggal: ${ttData.tanggal}</div><div>Dari: ${ttData.dari}</div><div>Kepada: ${ttData.kepada}</div><div>Jumlah: ${ttData.jumlah} ${ttData.currency}</div><div>Untuk: ${ttData.untuk}</div><div>Keterangan: ${ttData.keterangan}</div><div>Alamat: ${ttData.alamat}</div>`;
    document.getElementById('ttPrintContent').innerHTML = printHtml;
    const original = document.body.innerHTML;
    document.body.innerHTML = document.getElementById('printAreaTT').innerHTML;
    window.print();
    document.body.innerHTML = original;
    location.reload();
});

// ========== CETAK LABEL ==========
document.getElementById('labelSupplierSelect')?.addEventListener('change', (e) => {
    const s = suppliers[e.target.value];
    if (s) {
        const label = `${s.nama}\n${s.alamat || ''}\n${s.country || ''}\n${s.account || ''}`;
        document.getElementById('labelAlamat').value = label;
        document.getElementById('labelPrintContent').innerText = label;
    }
});

document.getElementById('btnPrintLabel')?.addEventListener('click', () => {
    const original = document.body.innerHTML;
    document.body.innerHTML = document.getElementById('printAreaLabel').innerHTML;
    window.print();
    document.body.innerHTML = original;
    location.reload();
});

// ========== EDIT DATA (DEMO) ==========
document.getElementById('editSupplierSelect')?.addEventListener('change', (e) => {
    const s = suppliers[e.target.value];
    if (s) {
        document.getElementById('editForm').style.display = 'block';
        document.getElementById('editNo').value = s.no;
        document.getElementById('editNama').value = s.nama;
        document.getElementById('editAccount').value = s.account;
        document.getElementById('editAlamat').value = s.alamat;
        document.getElementById('editBankName').value = s.bankName;
        document.getElementById('editSwift').value = s.swift;
        document.getElementById('editBankAlamat').value = s.bankAlamat;
        document.getElementById('editCountry').value = s.country;
    }
});

document.getElementById('btnUpdateSupplier')?.addEventListener('click', () => {
    alert('Fitur edit data terhubung ke Google Sheets. Untuk mengubah data, edit langsung di spreadsheet Anda.');
});

// ========== RIWAYAT (DEMO) ==========
document.getElementById('riwayatTransferBtn')?.addEventListener('click', () => {
    document.getElementById('riwayatTransferList').style.display = 'block';
    document.getElementById('riwayatTTList').style.display = 'none';
    document.getElementById('riwayatTransferBtn').classList.add('active');
    document.getElementById('riwayatTTBtn').classList.remove('active');
});
document.getElementById('riwayatTTBtn')?.addEventListener('click', () => {
    document.getElementById('riwayatTransferList').style.display = 'none';
    document.getElementById('riwayatTTList').style.display = 'block';
    document.getElementById('riwayatTTBtn').classList.add('active');
    document.getElementById('riwayatTransferBtn').classList.remove('active');
});

// ========== TUKAR FAKTUR ==========
document.getElementById('fakturSupplierSelect')?.addEventListener('change', (e) => {
    const s = suppliers[e.target.value];
    if (s) document.getElementById('fakturCurrency').value = s.currency;
});
document.getElementById('btnTukarFaktur')?.addEventListener('click', () => {
    const fakturData = {
        no: document.getElementById('fakturNo').value,
        supplier: suppliers[document.getElementById('fakturSupplierSelect').value]?.nama,
        nilai: document.getElementById('fakturNilai').value,
        currency: document.getElementById('fakturCurrency').value,
        tgl: document.getElementById('fakturTgl').value,
        jatuhTempo: document.getElementById('fakturJatuhTempo').value
    };
    document.getElementById('fakturResult').innerHTML = `✅ Faktur ${fakturData.no} untuk ${fakturData.supplier} telah diproses. Nilai: ${fakturData.nilai} ${fakturData.currency}`;
    document.getElementById('fakturResult').style.display = 'block';
});

<!-- MENU LAYOUT EDITOR -->
<div id="menuLayoutEditor" class="menu-content" style="display:none;">
    <button class="btn-back">← KEMBALI KE MENU</button>
    <div class="card">
        <h2>🎨 LAYOUT EDITOR</h2>
        <p class="info-note">Atur posisi field pada struk print Bank Panin dan Bank BCA</p>
        
        <div class="layout-tabs">
            <button id="layoutPaninBtn" class="layout-tab active">BANK PANIN</button>
            <button id="layoutBcaBtn" class="layout-tab">BANK BCA</button>
        </div>
        
        <div id="layoutPaninEditor" class="layout-editor">
            <h3>Posisi Field - Bank Panin</h3>
            
            <div class="layout-field">
                <label>Nama Penerima:</label>
                <select id="posNamaPanin" class="pos-select">
                    <option value="kiri-atas">Kiri Atas</option>
                    <option value="kanan-atas">Kanan Atas</option>
                    <option value="kiri-tengah">Kiri Tengah</option>
                    <option value="kanan-tengah">Kanan Tengah</option>
                    <option value="bawah">Bawah</option>
                </select>
            </div>
            
            <div class="layout-field">
                <label>Nomor Rekening:</label>
                <select id="posAccountPanin" class="pos-select">
                    <option value="kiri-atas">Kiri Atas</option>
                    <option value="kanan-atas">Kanan Atas</option>
                    <option value="kiri-tengah">Kiri Tengah</option>
                    <option value="kanan-tengah">Kanan Tengah</option>
                    <option value="bawah">Bawah</option>
                </select>
            </div>
            
            <div class="layout-field">
                <label>Jumlah Transfer:</label>
                <select id="posJumlahPanin" class="pos-select">
                    <option value="kanan-atas">Kanan Atas (besar)</option>
                    <option value="tengah">Tengah</option>
                    <option value="kiri-atas">Kiri Atas</option>
                </select>
            </div>
            
            <div class="layout-field">
                <label>LOA / CEK:</label>
                <select id="posLoaPanin" class="pos-select">
                    <option value="kanan-atas">Kanan Atas</option>
                    <option value="kiri-atas">Kiri Atas</option>
                    <option value="tidak">Tidak Ditampilkan</option>
                </select>
            </div>
            
            <div class="layout-field">
                <label>Bank & SWIFT:</label>
                <select id="posBankPanin" class="pos-select">
                    <option value="kiri-bawah">Kiri Bawah</option>
                    <option value="kanan-bawah">Kanan Bawah</option>
                    <option value="kiri-tengah">Kiri Tengah</option>
                </select>
            </div>
            
            <div class="layout-field">
                <label>Berita Transfer:</label>
                <select id="posBeritaPanin" class="pos-select">
                    <option value="bawah">Bawah</option>
                    <option value="kiri-tengah">Kiri Tengah</option>
                    <option value="tengah">Tengah</option>
                </select>
            </div>
            
            <button id="previewPaninBtn" class="btn-secondary">👁️ Preview Layout Panin</button>
        </div>
        
        <div id="layoutBcaEditor" class="layout-editor" style="display:none;">
            <h3>Posisi Field - Bank BCA</h3>
            
            <div class="layout-field">
                <label>Nama Penerima:</label>
                <select id="posNamaBca" class="pos-select">
                    <option value="kanan">Kanan</option>
                    <option value="kiri">Kiri</option>
                    <option value="tengah">Tengah</option>
                    <option value="bawah">Bawah</option>
                </select>
            </div>
            
            <div class="layout-field">
                <label>Nomor Rekening:</label>
                <select id="posAccountBca" class="pos-select">
                    <option value="bawah-nama">Bawah Nama</option>
                    <option value="samping">Samping Nama</option>
                    <option value="kiri">Kiri</option>
                </select>
            </div>
            
            <div class="layout-field">
                <label>Jumlah Transfer:</label>
                <select id="posJumlahBca" class="pos-select">
                    <option value="tengah-besar">Tengah (besar)</option>
                    <option value="kanan-atas">Kanan Atas</option>
                    <option value="tengah">Tengah</option>
                </select>
            </div>
            
            <div class="layout-field">
                <label>Bank & SWIFT:</label>
                <select id="posBankBca" class="pos-select">
                    <option value="kiri-bawah">Kiri Bawah</option>
                    <option value="kanan-bawah">Kanan Bawah</option>
                </select>
            </div>
            
            <div class="layout-field">
                <label>Tujuan Transfer:</label>
                <select id="posTujuanBca" class="pos-select">
                    <option value="tengah">Tengah</option>
                    <option value="bawah">Bawah</option>
                </select>
            </div>
            
            <button id="previewBcaBtn" class="btn-secondary">👁️ Preview Layout BCA</button>
        </div>
        
        <div id="layoutPreview" class="layout-preview" style="display:none; margin-top:20px;">
            <h4>Preview Layout:</h4>
            <div id="previewContent" class="preview-box"></div>
            <button id="saveLayoutBtn" class="btn-success" style="margin-top:10px;">💾 SIMPAN LAYOUT</button>
        </div>
    </div>
</div>
// ========== MAIN MENU NAVIGASI ==========
function setupMainMenu() {
    const menuCards = document.querySelectorAll('.menu-card');
    const menuContents = document.querySelectorAll('.menu-content');
    const mainMenu = document.getElementById('mainMenu');
    const backBtns = document.querySelectorAll('.btn-back');

    const showMenu = (menuId) => {
        mainMenu.style.display = 'none';
        menuContents.forEach(mc => mc.style.display = 'none');
        document.getElementById(menuId).style.display = 'block';
    };

    menuCards.forEach(card => {
        card.addEventListener('click', () => {
            const menu = card.getAttribute('data-menu');
            const menuMap = {
                transfer: 'menuTransfer',
                supplier: 'menuSupplier',
                tandaTerima: 'menuTandaTerima',
                cetakLabel: 'menuCetakLabel',
                editData: 'menuEditData',
                riwayat: 'menuRiwayat',
                tukarFaktur: 'menuTukarFaktur',
                layoutEditor: 'menuLayoutEditor'
            };
            showMenu(menuMap[menu]);
        });
    });

    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            mainMenu.style.display = 'grid';
            menuContents.forEach(mc => mc.style.display = 'none');
        });
    });
}

// ========== INIT ==========
window.onload = async () => {
    setupBankSelection();
    setupMainMenu();
    await loadSuppliers();
    document.getElementById('ttTanggal').value = new Date().toISOString().slice(0,10);
    document.getElementById('fakturTgl').value = new Date().toISOString().slice(0,10);
};
// ============ LAYOUT EDITOR ============
let currentLayoutPanin = {
    nama: 'kiri-atas',
    account: 'kiri-tengah',
    jumlah: 'kanan-atas',
    loa: 'kanan-atas',
    bank: 'kiri-bawah',
    berita: 'bawah'
};

let currentLayoutBca = {
    nama: 'kanan',
    account: 'bawah-nama',
    jumlah: 'tengah-besar',
    bank: 'kiri-bawah',
    tujuan: 'tengah'
};

// Load saved layout dari localStorage
function loadLayouts() {
    const savedPanin = localStorage.getItem('al_layout_panin');
    const savedBca = localStorage.getItem('al_layout_bca');
    if (savedPanin) currentLayoutPanin = JSON.parse(savedPanin);
    if (savedBca) currentLayoutBca = JSON.parse(savedBca);
    
    // Set nilai dropdown sesuai saved layout
    if (document.getElementById('posNamaPanin')) {
        document.getElementById('posNamaPanin').value = currentLayoutPanin.nama;
        document.getElementById('posAccountPanin').value = currentLayoutPanin.account;
        document.getElementById('posJumlahPanin').value = currentLayoutPanin.jumlah;
        document.getElementById('posLoaPanin').value = currentLayoutPanin.loa;
        document.getElementById('posBankPanin').value = currentLayoutPanin.bank;
        document.getElementById('posBeritaPanin').value = currentLayoutPanin.berita;
        
        document.getElementById('posNamaBca').value = currentLayoutBca.nama;
        document.getElementById('posAccountBca').value = currentLayoutBca.account;
        document.getElementById('posJumlahBca').value = currentLayoutBca.jumlah;
        document.getElementById('posBankBca').value = currentLayoutBca.bank;
        document.getElementById('posTujuanBca').value = currentLayoutBca.tujuan;
    }
}

function saveLayouts() {
    localStorage.setItem('al_layout_panin', JSON.stringify(currentLayoutPanin));
    localStorage.setItem('al_layout_bca', JSON.stringify(currentLayoutBca));
    alert('Layout tersimpan!');
}

// Preview layout Panin
function previewPanin() {
    currentLayoutPanin = {
        nama: document.getElementById('posNamaPanin').value,
        account: document.getElementById('posAccountPanin').value,
        jumlah: document.getElementById('posJumlahPanin').value,
        loa: document.getElementById('posLoaPanin').value,
        bank: document.getElementById('posBankPanin').value,
        berita: document.getElementById('posBeritaPanin').value
    };
    
    const previewDiv = document.getElementById('previewContent');
    previewDiv.innerHTML = `
        <div class="preview-field ${currentLayoutPanin.nama}">🏢 Nama: PT Maju Global</div>
        <div class="preview-field ${currentLayoutPanin.account}">💳 Account: 1234567890</div>
        <div class="preview-field ${currentLayoutPanin.jumlah}">💰 Jumlah: USD 10,000</div>
        ${currentLayoutPanin.loa !== 'tidak' ? `<div class="preview-field ${currentLayoutPanin.loa}">📄 LOA: LOA-2024-001</div>` : ''}
        <div class="preview-field ${currentLayoutPanin.bank}">🏦 Bank: ING BANK (SWIFT: INGBIDJA)</div>
        <div class="preview-field ${currentLayoutPanin.berita}">📝 Berita: Pembayaran invoice</div>
    `;
    document.getElementById('layoutPreview').style.display = 'block';
}

function previewBca() {
    currentLayoutBca = {
        nama: document.getElementById('posNamaBca').value,
        account: document.getElementById('posAccountBca').value,
        jumlah: document.getElementById('posJumlahBca').value,
        bank: document.getElementById('posBankBca').value,
        tujuan: document.getElementById('posTujuanBca').value
    };
    
    const previewDiv = document.getElementById('previewContent');
    previewDiv.innerHTML = `
        <div class="preview-field ${currentLayoutBca.nama}">🏢 Penerima: PT Maju Global</div>
        <div class="preview-field ${currentLayoutBca.account}">💳 Account: 1234567890</div>
        <div class="preview-field ${currentLayoutBca.jumlah}">💰 ${currentLayoutBca.jumlah === 'tengah-besar' ? 'USD 10,000' : 'Jumlah: USD 10,000'}</div>
        <div class="preview-field ${currentLayoutBca.bank}">🏦 Bank: ING BANK (SWIFT: INGBIDJA)</div>
        <div class="preview-field ${currentLayoutBca.tujuan}">🎯 Tujuan: Pembayaran invoice</div>
    `;
    document.getElementById('layoutPreview').style.display = 'block';
}

// Setup Layout Editor tabs
function setupLayoutEditor() {
    const paninBtn = document.getElementById('layoutPaninBtn');
    const bcaBtn = document.getElementById('layoutBcaBtn');
    const paninEditor = document.getElementById('layoutPaninEditor');
    const bcaEditor = document.getElementById('layoutBcaEditor');
    
    if (paninBtn) {
        paninBtn.addEventListener('click', () => {
            paninBtn.classList.add('active');
            bcaBtn.classList.remove('active');
            paninEditor.style.display = 'block';
            bcaEditor.style.display = 'none';
            document.getElementById('layoutPreview').style.display = 'none';
        });
        
        bcaBtn.addEventListener('click', () => {
            bcaBtn.classList.add('active');
            paninBtn.classList.remove('active');
            paninEditor.style.display = 'none';
            bcaEditor.style.display = 'block';
            document.getElementById('layoutPreview').style.display = 'none';
        });
        
        document.getElementById('previewPaninBtn').addEventListener('click', previewPanin);
        document.getElementById('previewBcaBtn').addEventListener('click', previewBca);
        document.getElementById('saveLayoutBtn').addEventListener('click', saveLayouts);
    }
}