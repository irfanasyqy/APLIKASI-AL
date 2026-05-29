// ========== TANDA-TERIMA.JS ==========
document.getElementById('btnPrintTT')?.addEventListener('click', function() {
    let idx = document.getElementById('ttSupplierSelect').value;
    if (!idx) { alert('Pilih supplier'); return; }
    let s = suppliers[idx];
    let noTT = document.getElementById('ttNo').value || 'TT-' + Date.now();
    let tanggal = document.getElementById('ttTanggal').value || new Date().toISOString().slice(0,10);
    let dari = document.getElementById('ttDari').value;
    let jumlah = document.getElementById('ttJumlah').value;
    let untuk = document.getElementById('ttUntuk').value;
    let keterangan = document.getElementById('ttKeterangan').value;
    
    let printHtml = '<div style="font-family:monospace; padding:20px;"><h2 style="text-align:center;">TANDA TERIMA</h2>';
    printHtml += '<p><strong>No:</strong> ' + noTT + '</p>';
    printHtml += '<p><strong>Tanggal:</strong> ' + tanggal + '</p>';
    printHtml += '<p><strong>Dari:</strong> ' + dari + '</p>';
    printHtml += '<p><strong>Kepada:</strong> ' + (s.nama || '-') + '</p>';
    printHtml += '<p><strong>Alamat:</strong> ' + (s.alamat || '-') + '</p>';
    printHtml += '<p><strong>Jumlah:</strong> ' + jumlah + ' ' + (s.currency || '') + '</p>';
    printHtml += '<p><strong>Untuk:</strong> ' + untuk + '</p>';
    printHtml += '<p><strong>Keterangan:</strong> ' + keterangan + '</p>';
    printHtml += '<br><br><p style="text-align:right">Penerima,<br><br>(' + (s.nama || '-') + ')</p></div>';
    
    document.getElementById('ttPrintContent').innerHTML = printHtml;
    let original = document.body.innerHTML;
    document.body.innerHTML = document.getElementById('printAreaTT').innerHTML;
    window.print();
    document.body.innerHTML = original;
    location.reload();
});
