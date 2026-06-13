// ========== TRANSLATIONS.JS ==========
// Multi Bahasa Indonesia / English

const translations = {
    id: {
        // Umum
        'app_title': 'APLIKASI AL',
        'app_subtitle': 'Transfer Bank & Dokumentasi',
        'back_to_menu': 'KEMBALI KE MENU',
        'save': 'SIMPAN',
        'cancel': 'BATAL',
        'edit': 'EDIT',
        'delete': 'HAPUS',
        'search': 'CARI',
        'reset': 'RESET',
        'loading': 'Memuat...',
        'no_data': 'Tidak ada data',
        'success': 'Berhasil',
        'failed': 'Gagal',
        'confirm': 'Konfirmasi',
        'yes': 'Ya',
        'no': 'Tidak',
        
        // Menu
        'menu_transfer': 'TRANSFER BANK',
        'menu_transfer_desc': 'Transfer ke supplier luar negeri',
        'menu_supplier': 'SUPPLIER DATA',
        'menu_supplier_desc': 'Lihat data supplier',
        'menu_customer': 'CUSTOMER DATA',
        'menu_customer_desc': 'Lihat & kelola data customer',
        'menu_tukar_faktur': 'TUKAR FAKTUR',
        'menu_tukar_faktur_desc': 'Input penukaran faktur / invoice',
        'menu_tanda_terima': 'TANDA TERIMA',
        'menu_tanda_terima_desc': 'Lihat & kelola tanda terima',
        'menu_cetak_label': 'CETAK LABEL',
        'menu_cetak_label_desc': 'Cetak label alamat',
        'menu_edit_data': 'EDIT DATA',
        'menu_edit_data_desc': 'Edit supplier',
        'menu_riwayat': 'RIWAYAT',
        'menu_riwayat_desc': 'History transfer',
        'menu_statistik': 'STATISTIK',
        'menu_statistik_desc': 'Grafik & ringkasan data',
        'menu_export': 'EXPORT DATA',
        'menu_export_desc': 'Export ke Excel',
        'menu_users': 'MANAJEMEN USER',
        'menu_users_desc': 'Kelola pengguna sistem',
        'menu_backup': 'BACKUP & RESTORE',
        'menu_backup_desc': 'Backup & restore semua data',
        'menu_notifikasi': 'NOTIFIKASI',
        'menu_notifikasi_desc': 'Kirim pengingat via WA/Email',
        'menu_activity_log': 'ACTIVITY LOG',
        'menu_activity_log_desc': 'Log aktivitas & laporan',
        
        // Login
        'login_title': 'Login',
        'username': 'Username',
        'password': 'Password',
        'login_btn': 'LOGIN',
        'login_error': 'Username atau password salah!',
        'login_blocked': 'Terlalu banyak percobaan gagal. Coba lagi setelah',
        'logout': 'LOGOUT',
        'logout_confirm': 'Yakin ingin logout?',
        
        // Supplier
        'supplier_title': 'Data Supplier',
        'supplier_add': 'Tambah Supplier',
        'supplier_name': 'Nama Supplier',
        'supplier_account': 'Account Number',
        'supplier_currency': 'Currency',
        'supplier_alamat': 'Alamat',
        'supplier_bank': 'Bank Name',
        'supplier_bank_alamat': 'Bank Alamat',
        'supplier_swift': 'SWIFT Code',
        'supplier_country': 'Country',
        
        // Transfer
        'transfer_title': 'Transfer Bank',
        'transfer_select_supplier': 'Pilih Supplier',
        'transfer_search_supplier': 'Cari supplier',
        'transfer_rekening_asal': 'Rekening Asal',
        'transfer_jumlah': 'Jumlah Transfer',
        'transfer_currency': 'Currency',
        'transfer_berita': 'Berita Transfer',
        'transfer_tujuan': 'Tujuan Transfer',
        'transfer_no_loa': 'No LOA',
        'transfer_value_date': 'Value Date',
        'transfer_metode': 'Metode Transfer',
        'transfer_submit': 'SUBMIT & PRINT',
        
        // Customer
        'customer_title': 'Data Customer',
        'customer_name': 'Nama Perusahaan',
        'customer_alamat': 'Alamat',
        'customer_jadwal': 'Jadwal Tukar Faktur',
        'customer_pic': 'PIC',
        'customer_hp': 'No HP',
        
        // Tanda Terima
        'tt_title': 'Tanda Terima',
        'tt_no': 'No TT',
        'tt_tanggal': 'Tanggal',
        'tt_customer': 'Customer',
        'tt_total': 'Total',
        'tt_upload_bukti': 'Upload Bukti',
        
        // Export
        'export_supplier': 'Export Supplier',
        'export_transfer': 'Export Riwayat Transfer',
        'export_tt': 'Export Tanda Terima',
        'export_valas': 'Export Riwayat Valas',
        
        // Notifikasi
        'notif_title': 'Notifikasi & Pengingat',
        'notif_today': 'Jadwal Hari Ini',
        'notif_tomorrow': 'Jadwal Besok',
        'notif_send_wa': 'Kirim WhatsApp',
        'notif_send_email': 'Kirim Email',
        'notif_send_all_wa': 'Kirim WhatsApp ke Semua Customer Hari Ini',
        'notif_send_all_email': 'Kirim Email ke Semua Customer Hari Ini',
        
        // Logout message
        'session_expired': 'Sesi berakhir, silakan login kembali',
        'session_warning': 'Sesi akan berakhir dalam'
    },
    
    en: {
        // General
        'app_title': 'AL APPLICATION',
        'app_subtitle': 'Bank Transfer & Documentation',
        'back_to_menu': 'BACK TO MENU',
        'save': 'SAVE',
        'cancel': 'CANCEL',
        'edit': 'EDIT',
        'delete': 'DELETE',
        'search': 'SEARCH',
        'reset': 'RESET',
        'loading': 'Loading...',
        'no_data': 'No data',
        'success': 'Success',
        'failed': 'Failed',
        'confirm': 'Confirm',
        'yes': 'Yes',
        'no': 'No',
        
        // Menu
        'menu_transfer': 'BANK TRANSFER',
        'menu_transfer_desc': 'Transfer to international supplier',
        'menu_supplier': 'SUPPLIER DATA',
        'menu_supplier_desc': 'View supplier data',
        'menu_customer': 'CUSTOMER DATA',
        'menu_customer_desc': 'View & manage customer data',
        'menu_tukar_faktur': 'INVOICE EXCHANGE',
        'menu_tukar_faktur_desc': 'Input invoice exchange',
        'menu_tanda_terima': 'RECEIPT',
        'menu_tanda_terima_desc': 'View & manage receipt',
        'menu_cetak_label': 'PRINT LABEL',
        'menu_cetak_label_desc': 'Print address label',
        'menu_edit_data': 'EDIT DATA',
        'menu_edit_data_desc': 'Edit supplier',
        'menu_riwayat': 'HISTORY',
        'menu_riwayat_desc': 'Transfer history',
        'menu_statistik': 'STATISTICS',
        'menu_statistik_desc': 'Charts & data summary',
        'menu_export': 'EXPORT DATA',
        'menu_export_desc': 'Export to Excel',
        'menu_users': 'USER MANAGEMENT',
        'menu_users_desc': 'Manage system users',
        'menu_backup': 'BACKUP & RESTORE',
        'menu_backup_desc': 'Backup & restore all data',
        'menu_notifikasi': 'NOTIFICATION',
        'menu_notifikasi_desc': 'Send reminder via WA/Email',
        'menu_activity_log': 'ACTIVITY LOG',
        'menu_activity_log_desc': 'Activity log & reports',
        
        // Login
        'login_title': 'Login',
        'username': 'Username',
        'password': 'Password',
        'login_btn': 'LOGIN',
        'login_error': 'Invalid username or password!',
        'login_blocked': 'Too many failed attempts. Try again in',
        'logout': 'LOGOUT',
        'logout_confirm': 'Are you sure you want to logout?',
        
        // Supplier
        'supplier_title': 'Supplier Data',
        'supplier_add': 'Add Supplier',
        'supplier_name': 'Supplier Name',
        'supplier_account': 'Account Number',
        'supplier_currency': 'Currency',
        'supplier_alamat': 'Address',
        'supplier_bank': 'Bank Name',
        'supplier_bank_alamat': 'Bank Address',
        'supplier_swift': 'SWIFT Code',
        'supplier_country': 'Country',
        
        // Transfer
        'transfer_title': 'Bank Transfer',
        'transfer_select_supplier': 'Select Supplier',
        'transfer_search_supplier': 'Search supplier',
        'transfer_rekening_asal': 'Source Account',
        'transfer_jumlah': 'Transfer Amount',
        'transfer_currency': 'Currency',
        'transfer_berita': 'Transfer Notes',
        'transfer_tujuan': 'Transfer Purpose',
        'transfer_no_loa': 'LOA Number',
        'transfer_value_date': 'Value Date',
        'transfer_metode': 'Transfer Method',
        'transfer_submit': 'SUBMIT & PRINT',
        
        // Customer
        'customer_title': 'Customer Data',
        'customer_name': 'Company Name',
        'customer_alamat': 'Address',
        'customer_jadwal': 'Exchange Schedule',
        'customer_pic': 'PIC',
        'customer_hp': 'Phone Number',
        
        // Tanda Terima
        'tt_title': 'Receipt',
        'tt_no': 'Receipt No',
        'tt_tanggal': 'Date',
        'tt_customer': 'Customer',
        'tt_total': 'Total',
        'tt_upload_bukti': 'Upload Proof',
        
        // Export
        'export_supplier': 'Export Supplier',
        'export_transfer': 'Export Transfer History',
        'export_tt': 'Export Receipt',
        'export_valas': 'Export Forex History',
        
        // Notifikasi
        'notif_title': 'Notification & Reminder',
        'notif_today': "Today's Schedule",
        'notif_tomorrow': "Tomorrow's Schedule",
        'notif_send_wa': 'Send WhatsApp',
        'notif_send_email': 'Send Email',
        'notif_send_all_wa': 'Send WhatsApp to All Customers Today',
        'notif_send_all_email': 'Send Email to All Customers Today',
        
        // Logout message
        'session_expired': 'Session expired, please login again',
        'session_warning': 'Session will expire in'
    }
};

