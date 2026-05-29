// ========== DATA.JS ==========
let suppliers = [];

async function loadSuppliers() {
    try {
        const res = await fetch(CONFIG.API_URL + '?type=getSuppliers');
        const result = await res.json();
        if (result.success) {
            suppliers = result.data;
            updateDropdowns();
            renderSupplierTable();
        } else {
            console.error('Gagal:', result.error);
            let tbody = document.getElementById('supplierTableBody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="7">Gagal load data: ' + (result.error || 'Unknown error') + '</td></tr>';
        }
    } catch(e) {
        console.error('Error:', e);
        let tbody = document.getElementById('supplierTableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="7">Error: ' + e.message + '</td></tr>';
    }
}

function updateDropdowns() {
    let options = '<option value="">-- Pilih --</option>';
    for (let i = 0; i < suppliers.length; i++) {
        options += '<option value="' + i + '">' + suppliers[i].nama + '</option>';
    }
    let selects = ['supplierSelect', 'ttSupplierSelect', 'labelSupplierSelect', 'editSupplierSelect', 'fakturSupplierSelect'];
    for (let i = 0; i < selects.length; i++) {
        let el = document.getElementById(selects[i]);
        if (el) el.innerHTML = options;
    }
}

function renderSupplierTable() {
    let tbody = document.getElementById('supplierTableBody');
    if (!tbody) return;
    if (suppliers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Tidak ada data supplier</td></tr>';
        return;
    }
    let html = '';
    for (let i = 0; i < suppliers.length; i++) {
        let s = suppliers[i];
        html += '<tr>';
        html += '<td>' + (s.no || '-') + '</td>';
        html += '<td>' + (s.nama || '-') + '</td>';
        html += '<td>' + (s.account || '-') + '</td>';
        html += '<td>' + (s.currency || '-') + '</td>';
        html += '<td>' + (s.bankName || '-') + '</td>';
        html += '<td>' + (s.swift || '-') + '</td>';
        html += '<td>' + (s.country || '-') + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}
