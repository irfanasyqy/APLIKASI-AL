// 🔴 GANTI DENGAN URL APPS SCRIPT ANDA NANTI 🔴
const API_URL = 'https://script.google.com/macros/s/AKfycbyTQ6zuy4n78DsIB2lKlsWRBz1lw4aXlCjzd59lXqH6bj5kT_ZsV4_vxL5UEbWne9ue/exec';
let suppliers = [];
let selectedSupplier = null;

// ========== LAYOUT EDITOR STATE ==========
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

function renderSupplierTable() {
    const tbody = document.getElementById('supplierTableBody');
    if (!tbody) return;
    if (!suppliers.length) {
        tbody.innerHTML = '<tr><td colspan="7">Belum ada data supplier</td></table>';
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

// ========== HANDLER SUPPLIER INFO ==========
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
    const bankCards = document.querySelectorAll('.bank-card');
    bankCards.forEach(card => {
        card.addEventListener('click', () => {
            bankCards.forEach(c => c.classList.remove('selected'));
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
    
    // Preview Print berdasarkan layout yang disimpan
    const printContent = generatePrintContent(data.bankTujuan, supplier, data, jumlah);
    
    if (data.bankTujuan === 'PANIN') {
        document.getElementById('paninPrintContent').innerHTML = printContent;
        const originalBody = document.body.innerHTML;
        document.body.innerHTML = document.getElementById('printAreaPanin').innerHTML;
        window.print();
        document.body.innerHTML = originalBody;
    } else {
        document.getElementById('bcaPrintContent').innerHTML = printContent;
        const originalBody = document.body.innerHTML;
        document.body.innerHTML = document.getElementById('printAreaBca').innerHTML;
        window.print();
        document.body.innerHTML = originalBody;
    }
    location.reload();
});

function generatePrintContent(bank, supplier, data, jumlah) {
    if (bank === 'PANIN') {
        return `
            <div class="preview-field ${currentLayoutPanin.nama}"><strong>PENERIMA:</strong> ${supplier.nama}</div>
            <div class="preview-field ${currentLayoutPanin.account}"><strong>ACCOUNT:</strong> ${supplier.account}</div>
            <div class="preview-field ${currentLayoutPanin.jumlah}"><strong>JUMLAH:</strong> ${formatNumber(jumlah)} ${supplier.currency}</div>
            ${currentLayoutPanin.loa !== 'tidak' ? `<div class="preview-field ${currentLayoutPanin.loa}"><strong>LOA/CEK:</strong> ${data.noLoa || '-'}</div>` : ''}
            <div class="preview-field ${currentLayoutPanin.bank}"><strong>BANK:</strong> ${supplier.bankName} (SWIFT: ${supplier.swift})</div>
            <div class="preview-field ${currentLayoutPanin.berita}"><strong>BERITA:</strong> ${data.berita || '-'}</div>
        `;
    } else {
        return `
            <div class="preview-field ${currentLayoutBca.nama}"><strong>PENERIMA:</strong> ${supplier.nama}</div>
            <div class="preview-field ${currentLayoutBca.account}"><strong>ACCOUNT:</strong> ${supplier.account}</div>
            <div class="preview-field ${currentLayoutBca.jumlah}"><strong>${currentLayoutBca.jumlah === 'tengah-besar' ? formatNumber(jumlah) : 'JUMLAH: ' + formatNumber(jumlah)} ${supplier.currency}</strong></div>
            <div class="preview-field ${currentLayoutBca.bank}"><strong>BANK:</strong> ${supplier.bankName} (SWIFT: ${supplier.swift})</div>
            <div class="preview-field ${currentLayoutBca.tujuan}"><strong>TUJUAN:</strong> ${data.tujuan || '-'}</div>
        `;
    }
}

// ========== LAYOUT EDITOR FUNCTIONS ==========
function loadLayouts() {
    const savedPanin = localStorage.getItem('al_layout_panin');
    const savedBca = localStorage.getItem('al_layout_bca');
    if (savedPanin) currentLayoutPanin = JSON.parse(savedPanin);
    if (savedBca) currentLayoutBca = JSON.parse(savedBca);
    
    // Set nilai dropdown
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
    alert('Layout tersimpan! Akan digunakan untuk print selanjutnya.');
}

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
        <div class="preview-field ${currentLayoutPanin.nama}">🏢 Penerima: PT Maju Global</div>
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

// ========== MAIN MENU NAVIGASI ==========
function setupMainMenu() {
    const menuCards = document.querySelectorAll('.menu-card');
    const menuContents = document.querySelectorAll('.menu-content');
    const mainMenu = document.getElementById('mainMenu');
    const backBtns = document.querySelectorAll('.btn-back');

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

    const showMenu = (menuId) => {
        if (mainMenu) mainMenu.style.display = 'none';
        menuContents.forEach(mc => mc.style.display = 'none');
        const targetMenu = document.getElementById(menuId);
        if (targetMenu) targetMenu.style.display = 'block';
    };

    menuCards.forEach(card => {
        card.addEventListener('click', () => {
            const menuKey = card.getAttribute('data-menu');
            const menuId = menuMap[menuKey];
            if (menuId) showMenu(menuId);
        });
    });

    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (mainMenu) mainMenu.style.display = 'grid';
            menuContents.forEach(mc => mc.style.display = 'none');
        });
    });
}

// ========== INITIALIZE ==========
window.onload = async () => {
    setupBankSelection();
    setupMainMenu();
    setupLayoutEditor();
    loadLayouts();
    await loadSuppliers();
    
    // Set default tanggal
    const today = new Date().toISOString().slice(0,10);
    if (document.getElementById('ttTanggal')) document.getElementById('ttTanggal').value = today;
    if (document.getElementById('fakturTgl')) document.getElementById('fakturTgl').value = today;
};