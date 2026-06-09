// ========== CETAK-LABEL.JS ==========
// Cetak Label Customer (dengan modal per label)

let currentLabel = null;
let customerData = [];
let labelData = {
    B3: null, I3: null, B7: null, I7: null, B11: null, I11: null
};

// =====================================================
// 1. BUKA MODAL UNTUK LABEL TERTENTU
// =====================================================
function openCustomerModal(label) {
    currentLabel = label;
    document.getElementById('modalTitle').innerText = `Pilih Customer untuk ${label}`;
    document.getElementById('customerModal').style.display = 'flex';
    document.getElementById('modalSearchInput').value = '';
    document.getElementById('modalCustomerList').innerHTML = '<div class="no-data">Ketik minimal 3 karakter untuk mencari</div>';
    document.getElementById('modalSearchInput').focus();
}

function closeModal() {
    document.getElementById('customerModal').style.display = 'none';
    currentLabel = null;
}

// =====================================================
// 2. LOAD DATA CUSTOMER DARI API
// =====================================================
async function loadCustomersToModal(searchText) {
    if (searchText.length < 3) {
        document.getElementById('modalCustomerList').innerHTML = '<div class="no-data">Ketik minimal 3 karakter untuk mencari</div>';
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
            
            const listDiv = document.getElementById('modalCustomerList');
            listDiv.innerHTML = '';
            
            if (filtered.length === 0) {
                listDiv.innerHTML = '<div class="no-data">Tidak ada data customer</div>';
            } else {
                filtered.forEach((c) => {
                    const div = document.createElement('div');
                    div.className = 'customer-item';
                    div.innerHTML = `
                        <div class="nama">📛 ${escapeHtml(c.nomor || '')} - ${escapeHtml(c.nama || '')}</div>
                        <div class="alamat">📍 ${escapeHtml(c.alamat || '-')}</div>
                        <div class="alamat">📞 ${escapeHtml(c.telepon || '-')} | 📱 ${escapeHtml(c.hp || '-')}</div>
                    `;
                    div.onclick = () => selectCustomerForLabel(c);
                    listDiv.appendChild(div);
                });
            }
        }
    } catch (error) {
        console.error('Error load customers:', error);
        document.getElementById('modalCustomerList').innerHTML = '<div class="no-data">Error memuat data</div>';
    }
}

// =====================================================
// 3. SELECT CUSTOMER UNTUK LABEL TERTENTU
// =====================================================
function selectCustomerForLabel(customer) {
    if (!currentLabel) return;
    
    const nomor = customer.nomor || '';
    const nama = customer.nama || '';
    const alamat = customer.alamat || '';
    const telp = customer.telepon || '';
    const hp = customer.hp || '';
    
    labelData[currentLabel] = {
        nomor: nomor,
        nama: nama,
        alamat: alamat,
        telp: telp,
        hp: hp
    };
    
    updateLabelDisplay(currentLabel, nama, alamat, hp);
    saveToLocalStorage();
    
    alert(`✅ Customer "${nama}" berhasil ditambahkan ke ${currentLabel}`);
    closeModal();
}

// =====================================================
// 4. UPDATE TAMPILAN HASIL LABEL
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
// 5. LOCAL STORAGE
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
// 9. ESCAPE HTML
// =====================================================
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    const text = String(str);
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== CETAK-LABEL.JS ==========
// Di bagian akhir, ganti dengan ini:

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    
    // Tombol Pilih Customer di setiap label - PASTIKAN ELEMENNYA ADA
    const customerButtons = document.querySelectorAll('.btn-pilih-customer');
    if (customerButtons.length > 0) {
        customerButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const label = btn.getAttribute('data-label');
                openCustomerModal(label);
            });
        });
    } else {
        console.warn('Tidak ada tombol .btn-pilih-customer di halaman ini');
    }
    
    // Search di modal - CEK APAKAH ELEMEN ADA
    const searchInput = document.getElementById('modalSearchInput');
    if (searchInput) {
        let typingTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                loadCustomersToModal(searchInput.value);
            }, 500);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadCustomersToModal(searchInput.value);
            }
        });
    }
    
    // Tombol Cetak - CEK ELEMEN
    const btnCetak = document.getElementById('btnCetak');
    if (btnCetak) {
        btnCetak.addEventListener('click', cetakLabel);
    }
    
    // Tombol Refresh - CEK ELEMEN
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', refreshData);
    }
    
    // Tombol Bersihkan - CEK ELEMEN
    const btnBersihkan = document.getElementById('btnBersihkan');
    if (btnBersihkan) {
        btnBersihkan.addEventListener('click', bersihkanSemua);
    }
    
    // Modal elements - CEK APAKAH ADA
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    const customerModal = document.getElementById('customerModal');
    if (customerModal) {
        customerModal.addEventListener('click', (e) => {
            if (e.target.id === 'customerModal') closeModal();
        });
    }
});