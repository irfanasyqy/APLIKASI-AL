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
    
    // Urutkan berdasarkan noTT (descending)
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
        
        // Pastikan total adalah angka atau string yang bisa diformat
        let totalDisplay = tt.total;
        if (typeof totalDisplay === 'string' && totalDisplay.includes('Rp')) {
            totalDisplay = totalDisplay; // biarkan apa adanya
        } else if (!isNaN(parseFloat(totalDisplay))) {
            totalDisplay = formatRupiah(parseFloat(totalDisplay));
        }
        
        html += `
            <div class="list-item ${statusClass}" data-id="${tt.id || idx}" data-no="${tt.noTT}" title="${hasBukti ? 'Sudah ada bukti' : 'Belum ada bukti'}">
                <div class="no-tt">${statusIcon} ${escapeHtml(tt.noTT || '-')}</div>
                <div class="customer-name">👤 ${escapeHtml(tt.customerNama || '-')}</div>
                <div class="total">💰 ${totalDisplay}</div>
                <div class="status-badge ${badgeClass}">${badgeText}</div>
            </div>
        `;
    });
    
    listContainer.innerHTML = html;
    document.getElementById('totalData').innerHTML = `📊 Total Data: ${data.length} record (filtered: ${filtered.length})`;
    
    // Attach event listeners
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

function showUploadModal(tt) {
    currentUploadTT = tt;
    document.getElementById('modalTTNumber').innerText = tt.noTT;
    document.getElementById('uploadModal').style.display = 'flex';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('previewImage').src = '';
    document.getElementById('uploadStatus').innerHTML = '';
    document.getElementById('fileNameInputGroup').style.display = 'block';
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
    document.getElementById('fileInput').click();
}

// 3. Upload dari Kamera
function uploadFromCamera() {
    if (!currentUploadTT) return;
    currentUploadSource = 'camera';
    document.getElementById('cameraInput').click();
}

// =====================================================
// FUNGSI UPLOAD DENGAN BASE64
// =====================================================
// Ganti CONFIG.API_URL dengan APPS_SCRIPT_URL langsung

async function uploadFileToDrive(file, noTT, fileName) {
    if (!file) {
        alert('❌ File tidak ditemukan!');
        return;
    }
    
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const uploadStatus = document.getElementById('uploadStatus');
    
    if (progressBar) progressBar.style.display = 'block';
    if (progressFill) progressFill.style.width = '30%';
    if (uploadStatus) {
        uploadStatus.innerHTML = '📤 Memproses file...';
        uploadStatus.style.color = '#3498db';
    }
    
    try {
        let finalBlob = file;
        let finalFileName = fileName || `Bukti_${noTT}`;
        finalFileName = finalFileName.replace(/[^a-zA-Z0-9_\-]/g, '_');
        
        // Konversi gambar ke PDF jika perlu
        if (file.type.startsWith('image/')) {
            if (uploadStatus) {
                uploadStatus.innerHTML = '🔄 Mengkonversi gambar ke PDF...';
                uploadStatus.style.color = '#f39c12';
            }
            if (progressFill) progressFill.style.width = '50%';
            finalBlob = await convertImageToPDFBlob(file);
        }
        
        if (progressFill) progressFill.style.width = '70%';
        if (uploadStatus) uploadStatus.innerHTML = '📡 Mengirim ke server...';
        
        // PAKAI FORM DATA (bukan base64)
        const formData = new FormData();
        formData.append('action', 'upload');
        formData.append('noTT', noTT);
        formData.append('fileName', finalFileName);
        formData.append('file', finalBlob, `${finalFileName}.pdf`);
        
        // Kirim ke Worker
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: formData
        });
        
        if (progressFill) progressFill.style.width = '90%';
        
        const result = await response.json();
        console.log('Upload result:', result);
        
        if (progressFill) progressFill.style.width = '100%';
        
        if (result.success) {
            if (uploadStatus) {
                uploadStatus.innerHTML = '✅ Upload berhasil!';
                uploadStatus.style.color = '#27ae60';
            }
            
            alert(`✅ Bukti berhasil diupload!\n📁 Nama: ${result.fileName}`);
            
            // Simpan URL ke database
            await simpanBuktiUrl(noTT, result.url);
            
            setTimeout(() => {
                closeUploadModal();
                loadTandaTerima();
            }, 1500);
        } else {
            throw new Error(result.error || 'Upload gagal');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        if (progressBar) progressBar.style.display = 'none';
        
        if (uploadStatus) {
            uploadStatus.innerHTML = '❌ ' + error.message;
            uploadStatus.style.color = 'red';
        }
        alert('❌ Gagal upload: ' + error.message);
    }
}

