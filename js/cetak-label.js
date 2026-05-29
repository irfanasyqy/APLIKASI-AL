// ========== CETAK-LABEL.JS ==========
document.getElementById('btnPrintLabel')?.addEventListener('click', function() {
    let idx = document.getElementById('labelSupplierSelect').value;
    if (!idx) { alert('Pilih supplier'); return; }
    let s = suppliers[idx];
    let labelHtml = '<div style="border:1px solid #000; padding:12px; width:100%; max-width:250px;">';
    labelHtml += '<div style="font-weight:bold; margin-bottom:5px;">' + (s.nama || '-') + '</div>';
    labelHtml += '<div>' + (s.alamat || '-') + '</div>';
    labelHtml += '<div>' + (s.country || '-') + '</div>';
    labelHtml += '<div style="margin-top:8px;">' + (s.account ? 'Account: ' + s.account : '') + '</div>';
    labelHtml += '</div>';
    
    document.getElementById('labelPrintContent').innerHTML = labelHtml;
    let original = document.body.innerHTML;
    document.body.innerHTML = document.getElementById('printAreaLabel').innerHTML;
    window.print();
    document.body.innerHTML = original;
    location.reload();
});
