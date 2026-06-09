// ========== TUKAR-FAKTUR.JS ==========
// Tukar Faktur

// Global variables
let selectedCustomer = null;
let selectedInvoices = [];
let currentPT = '';
let ptList = [
    'PT. SINAR CAHAYA CEMERLANG',
    'PT. SINAR ANUGERAH CEMERLANG',
    'CV. UTAMA UNGGUL PERSADA',
    'CV. PRIMA MAJU PERKASA'
];

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1iJ6NMTx3LW09ZoKXpCrJwUux4M_EeBzKu_gP7NgGW6s/export?format=tsv&gid=0';

// =====================================================
// 1. LOAD PT AKTIF
// =====================================================
async function loadActivePT() {
    let savedPT = localStorage.getItem('activePT');
    if (savedPT && ptList.includes(savedPT)) {
        currentPT = savedPT;
    } else {
        currentPT = ptList[0];
    }
    document.getElementById('ptName').innerText = currentPT;
}

// =====================================================
// 2. GANTI PT
// =====================================================
function gantiPT() {
    let currentIndex = ptList.indexOf(currentPT);
    let nextIndex = (currentIndex + 1) % ptList.length;
    currentPT = ptList[nextIndex];
    localStorage.setItem('activePT', currentPT);
    document.getElementById('ptName').innerText = currentPT;
    alert(`PT telah diganti menjadi: ${currentPT}`);
    
    document.getElementById('searchInvoice').value = '';
    document.getElementById('invoiceList').style.display = 'none';
    resetInvoices();
}

// =====================================================
// 3. LOAD CUSTOMER LIST
// =====================================================
let customerData = [];

async function loadCustomers(searchText) {
    if (searchText.length < 3) {
        document.getElementById('customerList').style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getCustomers' })
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            customerData = result.data;
            const filtered = customerData.filter(c => 
                c.nama && c.nama.toLowerCase().includes(searchText.toLowerCase())
            );
            
            const listDiv = document.getElementById('customerList');
            listDiv.innerHTML = '';
            
            if (filtered.length === 0) {
                listDiv.innerHTML = '<div style="padding: 8px; color: #999;">Tidak ada data customer</div>';
            } else {
                filtered.forEach((c) => {
                    const div = document.createElement('div');
                    div.textContent = `${c.nomor || ''} - ${c.nama || ''}`;
                    div.onclick = () => selectCustomer(c);
                    listDiv.appendChild(div);
                });
            }
            listDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error load customers:', error);
    }
}

// =====================================================
// 4. SELECT CUSTOMER
// =====================================================
function selectCustomer(customer) {
    selectedCustomer = customer;
    
    const nomor = customer.nomor || '-';
    const nama = customer.nama || '-';
    const alamat = customer.alamat || '-';
    const pic = customer.pic || '-';
    const hp = customer.hp || '-';
    
    document.getElementById('customerName').innerHTML = `${nomor} - ${nama}`;
    document.getElementById('customerAddress').innerHTML = `📍 Alamat: ${alamat}`;
    document.getElementById('customerContact').innerHTML = `👤 PIC: ${pic} | 📞 HP: ${hp}`;
    document.getElementById('selectedCustomerInfo').style.display = 'block';
    document.getElementById('customerList').style.display = 'none';
    document.getElementById('searchCustomer').value = nama;
    
    resetInvoices();
}

// =====================================================
// 5. SEARCH INVOICE DARI GOOGLE SHEETS
// =====================================================
async function searchInvoice(invoiceNumber) {
    if (invoiceNumber.length !== 5) {
        document.getElementById('invoiceList').style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(SHEET_URL + '&_=' + Date.now());
        const text = await response.text();
        const lines = text.split(/\r?\n/);
        
        const results = [];
        const searchPT = getPTCode(currentPT);
        
        for (let i = 0; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const cols = lines[i].split('\t');
            if (cols.length >= 9) {
                const ptDB = (cols[3] || '').trim().toUpperCase();
                const invDB = cleanInvoiceNumber(cols[5] || '');
                
                if (ptDB === searchPT && invDB.includes(invoiceNumber)) {
                    // Gunakan fungsi parseNominal
                    let nominalRaw = cols[8] || '0';
                    let nominal = parseNominal(nominalRaw);
                    
                    results.push({
                        no: cols[5] || '-',
                        url: cols[4] || '',
                        file: cols[1] || '',
                        path: cols[0] || '',
                        tahun: cols[2] || '',
                        nominal: nominal,
                        nominalDisplay: formatRupiah(nominal),
                        terbilang: cols[7] || ''
                    });
                }
            }
        }
        
        results.sort((a, b) => a.no.localeCompare(b.no));
        displayInvoiceList(results);
        
    } catch (error) {
        console.error('Error search invoice:', error);
        document.getElementById('invoiceList').innerHTML = '<div style="padding: 8px;">❌ Error membaca data</div>';
        document.getElementById('invoiceList').style.display = 'block';
    }
}

