// ========== TANDA-TERIMA.JS ==========
// Riwayat Tanda Terima

let ttData = [];
let selectedTT = null;
let currentUploadTT = null;
let currentUploadSource = null;

// Gunakan Worker URL sebagai proxy
const API_URL = 'https://aplikasi-al.al-asyqy.workers.dev';

// =====================================================
// 1. LOAD DATA TANDA TERIMA
// =====================================================
async function loadTandaTerima() {
    const listContainer = document.getElementById('ttList');
    listContainer.innerHTML = '<div style="text-align: center; padding: 20px;">📡 Memuat数据...</div>';
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'getTandaTerima' })
        });
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            ttData = result.data;
            displayTTList(ttData);
            document.getElementById('totalData').innerHTML = `📊 Total Data: ${ttData.length} record`;
        } else {
            listContainer.innerHTML = '<div style="text-align: center; padding: 20px;">📭 Belum ada data tanda terima</div>';
            document.getElementById('totalData').innerHTML = '📊 Total Data: 0 record';
        }
    } catch (error) {
        console.error('Error load TT:', error);
        listContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">❌ Gagal memuat data</div>';
    }
}

// =====================================================
// 2. TAMPILKAN DAFTAR TT
// =====================================================
function displayTTList(data) {
    const listContainer = document.getElementById('ttList');
    const searchText = document.getElementById('searchFilter').value.toLowerCase();
    
    let filtered = data;
    if (searchText) {
        filtered = data.filter(tt => 
            (tt.noTT && tt.noTT.toLowerCase().includes(searchText)) ||
            (tt.customerNama && tt.customerNama.toLowerCase().includes(searchText))
        );
    }
    
    if (filtered.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; padding: 20px;">🔍 Tidak ada data yang cocok</div>';
        document.getElementById('totalData').innerHTML = `📊 Total Data: ${data.length} record (filtered: 0)`;
        return;
    }
    
    filtered.sort((a, b) => {
        const numA = extractTTNumber(a.noTT);
        const numB = extractTTNumber(b.noTT);
        return numB - numA;
    });
    
    let html = '';
    filtered.forEach((tt, idx) => {
        const hasBukti = tt.buktiUrl && tt.buktiUrl !== '' && tt.buktiUrl !== 'Belum ada bukti';
        const statusClass = hasBukti ? '' : 'belum-bukti';
        const statusIcon = hasBukti ? '✅' : '⚠️';
        const badgeClass = hasBukti ? 'badge-success' : 'badge-warning';
        const badgeText = hasBukti ? '✓ Ada Bukti' : '! Belum Ada Bukti';
        
        html += `
            <div class="list-item ${statusClass}" data-id="${tt.id || idx}" data-no="${tt.noTT}" title="${hasBukti ? 'Sudah ada bukti' : 'Belum ada bukti'}">
                <div class="no-tt">${statusIcon} ${escapeHtml(tt.noTT || '-')}</div>
                <div class="customer-name">👤 ${escapeHtml(tt.customerNama || '-')}</div>
                <div class="total">💰 ${formatRupiah(tt.total || 0)}</div>
                <div class="status-badge ${badgeClass}">${badgeText}</div>
            </div>
        `;
    });
    
    listContainer.innerHTML = html;
    document.getElementById('totalData').innerHTML = `📊 Total Data: ${data.length} record (filtered: ${filtered.length})`;
    
    document.querySelectorAll('.list-item').forEach(item => {
        item.addEventListener('click', () => {
            const noTT = item.getAttribute('data-no');
            const selected = ttData.find(tt => tt.noTT === noTT);
            if (selected) {
                selectTT(selected);
                document.querySelectorAll('.list-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function extractTTNumber(noTT) {
    if (!noTT) return 0;
    const match = noTT.match(/\d+/g);
    if (match) return parseInt(match[match.length - 1]) || 0;
    return 0;
}

// =====================================================
// 3. SELECT TT - TAMPILKAN DETAIL
// =====================================================
function selectTT(tt) {
    selectedTT = tt;
    
    const detailContainer = document.getElementById('detailContent');
    const actionButtons = document.getElementById('actionButtons');
    const btnHapusBukti = document.getElementById('btnHapusBukti');
    
    const hasBukti = tt.buktiUrl && tt.buktiUrl !== '' && tt.buktiUrl !== 'Belum ada bukti';
    const statusHtml = hasBukti 
        ? '<span class="status-bukti-tersedia">✅ Bukti Faktur: TERSEDIA</span>'
        : '<span class="status-bukti-belum">⚠️ Bukti Faktur: BELUM ADA</span>';
    
    if (btnHapusBukti) {
        btnHapusBukti.style.display = hasBukti ? 'flex' : 'none';
    }
    
    let invoicesHtml = '';
    if (tt.invoices && tt.invoices.length > 0) {
        invoicesHtml = '<ul class="invoice-list">';
        tt.invoices.forEach(inv => {
            invoicesHtml += `<li>📄 ${escapeHtml(inv.no)} - ${formatRupiah(inv.nominal)}</li>`;
        });
        invoicesHtml += '</ul>';
    } else if (tt.invoiceList) {
        invoicesHtml = `<div class="invoice-list">${escapeHtml(tt.invoiceList) || '-'}</div>`;
    } else {
        invoicesHtml = '<div>-</div>';
    }
    
    const detailHtml = `
        <div class="detail-row">
            <div><span class="detail-label">🏷️ No. TT:</span> ${escapeHtml(tt.noTT) || '-'}</div>
        </div>
        <div class="detail-row">
            <div><span class="detail-label">📅 Tanggal:</span> ${formatDate(tt.tanggal) || '-'}</div>
        </div>
        <div class="detail-row">
            <div><span class="detail-label">👤 Customer:</span> ${escapeHtml(tt.customerNama) || '-'}</div>
            <div><span class="detail-label">📍 Alamat:</span> ${escapeHtml(tt.customerAlamat) || '-'}</div>
            <div><span class="detail-label">📞 Telp:</span> ${escapeHtml(tt.customerTelp) || '-'}</div>
            <div><span class="detail-label">📱 HP:</span> ${escapeHtml(tt.customerHP) || '-'}</div>
        </div>
        <div class="detail-row">
            <div><span class="detail-label">📑 Faktur:</span></div>
            ${invoicesHtml}
        </div>
        <div class="detail-row">
            <div><span class="detail-label">💰 Total:</span> <strong style="color: #27ae60;">${formatRupiah(tt.total || 0)}</strong></div>
        </div>
        <div class="detail-row">
            <div><span class="detail-label">🏢 PT:</span> ${escapeHtml(tt.ptName || tt.ptCode) || '-'}</div>
        </div>
        <div class="detail-row">
            <div>${statusHtml}</div>
            ${tt.buktiUrl && tt.buktiUrl !== 'Belum ada bukti' ? `<div style="margin-top: 5px; font-size: 11px;">🔗 URL: ${escapeHtml(tt.buktiUrl)}</div>` : ''}
        </div>
    `;
    
    detailContainer.innerHTML = detailHtml;
    actionButtons.style.display = 'flex';
}

// =====================================================
// 4. CETAK TANDA TERIMA
// =====================================================
function printTT() {
    if (!selectedTT) {
        alert('Pilih tanda terima terlebih dahulu!');
        return;
    }
    window.open(`../print/print-tt.html?noTT=${encodeURIComponent(selectedTT.noTT)}`, '_blank');
}

// =====================================================
// 5. UPLOAD BUKTI (POPUP MODAL)
// =====================================================
function uploadBukti() {
    if (!selectedTT) {
        alert('Pilih tanda terima terlebih dahulu!');
        return;
    }
    showUploadModal(selectedTT);
}

// =====================================================
// UPLOAD BUKTI (LANGSUNG KE APPS SCRIPT - SUDAH BERHASIL)
// =====================================================
const UPLOAD_API_URL = 'https://script.google.com/macros/s/AKfycbwrZ3lVtwitHHg8aFQesvPzn6OvqPulGf8Qctwh3NFQOJBH_LY9vGgcofVPjvwB9sRs/exec';
const UPLOAD_FOLDER_ID = '1uOqu-94ECuorCf1frMgtOooJY_-4nUqQ';

// =====================================================
// UPLOAD BUKTI - 3 METODE
// =====================================================

function showUploadModal(tt) {
    currentUploadTT = tt;
    document.getElementById('modalTTNumber').innerText = tt.noTT;
    document.getElementById('uploadModal').style.display = 'flex';
    
    // Reset semua area
    document.getElementById('fileUploadArea').style.display = 'none';
    document.getElementById('driveUrlArea').style.display = 'none';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('uploadFileInput').value = '';
    document.getElementById('driveUrlInput').value = '';
    document.getElementById('fileName').value = `Bukti_${tt.noTT.replace(/\//g, '_')}`;
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
    currentUploadTT = null;
    document.getElementById('uploadFileInput').value = '';
    document.getElementById('cameraFileInput').value = '';
}

// 1. Upload dari Komputer
function showUploadFromPC() {
    document.getElementById('fileUploadArea').style.display = 'block';
    document.getElementById('driveUrlArea').style.display = 'none';
    document.getElementById('uploadFileInput').click();
}

// 2. Upload dari Kamera
function showUploadFromCamera() {
    document.getElementById('fileUploadArea').style.display = 'block';
    document.getElementById('driveUrlArea').style.display = 'none';
    document.getElementById('cameraFileInput').click();
}

// 3. Upload dari URL Google Drive
function showUploadFromDrive() {
    document.getElementById('fileUploadArea').style.display = 'none';
    document.getElementById('driveUrlArea').style.display = 'block';
}

// Handle file dari PC
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Preview gambar
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewImage').src = e.target.result;
            document.getElementById('uploadPreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
    
    // Tampilkan tombol upload
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.style.display = 'block';
    uploadBtn.onclick = () => uploadFile(file);
}

// Handle file dari kamera
function handleCameraSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Preview gambar
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('uploadPreview').style.display = 'block';
    };
    reader.readAsDataURL(file);
    
    // Upload otomatis setelah ambil foto
    uploadFile(file);
}

// Upload file ke Google Drive via Worker
async function uploadFile(file) {
    const uploadBtn = document.getElementById('uploadBtn');
    const resultDiv = document.getElementById('uploadResult');
    const fileNameInput = document.getElementById('fileName');
    const noTT = currentUploadTT ? currentUploadTT.noTT : 'UNKNOWN';
    
    let customFileName = fileNameInput.value.trim();
    let finalFileName = customFileName || `Bukti_${noTT.replace(/\//g, '_')}`;
    if (!finalFileName.toLowerCase().endsWith('.pdf') && 
        !finalFileName.toLowerCase().endsWith('.jpg') && 
        !finalFileName.toLowerCase().endsWith('.jpeg') && 
        !finalFileName.toLowerCase().endsWith('.png')) {
        finalFileName += '.pdf';
    }
    
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '⏳ Mengupload...';
    resultDiv.style.display = 'none';
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64 = e.target.result.split(',')[1];
        
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "upload",
                    data: base64,
                    fileName: finalFileName,
                    folderId: UPLOAD_FOLDER_ID
                })
            });
            
            const result = await response.json();
            
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '🚀 UPLOAD';
            
            if (result.success) {
                resultDiv.innerHTML = `✅ <b>BERHASIL!</b><br>📄 ${result.fileName}<br><a href="${result.fileUrl}" target="_blank">📂 Buka di Drive</a>`;
                resultDiv.style.display = 'block';
                resultDiv.style.background = '#e6f4ea';
                resultDiv.style.color = '#1e8e3e';
                
                await simpanBuktiUrl(noTT, result.fileUrl);
                
                setTimeout(() => {
                    closeUploadModal();
                    loadTandaTerima();
                }, 2000);
            } else {
                resultDiv.innerHTML = `❌ Error: ${result.error}`;
                resultDiv.style.display = 'block';
                resultDiv.style.background = '#fce8e6';
                resultDiv.style.color = '#d93025';
            }
        } catch (error) {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '🚀 UPLOAD';
            resultDiv.innerHTML = `❌ Error: ${error.message}`;
            resultDiv.style.display = 'block';
            resultDiv.style.background = '#fce8e6';
            resultDiv.style.color = '#d93025';
        }
    };
    
    reader.readAsDataURL(file);
}

