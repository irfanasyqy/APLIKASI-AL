let suppliers = [];

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
    if(!suppliers.length) { tbody.innerHTML = '<tr><td colspan="7">Tidak ada data</td>\(`; return; }
    tbody.innerHTML = suppliers.map(s => `<tr><td>${s.no||'-'}</td><td>${s.nama||'-'}</td><td>${s.account||'-'}</td><td>${s.currency||'-'}</td><td>${s.bankName||'-'}</td><td>${s.swift||'-'}</td><td>${s.country||'-'}</td></tr>`).join('');
}

function setupBankSelection() {
    document.querySelectorAll('.bank-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.bank-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            document.getElementById('selectedBank').value = card.getAttribute('data-bank');
        });
    });
}

// ========== SUPPLIER INFO ==========
document.getElementById('supplierSelect')?.addEventListener('change', (e) => {
    let idx = e.target.value;
    if (idx === "") { document.getElementById('supplierInfo').style.display = 'none'; document.getElementById('currencyDisplay').value = ''; return; }
    let s = suppliers[idx];
    document.getElementById('supplierInfo').innerHTML = `<strong>${s.nama}</strong><br>Account: ${s.account}<br>Bank: ${s.bankName} (${s.swift})`;
    document.getElementById('supplierInfo').style.display = 'block';
    document.getElementById('currencyDisplay').value = s.currency;
});

document.getElementById('ttSupplierSelect')?.addEventListener('change', (e) => {
    let s = suppliers[e.target.value];
    if(s) {
        document.getElementById('ttKepada').value = s.nama;
        document.getElementById('ttAlamat').value = s.alamat || '';
        document.getElementById('ttCurrency').value = s.currency;
    }
});

document.getElementById('fakturSupplierSelect')?.addEventListener('change', (e) => {
    let s = suppliers[e.target.value];
    if(s) document.getElementById('fakturCurrency').value = s.currency;
});

// ========== PRINT TRANSFER ==========
document.getElementById('btnPrintTransfer')?.addEventListener('click', async () => {
    let idx = document.getElementById('supplierSelect').value;
    if (!idx) { alert('Pilih supplier'); return; }
    let supplier = suppliers[idx];
    let jumlah = parseFloat(document.getElementById('jumlahTransfer').value);
    if (!jumlah) { alert('Masukkan jumlah'); return; }
    
    let bank = document.getElementById('selectedBank').value;
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
        tujuan: document.getElementById('tujuanTransfer').value
    };
    await fetch(CONFIG.API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
    
    let printContent = bank === 'PANIN' ? 
        `<div style="font-family:monospace"><h3>BANK PANIN</h3><p>Jumlah: ${jumlah} ${supplier.currency}</p><p>Penerima: ${supplier.nama}</p><p>Account: ${supplier.account}</p><p>Bank: ${supplier.bankName}</p><p>SWIFT: ${supplier.swift}</p><p>LOA: ${data.noLoa}</p><p>Berita: ${data.berita}</p><p>Tujuan: ${data.tujuan}</p></div>` :
        `<div style="font-family:monospace"><h3>BANK BCA</h3><p>Amount: ${jumlah} ${supplier.currency}</p><p>Beneficiary: ${supplier.nama}</p><p>Account: ${supplier.account}</p><p>Bank: ${supplier.bankName}</p><p>SWIFT: ${supplier.swift}</p><p>LOA Ref: ${data.noLoa}</p><p>Remark: ${data.berita}</p></div>`;
    
    let printDiv = bank === 'PANIN' ? document.getElementById('paninPrintContent') : document.getElementById('bcaPrintContent');
    printDiv.innerHTML = printContent;
    let original = document.body.innerHTML;
    document.body.innerHTML = document.getElementById(bank === 'PANIN' ? 'printAreaPanin' : 'printAreaBca').innerHTML;
    window.print();
    document.body.innerHTML = original;
    location.reload();
});

