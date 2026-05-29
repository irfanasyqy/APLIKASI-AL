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
    // ========== FUNGSI TERBILANG ==========
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
            if (n < 1000000) {
                let ribu = Math.floor(n / 1000);
                let sisa = n % 1000;
                return convert(ribu) + ' RIBU' + (sisa > 0 ? ' ' + convert(sisa) : '');
            }
            return n.toString();
        }
        
        let bulat = Math.floor(angka);
        let pecahan = Math.round((angka - bulat) * 100);
        let hasil = convert(bulat);
        
        if (hasil === '') hasil = 'NOL';
        if (pecahan > 0) {
            hasil += ` KOMA ${convert(pecahan)}`;
        }
        return hasil + ' ' + supplier.currency;
    }
    
    let terbilang = terbilangAngka(jumlah);
    
    printContent = `
        <div style="font-family: 'Courier New', monospace; font-size: 10pt; width: 100%;">
            <!-- Jumlah di kiri atas -->
            <div style="margin-bottom: 10px;">
                <div style="font-size: 14pt; font-weight: bold;">
                    ${supplier.currency} ${jumlah.toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
                <div style="font-size: 9pt; border-bottom: 1px dashed #ccc; padding-bottom: 8px;">
                    ${terbilang}
                </div>
            </div>
            
            <div style="display: flex; gap: 30px; justify-content: space-between;">
                <div style="flex: 2;">
                    <div style="font-weight: bold;">${supplier.nama}</div>
                    <div>${supplier.account}</div>
                    <div>${supplier.alamat || '-'}</div>
                    <div style="height: 8px;"></div>
                    <div style="font-weight: bold;">${supplier.bankName || '-'}</div>
                    <div>${supplier.country || '-'}</div>
                    <div style="height: 8px;"></div>
                    <div>${data.berita || '-'}</div>
                    <div>${data.tujuan || '-'}</div>
                    <div style="height: 8px;"></div>
                    <div style="font-weight: bold;">PT. SINAR CAHAYA CEMERLANG</div>
                    <div style="letter-spacing: 5px; font-size: 11pt; margin-top: 5px;">0 7 9 6 0 0 0 6 6 5</div>
                </div>
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
// ========== TAB NAVIGATION ==========
const tabSupplier = document.getElementById('tabSupplier');
const tabValas = document.getElementById('tabValas');
const formSupplier = document.getElementById('formSupplier');
const formValas = document.getElementById('formValas');

if (tabSupplier && tabValas) {
    tabSupplier.addEventListener('click', () => {
        tabSupplier.classList.add('active');
        tabValas.classList.remove('active');
        formSupplier.style.display = 'block';
        formValas.style.display = 'none';
    });
    
    tabValas.addEventListener('click', () => {
        tabValas.classList.add('active');
        tabSupplier.classList.remove('active');
        formSupplier.style.display = 'none';
        formValas.style.display = 'block';
    });
}

// ========== HITUNG JUMLAH DAPAT VALAS ==========
const jumlahIDR = document.getElementById('jumlahIDR');
const kursValas = document.getElementById('kursValas');
const keRekening = document.getElementById('keRekening');
const jumlahDapat = document.getElementById('jumlahDapat');

function hitungJumlahDapat() {
    const idr = parseFloat(jumlahIDR?.value) || 0;
    const kurs = parseFloat(kursValas?.value) || 0;
    const mataUang = keRekening?.value || 'USD';
    
    if (kurs > 0 && idr > 0) {
        const hasil = idr / kurs;
        jumlahDapat.value = hasil.toLocaleString('en-US', {minimumFractionDigits: 2}) + ' ' + mataUang;
    } else {
        jumlahDapat.value = '';
    }
}

if (jumlahIDR) jumlahIDR.addEventListener('input', hitungJumlahDapat);
if (kursValas) kursValas.addEventListener('input', hitungJumlahDapat);
if (keRekening) keRekening.addEventListener('change', hitungJumlahDapat);

// ========== PRINT PEMBELIAN VALAS ==========
document.getElementById('btnPrintValas')?.addEventListener('click', async () => {
    const perusahaan = document.getElementById('perusahaanSelect')?.value || '';
    const dariRek = document.getElementById('dariRekening')?.value || 'IDR';
    const keRek = document.getElementById('keRekening')?.value || 'USD';
    const jumlahIDRVal = parseFloat(document.getElementById('jumlahIDR')?.value) || 0;
    const kurs = parseFloat(document.getElementById('kursValas')?.value) || 0;
    const jumlahDapatVal = jumlahIDRVal / kurs;
    const berita = document.getElementById('beritaValas')?.value || '-';
    const noRef = document.getElementById('noRefValas')?.value || 'REF-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(Math.random()*1000);
    
    if (jumlahIDRVal <= 0 || kurs <= 0) {
        alert('Masukkan jumlah IDR dan Kurs dengan benar!');
        return;
    }
    
    const printContent = `
        <div style="font-family: monospace; padding: 20px; width: 105mm; margin: 0 auto;">
            <div style="text-align: center; border-bottom: 2px solid #000; margin-bottom: 15px;">
                <h2>APLIKASI AL</h2>
                <h3>BUKTI PEMBELIAN VALAS</h3>
            </div>
            <div><strong>Perusahaan:</strong> ${perusahaan}</div>
            <div><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}</div>
            <div><strong>No Ref:</strong> ${noRef}</div>
            <div style="margin-top: 15px;"><strong>Detail Transaksi:</strong></div>
            <div>Dari Rekening: ${dariRek}</div>
            <div>Ke Rekening: ${keRek}</div>
            <div>Jumlah Dibayar: IDR ${jumlahIDRVal.toLocaleString('id-ID')}</div>
            <div>Kurs: 1 ${keRek} = IDR ${kurs.toLocaleString('id-ID')}</div>
            <div style="font-size: 14pt; font-weight: bold; margin: 10px 0;">
                Jumlah Dapat: ${jumlahDapatVal.toLocaleString('en-US', {minimumFractionDigits: 2})} ${keRek}
            </div>
            <div><strong>Berita:</strong> ${berita}</div>
            <div style="margin-top: 20px; text-align: center; font-size: 9pt;">
                Dicetak dari APLIKASI AL
            </div>
        </div>
    `;
    
    // Print
    const originalBody = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalBody;
    location.reload();
});