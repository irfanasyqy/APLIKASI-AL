// ========== TUKAR-FAKTUR.JS ==========
document.getElementById('btnTukarFaktur')?.addEventListener('click', function() {
    let fakturNo = document.getElementById('fakturNo').value;
    let supplierIdx = document.getElementById('fakturSupplierSelect').value;
    let supplier = suppliers[supplierIdx]?.nama;
    let nilai = document.getElementById('fakturNilai').value;
    let currency = document.getElementById('fakturCurrency').value;
    
    if (!fakturNo || !supplier) { alert('Isi nomor invoice dan pilih supplier'); return; }
    document.getElementById('fakturResult').innerHTML = '✅ Faktur ' + fakturNo + ' untuk ' + supplier + ' diproses. Nilai: ' + nilai + ' ' + currency;
    document.getElementById('fakturResult').style.display = 'block';
});