// Simpan URL dari Google Drive
async function saveDriveUrl() {
    const driveUrl = document.getElementById('driveUrlInput').value.trim();
    const noTT = currentUploadTT ? currentUploadTT.noTT : 'UNKNOWN';
    
    if (!driveUrl || !driveUrl.includes('drive.google.com')) {
        alert('❌ URL tidak valid! Pastikan URL dari Google Drive.');
        return;
    }
    
    await simpanBuktiUrl(noTT, driveUrl);
    alert('✅ URL bukti berhasil disimpan!');
    closeUploadModal();
    loadTandaTerima();
}

// =====================================================
// SIMPAN URL BUKTI KE DATABASE
// =====================================================
async function simpanBuktiUrl(noTT, url) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'updateBuktiTT',
                noTT: noTT,
                buktiUrl: url
            })
        });
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Bukti tersimpan di database');
            await loadTandaTerima();
            const updated = ttData.find(tt => tt.noTT === noTT);
            if (updated) selectTT(updated);
        } else {
            console.error('Gagal simpan ke database:', result.error);
            alert('⚠️ File terupload tapi gagal menyimpan ke database: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error save bukti:', error);
        alert('⚠️ File terupload tapi error koneksi saat menyimpan ke database');
    }
}

// =====================================================
// HAPUS BUKTI
// =====================================================
async function hapusBukti() {
    if (!selectedTT) {
        alert('Pilih tanda terima terlebih dahulu!');
        return;
    }
    
    if (!selectedTT.buktiUrl || selectedTT.buktiUrl === '' || selectedTT.buktiUrl === 'Belum ada bukti') {
        alert('⚠️ Tidak ada bukti yang dapat dihapus!');
        return;
    }
    
    const confirmMsg = `⚠️ Yakin ingin menghapus bukti untuk No. TT: ${selectedTT.noTT}?\n\n` +
        `URL: ${selectedTT.buktiUrl}\n\n` +
        `TINDAKAN INI AKAN MENGHAPUS FILE DARI GOOGLE DRIVE DAN DATABASE!\n` +
        `TIDAK DAPAT DIBATALKAN!`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
        const fileId = extractFileIdFromUrl(selectedTT.buktiUrl);
        if (fileId) {
            await deleteFileFromDrive(fileId);
        }
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'updateBuktiTT',
                noTT: selectedTT.noTT,
                buktiUrl: ''
            })
        });
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Bukti berhasil dihapus!');
            await loadTandaTerima();
            const updated = ttData.find(tt => tt.noTT === selectedTT.noTT);
            if (updated) selectTT(updated);
        } else {
            alert('❌ Gagal menghapus bukti dari database: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error hapus bukti:', error);
        alert('❌ Error koneksi saat menghapus bukti');
    }
}

