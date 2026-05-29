// 🔴 GANTI DENGAN URL APPS SCRIPT ANDA NANTI 🔴
const API_URL = 'https://script.google.com/macros/s/AKfycbztKZhaVWpIygZXHtVeImy38nPVZ_Rk5bbWJWIl13tiWf87YI0zJIlYvZVzPnEVyoXN/exec';

let suppliers = [];
let selectedSupplier = null;

// ============ LOAD SUPPLIER DARI GOOGLE SHEETS ============
async function loadSuppliers() {
    const select = document.getElementById('supplierSelect');
    select.innerHTML = '<option value="">-- Memuat data supplier... --</option>';
    
    try {
        const response = await fetch(API_URL + '?type=getSuppliers');
        const result = await response.json();
        
        if (result.success && result.data) {
            suppliers = result.data;
            
            if (suppliers.length === 0) {
                select.innerHTML = '<option value="">-- Tidak ada data supplier --</option>';
                document.getElementById('supplierInfo').style.display = 'none';
            } else {
                let options = '<option value="">-- Pilih Supplier --</option>';
                suppliers.forEach((s, index) => {
                    options += `<option value="${index}" data-nama="${s.nama}" data-account="${s.account}" data-currency="${s.currency}" data-alamat="${s.alamat}" data-bankname="${s.bankName}" data-bankalamat="${s.bankAlamat}" data-swift="${s.swift}" data-country="${s.country}">${s.no} - ${s.nama} (${s.currency})</option>`;
                });
                select.innerHTML = options;
            }
        } else {
            select.innerHTML = '<option value="">-- Gagal memuat data --</option>';
        }
    } catch (error) {
        console.error('Error:', error);
        select.innerHTML = '<option value="">-- Error koneksi API --</option>';
    }
}

// ============ TAMPILKAN INFO SUPPLIER YANG DIPILIH ============
function displaySupplierInfo(index) {
    if (index === "" || !suppliers[index]) {
        document.getElementById('supplierInfo').style.display = 'none';
        document.getElementById('currencyDisplay').value = '';
        selectedSupplier = null;
        return;
    }
    
    const s = suppliers[index];
    selectedSupplier = s;
    
    const infoHtml = `
        <strong>📌 ${s.nama}</strong><br>
        Account: ${s.account || '-'}<br>
        Bank: ${s.bankName || '-'} (${s.swift || '-'})<br>
        Negara: ${s.country || '-'}
    `;
    document.getElementById('supplierInfo').innerHTML = infoHtml;
    document.getElementById('supplierInfo').style.display = 'block';
    document.getElementById('currencyDisplay').value = s.currency || 'USD';
}

// ============ SETUP BANK SELECTION ============
function setupBankSelection() {
    const bankCards = document.querySelectorAll('.bank-card');
    bankCards.forEach(card => {
        card.addEventListener('click', () => {
            bankCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const bank = card.getAttribute('data-bank');
            document.getElementById('selectedBank').value = bank;
        });
    });
}

// ============ FORMAT ANGKA ============
function formatNumber(angka) {
    return new Intl.NumberFormat('id-ID').format(angka || 0);
}

