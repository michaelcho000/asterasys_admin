const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const workbook = XLSX.readFile('C:/asterasys_admin_latest/datalab.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON first to process the data
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Create CSV content matching the format of 2025-08 naver datalab.csv
let csvContent = '';

// Add header rows (first 6 rows from the Excel file)
for (let i = 0; i < Math.min(6, jsonData.length); i++) {
    csvContent += jsonData[i].join(',') + '\n';
}

// Add the column header row (날짜, 리프테라, 날짜, 쿨페이즈, 날짜, 쿨소닉)
if (jsonData.length > 6) {
    csvContent += jsonData[6].join(',') + '\n';
}

// Add the data rows (from row 8 onwards)
for (let i = 7; i < jsonData.length; i++) {
    if (jsonData[i].length > 0 && jsonData[i][0]) {
        csvContent += jsonData[i].join(',') + '\n';
    }
}

// Write to the output file
const outputPath = 'C:/asterasys_admin_latest/data/raw/2025-09/asterasys_total_data - naver datalab.csv';
fs.writeFileSync(outputPath, '\ufeff' + csvContent, 'utf8'); // Add BOM for Excel compatibility

console.log('✅ CSV 파일이 생성되었습니다:', outputPath);
console.log('📊 총 행 수:', jsonData.length - 7, '일');