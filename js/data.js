// ========== DATA.JS ==========
let suppliers = [];

async function loadSuppliers() {
    try {
        if (typeof CONFIG === 'undefined') {
            console.error('CONFIG tidak ditemukan!');
            showErrorInTable('Konfigurasi tidak ditemukan');
            return;
        }

        console.log('📡 Mengambil data supplier...');
        
        // Gunakan POST method seperti di kode lain Anda
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getSuppliers' })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Supplier response:', result);
        
        // Cek struktur response
        if (result && result.success === true) {
            // Pastikan result.data adalah array
            if (result.data && Array.isArray(result.data)) {
                suppliers = result.data.map((s, index) => ({
                    id: index,
                    no: s.no || s.id || (index + 1).toString(),
                    nama: s.nama || s.name || '-',
                    account: s.account || '-',
                    currency: s.currency || 'IDR',
                    alamat: s.alamat || '',
                    bankName: s.bankName || s.bank || '-',
                    bankAlamat: s.bankAlamat || '',
                    swift: s.swift || '-',
                    country: s.country || 'Indonesia',
                    ...s
                }));
                
                console.log(`✅ ${suppliers.length} supplier(s) loaded`);
            } else {
                console.warn('Data supplier bukan array:', result.data);
                suppliers = [];
            }
        } else {
            console.warn('Response tidak memiliki success=true:', result);
            suppliers = [];
        }
        
        // Update dropdowns dan tabel
        updateDropdowns();
        renderSupplierTable();
        
    } catch(e) {
        console.error('❌ Error load suppliers:', e);
        suppliers = [];
        updateDropdowns();
        renderSupplierTable();
        showErrorInTable('Error: ' + e.message);
    }
}

function showErrorInTable(message) {
    let tbody = document.getElementById('supplierTableBody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" style="color: red; text-align: center;">❌ ${message}</td></tr>`;
    }
}

function updateDropdowns() {
    let options = '<option value="">-- Pilih Supplier --</option>';
    
    if (suppliers && Array.isArray(suppliers) && suppliers.length > 0) {
        for (let i = 0; i < suppliers.length; i++) {
            const s = suppliers[i];
            const nama = s.nama || 'Unknown';
            options += `<option value="${i}">${escapeHtml(nama)}</option>`;
        }
    } else {
        options = '<option value="">-- Tidak ada data supplier --</option>';
    }
    
    // Update dropdowns
    const selects = ['supplierSelect', 'ttSupplierSelect', 'labelSupplierSelect', 'editSupplierSelect', 'fakturSupplierSelect'];
    for (let i = 0; i < selects.length; i++) {
        const el = document.getElementById(selects[i]);
        if (el) {
            el.innerHTML = options;
        }
    }
}

function renderSupplierTable() {
    const tbody = document.getElementById('supplierTableBody');
    if (!tbody) return;
    
    if (!suppliers || suppliers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">📋 Tidak ada data supplier</td></tr>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < suppliers.length; i++) {
        const s = suppliers[i];
        html += '<tr>';
        html += '<td>' + escapeHtml(s.no || (i + 1)) + '</td>';
        html += '<td>' + escapeHtml(s.nama || '-') + '</td>';
        html += '<td>' + escapeHtml(s.account || '-') + '</td>';
        html += '<td>' + escapeHtml(s.currency || '-') + '</td>';
        html += '<td>' + escapeHtml(s.bankName || '-') + '</td>';
        html += '<td>' + escapeHtml(s.swift || '-') + '</td>';
        html += '<td>' + escapeHtml(s.country || '-') + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Load suppliers jika halaman memiliki tabel supplier
if (document.getElementById('supplierTableBody')) {
    loadSuppliers();
}