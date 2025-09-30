const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/**
 * Generate youtube_rank.csv from youtube_products.csv
 * Formula: 총 발행량 = videos + comments
 * Rankings are calculated per category (RF/HIFU)
 */

const args = process.argv.slice(2);
const monthArg = args.find(arg => arg.startsWith('--month='));
const month = monthArg ? monthArg.split('=')[1] : '2025-08';

const inputFile = path.join(__dirname, '..', 'data', 'raw', 'generated', month, 'youtube_products.csv');
const outputFile = path.join(__dirname, '..', 'data', 'raw', month, 'asterasys_total_data - youtube_rank.csv');

console.log(`\n📊 Generating youtube_rank.csv for ${month}...`);
console.log(`Input: ${inputFile}`);
console.log(`Output: ${outputFile}`);

// Read youtube_products.csv
const csvData = fs.readFileSync(inputFile, 'utf-8');
const products = parse(csvData, {
  columns: true,
  skip_empty_lines: true,
  cast: true
});

// Calculate total publications (videos + comments) and prepare data
const rankData = products.map(product => ({
  키워드: product.product,
  그룹: product.category === 'RF' ? '고주파' : '초음파',
  총발행량: parseInt(product.videos) + parseInt(product.comments),
  category: product.category
}));

// Sort by category and total publications (descending)
const rfProducts = rankData.filter(p => p.category === 'RF')
  .sort((a, b) => b.총발행량 - a.총발행량);

const hifuProducts = rankData.filter(p => p.category === 'HIFU')
  .sort((a, b) => b.총발행량 - a.총발행량);

// Assign rankings
rfProducts.forEach((product, index) => {
  product.발행량순위 = index + 1;
});

hifuProducts.forEach((product, index) => {
  product.발행량순위 = index + 1;
});

// Combine and remove temporary category field
const finalData = [...rfProducts, ...hifuProducts].map(({ 키워드, 그룹, 총발행량, 발행량순위 }) => ({
  키워드,
  그룹,
  '총 발행량': 총발행량,
  '발행량 순위': 발행량순위
}));

// Generate CSV manually
const header = '키워드,그룹,총 발행량,발행량 순위\n';
const rows = finalData.map(row =>
  `${row.키워드},${row.그룹},${row['총 발행량']},${row['발행량 순위']}`
).join('\n');
const output = header + rows;

// Ensure output directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write to file
fs.writeFileSync(outputFile, output, 'utf-8');

console.log('\n✅ youtube_rank.csv generated successfully!\n');

// Display summary
console.log('📈 Top 5 by category:\n');
console.log('RF (고주파):');
rfProducts.slice(0, 5).forEach(p => {
  const brand = ['쿨페이즈', '쿨소닉', '리프테라'].includes(p.키워드) ? '★' : ' ';
  console.log(`  ${brand} ${p.발행량순위}. ${p.키워드}: ${p.총발행량}`);
});

console.log('\nHIFU (초음파):');
hifuProducts.slice(0, 5).forEach(p => {
  const brand = ['쿨페이즈', '쿨소닉', '리프테라'].includes(p.키워드) ? '★' : ' ';
  console.log(`  ${brand} ${p.발행량순위}. ${p.키워드}: ${p.총발행량}`);
});

console.log('\n★ = Asterasys product\n');