// =====================================================
// PARSE NOMINAL DENGAN LOGIKA
// =====================================================
function parseNominal(nominalRaw) {
    if (!nominalRaw) return 0;
    
    let str = String(nominalRaw);
    
    // 1. Hapus "Rp" (case insensitive)
    str = str.replace(/Rp/gi, '');
    
    // 2. Hapus semua koma (pemisah ribuan)
    str = str.replace(/,/g, '');
    
    // 3. Cek bagian setelah titik
    let hasDecimal = false;
    let decimalValue = 0;
    
    if (str.includes('.')) {
        let parts = str.split('.');
        let afterDot = parts[1] || '';
        
        // Jika setelah titik adalah "00" atau kosong
        if (afterDot === '00' || afterDot === '0' || afterDot === '') {
            // Hapus titik dan angka setelahnya
            str = parts[0];
        } else {
            // Jika setelah titik > 0, simpan sebagai desimal
            hasDecimal = true;
            decimalValue = parseInt(afterDot) || 0;
            str = parts[0];
        }
    }
    
    // Konversi ke angka
    let nominal = parseInt(str) || 0;
    
    // Tambahkan desimal jika ada
    if (hasDecimal && decimalValue > 0) {
        nominal = nominal + (decimalValue / 100);
    }
    
    console.log(`Parse: "${nominalRaw}" → ${nominal}`);
    
    return nominal;
}

// Contoh penggunaan di searchInvoice:
// let nominal = parseNominal(cols[8]);

function cleanInvoiceNumber(inv) {
    if (!inv) return '';
    return inv.replace(/\D/g, '');
}

function getPTCode(ptName) {
    const ptMap = {
        'PT. SINAR CAHAYA CEMERLANG': 'SCC',
        'PT. SINAR ANUGERAH CEMERLANG': 'SAC',
        'CV. UTAMA UNGGUL PERSADA': 'UUP',
        'CV. PRIMA MAJU PERKASA': 'PMP'
    };
    return ptMap[ptName] || ptName.substring(0, 3).toUpperCase();
}

function displayInvoiceList(invoices) {
    const listDiv = document.getElementById('invoiceList');
    listDiv.innerHTML = '';
    
    if (invoices.length === 0) {
        listDiv.innerHTML = '<div style="padding: 8px;">❌ Invoice tidak ditemukan</div>';
    } else {
        invoices.forEach((inv) => {
            const div = document.createElement('div');
            div.innerHTML = `<strong>📄 ${inv.no}</strong> - ${formatRupiah(inv.nominal)}`;
            div.onclick = () => addInvoice(inv);
            listDiv.appendChild(div);
        });
    }
    listDiv.style.display = 'block';
}

// =====================================================
// 6. ADD INVOICE KE LIST
// =====================================================
function addInvoice(invoice) {
    if (selectedInvoices.length >= 5) {
        alert('⚠️ Maksimal 5 faktur!');
        return;
    }
    
    if (selectedInvoices.some(inv => inv.no === invoice.no)) {
        alert('⚠️ Faktur ini sudah dipilih!');
        return;
    }
    
    selectedInvoices.push({
        ...invoice,
        id: Date.now() + Math.random()
    });
    
    updateInvoiceDisplay();
    document.getElementById('invoiceList').style.display = 'none';
    document.getElementById('searchInvoice').value = '';
}

function removeInvoice(index) {
    selectedInvoices.splice(index, 1);
    updateInvoiceDisplay();
}

