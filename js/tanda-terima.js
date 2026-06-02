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

// =====================================================
// PERBAIKI FUNGSI UPLOAD FILE KE DRIVE
// =====================================================
async function uploadFileToDrive(file, noTT, fileName) {
    // VALIDASI AWAL
    if (!file) {
        alert('❌ File tidak ditemukan!');
        return;
    }
    
    console.log('File to upload:', {
        name: file.name,
        type: file.type,
        size: file.size,
        isFile: file instanceof File,
        isBlob: file instanceof Blob
    });
    
    let fileToUpload = file;
    let isConverted = false;

    // KONVERSI GAMBAR KE PDF (jika perlu)
    if (file.type.startsWith('image/')) {
        document.getElementById('uploadStatus').innerHTML = '🔄 Mengkonversi gambar ke PDF...';
        document.getElementById('uploadStatus').style.color = '#f39c12';
        
        try {
            fileToUpload = await convertImageToPDF(file, fileName);
            console.log('Hasil konversi:', {
                name: fileToUpload.name,
                type: fileToUpload.type,
                size: fileToUpload.size
            });
            isConverted = true;
        } catch (error) {
            console.error('Error konversi:', error);
            document.getElementById('uploadStatus').innerHTML = '❌ Gagal konversi gambar';
            document.getElementById('uploadStatus').style.color = 'red';
            alert('❌ Gagal mengkonversi gambar ke PDF: ' + error.message);
            return;
        }
    }
    
    // VALIDASI SETELAH KONVERSI
    if (!fileToUpload || fileToUpload.size === 0) {
        alert('❌ File hasil konversi kosong!');
        return;
    }
    
    // KIRIM KE APPS SCRIPT
    const formData = new FormData();
    formData.append('action', 'upload');
    formData.append('noTT', noTT);
    
    // Gunakan nama file yang aman
    let finalFileName = fileName || `Bukti_${noTT}`;
    finalFileName = finalFileName.replace(/[^a-zA-Z0-9_\-]/g, '_');
    formData.append('fileName', finalFileName);
    
    // PASTIKAN FILE TERKIRIM DENGAN BENAR
    // Cara 1: Kirim sebagai File object
    if (fileToUpload instanceof File) {
        formData.append('file', fileToUpload, `${finalFileName}.pdf`);
    } 
    // Cara 2: Kirim sebagai Blob
    else if (fileToUpload instanceof Blob) {
        const blobAsFile = new File([fileToUpload], `${finalFileName}.pdf`, { type: 'application/pdf' });
        formData.append('file', blobAsFile);
    }
    else {
        alert('❌ Format file tidak dikenali');
        return;
    }
    
    // DEBUG: Cek formData
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
        console.log(pair[0], pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].size} bytes)` : pair[1]);
    }
    
    document.getElementById('uploadStatus').innerHTML = '📤 Mengupload ke server...';
    document.getElementById('uploadStatus').style.color = '#3498db';
    
    // TAMPILKAN PROGRESS BAR
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    if (progressBar) progressBar.style.display = 'block';
    
    try {
        const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxRVvpzWbE6dMXfdNrD51c4SqjWL9koy933-ch1JYr_pWhnnNHJmjwdJtAGvt9tEg2b2Q/exec';
        
        // Gunakan fetch dengan timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 detik timeout
        
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('Response status:', response.status);
        
        // Baca response sebagai text dulu untuk debugging
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        // Parse JSON
        let result;
        try {
            result = JSON.parse(responseText);
        } catch(e) {
            console.error('Gagal parse JSON:', e);
            throw new Error('Server merespon format tidak valid: ' + responseText.substring(0, 200));
        }
        
        if (progressBar) progressBar.style.display = 'none';
        
        if (result.success) {
            document.getElementById('uploadStatus').innerHTML = '✅ Upload berhasil!';
            document.getElementById('uploadStatus').style.color = '#27ae60';
            
            // Update progress fill to 100%
            if (progressFill) progressFill.style.width = '100%';
            
            alert(`✅ Bukti berhasil diupload!\n📁 Nama: ${result.fileName}\n📄 Ukuran: ${Math.round(result.fileSize/1024)} KB`);
            
            // Simpan URL ke database
            await simpanBuktiUrl(noTT, result.url);
            
            // Tutup modal setelah 1 detik
            setTimeout(() => {
                closeUploadModal();
                // Refresh data
                loadTandaTerima();
            }, 1000);
        } else {
            throw new Error(result.error || 'Upload gagal');
        }
    } catch (error) {
        console.error('Error upload detail:', error);
        if (progressBar) progressBar.style.display = 'none';
        
        let errorMsg = error.message;
        if (error.name === 'AbortError') {
            errorMsg = 'Upload timeout. Coba dengan file yang lebih kecil.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMsg = 'Koneksi terputus. Periksa koneksi internet Anda.';
        }
        
        document.getElementById('uploadStatus').innerHTML = '❌ ' + errorMsg;
        document.getElementById('uploadStatus').style.color = 'red';
        alert('❌ Gagal upload: ' + errorMsg);
    }
}

// =====================================================
// PERBAIKI FUNGSI KONVERSI GAMBAR KE PDF
// =====================================================
async function convertImageToPDF(imageFile, fileName) {
    // Pastikan jsPDF tersedia
    if (typeof window.jspdf === 'undefined') {
        throw new Error('jsPDF library tidak ditemukan. Refresh halaman dan coba lagi.');
    }
    
    const { jsPDF } = window.jspdf;
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            
            img.onload = function() {
                try {
                    console.log('Image loaded:', { width: img.width, height: img.height });
                    
                    // Buat PDF dengan orientasi sesuai gambar
                    const orientation = img.width > img.height ? 'landscape' : 'portrait';
                    const pdf = new jsPDF({
                        orientation: orientation,
                        unit: 'mm',
                        format: 'a4'
                    });
                    
                    // Hitung dimensi agar proporsional
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
                    
                    // Tambahkan gambar ke PDF
                    pdf.addImage(img, 'JPEG', x, y, width, height);
                    
                    // Konversi ke Blob
                    const pdfBlob = pdf.output('blob');
                    console.log('PDF blob created:', { size: pdfBlob.size, type: pdfBlob.type });
                    
                    if (!pdfBlob || pdfBlob.size === 0) {
                        reject(new Error('PDF blob kosong'));
                        return;
                    }
                    
                    // Buat File object
                    const pdfFile = new File([pdfBlob], `${fileName}.pdf`, { 
                        type: 'application/pdf' 
                    });
                    
                    resolve(pdfFile);
                    
                } catch (err) {
                    console.error('Error creating PDF:', err);
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
// PERBAIKI FUNGSI HANDLE FILE UPLOAD DARI PC
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
    
    // Validasi ukuran file (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('❌ Ukuran file terlalu besar! Maksimal 10MB.');
        return;
    }
    
    // Dapatkan nama file
    let fileName = document.getElementById('fileName').value.trim();
    if (!fileName) {
        fileName = `Bukti_${currentUploadTT.noTT}`;
    }
    
    // Tampilkan preview untuk gambar
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
    }
    
    // Upload file
    await uploadFileToDrive(file, currentUploadTT.noTT, fileName);
}

// =====================================================
// PERBAIKI FUNGSI HANDLE UPLOAD DARI KAMERA
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
    
    // Validasi ukuran file
    if (file.size > 10 * 1024 * 1024) {
        alert('❌ Ukuran foto terlalu besar! Maksimal 10MB.');
        return;
    }
    
    // Dapatkan nama file
    let fileName = document.getElementById('fileName').value.trim();
    if (!fileName) {
        fileName = `Bukti_${currentUploadTT.noTT}`;
    }
    
    // Tampilkan preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImg = document.getElementById('previewImage');
        if (previewImg) {
            previewImg.src = e.target.result;
            document.getElementById('uploadPreview').style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
    
    // Upload file
    await uploadFileToDrive(file, currentUploadTT.noTT, fileName);
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