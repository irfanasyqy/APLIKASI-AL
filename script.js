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
                tukarFaktur: 'menuTukarFaktur'
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