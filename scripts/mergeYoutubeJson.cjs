#!/usr/bin/env node
/**
 * Merge YouTube scraper JSON files and add input field
 * - Combines multiple JSON files from the same month
 * - Extracts product name from title to create 'input' field
 * - Removes duplicates based on video URL
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS = [
  '쿨페이즈', '쿨소닉', '리프테라',
  '써마지', '인모드', '덴서티', '올리지오', '볼뉴머', '튠페이스', '텐써마', '세르프',
  '울쎄라', '슈링크', '리니어지', '브이로', '텐쎄라', '튠라이너', '리니어펌'
];

function findProduct(title) {
  if (!title) return null;
  for (const p of PRODUCTS) {
    if (title.includes(p)) return p;
  }
  return null;
}

function parseArgs(argv) {
  return argv.slice(2).reduce((acc, item) => {
    if (!item.startsWith('--')) return acc;
    const [key, value] = item.replace(/^--/, '').split('=');
    acc[key.trim()] = value === undefined ? true : value.trim();
    return acc;
  }, {});
}

function main() {
  const args = parseArgs(process.argv);
  const month = args.month || '2025-11';

  const rawDir = path.join(process.cwd(), 'data', 'raw', month);

  console.log(`\n📊 Merging YouTube JSON files for ${month}`);
  console.log(`Directory: ${rawDir}\n`);

  // Find all JSON files
  const jsonFiles = fs.readdirSync(rawDir)
    .filter(f => f.startsWith('dataset_youtube-scraper_') && f.endsWith('.json'))
    .map(f => path.join(rawDir, f));

  if (jsonFiles.length === 0) {
    throw new Error('No dataset_youtube-scraper_*.json files found');
  }

  console.log(`Found ${jsonFiles.length} JSON files:`);
  jsonFiles.forEach(f => console.log(`  - ${path.basename(f)}`));

  // Merge all JSON files
  const allItems = [];
  const seenUrls = new Set();

  for (const file of jsonFiles) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`\n  Processing ${path.basename(file)}: ${data.length} items`);

    let added = 0;
    let skipped = 0;
    let noProduct = 0;

    for (const item of data) {
      // Skip duplicates
      if (seenUrls.has(item.url)) {
        skipped++;
        continue;
      }

      // Extract product from title
      const product = findProduct(item.title);
      if (!product) {
        noProduct++;
        continue;
      }

      // Add input field and mark as seen
      item.input = product;
      seenUrls.add(item.url);
      allItems.push(item);
      added++;
    }

    console.log(`    Added: ${added}, Skipped (dup): ${skipped}, No product: ${noProduct}`);
  }

  // Product distribution
  const productCount = {};
  for (const item of allItems) {
    productCount[item.input] = (productCount[item.input] || 0) + 1;
  }

  console.log(`\n📈 Product distribution:`);
  Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([product, count]) => {
      const asterasys = ['쿨페이즈', '쿨소닉', '리프테라'].includes(product) ? '★' : ' ';
      console.log(`  ${asterasys} ${product}: ${count}`);
    });

  // Save merged file
  const outputFile = path.join(rawDir, `dataset_youtube-scraper_${month}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(allItems, null, 2), 'utf8');

  console.log(`\n✅ Merged JSON saved: ${path.basename(outputFile)}`);
  console.log(`   Total items: ${allItems.length}`);
  console.log(`   Products found: ${Object.keys(productCount).length}\n`);
}

try {
  main();
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