// ========== PRINT TANDA TERIMA ==========
document.getElementById('btnPrintTT')?.addEventListener('click', () => {
    let idx = document.getElementById('ttSupplierSelect').value;
    if (!idx) { alert('Pilih supplier'); return; }
    let s = suppliers[idx];
    let printHtml = `<div style="font-family:monospace"><h2>TANDA TERIMA</h2>
        <p>No: ${document.getElementById('ttNo').value || 'TT-'+Date.now()}</p>
        <p>Tanggal: ${document.getElementById('ttTanggal').value || new Date().toISOString().slice(0,10)}</p>
        <p>Dari: ${document.getElementById('ttDari').value}</p>
        <p>Kepada: ${s.nama}</p>
        <p>Alamat: ${s.alamat || '-'}</p>
        <p>Jumlah: ${document.getElementById('ttJumlah').value} ${s.currency}</p>
        <p>Untuk: ${document.getElementById('ttUntuk').value}</p>
        <p>Keterangan: ${document.getElementById('ttKeterangan').value}</p>
        <br><br><p style="text-align:right">Penerima,<br><br>(${s.nama})</p></div>`;
    document.getElementById('ttPrintContent').innerHTML = printHtml;
    let original = document.body.innerHTML;
    document.body.innerHTML = document.getElementById('printAreaTT').innerHTML;
    window.print();
    document.body.innerHTML = original;
    location.reload();
});

// ========== CETAK LABEL ==========
document.getElementById('btnPrintLabel')?.addEventListener('click', () => {
    let idx = document.getElementById('labelSupplierSelect').value;
    if (!idx) { alert('Pilih supplier'); return; }
    let s = suppliers[idx];
    let labelHtml = `<div style="border:1px solid #000; padding:10px; width:100%;">
        <div><strong>${s.nama}</strong></div>
        <div>${s.alamat || '-'}</div>
        <div>${s.country || '-'}</div>
        <div style="margin-top:5px">${s.account ? 'Account: ' + s.account : ''}</div>
    </div>`;
    document.getElementById('labelPrintContent').innerHTML = labelHtml;
    let original = document.body.innerHTML;
    document.body.innerHTML = document.getElementById('printAreaLabel').innerHTML;
    window.print();
    document.body.innerHTML = original;
    location.reload();
});

// ========== EDIT DATA ==========
document.getElementById('editSupplierSelect')?.addEventListener('change', (e) => {
    let s = suppliers[e.target.value];
    if(s) {
        document.getElementById('editForm').style.display = 'block';
        document.getElementById('editNo').value = s.no || '';
        document.getElementById('editNama').value = s.nama || '';
        document.getElementById('editAccount').value = s.account || '';
        document.getElementById('editAlamat').value = s.alamat || '';
        document.getElementById('editBankName').value = s.bankName || '';
        document.getElementById('editSwift').value = s.swift || '';
    }
});

document.getElementById('btnUpdateSupplier')?.addEventListener('click', () => {
    alert('Edit data: Silakan edit langsung di Google Sheets Anda.');
});

// ========== TUKAR FAKTUR ==========
document.getElementById('btnTukarFaktur')?.addEventListener('click', () => {
    let fakturData = {
        no: document.getElementById('fakturNo').value,
        supplier: suppliers[document.getElementById('fakturSupplierSelect').value]?.nama,
        nilai: document.getElementById('fakturNilai').value,
        currency: document.getElementById('fakturCurrency').value
    };
    if(!fakturData.no || !fakturData.supplier) { alert('Isi nomor invoice dan pilih supplier'); return; }
    document.getElementById('fakturResult').innerHTML = `✅ Faktur ${fakturData.no} untuk ${fakturData.supplier} diproses. Nilai: ${fakturData.nilai} ${fakturData.currency}`;
    document.getElementById('fakturResult').style.display = 'block';
});

// ========== RIWAYAT TABS ==========
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

// ========== INIT ==========
window.onload = () => {
    setupBankSelection();
    loadSuppliers();
    let today = new Date().toISOString().slice(0,10);
    if(document.getElementById('ttTanggal')) document.getElementById('ttTanggal').value = today;
    if(document.getElementById('fakturTgl')) document.getElementById('fakturTgl').value = today;
};
