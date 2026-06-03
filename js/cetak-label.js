// ========== CETAK-LABEL.JS ==========
// Cetak Label Customer

let selectedLabel = null;
let customerData = [];
let labelData = {
    B3: null, I3: null, B7: null, I7: null, B11: null, I11: null
};

const API_URL = CONFIG.API_URL;

// =====================================================
// 1. LOAD DATA CUSTOMER
// =====================================================
async function loadCustomers(searchText) {
    if (searchText.length < 3) {
        document.getElementById('customerList').style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
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
// 2. SELECT CUSTOMER
// =====================================================
function selectCustomer(customer) {
    if (!selectedLabel) {
        alert('⚠️ Pilih posisi label terlebih dahulu! (klik tombol label 1-6)');
        document.getElementById('customerList').style.display = 'none';
        document.getElementById('searchCustomer').value = '';
        return;
    }
    
    const nomor = customer.nomor || '';
    const nama = customer.nama || '';
    const alamat = customer.alamat || '';
    const telp = customer.telepon || '';
    const hp = customer.hp || '';
    
    labelData[selectedLabel] = {
        nomor: nomor,
        nama: nama,
        alamat: alamat,
        telp: telp,
        hp: hp
    };
    
    updateLabelDisplay(selectedLabel, nama, alamat, hp);
    saveToLocalStorage();
    
    alert(`✅ Customer "${nama}" berhasil ditambahkan ke ${selectedLabel}`);
    
    selectedLabel = null;
    document.getElementById('searchCustomer').value = '';
    document.getElementById('customerList').style.display = 'none';
    document.getElementById('previewPanel').style.display = 'none';
    
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
// 4. LOCAL STORAGE
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
// 5. PREVIEW CUSTOMER
// =====================================================
function showPreview(customer) {
    const nomor = customer.nomor || '';
    const nama = customer.nama || '';
    const alamat = customer.alamat || '';
    const telp = customer.telepon || '';
    const hp = customer.hp || '';
    
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
    const hasData = Object.values(labelData).some(v => v && v.nama);
    if (!hasData) {
        alert('⚠️ Belum ada data customer yang dimasukkan!');
        return;
    }
    saveToLocalStorage();
    window.open('../print/print-label.html', '_blank');
}

// =====================================================
// 7. BERSIHKAN SEMUA DATA
// =====================================================
function bersihkanSemua() {
    if (confirm('⚠️ Yakin ingin membersihkan SEMUA data label?\n\nTINDAKAN INI TIDAK DAPAT DIBATALKAN!')) {
        labelData = {
            B3: null, I3: null, B7: null, I7: null, B11: null, I11: null
        };
        
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
        
        localStorage.removeItem('cetakLabelData');
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
// 9. UTILITY
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
    loadFromLocalStorage();
    
    document.querySelectorAll('.btn-label').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedLabel = btn.getAttribute('data-label');
            document.querySelectorAll('.btn-label').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('searchCustomer').focus();
            document.getElementById('searchCustomer').value = '';
            document.getElementById('customerList').style.display = 'none';
            document.getElementById('previewPanel').style.display = 'none';
            alert(`📌 Silakan cari customer untuk ${selectedLabel}`);
        });
    });
    
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
    
    document.getElementById('btnCetak')?.addEventListener('click', cetakLabel);
    document.getElementById('btnRefresh')?.addEventListener('click', refreshData);
    document.getElementById('btnBersihkan')?.addEventListener('click', bersihkanSemua);
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#customerList') && !e.target.closest('#searchCustomer')) {
            document.getElementById('customerList').style.display = 'none';
        }
    });
});

window.selectCustomer = selectCustomer;
window.showPreview = showPreview;