function updateInvoiceDisplay() {
    const container = document.getElementById('invoiceItems');
    const totalSpan = document.getElementById('totalAmount');
    
    if (selectedInvoices.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">Belum ada faktur dipilih</div>';
        totalSpan.innerText = formatRupiah(0);
        document.getElementById('noTT').innerText = 'TT---';
        return;
    }
    
    let total = 0;
    let html = '';
    selectedInvoices.forEach((inv, idx) => {
        total += inv.nominal;
        html += `
            <div class="invoice-item">
                <div>
                    <strong>📄 ${inv.no}</strong><br>
                    <small>${formatRupiah(inv.nominal)}</small>
                </div>
                <button class="remove-btn" onclick="removeInvoice(${idx})">✖</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    totalSpan.innerText = formatRupiah(total);
    
    generateNoTT();
}

// =====================================================
// 7. GENERATE NO TUKAR FAKTUR (CEK DARI DATABASE)
// =====================================================
async function generateNoTT() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Ambil nomor terakhir dari database
    let lastNumber = await getLastTTNumber();
    let newNumber = lastNumber + 1;
    
    // Format: TT/2025/01/001
    const noTT = `TT/${year}/${month}/${String(newNumber).padStart(3, '0')}`;
    document.getElementById('noTT').innerText = noTT;
    
    return noTT;
}

// =====================================================
// AMBIL NOMOR TERAKHIR DARI DATABASE TANDA TERIMA
// =====================================================
async function getLastTTNumber() {
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getTandaTerima' })
        });
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            // Cari nomor TT terbesar
            let maxNumber = 0;
            const currentYear = new Date().getFullYear();
            
            for (const tt of result.data) {
                const noTT = tt.noTT || '';
                // Cek format TT/2025/01/001
                const match = noTT.match(/TT\/(\d{4})\/\d{2}\/(\d{3})/);
                if (match) {
                    const year = parseInt(match[1]);
                    const num = parseInt(match[2]);
                    // Hanya hitung yang tahunnya sama dengan tahun ini
                    if (year === currentYear && num > maxNumber) {
                        maxNumber = num;
                    }
                }
            }
            
            console.log(`Nomor TT terakhir tahun ${currentYear}: ${maxNumber}`);
            return maxNumber;
        }
        
        return 0;
    } catch (error) {
        console.error('Error get last TT number:', error);
        return 0;
    }
}

// =====================================================
// 8. RESET INVOICES
// =====================================================
function resetInvoices() {
    selectedInvoices = [];
    updateInvoiceDisplay();
}

// =====================================================
// 9. SIMPAN TUKAR FAKTUR
// =====================================================
async function simpanTukarFaktur() {
    if (!selectedCustomer) {
        alert('⚠️ Pilih customer terlebih dahulu!');
        document.getElementById('searchCustomer').focus();
        return;
    }
    
    if (selectedInvoices.length === 0) {
        alert('⚠️ Pilih minimal 1 faktur!');
        document.getElementById('searchInvoice').focus();
        return;
    }
    
    const tanggal = document.getElementById('tanggalTT').value;
    if (!tanggal) {
        alert('⚠️ Pilih tanggal terlebih dahulu!');
        return;
    }
    
    // Generate nomor baru sebelum simpan (biar dapat nomor terbaru)
    const noTT = await generateNoTT();
    
    const data = {
        type: 'saveTandaTerima',
        noTT: noTT,
        tanggal: tanggal,
        customerNomor: selectedCustomer.nomor || '',
        customerNama: selectedCustomer.nama || '',
        customerAlamat: selectedCustomer.alamat || '',
        customerPic: selectedCustomer.pic || '',
        customerTelepon: selectedCustomer.hp || '',
        invoices: selectedInvoices.map(inv => ({
            no: inv.no,
            nominal: inv.nominal,
            nominalDisplay: inv.nominalDisplay,
            url: inv.url
        })),
        total: selectedInvoices.reduce((sum, inv) => sum + inv.nominal, 0),
        ptCode: getPTCode(currentPT),
        ptName: currentPT
    };
    
    const btnSimpan = document.getElementById('btnSimpanTT');
    const originalText = btnSimpan.innerText;
    btnSimpan.innerText = '💾 MENYIMPAN...';
    btnSimpan.disabled = true;
    
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Tukar Faktur No. ${noTT} berhasil disimpan!`);
            
            resetInvoices();
            selectedCustomer = null;
            document.getElementById('selectedCustomerInfo').style.display = 'none';
            document.getElementById('searchCustomer').value = '';
            
            // Generate nomor baru untuk form berikutnya
            await generateNoTT();
            
            if (confirm('🖨️ Cetak Tukar Faktur sekarang?')) {
                window.open(`../print/print-tt.html?noTT=${encodeURIComponent(noTT)}`, '_blank');
            }
        } else {
            alert('❌ Gagal menyimpan: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error save:', error);
        alert('❌ Error koneksi saat menyimpan');
    } finally {
        btnSimpan.innerText = originalText;
        btnSimpan.disabled = false;
    }
}

// =====================================================
// 10. REFRESH DATA
// =====================================================
function refreshData() {
    if (confirm('🔄 Refresh data dari Google Sheet?')) {
        customerData = [];
        document.getElementById('searchCustomer').value = '';
        document.getElementById('selectedCustomerInfo').style.display = 'none';
        document.getElementById('invoiceList').style.display = 'none';
        document.getElementById('customerList').style.display = 'none';
        selectedCustomer = null;
        resetInvoices();
        alert('✅ Data siap direfresh! Silakan cari customer/invoice kembali.');
    }
}

// =====================================================
// 11. FORMAT RUPIAH (HANYA SATU)
// =====================================================
function formatRupiah(angka) {
    if (isNaN(angka) || angka === 0) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(angka);
}

// =====================================================
// 12. EVENT LISTENERS
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    loadActivePT();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tanggalTT').value = today;
    
    const searchInput = document.getElementById('searchCustomer');
    let typingTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            loadCustomers(searchInput.value);
        }, 500);
    });
    
    const invoiceInput = document.getElementById('searchInvoice');
    invoiceInput.addEventListener('input', () => {
        searchInvoice(invoiceInput.value);
    });
    
    document.getElementById('btnRefreshData').addEventListener('click', refreshData);
    document.getElementById('btnSimpanTT').addEventListener('click', simpanTukarFaktur);
    document.getElementById('btnGantiPT').addEventListener('click', gantiPT);
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#customerList') && !e.target.closest('#searchCustomer')) {
            document.getElementById('customerList').style.display = 'none';
        }
        if (!e.target.closest('#invoiceList') && !e.target.closest('#searchInvoice')) {
            document.getElementById('invoiceList').style.display = 'none';
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.length >= 3) {
            loadCustomers(searchInput.value);
        }
    });
    
    invoiceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && invoiceInput.value.length === 5) {
            searchInvoice(invoiceInput.value);
        }
    });
});

// Global functions
window.removeInvoice = removeInvoice;