async function convertImageToPDFBlob(imageFile) {
    if (typeof window.jspdf === 'undefined') {
        throw new Error('jsPDF library tidak ditemukan. Refresh halaman.');
    }
    
    const { jsPDF } = window.jspdf;
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            
            img.onload = function() {
                try {
                    const orientation = img.width > img.height ? 'landscape' : 'portrait';
                    const pdf = new jsPDF({
                        orientation: orientation,
                        unit: 'mm',
                        format: 'a4'
                    });
                    
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    
                    let width = pdfWidth;
                    let height = (img.height * pdfWidth) / img.width;
                    
                    if (height > pdfHeight) {
                        height = pdfHeight;
                        width = (img.width * pdfHeight) / img.height;
                    }
                    
                    const x = (pdfWidth - width) / 2;
                    const y = (pdfHeight - height) / 2;
                    
                    pdf.addImage(img, 'JPEG', x, y, width, height);
                    const pdfBlob = pdf.output('blob');
                    resolve(pdfBlob);
                    
                } catch (err) {
                    reject(new Error('Gagal membuat PDF: ' + err.message));
                }
            };
            
            img.onerror = function() {
                reject(new Error('Gagal memuat gambar'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = function() {
            reject(new Error('Gagal membaca file gambar'));
        };
        
        reader.readAsDataURL(imageFile);
    });
}

// =====================================================
// KONVERSI GAMBAR KE PDF
// =====================================================
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

// =====================================================
// HANDLE FILE UPLOAD DARI PC
// =====================================================
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        alert('⚠️ Silakan pilih file terlebih dahulu!');
        return;
    }
    
    if (!currentUploadTT) {
        alert('⚠️ Data TT tidak ditemukan!');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('❌ Ukuran file terlalu besar! Maksimal 10MB.');
        return;
    }
    
    let fileName = document.getElementById('fileName').value.trim();
    if (!fileName) {
        fileName = `Bukti_${currentUploadTT.noTT}`;
    }
    
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImg = document.getElementById('previewImage');
            if (previewImg) {
                previewImg.src = e.target.result;
                document.getElementById('uploadPreview').style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        document.getElementById('uploadPreview').style.display = 'block';
        document.getElementById('previewImage').src = 'https://cdn-icons-png.flaticon.com/512/337/337946.png';
    }
    
    await uploadFileToDrive(file, currentUploadTT.noTT, fileName);
}

// =====================================================
// HANDLE UPLOAD DARI KAMERA
// =====================================================
async function handleCameraUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        alert('⚠️ Silakan ambil foto terlebih dahulu!');
        return;
    }
    
    if (!currentUploadTT) {
        alert('⚠️ Data TT tidak ditemukan!');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('❌ Ukuran foto terlalu besar! Maksimal 10MB.');
        return;
    }
    
    let fileName = document.getElementById('fileName').value.trim();
    if (!fileName) {
        fileName = `Bukti_${currentUploadTT.noTT}`;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImg = document.getElementById('previewImage');
        if (previewImg) {
            previewImg.src = e.target.result;
            document.getElementById('uploadPreview').style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
    
    await uploadFileToDrive(file, currentUploadTT.noTT, fileName);
}

// =====================================================
// SIMPAN URL BUKTI KE DATABASE
// =====================================================
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
// REFRESH DATA
// =====================================================
function refreshData() {
    loadTandaTerima();
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
function formatRupiah(angka) {
    // Jika sudah dalam format Rp, kembalikan langsung
    if (typeof angka === 'string' && angka.includes('Rp')) return angka;
    // Konversi ke number
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
document.getElementById('uploadFromDrive')?.addEventListener('click', uploadFromDrive);
document.getElementById('uploadFromPC')?.addEventListener('click', uploadFromPC);
document.getElementById('uploadFromCamera')?.addEventListener('click', uploadFromCamera);
document.getElementById('fileInput')?.addEventListener('change', handleFileUpload);
document.getElementById('cameraInput')?.addEventListener('change', handleCameraUpload);
document.querySelector('.modal-close')?.addEventListener('click', closeUploadModal);
document.getElementById('uploadModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'uploadModal') closeUploadModal();
});