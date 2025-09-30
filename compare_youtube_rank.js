const fs = require('fs');
const path = require('path');

// youtube_rank.csv 읽기
const rankData = {};
const rankCsv = fs.readFileSync('data/raw/2025-08/asterasys_total_data - youtube_rank.csv', 'utf8');
const rankLines = rankCsv.split('\n').slice(1); // 헤더 제외

rankLines.forEach(line => {
  if (!line.trim()) return;
  const [product, group, count, rank] = line.split(',');
  rankData[product.trim()] = {
    rank_count: parseInt(count),
    group: group.trim(),
    rank: parseInt(rank)
  };
});

// youtube_products.csv 읽기
const productsData = {};
const productsCsv = fs.readFileSync('data/raw/generated/2025-08/youtube_products.csv', 'utf8');
const productsLines = productsCsv.split('\n').slice(1); // 헤더 제외

productsLines.forEach(line => {
  if (!line.trim()) return;
  const parts = line.split(',');
  const product = parts[0].trim();
  const videos = parseInt(parts[3]);
  
  productsData[product] = {
    videos: videos
  };
});

// 비교 및 차이 계산
console.log('제품별 발행량 비교 (8월 데이터)\n');
console.log('제품명\t\t그룹\t\trank 발행량\tJSON 영상수\t배율 차이');
console.log('='.repeat(80));

const products = Object.keys(rankData).sort((a, b) => {
  const diffA = rankData[a].rank_count / (productsData[a]?.videos || 1);
  const diffB = rankData[b].rank_count / (productsData[b]?.videos || 1);
  return diffB - diffA; // 차이가 큰 순서대로 정렬
});

products.forEach(product => {
  const rankCount = rankData[product].rank_count;
  const videoCount = productsData[product]?.videos || 0;
  const ratio = videoCount > 0 ? (rankCount / videoCount).toFixed(1) : 'N/A';
  const group = rankData[product].group;
  
  console.log(`${product}\t\t${group}\t${rankCount}\t\t${videoCount}\t\t${ratio}x`);
});

console.log('\n요약 통계:');
const ratios = products
  .filter(p => productsData[p]?.videos > 0)
  .map(p => rankData[p].rank_count / productsData[p].videos);

const min = Math.min(...ratios).toFixed(1);
const max = Math.max(...ratios).toFixed(1);
const avg = (ratios.reduce((a,b) => a+b, 0) / ratios.length).toFixed(1);

console.log(`최소 배율: ${min}x`);
console.log(`최대 배율: ${max}x`);
console.log(`평균 배율: ${avg}x`);