let currentLang = localStorage.getItem('language') || 'id';

function t(key) {
    return translations[currentLang][key] || key;
}

function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
        localStorage.setItem('language', lang);
        updatePageLanguage();
    }
}

function updatePageLanguage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = t(key);
        } else {
            el.innerHTML = t(key);
        }
    });
    
    // Update page title
    const titleEl = document.querySelector('title');
    if (titleEl) {
        const currentTitle = titleEl.innerText;
        if (currentTitle.includes('APLIKASI')) {
            titleEl.innerText = t('app_title');
        }
    }
}

// Load language on page load
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage();
});
// Tambahkan fungsi untuk update bahasa di semua halaman
function updatePageLanguage() {
    // Update elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = t(key);
        } else {
            el.innerHTML = t(key);
        }
    });
    
    // Update title
    const titleEl = document.querySelector('title');
    if (titleEl && titleEl.innerText.includes('APLIKASI')) {
        titleEl.innerText = t('app_title');
    }
}

// Fungsi ganti bahasa
function switchLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('language', lang);
    updatePageLanguage();
    
    // Update active state tombol
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (lang === 'id') {
        document.getElementById('langID')?.classList.add('active');
    } else {
        document.getElementById('langEN')?.classList.add('active');
    }
    
    // Optional: reload page to refresh all content
    setTimeout(() => {
        location.reload();
    }, 100);
}