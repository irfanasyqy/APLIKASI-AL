// ========== UI.JS ==========
function setupBankSelection() {
    let cards = document.querySelectorAll('.bank-card');
    for (let i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function() {
            for (let j = 0; j < cards.length; j++) {
                cards[j].classList.remove('selected');
            }
            this.classList.add('selected');
            document.getElementById('selectedBank').value = this.getAttribute('data-bank');
        });
    }
}

document.getElementById('supplierSelect')?.addEventListener('change', function(e) {
    let idx = e.target.value;
    if (idx === "") {
        document.getElementById('supplierInfo').style.display = 'none';
        document.getElementById('currencyDisplay').value = '';
        return;
    }
    let s = suppliers[idx];
    document.getElementById('supplierInfo').innerHTML = '<strong>' + s.nama + '</strong><br>Account: ' + (s.account || '-') + '<br>Bank: ' + (s.bankName || '-') + ' (' + (s.swift || '-') + ')';
    document.getElementById('supplierInfo').style.display = 'block';
    document.getElementById('currencyDisplay').value = s.currency || '';
});

document.getElementById('ttSupplierSelect')?.addEventListener('change', function(e) {
    let s = suppliers[e.target.value];
    if (s) {
        document.getElementById('ttKepada').value = s.nama || '';
        document.getElementById('ttAlamat').value = s.alamat || '';
        document.getElementById('ttCurrency').value = s.currency || '';
    }
});

document.getElementById('fakturSupplierSelect')?.addEventListener('change', function(e) {
    let s = suppliers[e.target.value];
    if (s) document.getElementById('fakturCurrency').value = s.currency || '';
});
