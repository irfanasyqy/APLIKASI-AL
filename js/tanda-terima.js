// ========== TANDA-TERIMA.JS ==========
// Riwayat Tanda Terima

let ttData = [];
let selectedTT = null;
let currentUploadTT = null;
let currentUploadSource = null;

const API_URL = CONFIG.API_URL;

// =====================================================
// 1. LOAD DATA TANDA TERIMA
// =====================================================
async function loadTandaTerima() {
    const listContainer = document.getElementById('ttList');
    listContainer.innerHTML = '<div style="text-align: center; padding: 20px;">📡 Memuat data...</div>';
    
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
// 3. SELECT TT - TAMPILKAN DETAIL (DENGAN LOGIKA TOMBOL HAPUS BUKTI)
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
    
    // Tampilkan atau sembunyikan tombol HAPUS BUKTI hanya jika ada bukti
    if (btnHapusBukti) {
        btnHapusBukti.style.display = hasBukti ? 'flex' : 'none';
    }
    
    // Format invoices
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

function showUploadModal(tt) {
    currentUploadTT = tt;
    document.getElementById('modalTTNumber').innerText = tt.noTT;
    document.getElementById('uploadModal').style.display = 'flex';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('previewImage').src = '';
    document.getElementById('uploadStatus').innerHTML = '';
    document.getElementById('fileNameInputGroup').style.display = 'none';
    document.getElementById('fileName').value = `Bukti_${tt.noTT.replace(/\//g, '_')}`;
    currentUploadSource = null;
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
    currentUploadTT = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('cameraInput').value = '';
}

// 1. Upload dari Google Drive (ambil link)
function uploadFromDrive() {
    if (!currentUploadTT) return;
    
    const driveUrl = prompt(
        `📂 Upload bukti untuk No. TT: ${currentUploadTT.noTT}\n\n` +
        `1. Buka Google Drive di browser\n` +
        `2. Klik kanan pada file bukti\n` +
        `3. Pilih "Dapatkan link"\n` +
        `4. Copy URL dan paste di bawah\n\n` +
        `Masukkan URL Google Drive:`
    );
    
    if (driveUrl && driveUrl.includes('drive.google.com')) {
        simpanBuktiUrl(currentUploadTT.noTT, driveUrl);
        closeUploadModal();
    } else if (driveUrl) {
        alert('❌ URL tidak valid! Pastikan URL dari Google Drive.');
    }
}

// 2. Upload dari PC
function uploadFromPC() {
    if (!currentUploadTT) return;
    currentUploadSource = 'pc';
    document.getElementById('fileNameInputGroup').style.display = 'block';
    document.getElementById('fileInput').click();
}

// 3. Upload dari Kamera
function uploadFromCamera() {
    if (!currentUploadTT) return;
    currentUploadSource = 'camera';
    document.getElementById('fileNameInputGroup').style.display = 'block';
    document.getElementById('cameraInput').click();
}

// Handle file dari PC
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file || !currentUploadTT) return;
    
    const fileName = document.getElementById('fileName').value.trim();
    if (!fileName) {
        alert('⚠️ Silakan isi nama file terlebih dahulu!');
        return;
    }
    
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewImage').src = e.target.result;
            document.getElementById('uploadPreview').style.display = 'block';
            document.getElementById('uploadStatus').innerHTML = '📤 Mengupload ke Google Drive...';
        };
        reader.readAsDataURL(file);
    }
    
    await uploadFileToDrive(file, currentUploadTT.noTT, fileName);
}

