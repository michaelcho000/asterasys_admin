const fs = require('fs');
const path = require('path');

// Load data files
const dataPath = path.join(__dirname, '..', 'data', 'raw', '2025-09');
const blogData = fs.readFileSync(path.join(dataPath, 'asterasys_total_data - blog_rank.csv'), 'utf-8');
const newsData = fs.readFileSync(path.join(dataPath, 'asterasys_total_data - news analysis.csv'), 'utf-8');
const cafeData = fs.readFileSync(path.join(dataPath, 'asterasys_total_data - cafe_rank.csv'), 'utf-8');

const asterasysKeywords = ['쿨페이즈', '리프테라', '쿨소닉'];
const competitorKeywords = ['덴서티', '세르프', '올리지오', '볼뉴머', '텐써마'];

// Parse CSV helper
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim() || '';
    });
    return obj;
  });
}

console.log('=== Volume-Based Organic vs Managed Analysis ===\n');
console.log('Organic = 병원블로그 + 병원기사');
console.log('Managed = 일반블로그 + 기업기사 + 카페\n');

// Parse data
const blogRows = parseCSV(blogData);
const newsRows = parseCSV(newsData);
const cafeRows = parseCSV(cafeData);

// Calculate for each product
const productStats = {};

function analyzeProduct(keyword) {
  // 1. Blog data
  const blogItems = blogRows.filter(r => r['키워드'] === keyword);
  const hospitalBlogs = blogItems
    .filter(r => r['블로그유형'] === '병원블로그')
    .reduce((sum, r) => sum + parseInt(r['총 개수'] || 0), 0);
  const generalBlogs = blogItems
    .filter(r => r['블로그유형'] === '일반블로그')
    .reduce((sum, r) => sum + parseInt(r['총 개수'] || 0), 0);

  // 2. News data
  const newsItem = newsRows.find(r => r['product_name'] === keyword);
  const totalNews = parseInt(newsItem?.['total_articles'] || 0);
  const hospitalNewsPercent = parseFloat(newsItem?.['category_병원발행'] || 0);
  const corporateNewsPercent = parseFloat(newsItem?.['category_기업소식'] || 0);

  const hospitalNews = Math.round(totalNews * hospitalNewsPercent / 100);
  const corporateNews = Math.round(totalNews * corporateNewsPercent / 100);

  // 3. Cafe data (100% Managed)
  const cafeItem = cafeRows.find(r => r['키워드'] === keyword);
  const cafeVolume = parseInt(cafeItem?.['총 발행량'] || 0);

  // Calculate totals
  const organicVolume = hospitalBlogs + hospitalNews;
  const managedVolume = generalBlogs + corporateNews + cafeVolume;
  const totalVolume = organicVolume + managedVolume;

  const organicPercent = totalVolume > 0 ? Math.round((organicVolume / totalVolume) * 100) : 0;
  const managedPercent = 100 - organicPercent;

  productStats[keyword] = {
    organic: {
      hospitalBlogs,
      hospitalNews,
      total: organicVolume
    },
    managed: {
      generalBlogs,
      corporateNews,
      cafe: cafeVolume,
      total: managedVolume
    },
    totalVolume,
    organicPercent,
    managedPercent
  };

  return productStats[keyword];
}

// Analyze all products
console.log('\n=== Individual Product Analysis ===\n');

asterasysKeywords.concat(competitorKeywords).forEach(keyword => {
  const stats = analyzeProduct(keyword);

  console.log(`${keyword}:`);
  console.log(`  Organic: ${stats.organic.total} (병원블로그 ${stats.organic.hospitalBlogs} + 병원기사 ${stats.organic.hospitalNews})`);
  console.log(`  Managed: ${stats.managed.total} (일반블로그 ${stats.managed.generalBlogs} + 기업기사 ${stats.managed.corporateNews} + 카페 ${stats.managed.cafe})`);
  console.log(`  → Organic ${stats.organicPercent}% / Managed ${stats.managedPercent}%\n`);
});

// Asterasys average
console.log('\n=== Asterasys Average ===\n');

const asterasysTotalOrganic = asterasysKeywords.reduce((sum, k) => sum + productStats[k].organic.total, 0);
const asterasysTotalManaged = asterasysKeywords.reduce((sum, k) => sum + productStats[k].managed.total, 0);
const asterasysTotalVolume = asterasysTotalOrganic + asterasysTotalManaged;

const asterasysOrganic = Math.round((asterasysTotalOrganic / asterasysTotalVolume) * 100);
const asterasysManaged = 100 - asterasysOrganic;

