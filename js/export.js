// ========== EXPORT.JS ==========
// Fungsi untuk export data ke Excel

function exportToExcel(data, filename, sheetName = 'Sheet1') {
    // Buat workbook
    const wb = XLSX.utils.book_new();
    
    // Konversi data ke worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Atur lebar kolom (opsional)
    const colWidths = [];
    for (let i = 0; i < Object.keys(data[0] || {}).length; i++) {
        colWidths.push({ wch: 20 });
    }
    ws['!cols'] = colWidths;
    
    // Tambah worksheet ke workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Export ke file
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

// Export Supplier
async function exportSuppliers() {
    try {
        showToast('📡 Mengambil data supplier...', 'info');
        
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getSuppliers' })
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            // Format data untuk Excel
            const exportData = result.data.map((s, index) => ({
                'No': index + 1,
                'Nama Supplier': s.nama || '-',
                'Account Number': s.account || '-',
                'Currency': s.currency || '-',
                'Alamat': s.alamat || '-',
                'Bank Name': s.bankName || '-',
                'Bank Alamat': s.bankAlamat || '-',
                'SWIFT Code': s.swift || '-',
                'Country': s.country || '-'
            }));
            
            exportToExcel(exportData, `Supplier_${new Date().toISOString().slice(0,10)}`, 'Data Supplier');
            showToast(`✅ Berhasil export ${exportData.length} supplier`, 'success');
        } else {
            showToast('❌ Gagal mengambil data supplier', 'error');
        }
    } catch (error) {
        console.error('Error export suppliers:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
}

// Export Riwayat Transfer
async function exportTransferHistory() {
    try {
        showToast('📡 Mengambil data riwayat transfer...', 'info');
        
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getRiwayatTransfer' })
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            // Format data untuk Excel
            const exportData = result.data.map(row => ({
                'Tanggal': row[1] || '-',
                'No LOA/CEK': row[2] || '-',
                'Bank Tujuan': row[3] || '-',
                'Nama Penerima': row[4] || '-',
                'Account Number': row[5] || '-',
                'Currency': row[6] || '-',
                'Jumlah': row[7] || 0,
                'Berita Transfer': row[8] || '-',
                'Tujuan Transfer': row[9] || '-',
                'Metode Transfer': row[11] || '-',
                'Biaya Full Amount': row[12] || 0,
                'Biaya Telex': row[13] || 0,
                'Kurs': row[14] || 0,
                'Jumlah IDR': row[15] || 0,
                'Status': row[16] || '-'
            }));
            
            exportToExcel(exportData, `RiwayatTransfer_${new Date().toISOString().slice(0,10)}`, 'Riwayat Transfer');
            showToast(`✅ Berhasil export ${exportData.length} data transfer`, 'success');
        } else {
            showToast('❌ Gagal mengambil data riwayat transfer', 'error');
        }
    } catch (error) {
        console.error('Error export transfers:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
}

// Export Riwayat Tanda Terima
async function exportTTHistory() {
    try {
        showToast('📡 Mengambil data tanda terima...', 'info');
        
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getRiwayatTT' })
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            const exportData = result.data.map(row => ({
                'Timestamp': row[0] || '-',
                'No TT': row[1] || '-',
                'Tanggal': row[2] || '-',
                'Dari': row[3] || '-',
                'Kepada': row[4] || '-',
                'Alamat': row[5] || '-',
                'Jumlah': row[6] || 0,
                'Currency': row[7] || '-',
                'Untuk': row[8] || '-',
                'Keterangan': row[9] || '-',
                'Status': row[10] || '-'
            }));
            
            exportToExcel(exportData, `TandaTerima_${new Date().toISOString().slice(0,10)}`, 'Tanda Terima');
            showToast(`✅ Berhasil export ${exportData.length} data tanda terima`, 'success');
        } else {
            showToast('❌ Gagal mengambil data tanda terima', 'error');
        }
    } catch (error) {
        console.error('Error export TT:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
}

// Export Riwayat Valas
async function exportValasHistory() {
    try {
        showToast('📡 Mengambil data valas...', 'info');
        
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getRiwayatValas' })
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            const exportData = result.data.map(row => ({
                'Timestamp': row[0] || '-',
                'Tanggal': row[1] || '-',
                'No Referensi': row[2] || '-',
                'Dari Rekening': row[3] || '-',
                'Ke Rekening': row[4] || '-',
                'Jumlah Valas': row[5] || 0,
                'Mata Uang': row[6] || '-',
                'Kurs': row[7] || 0,
                'Jumlah IDR': row[8] || 0,
                'Berita': row[9] || '-',
                'Tujuan Transfer': row[10] || '-',
                'Info Tambahan': row[11] || '-'
            }));
            
            exportToExcel(exportData, `RiwayatValas_${new Date().toISOString().slice(0,10)}`, 'Riwayat Valas');
            showToast(`✅ Berhasil export ${exportData.length} data valas`, 'success');
        } else {
            showToast('❌ Gagal mengambil data valas', 'error');
        }
    } catch (error) {
        console.error('Error export valas:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
}

// Toast notification
function showToast(message, type = 'info') {
    // Cek apakah sudah ada toast
    let toast = document.getElementById('globalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(toast);
    }
    
    // Set warna sesuai type
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    toast.style.background = colors[type] || '#333';
    toast.innerHTML = message;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Tambahkan style untuk animasi
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);