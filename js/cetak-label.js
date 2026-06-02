// ========== CETAK-LABEL.JS ==========
// Cetak Label Customer (Konversi dari frmCetakLabel VBA)

let selectedLabel = null;
let customerData = [];
let labelData = {
    B3: null, I3: null, B7: null, I7: null, B11: null, I11: null
};

const API_URL = CONFIG.API_URL;
const CUSTOMER_API_URL = CONFIG.CUSTOMER_API_URL || API_URL;

// =====================================================
// 1. LOAD DATA CUSTOMER
// =====================================================
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
// 2. SELECT CUSTOMER
// =====================================================
function selectCustomer(customer) {
    if (!selectedLabel) {
        alert('⚠️ Pilih posisi label terlebih dahulu! (klik tombol label 1-6)');
        document.getElementById('customerList').style.display = 'none';
        document.getElementById('searchCustomer').value = '';
        return;
    }
    
    const nomor = customer[0] || '';
    const nama = customer[1] || '';
    const alamat = customer[2] || '';
    const telp = customer[4] || '';
    const hp = customer[5] || '';
    
    // Simpan ke labelData
    labelData[selectedLabel] = {
        nomor: nomor,
        nama: nama,
        alamat: alamat,
        telp: telp,
        hp: hp
    };
    
    // Update tampilan hasil
    updateLabelDisplay(selectedLabel, nama, alamat, hp);
    
    // Simpan ke localStorage (simulasi sheet CETAK LABEL)
    saveToLocalStorage();
    
    alert(`✅ Customer "${nama}" berhasil ditambahkan ke ${selectedLabel}`);
    
    // Reset
    selectedLabel = null;
    document.getElementById('searchCustomer').value = '';
    document.getElementById('customerList').style.display = 'none';
    document.getElementById('previewPanel').style.display = 'none';
    
    // Hapus active class dari semua tombol label
    document.querySelectorAll('.btn-label').forEach(btn => {
        btn.classList.remove('active');
    });
}

// =====================================================
// 3. UPDATE TAMPILAN HASIL LABEL
// =====================================================
function updateLabelDisplay(label, nama, alamat, hp) {
    const dataDiv = document.getElementById(`dataLabel${getLabelIndex(label)}`);
    if (dataDiv) {
        dataDiv.innerHTML = `
            <div>📛 Nama: ${escapeHtml(nama) || '-'}</div>
            <div>📍 Alamat: ${escapeHtml(alamat) || '-'}</div>
            <div>📱 HP: ${escapeHtml(hp) || '-'}</div>
        `;
    }
}

function getLabelIndex(label) {
    const map = { B3: 1, I3: 2, B7: 3, I7: 4, B11: 5, I11: 6 };
    return map[label] || 1;
}

// =====================================================
// 4. SAVE TO LOCAL STORAGE (Simulasi Sheet)
// =====================================================
function saveToLocalStorage() {
    localStorage.setItem('cetakLabelData', JSON.stringify(labelData));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('cetakLabelData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            for (const [label, value] of Object.entries(data)) {
                if (value && value.nama) {
                    labelData[label] = value;
                    updateLabelDisplay(label, value.nama, value.alamat, value.hp);
                }
            }
        } catch(e) {}
    }
}

// =====================================================
// 5. SHOW PREVIEW CUSTOMER
// =====================================================
function showPreview(customer) {
    const nomor = customer[0] || '';
    const nama = customer[1] || '';
    const alamat = customer[2] || '';
    const telp = customer[4] || '';
    const hp = customer[5] || '';
    
    const previewHtml = `
        <div><strong>📛 ${escapeHtml(nomor)} - ${escapeHtml(nama)}</strong></div>
        <div>📍 Alamat: ${escapeHtml(alamat)}</div>
        <div>📞 Telp: ${escapeHtml(telp)}</div>
        <div>📱 HP: ${escapeHtml(hp)}</div>
        <div style="margin-top: 10px; color: #27ae60;">✅ Klik untuk memilih ke ${selectedLabel || 'label yang dipilih'}</div>
    `;
    
    document.getElementById('previewContent').innerHTML = previewHtml;
    document.getElementById('previewPanel').style.display = 'block';
}

// =====================================================
// 6. CETAK LABEL
// =====================================================
function cetakLabel() {
    // Cek apakah ada data
    const hasData = Object.values(labelData).some(v => v && v.nama);
    if (!hasData) {
        alert('⚠️ Belum ada data customer yang dimasukkan!');
        return;
    }
    
    // Simpan ke localStorage terlebih dahulu
    saveToLocalStorage();
    
    // Buka halaman print label
    window.open('../print/print-label.html', '_blank');
}

// =====================================================
// 7. BERSIHKAN SEMUA DATA
// =====================================================
function bersihkanSemua() {
    if (confirm('⚠️ Yakin ingin membersihkan SEMUA data label?\n\nTINDAKAN INI TIDAK DAPAT DIBATALKAN!')) {
        // Reset labelData
        labelData = {
            B3: null, I3: null, B7: null, I7: null, B11: null, I11: null
        };
        
        // Reset tampilan
        for (let i = 1; i <= 6; i++) {
            const dataDiv = document.getElementById(`dataLabel${i}`);
            if (dataDiv) {
                dataDiv.innerHTML = `
                    <div>Nama: -</div>
                    <div>Alamat: -</div>
                    <div>HP: -</div>
                `;
            }
        }
        
        // Hapus dari localStorage
        localStorage.removeItem('cetakLabelData');
        
        // Reset selected label
        selectedLabel = null;
        document.querySelectorAll('.btn-label').forEach(btn => {
            btn.classList.remove('active');
        });
        
        alert('✅ Semua data label telah dibersihkan!');
    }
}

// =====================================================
// 8. REFRESH DATA
// =====================================================
function refreshData() {
    loadFromLocalStorage();
    alert('✅ Data berhasil direfresh!');
}

// =====================================================
// 9. UTILITY FUNCTIONS
// =====================================================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// =====================================================
// 10. EVENT LISTENERS
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    // Load data dari localStorage
    loadFromLocalStorage();
    
    // Tombol Label
    document.querySelectorAll('.btn-label').forEach(btn => {
        btn.addEventListener('click', () => {
            const label = btn.getAttribute('data-label');
            selectedLabel = label;
            
            // Hapus active dari semua, lalu tambahkan ke yang dipilih
            document.querySelectorAll('.btn-label').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.getElementById('searchCustomer').focus();
            document.getElementById('searchCustomer').value = '';
            document.getElementById('customerList').style.display = 'none';
            document.getElementById('previewPanel').style.display = 'none';
            
            alert(`📌 Silakan cari customer untuk ${label}`);
        });
    });
    
    // Search customer
    const searchInput = document.getElementById('searchCustomer');
    let typingTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            const searchText = searchInput.value;
            if (searchText.length >= 3) {
                loadCustomers(searchText);
            } else {
                document.getElementById('customerList').style.display = 'none';
                document.getElementById('previewPanel').style.display = 'none';
            }
        }, 500);
    });
    
    // Tombol Cetak
    document.getElementById('btnCetak').addEventListener('click', cetakLabel);
    document.getElementById('btnRefresh').addEventListener('click', refreshData);
    document.getElementById('btnBersihkan').addEventListener('click', bersihkanSemua);
    
    // Klik di luar list untuk menutup
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#customerList') && !e.target.closest('#searchCustomer')) {
            document.getElementById('customerList').style.display = 'none';
        }
    });
});

// Global functions
window.selectCustomer = selectCustomer;
window.showPreview = showPreview;