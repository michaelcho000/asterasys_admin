const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const csvPath = path.join(__dirname, '..', 'data', 'raw', 'asterasys_total_data - youtube_sponsor ad.csv');
console.log('Reading file:', csvPath);

const content = fs.readFileSync(csvPath, 'utf-8');
const cleanContent = content.replace(/^\uFEFF/, '');

const records = parse(cleanContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  bom: true,
  relax_column_count: true,
  skip_records_with_error: true
});

console.log('Total records:', records.length);
console.log('\nFirst 5 records:');
records.slice(0, 5).forEach((record, index) => {
  console.log(`Record ${index + 1}:`, {
    product: record['기기구분'] || 'EMPTY',
    campaign: record['캠페인'] || 'EMPTY', 
    cpv: record['평균 CPV'] || 'EMPTY',
    views: record['조회수'] || 'EMPTY',
    video: record['동영상'] || 'EMPTY'
  });
});

// Process data like the API does
let currentProduct = '';
const processed = [];

records.forEach(record => {
  const product = record['기기구분'] || '';
  const campaign = record['캠페인'] || '';
  const videoUrl = record['동영상'] || '';
  
  if (product) currentProduct = product;
  if (campaign && videoUrl && currentProduct) {
    processed.push({ 
      product: currentProduct, 
      campaign: campaign,
      videoUrl: videoUrl,
      cpv: record['평균 CPV'],
      views: record['조회수']
    });
  }
});

console.log('\nProcessed records:', processed.length);
console.log('Products found:', [...new Set(processed.map(p => p.product))]);

console.log('\nBy product:');
const productCount = {};
processed.forEach(item => {
  productCount[item.product] = (productCount[item.product] || 0) + 1;
});
console.log(productCount);