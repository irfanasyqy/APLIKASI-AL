<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Cetak Label Customer</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', monospace;
            padding: 10mm;
            width: 210mm;
            margin: 0 auto;
        }
        .label-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10mm;
        }
        .label-card {
            border: 1px solid #000;
            padding: 5mm;
            min-height: 50mm;
            page-break-inside: avoid;
        }
        .label-title {
            font-weight: bold;
            text-align: center;
            border-bottom: 1px solid #000;
            margin-bottom: 3mm;
            padding-bottom: 2mm;
        }
        .label-content {
            font-size: 9pt;
            line-height: 1.4;
        }
        .label-content div {
            margin-bottom: 2mm;
        }
        @media print {
            body {
                padding: 0;
                margin: 0;
            }
            @page {
                size: A4;
                margin: 5mm;
            }
        }
    </style>
</head>
<body>
    <div id="printContainer">Memuat data...</div>
    <script>
        const labelData = JSON.parse(localStorage.getItem('cetakLabelData') || '{}');
        const labelMap = {
            B3: 'LABEL 1 (B3)',
            I3: 'LABEL 2 (I3)',
            B7: 'LABEL 3 (B7)',
            I7: 'LABEL 4 (I7)',
            B11: 'LABEL 5 (B11)',
            I11: 'LABEL 6 (I11)'
        };
        
        let html = '<div class="label-container">';
        
        for (const [key, title] of Object.entries(labelMap)) {
            const data = labelData[key];
            html += `
                <div class="label-card">
                    <div class="label-title">${title}</div>
                    <div class="label-content">
                        <div><strong>Nama:</strong> ${data?.nama || '-'}</div>
                        <div><strong>Alamat:</strong> ${data?.alamat || '-'}</div>
                        <div><strong>HP:</strong> ${data?.hp || '-'}</div>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        document.getElementById('printContainer').innerHTML = html;
        
        // Auto print
        window.print();
        setTimeout(() => window.close(), 500);
    </script>
</body>
</html>