const fs = require('fs');
const path = require('path');

/**
 * Fix naver datalab CSV file for November 2025
 * - Fix encoding (add proper Korean headers)
 * - Swap columns: cols[1] and cols[3] to match October format
 * Expected output format: 날짜,리프테라,날짜,쿨페이즈,날짜,쿨소닉
 */

const month = '2025-11';
const inputFile = path.join(__dirname, '..', 'data', 'raw', month, 'asterasys_total_data - naver datalab.CSV');
const outputFile = path.join(__dirname, '..', 'public', 'data', 'raw', month, 'asterasys_total_data - naver datalab.csv');

console.log('\n📊 Fixing naver datalab CSV for', month);
console.log('Input:', inputFile);
console.log('Output:', outputFile);

// Read the corrupted file
const rawData = fs.readFileSync(inputFile, 'utf-8');
const lines = rawData.split('\n');

// Build new file with correct format
const output = [];

// Add metadata header (matching October format)
output.push('url,http://datalab.naver.com/keyword/trendResult.naver?hashKey=N_4d149ad61c48a2f8fdb3990bf667f65e,,,,');
output.push('주제,통검,,,,');
output.push('범위,합계,,,,');
output.push('기간,일간 : 2024-12-07 ~ 2025-12-07,,,,');
output.push('성별,"전체(여성,남성)",,,,');
output.push('연령대,전체,,,,');
output.push('날짜,리프테라,날짜,쿨페이즈,날짜,쿨소닉');

// Process data rows (skip first 7 header lines)
let dataCount = 0;
for (let i = 7; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const cols = line.split(',');
  if (cols.length >= 6) {
    // Swap cols[1] and cols[3]:
    // Original: 날짜,쿨페이즈,날짜,리프테라,날짜,쿨소닉
    // Target:   날짜,리프테라,날짜,쿨페이즈,날짜,쿨소닉
    const newLine = [
      cols[0],  // 날짜
      cols[3],  // 리프테라 (was in cols[3])
      cols[2],  // 날짜
      cols[1],  // 쿨페이즈 (was in cols[1])
      cols[4],  // 날짜
      cols[5]   // 쿨소닉
    ].join(',');
    output.push(newLine);
    dataCount++;
  }
}

// Ensure output directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write with UTF-8 BOM
const BOM = '\ufeff';
fs.writeFileSync(outputFile, BOM + output.join('\n'), 'utf-8');

console.log('\n✅ Fixed naver datalab CSV!');
console.log(`   Processed ${dataCount} data rows`);
console.log(`   Output: ${outputFile}\n`);

// Verify the output
const verifyData = fs.readFileSync(outputFile, 'utf-8');
const verifyLines = verifyData.split('\n');
console.log('📋 First 10 lines of output:');
verifyLines.slice(0, 10).forEach((line, idx) => {
  console.log(`   ${idx + 1}: ${line.substring(0, 80)}${line.length > 80 ? '...' : ''}`);
});
