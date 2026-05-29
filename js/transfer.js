// ========== TRANSFER.JS ==========
document.getElementById('btnPrintTransfer')?.addEventListener('click', async function() {
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
    
    let printContent = '';
    
    if (bank === 'PANIN') {
    // Fungsi terbilang
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
        let hasil = convert(bulat);
        if (hasil === '') hasil = 'NOL';
        return hasil + ' ' + supplier.currency;
    }
    
    let terbilang = terbilangAngka(jumlah);
    
    printContent = `
        <div style="font-family: 'Courier New', monospace; font-size: 10pt; width: 100%;">
            <!-- Jumlah dan Terbilang di KIRI ATAS -->
            <div style="margin-bottom: 20px;">
                <div style="font-size: 13pt; font-weight: bold;">
                    ${supplier.currency} ${jumlah.toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
                <div style="font-size: 9pt; border-bottom: 1px dashed #ccc; padding-bottom: 8px;">
                    ${terbilang}
                </div>
            </div>
            
            <div style="display: flex; gap: 30px; justify-content: space-between;">
                <!-- KOLOM KIRI -->
                <div style="flex: 2;">
                    <div style="font-weight: bold;">${supplier.nama}</div>
                    <div>${supplier.account}</div>
                    <div>${supplier.alamat || '-'}</div>
                    <div style="height: 8px;"></div>
                    <div style="font-weight: bold;">${supplier.bankName || '-'}</div>
                    <div>${supplier.country || '-'}</div>
                    <div style="height: 8px;"></div>
                    <div>${data.berita || '-'}</div>
                    <!-- TUJUAN TRANSFER (dari data.tujuan) -->
                    <div>${data.tujuan || '-'}</div>
                    <div style="height: 8px;"></div>
                    <div style="font-weight: bold;">PT. SINAR CAHAYA CEMERLANG</div>
                    <div style="letter-spacing: 5px; font-size: 11pt; margin-top: 5px;">0 7 9 6 0 0 0 6 6 5</div>
                </div>
                
                <!-- KOLOM KANAN -->
                <div style="flex: 1; text-align: right;">
                    <div style="margin-bottom: 15px;">
                        <span>B084235</span>
                        <span style="margin-left: 10px;">${data.noLoa || '0796000665'}</span>
                        <span style="margin-left: 10px;">${supplier.currency} ${jumlah.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div style="font-size: 13pt; font-weight: bold; margin-bottom: 15px;">
                        ${supplier.currency} ${jumlah.toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </div>
                    <div>
                        <div>${supplier.currency} ${jumlah.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        <div>${supplier.currency} 25</div>
                        <div>IDR. 50,000</div>
                    </div>
                </div>
            </div>
        </div>
    `;
} else {
        printContent = `
            <div style="font-family: 'Courier New', monospace; text-align: center; padding: 20px;">
                <h2 style="margin-bottom: 20px;">BANK BCA</h2>
                <div style="font-size: 20pt; font-weight: bold; margin: 20px 0;">${jumlah.toLocaleString('en-US', {minimumFractionDigits: 2})} ${supplier.currency}</div>
                <div style="margin: 10px 0;"><strong>Beneficiary:</strong> ${supplier.nama}</div>
                <div style="margin: 10px 0;"><strong>Account:</strong> ${supplier.account}</div>
                <div style="margin: 10px 0;"><strong>Bank:</strong> ${supplier.bankName}</div>
                <div style="margin: 10px 0;"><strong>SWIFT:</strong> ${supplier.swift}</div>
                <div style="margin: 10px 0;"><strong>LOA Ref:</strong> ${data.noLoa || '-'}</div>
                <div style="margin: 10px 0;"><strong>Remark:</strong> ${data.berita || '-'}</div>
                <div style="margin: 10px 0;"><strong>Tujuan:</strong> ${data.tujuan || '-'}</div>
            </div>
        `;
    }
    
    let printDiv = bank === 'PANIN' ? document.getElementById('paninPrintContent') : document.getElementById('bcaPrintContent');
    printDiv.innerHTML = printContent;
    let original = document.body.innerHTML;
    document.body.innerHTML = document.getElementById(bank === 'PANIN' ? 'printAreaPanin' : 'printAreaBca').innerHTML;
    window.print();
    document.body.innerHTML = original;
    location.reload();
});