// Handle file dari kamera
async function handleCameraUpload(event) {
    const file = event.target.files[0];
    if (!file || !currentUploadTT) return;
    
    const fileName = document.getElementById('fileName').value.trim();
    if (!fileName) {
        alert('⚠️ Silakan isi nama file terlebih dahulu!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('uploadPreview').style.display = 'block';
        document.getElementById('uploadStatus').innerHTML = '📤 Mengupload ke Google Drive...';
    };
    reader.readAsDataURL(file);
    
    await uploadFileToDrive(file, currentUploadTT.noTT, fileName);
}

async function uploadFileToDrive(file, noTT, fileName) {
    let fileToUpload = file;

    if (file.type.startsWith('image/')) {
        document.getElementById('uploadStatus').innerHTML = '🔄 Mengkonversi gambar ke PDF...';
        try {
            fileToUpload = await convertImageToPDF(file, fileName);
        } catch (error) {
            alert('❌ Gagal mengkonversi gambar ke PDF.');
            return;
        }
    }

    const formData = new FormData();
    formData.append('action', 'upload');
    formData.append('noTT', noTT);
    formData.append('fileName', fileName);
    formData.append('file', fileToUpload);

    document.getElementById('uploadStatus').innerHTML = '📤 Mengupload ke Google Drive...';

    try {
        // LANGSUNG KE APPS SCRIPT (LEWATI WORKER)
        const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw6-skV1x_jbHnZBIMQ3wim_JeIN95ohpyeKLECxQphmUV33X4DJ9iVZSVHL-s36bZXFQ/exec';
        
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (result.success) {
            document.getElementById('uploadStatus').innerHTML = '✅ Upload berhasil!';
            alert(`✅ Bukti berhasil diupload!\n📁 Nama: ${result.fileName}\n🔗 URL: ${result.url}`);
            await simpanBuktiUrl(noTT, result.url);
            closeUploadModal();
        } else {
            throw new Error(result.error || 'Upload gagal');
        }
    } catch (error) {
        console.error('Error upload:', error);
        document.getElementById('uploadStatus').innerHTML = '❌ Upload gagal';
        alert('❌ Gagal upload: ' + error.message);
    }
}

// Konversi gambar ke PDF
async function convertImageToPDF(imageFile, fileName) {
    const { jsPDF } = window.jspdf;
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const pdf = new jsPDF({
                    orientation: img.width > img.height ? 'landscape' : 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
                const imgWidth = pdf.internal.pageSize.getWidth();
                const imgHeight = (img.height * imgWidth) / img.width;
                pdf.addImage(img, 'JPEG', 0, 0, imgWidth, imgHeight);
                const pdfBlob = pdf.output('blob');
                const pdfFile = new File([pdfBlob], `${fileName}.pdf`, { type: 'application/pdf' });
                resolve(pdfFile);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });
}

// Simpan URL bukti ke database
async function simpanBuktiUrl(noTT, url) {
    try {
        const response = await fetch(CONFIG.API_URL, {
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
            alert('✅ Bukti faktur berhasil ditambahkan!');
            await loadTandaTerima();
            const updated = ttData.find(tt => tt.noTT === noTT);
            if (updated) selectTT(updated);
        } else {
            alert('❌ Gagal menyimpan: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error save bukti:', error);
        alert('❌ Error koneksi saat menyimpan');
    }
}

// =====================================================
// 6. HAPUS BUKTI (HANYA MUNCUL JIKA ADA BUKTI)
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
        // 1. Hapus file dari Google Drive
        const fileId = extractFileIdFromUrl(selectedTT.buktiUrl);
        if (fileId) {
            await deleteFileFromDrive(fileId);
        }
        
        // 2. Hapus URL dari database
        const response = await fetch(CONFIG.API_URL, {
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

// Ekstrak file ID dari URL Google Drive
function extractFileIdFromUrl(url) {
    if (!url) return null;
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
    const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match2 && match2[1]) return match2[1];
    return null;
}

// Hapus file dari Google Drive via Apps Script
async function deleteFileFromDrive(fileId) {
    try {
        const response = await fetch(CONFIG.API_URL, {
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
// 7. BUKA BUKTI
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
// 8. HAPUS DATA TANDA TERIMA
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
        const response = await fetch(CONFIG.API_URL, {
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
        alert('❌ Error koneksi saat menghapus');
    }
}

// =====================================================
// 9. REFRESH DATA
// =====================================================
function refreshData() {
    loadTandaTerima();
}

// =====================================================
// 10. UTILITY FUNCTIONS
// =====================================================
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
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
// 11. EVENT LISTENERS
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
document.getElementById('uploadFromDrive')?.addEventListener('click', uploadFromDrive);
document.getElementById('uploadFromPC')?.addEventListener('click', uploadFromPC);
document.getElementById('uploadFromCamera')?.addEventListener('click', uploadFromCamera);
document.getElementById('fileInput')?.addEventListener('change', handleFileUpload);
document.getElementById('cameraInput')?.addEventListener('change', handleCameraUpload);
document.querySelector('.modal-close')?.addEventListener('click', closeUploadModal);
document.getElementById('uploadModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'uploadModal') closeUploadModal();
});