function extractFileIdFromUrl(url) {
    if (!url) return null;
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
    const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match2 && match2[1]) return match2[1];
    return null;
}

async function deleteFileFromDrive(fileId) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'deleteFile',
                fileId: fileId
            })
        });
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Error delete file:', error);
        return false;
    }
}

// =====================================================
// BUKA BUKTI
// =====================================================
function bukaBukti() {
    if (!selectedTT) {
        alert('Pilih tanda terima terlebih dahulu!');
        return;
    }
    
    if (selectedTT.buktiUrl && selectedTT.buktiUrl !== '' && selectedTT.buktiUrl !== 'Belum ada bukti') {
        window.open(selectedTT.buktiUrl, '_blank');
    } else {
        alert('Belum ada bukti faktur untuk No. TT ini!');
    }
}

// =====================================================
// HAPUS DATA TANDA TERIMA
// =====================================================
async function hapusTT() {
    if (!selectedTT) {
        alert('Pilih tanda terima terlebih dahulu!');
        return;
    }
    
    const confirmMsg = `⚠️ Yakin ingin menghapus data Tanda Terima ini?\n\n` +
        `No. TT: ${selectedTT.noTT}\n` +
        `Customer: ${selectedTT.customerNama}\n` +
        `Total: ${formatRupiah(selectedTT.total || 0)}\n\n` +
        `TINDAKAN INI TIDAK DAPAT DIBATALKAN!`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'deleteTandaTerima',
                noTT: selectedTT.noTT
            })
        });
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Data berhasil dihapus!');
            await loadTandaTerima();
            document.getElementById('detailContent').innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">Pilih tanda terima dari daftar</div>';
            document.getElementById('actionButtons').style.display = 'none';
            selectedTT = null;
        } else {
            alert('❌ Gagal menghapus: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error hapus:', error);
        alert('❌ Error koneksi saat hapus');
    }
}