// ============ SAVE TRANSFER KE GOOGLE SHEETS & PRINT ============
async function submitAndPrint() {
    const supplierIndex = document.getElementById('supplierSelect').value;
    if (supplierIndex === "") {
        alert('Pilih supplier penerima dulu!');
        return;
    }
    
    const supplier = suppliers[supplierIndex];
    const jumlah = parseFloat(document.getElementById('jumlahTransfer').value);
    
    if (!jumlah || jumlah <= 0) {
        alert('Masukkan jumlah transfer yang valid!');
        return;
    }
    
    const berita = document.getElementById('beritaTransfer').value.trim() || '-';
    const tujuan = document.getElementById('tujuanTransfer').value.trim() || '-';
    const loa = document.getElementById('noCekLoa').value.trim() || '-';
    const tanggal = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const bankTujuan = document.getElementById('selectedBank').value;
    
    const transferData = {
        type: 'saveTransfer',
        tanggal: tanggal,
        noLoa: loa,
        bankTujuan: bankTujuan,
        namaPenerima: supplier.nama,
        accountNumber: supplier.account,
        currency: supplier.currency,
        jumlah: jumlah,
        berita: berita,
        tujuan: tujuan
    };
    
    const btn = document.getElementById('btnPrintTransfer');
    const originalText = btn.innerText;
    btn.innerText = '⏳ Menyimpan data...';
    btn.disabled = true;
    
    try {
        await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transferData)
        });
        
        if (bankTujuan === 'PANIN') {
            updatePaninPrint(supplier, loa, tanggal, jumlah, berita, tujuan);
            printContent('printAreaPanin', 'BUKTI TRANSFER PANIN - APLIKASI AL');
        } else {
            updateBcaPrint(supplier, loa, tanggal, jumlah, berita, tujuan);
            printContent('printAreaBca', 'BUKTI TRANSFER BCA - APLIKASI AL');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal menyimpan data, tetapi tetap bisa print.');
        if (bankTujuan === 'PANIN') {
            updatePaninPrint(supplier, loa, tanggal, jumlah, berita, tujuan);
            printContent('printAreaPanin', 'BUKTI TRANSFER PANIN - APLIKASI AL');
        } else {
            updateBcaPrint(supplier, loa, tanggal, jumlah, berita, tujuan);
            printContent('printAreaBca', 'BUKTI TRANSFER BCA - APLIKASI AL');
        }
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

function updatePaninPrint(supplier, loa, tanggal, jumlah, berita, tujuan) {
    document.getElementById('printLoa').innerText = loa;
    document.getElementById('printTgl').innerText = tanggal;
    document.getElementById('printNama').innerText = supplier.nama || '-';
    document.getElementById('printAlamat').innerText = supplier.alamat || '-';
    document.getElementById('printAccount').innerText = supplier.account || '-';
    document.getElementById('printCurrency').innerText = supplier.currency || 'USD';
    document.getElementById('printBankName').innerText = supplier.bankName || '-';
    document.getElementById('printBankAlamat').innerText = supplier.bankAlamat || '-';
    document.getElementById('printSwift').innerText = supplier.swift || '-';
    document.getElementById('printCountry').innerText = supplier.country || '-';
    document.getElementById('printJumlah').innerText = formatNumber(jumlah);
    document.getElementById('printCurrSym').innerText = supplier.currency || 'USD';
    document.getElementById('printBerita').innerText = berita;
    document.getElementById('printTujuan').innerText = tujuan;
}

function updateBcaPrint(supplier, loa, tanggal, jumlah, berita, tujuan) {
    document.getElementById('printBcaLoa').innerText = loa;
    document.getElementById('printBcaTgl').innerText = tanggal;
    document.getElementById('printBcaNama').innerText = supplier.nama || '-';
    document.getElementById('printBcaAlamat').innerText = supplier.alamat || '-';
    document.getElementById('printBcaAccount').innerText = supplier.account || '-';
    document.getElementById('printBcaCurrency').innerText = supplier.currency || 'USD';
    document.getElementById('printBcaBankName').innerText = supplier.bankName || '-';
    document.getElementById('printBcaBankAlamat').innerText = supplier.bankAlamat || '-';
    document.getElementById('printBcaSwift').innerText = supplier.swift || '-';
    document.getElementById('printBcaCountry').innerText = supplier.country || '-';
    document.getElementById('printBcaJumlah').innerText = formatNumber(jumlah);
    document.getElementById('printBcaCurrSym').innerText = supplier.currency || 'USD';
    document.getElementById('printBcaBerita').innerText = berita;
    document.getElementById('printBcaTujuan').innerText = tujuan;
}

function printContent(areaId, title) {
    const printContent = document.getElementById(areaId).innerHTML;
    document.title = title;
    const originalBody = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalBody;
    location.reload();
}

// ============ EVENT LISTENERS ============
document.getElementById('supplierSelect').addEventListener('change', (e) => {
    displaySupplierInfo(e.target.value);
});

document.getElementById('btnPrintTransfer').addEventListener('click', submitAndPrint);

// ============ INITIALIZE ============
window.onload = function() {
    setupBankSelection();
    loadSuppliers();
};