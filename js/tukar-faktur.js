// ========== TANDA-TERIMA.JS ==========
// Tukar Faktur / Input Tanda Terima (Konversi dari frmInput VBA)

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

// Konfigurasi API
const API_URL = CONFIG.API_URL;
const CUSTOMER_API_URL = CONFIG.CUSTOMER_API_URL || API_URL;
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1iJ6NMTx3LW09ZoKXpCrJwUux4M_EeBzKu_gP7NgGW6s/export?format=tsv&gid=0';

// =====================================================
// 1. LOAD PT AKTIF
// =====================================================
async function loadActivePT() {
    // Coba ambil dari localStorage dulu
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
    
    // Reset pencarian invoice
    document.getElementById('searchInvoice').value = '';
    document.getElementById('invoiceList').style.display = 'none';
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
        const response = await fetch(CUSTOMER_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getCustomers' })
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            customerData = result.data;
            const filtered = customerData.filter(c => 
                c[1] && c[1].toLowerCase().includes(searchText.toLowerCase())
            );
            
            const listDiv = document.getElementById('customerList');
            listDiv.innerHTML = '';
            
            if (filtered.length === 0) {
                listDiv.innerHTML = '<div style="padding: 8px; color: #999;">Tidak ada data customer</div>';
            } else {
                filtered.forEach((c) => {
                    const div = document.createElement('div');
                    div.textContent = `${c[0] || ''} - ${c[1] || ''}`;
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
    const nomor = customer[0] || '-';
    const nama = customer[1] || '-';
    const alamat = customer[2] || '-';
    const telp = customer[4] || '-';
    const hp = customer[5] || '-';
    
    document.getElementById('customerName').innerHTML = `${nomor} - ${nama}`;
    document.getElementById('customerAddress').innerHTML = `📍 Alamat: ${alamat}`;
    document.getElementById('customerContact').innerHTML = `📞 Telp: ${telp} | HP: ${hp}`;
    document.getElementById('selectedCustomerInfo').style.display = 'block';
    document.getElementById('customerList').style.display = 'none';
    document.getElementById('searchCustomer').value = nama;
    
    // Reset invoice selections
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
            
            let delimiter = '\t';
            if (lines[i].includes(',')) delimiter = ',';
            
            const cols = lines[i].split(delimiter);
            if (cols.length >= 6) {
                const ptDB = (cols[3] || '').trim().toUpperCase();
                const invDB = cleanInvoiceNumber(cols[5] || '');
                
                if (ptDB === searchPT && invDB.startsWith(invoiceNumber)) {
                    let nominal = 0;
                    const nominalStr = (cols[8] || '0').replace(/Rp/g, '').replace(/\./g, '').replace(/,/g, '.').trim();
                    nominal = parseFloat(nominalStr) || 0;
                    
                    results.push({
                        no: cols[5] || '-',
                        url: cols[4] || '',
                        file: cols[1] || '',
                        path: cols[0] || '',
                        tahun: cols[2] || '',
                        nominal: nominal,
                        nominalDisplay: cols[8] || '0',
                        terbilang: cols[7] || ''
                    });
                }
            }
        }
        
        displayInvoiceList(results);
        
    } catch (error) {
        console.error('Error search invoice:', error);
    }
}

function cleanInvoiceNumber(inv) {
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
    
    // Cek duplikat
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
    
    // Generate No TT
    generateNoTT();
}

// =====================================================
// 7. GENERATE NO TANDA TERIMA
// =====================================================
async function generateNoTT() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    let lastNumber = await getLastTTNumber();
    let newNumber = lastNumber + 1;
    
    document.getElementById('noTT').innerText = `TT/${year}/${month}/${String(newNumber).padStart(3, '0')}`;
}

async function getLastTTNumber() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getLastTTNumber' })
        });
        const result = await response.json();
        return result.success ? result.number : 0;
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
// 9. SIMPAN TANDA TERIMA
// =====================================================
async function saveTandaTerima() {
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
    
    const noTT = document.getElementById('noTT').innerText;
    
    const data = {
        type: 'saveTandaTerima',
        noTT: noTT,
        tanggal: tanggal,
        customerNomor: selectedCustomer[0],
        customerNama: selectedCustomer[1],
        customerAlamat: selectedCustomer[2] || '',
        customerTelp: selectedCustomer[4] || '',
        customerHP: selectedCustomer[5] || '',
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
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Tanda Terima No. ${noTT} berhasil disimpan!`);
            
            // Reset form
            resetInvoices();
            selectedCustomer = null;
            document.getElementById('selectedCustomerInfo').style.display = 'none';
            document.getElementById('searchCustomer').value = '';
            await generateNoTT();
            
            // Tanya apakah ingin cetak
            if (confirm('🖨️ Cetak Tanda Terima sekarang?')) {
                window.open(`../print/print-tt.html?noTT=${noTT}`, '_blank');
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
        // Clear cache
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
// 11. UTILITY FUNCTIONS
// =====================================================
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

// =====================================================
// 12. EVENT LISTENERS
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    loadActivePT();
    
    // Set tanggal default = hari ini
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tanggalTT').value = today;
    
    // Search customer dengan debounce
    const searchInput = document.getElementById('searchCustomer');
    let typingTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            loadCustomers(searchInput.value);
        }, 500);
    });
    
    // Search invoice
    const invoiceInput = document.getElementById('searchInvoice');
    invoiceInput.addEventListener('input', () => {
        searchInvoice(invoiceInput.value);
    });
    
    // Tombol refresh
    document.getElementById('btnRefreshData').addEventListener('click', refreshData);
    document.getElementById('btnSimpanTT').addEventListener('click', saveTandaTerima);
    document.getElementById('btnGantiPT').addEventListener('click', gantiPT);
    
    // Klik di luar list untuk menutup
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#customerList') && !e.target.closest('#searchCustomer')) {
            document.getElementById('customerList').style.display = 'none';
        }
        if (!e.target.closest('#invoiceList') && !e.target.closest('#searchInvoice')) {
            document.getElementById('invoiceList').style.display = 'none';
        }
    });
    
    // Enter key pada search customer
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.length >= 3) {
            loadCustomers(searchInput.value);
        }
    });
    
    // Enter key pada search invoice
    invoiceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && invoiceInput.value.length === 5) {
            searchInvoice(invoiceInput.value);
        }
    });
});

// Global functions untuk onclick
window.removeInvoice = removeInvoice;