console.log(`Total Organic Volume: ${asterasysTotalOrganic}`);
console.log(`  - 병원블로그: ${asterasysKeywords.reduce((sum, k) => sum + productStats[k].organic.hospitalBlogs, 0)}`);
console.log(`  - 병원기사: ${asterasysKeywords.reduce((sum, k) => sum + productStats[k].organic.hospitalNews, 0)}`);
console.log(`\nTotal Managed Volume: ${asterasysTotalManaged}`);
console.log(`  - 일반블로그: ${asterasysKeywords.reduce((sum, k) => sum + productStats[k].managed.generalBlogs, 0)}`);
console.log(`  - 기업기사: ${asterasysKeywords.reduce((sum, k) => sum + productStats[k].managed.corporateNews, 0)}`);
console.log(`  - 카페: ${asterasysKeywords.reduce((sum, k) => sum + productStats[k].managed.cafe, 0)}`);
console.log(`\n→ Asterasys: Organic ${asterasysOrganic}% / Managed ${asterasysManaged}%`);

// Competitor average (exclude 올리지오 due to data error)
console.log('\n=== Competitor Average (4개 - 올리지오 제외) ===\n');

const validCompetitors = competitorKeywords.filter(k => k !== '올리지오');
const competitorTotalOrganic = validCompetitors.reduce((sum, k) => sum + productStats[k].organic.total, 0);
const competitorTotalManaged = validCompetitors.reduce((sum, k) => sum + productStats[k].managed.total, 0);
const competitorTotalVolume = competitorTotalOrganic + competitorTotalManaged;

const competitorOrganic = Math.round((competitorTotalOrganic / competitorTotalVolume) * 100);
const competitorManaged = 100 - competitorOrganic;

console.log(`Total Organic Volume: ${competitorTotalOrganic}`);
console.log(`  - 병원블로그: ${validCompetitors.reduce((sum, k) => sum + productStats[k].organic.hospitalBlogs, 0)}`);
console.log(`  - 병원기사: ${validCompetitors.reduce((sum, k) => sum + productStats[k].organic.hospitalNews, 0)}`);
console.log(`\nTotal Managed Volume: ${competitorTotalManaged}`);
console.log(`  - 일반블로그: ${validCompetitors.reduce((sum, k) => sum + productStats[k].managed.generalBlogs, 0)}`);
console.log(`  - 기업기사: ${validCompetitors.reduce((sum, k) => sum + productStats[k].managed.corporateNews, 0)}`);
console.log(`  - 카페: ${validCompetitors.reduce((sum, k) => sum + productStats[k].managed.cafe, 0)}`);
console.log(`\n→ Competitors (덴서티, 세르프, 볼뉴머, 텐써마): Organic ${competitorOrganic}% / Managed ${competitorManaged}%`);

// Comparison
console.log('\n=== Comparison ===\n');

const gap = asterasysOrganic - competitorOrganic;
if (gap > 0) {
  console.log(`Asterasys가 경쟁사보다 Organic이 ${gap}%p 높습니다.`);
} else {
  console.log(`Asterasys가 경쟁사보다 Organic이 ${Math.abs(gap)}%p 낮습니다.`);
}

// Key insights
console.log('\n=== Key Insights ===\n');

const asterasysCafe = asterasysKeywords.reduce((sum, k) => sum + productStats[k].managed.cafe, 0);
const competitorCafe = competitorKeywords.reduce((sum, k) => sum + productStats[k].managed.cafe, 0);

console.log(`1. 카페 활용도:`);
console.log(`   - Asterasys: ${asterasysCafe}건 (쿨페이즈 598 + 쿨소닉 522 + 리프테라 430)`);
console.log(`   - Competitors: ${competitorCafe}건`);
console.log(`   → Asterasys가 ${asterasysCafe - competitorCafe}건 더 많이 사용 (${((asterasysCafe / competitorCafe - 1) * 100).toFixed(1)}% 높음)\n`);

console.log(`2. Managed 전략의 현실:`);
console.log(`   - 카페 인위 바이럴에 집중하고 있음`);
console.log(`   - Managed ${asterasysManaged}%는 시장 초기 진입 전략으로 적절\n`);

console.log(`3. Organic 개선 방향:`);
console.log(`   - 병원블로그 비중 증가 (현재 ${asterasysKeywords.reduce((sum, k) => sum + productStats[k].organic.hospitalBlogs, 0)}건)`);
console.log(`   - 병원 네트워크 확대를 통한 자발적 콘텐츠 증가`);
console.log(`   - 카페 의존도 점진적 감소\n`);

// Save results
const output = {
  asterasys: {
    organic: asterasysOrganic,
    managed: asterasysManaged,
    details: {
      organicVolume: asterasysTotalOrganic,
      managedVolume: asterasysTotalManaged,
      cafeVolume: asterasysCafe
    }
  },
  competitor: {
    organic: competitorOrganic,
    managed: competitorManaged,
    details: {
      organicVolume: competitorTotalOrganic,
      managedVolume: competitorTotalManaged,
      cafeVolume: competitorCafe
    }
  },
  gap: gap,
  products: productStats
};

fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'processed', 'organic-viral-analysis.json'),
  JSON.stringify(output, null, 2)
);

console.log('✅ Analysis complete. Results saved to data/processed/organic-viral-analysis.json');