// =====================================================
// REFRESH DATA
// =====================================================
function refreshData() {
    loadTandaTerima();
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
function formatRupiah(angka) {
    if (typeof angka === 'string' && angka.includes('Rp')) return angka;
    let num = typeof angka === 'string' ? parseFloat(angka.replace(/[^0-9,-]/g, '').replace(',', '.')) : angka;
    if (isNaN(num)) num = 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(num);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('id-ID');
    } catch {
        return dateStr;
    }
}

// =====================================================
// EVENT LISTENERS
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    loadTandaTerima();
    
    document.getElementById('btnRefresh').addEventListener('click', refreshData);
    document.getElementById('btnPrint').addEventListener('click', printTT);
    document.getElementById('btnUpload').addEventListener('click', uploadBukti);
    document.getElementById('btnBukaBukti').addEventListener('click', bukaBukti);
    document.getElementById('btnHapusBukti').addEventListener('click', hapusBukti);
    document.getElementById('btnHapus').addEventListener('click', hapusTT);
    document.getElementById('searchFilter').addEventListener('input', () => {
        displayTTList(ttData);
    });
});

// Event listeners untuk upload modal
document.getElementById('uploadFromPCBtn')?.addEventListener('click', showUploadFromPC);
document.getElementById('uploadFromCameraBtn')?.addEventListener('click', showUploadFromCamera);
document.getElementById('uploadFromDriveBtn')?.addEventListener('click', showUploadFromDrive);
document.getElementById('uploadFileInput')?.addEventListener('change', handleFileSelect);
document.getElementById('cameraFileInput')?.addEventListener('change', handleCameraSelect);
document.getElementById('saveDriveUrlBtn')?.addEventListener('click', saveDriveUrl);