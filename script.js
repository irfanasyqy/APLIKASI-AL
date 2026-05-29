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
document.getElementById('btnPrintTransfer')?.addEventListener('click', async () => {
    let idx = document.getElementById('supplierSelect').value;
    if(!idx) { alert('Pilih supplier'); return; }
    let supplier = suppliers[idx];
    let jumlah = document.getElementById('jumlahTransfer').value;
    if(!jumlah) { alert('Masukkan jumlah'); return; }
    
    let bank = document.getElementById('selectedBank').value;
    
    // Simpan ke Google Sheets
    let transferData = {
        type: 'saveTransfer',
        tanggal: new Date().toLocaleDateString(),
        noLoa: document.getElementById('noCekLoa').value,
        bankTujuan: bank,
        namaPenerima: supplier.nama,
        accountNumber: supplier.account,
        currency: supplier.currency,
        jumlah: parseFloat(jumlah),
        berita: document.getElementById('beritaTransfer').value,
        tujuan: document.getElementById('tujuanTransfer').value
    };
    await fetch(CONFIG.API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(transferData) });
    
    // Print
    let content = bank === 'PANIN' ? 
        `<div class="preview-field ${currentLayoutPanin.nama}">Penerima: ${supplier.nama}</div>
         <div class="preview-field ${currentLayoutPanin.jumlah}">Jumlah: ${jumlah} ${supplier.currency}</div>
         ${currentLayoutPanin.loa !== 'Tidak' ? `<div class="preview-field ${currentLayoutPanin.loa}">LOA: ${document.getElementById('noCekLoa').value}</div>` : ''}`
        :
        `<div class="preview-field ${currentLayoutBca.nama}">Penerima: ${supplier.nama}</div>
         <div class="preview-field ${currentLayoutBca.jumlah}">${jumlah} ${supplier.currency}</div>`;
    
    let printDiv = bank === 'PANIN' ? document.getElementById('paninPrintContent') : document.getElementById('bcaPrintContent');
    printDiv.innerHTML = content;
    let original = document.body.innerHTML;
    document.body.innerHTML = document.getElementById(bank === 'PANIN' ? 'printAreaPanin' : 'printAreaBca').innerHTML;
    window.print();
    document.body.innerHTML = original;
    location.reload();
});

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