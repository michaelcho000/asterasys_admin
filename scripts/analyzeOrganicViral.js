const fs = require('fs');
const path = require('path');

// Load data files
const dataPath = path.join(__dirname, '..', 'data', 'raw', '2025-09');
const youtubeData = JSON.parse(fs.readFileSync(path.join(dataPath, 'dataset_youtube-scraper_2025-09.json'), 'utf-8'));
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

// 1. Analyze YouTube engagement
console.log('\n=== YouTube Engagement Analysis ===\n');

const youtubeStats = {};
asterasysKeywords.concat(competitorKeywords).forEach(keyword => {
  const videos = youtubeData.filter(v => v.input === keyword);
  const totalViews = videos.reduce((sum, v) => sum + (v.viewCount || 0), 0);
  const totalComments = videos.reduce((sum, v) => sum + (v.commentsCount || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
  const engagement = totalViews + totalComments * 10; // Weight comments 10x (more valuable)

  youtubeStats[keyword] = {
    videoCount: videos.length,
    totalViews,
    totalComments,
    totalLikes,
    avgViews: videos.length > 0 ? Math.round(totalViews / videos.length) : 0,
    engagement
  };

  console.log(`${keyword}:`);
  console.log(`  Videos: ${videos.length}`);
  console.log(`  Total Views: ${totalViews.toLocaleString()}`);
  console.log(`  Total Comments: ${totalComments}`);
  console.log(`  Avg Views: ${youtubeStats[keyword].avgViews.toLocaleString()}`);
  console.log(`  Engagement Score: ${engagement.toLocaleString()}\n`);
});

// 2. Analyze Blog ratio (hospital vs general)
console.log('\n=== Blog Analysis (Hospital vs General) ===\n');

const blogRows = parseCSV(blogData);
const blogStats = {};

asterasysKeywords.concat(competitorKeywords).forEach(keyword => {
  const rows = blogRows.filter(r => r['키워드'] === keyword);
  const hospitalBlogs = rows.filter(r => r['블로그유형'] === '병원블로그')
    .reduce((sum, r) => sum + parseInt(r['총 개수'] || 0), 0);
  const generalBlogs = rows.filter(r => r['블로그유형'] === '일반블로그')
    .reduce((sum, r) => sum + parseInt(r['총 개수'] || 0), 0);
  const total = hospitalBlogs + generalBlogs;

  blogStats[keyword] = {
    hospital: hospitalBlogs,
    general: generalBlogs,
    total,
    hospitalRatio: total > 0 ? (hospitalBlogs / total * 100) : 0
  };

  console.log(`${keyword}: Hospital ${hospitalBlogs} / General ${generalBlogs} = ${blogStats[keyword].hospitalRatio.toFixed(1)}%`);
});

// 3. Analyze News (hospital vs corporate)
console.log('\n=== News Analysis (Hospital vs Corporate) ===\n');

const newsRows = parseCSV(newsData);
const newsStats = {};

asterasysKeywords.concat(competitorKeywords).forEach(keyword => {
  const row = newsRows.find(r => r['product_name'] === keyword);
  if (row) {
    const hospitalNews = parseFloat(row['category_병원발행'] || 0);
    const corporateNews = parseFloat(row['category_기업소식'] || 0);

    newsStats[keyword] = {
      hospital: hospitalNews,
      corporate: corporateNews,
      hospitalRatio: hospitalNews
    };

    console.log(`${keyword}: Hospital ${hospitalNews.toFixed(1)}% / Corporate ${corporateNews.toFixed(1)}%`);
  } else {
    newsStats[keyword] = { hospital: 0, corporate: 0, hospitalRatio: 0 };
    console.log(`${keyword}: No data`);
  }
});

// 4. Calculate Organic Score
console.log('\n=== Organic Score Calculation ===\n');
console.log('Formula: Blog(40%) + News(30%) + YouTube(30%)\n');

// Normalize YouTube engagement (scale to 0-100)
const maxEngagement = Math.max(...Object.values(youtubeStats).map(s => s.engagement));

const organicScores = {};
asterasysKeywords.concat(competitorKeywords).forEach(keyword => {
  const blogScore = blogStats[keyword]?.hospitalRatio || 0;
  const newsScore = newsStats[keyword]?.hospitalRatio || 0;
  const youtubeScore = maxEngagement > 0
    ? (youtubeStats[keyword]?.engagement / maxEngagement * 100)
    : 0;

  const organicScore = (blogScore * 0.4) + (newsScore * 0.3) + (youtubeScore * 0.3);
  const managedScore = 100 - organicScore;

  organicScores[keyword] = {
    organic: Math.round(organicScore),
    managed: Math.round(managedScore),
    breakdown: {
      blog: blogScore.toFixed(1),
      news: newsScore.toFixed(1),
      youtube: youtubeScore.toFixed(1)
    }
  };

  console.log(`${keyword}:`);
  console.log(`  Blog: ${blogScore.toFixed(1)}% × 0.4 = ${(blogScore * 0.4).toFixed(1)}`);
  console.log(`  News: ${newsScore.toFixed(1)}% × 0.3 = ${(newsScore * 0.3).toFixed(1)}`);
  console.log(`  YouTube: ${youtubeScore.toFixed(1)}% × 0.3 = ${(youtubeScore * 0.3).toFixed(1)}`);
  console.log(`  → Organic: ${organicScores[keyword].organic}% / Managed: ${organicScores[keyword].managed}%\n`);
});

// 5. Asterasys vs Competitors
console.log('\n=== Asterasys vs Competitors Summary ===\n');

const asterasysAvg = {
  organic: Math.round(asterasysKeywords.reduce((sum, k) => sum + organicScores[k].organic, 0) / asterasysKeywords.length),
  managed: 0
};
asterasysAvg.managed = 100 - asterasysAvg.organic;

const competitorAvg = {
  organic: Math.round(competitorKeywords.reduce((sum, k) => sum + organicScores[k].organic, 0) / competitorKeywords.length),
  managed: 0
};
competitorAvg.managed = 100 - competitorAvg.organic;

console.log(`Asterasys (쿨페이즈, 리프테라, 쿨소닉): Organic ${asterasysAvg.organic}% / Managed ${asterasysAvg.managed}%`);
console.log(`Competitors (5개 평균): Organic ${competitorAvg.organic}% / Managed ${competitorAvg.managed}%`);
console.log(`\nGap: ${competitorAvg.organic - asterasysAvg.organic}%p (경쟁사가 더 높음)`);

// 6. Top Competitor YouTube Content Analysis
console.log('\n=== Top Competitor YouTube Content Strategies ===\n');

competitorKeywords.forEach(keyword => {
  const videos = youtubeData.filter(v => v.input === keyword);
  const topVideos = videos
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 3);

  console.log(`\n${keyword} - Top 3 Videos:`);
  topVideos.forEach((v, i) => {
    console.log(`  ${i + 1}. ${v.title}`);
    console.log(`     Views: ${(v.viewCount || 0).toLocaleString()}, Comments: ${v.commentsCount || 0}, Likes: ${v.likes || 0}`);
    console.log(`     Channel: ${v.channelUsername}`);
  });
});

// 7. Content Strategy Recommendations
console.log('\n\n=== Content Strategy Recommendations ===\n');

console.log('1. YouTube 참여도 증가 전략:');
console.log('   - 경쟁사 대비 YouTube 참여도가 낮음');
console.log('   - 병원 채널에서 시술 후기, 의사 인터뷰 콘텐츠 제작');
console.log('   - 댓글 유도 콘텐츠 (Q&A, 시술 전후 비교)\n');

console.log('2. 병원 블로그 증가 전략:');
console.log(`   - 현재 병원블로그 비중: ${blogStats['쿨페이즈']?.hospitalRatio.toFixed(1)}% (쿨페이즈)`);
console.log('   - 목표: 60% 이상 (경쟁사 평균 초과)');
console.log('   - 병원 네트워크 확대 (현재 → +30개 병원)\n');

console.log('3. 병원 발행 기사 증가:');
console.log(`   - 쿨페이즈 병원기사: ${newsStats['쿨페이즈']?.hospitalRatio.toFixed(1)}%`);
console.log(`   - 쿨소닉 병원기사: ${newsStats['쿨소닉']?.hospitalRatio.toFixed(1)}%`);
console.log('   - KOL 의사와 협력하여 병원 발행 보도자료 작성\n');

console.log('4. Managed → Organic 전환 로드맵:');
console.log(`   - Q4 2025: Organic ${asterasysAvg.organic + 6}% (병원 네트워크 30개 확대)`);
console.log(`   - Q1 2026: Organic ${asterasysAvg.organic + 11}% (경쟁사 평균 도달)`);
console.log(`   - Q2 2026: Organic ${asterasysAvg.organic + 16}% (경쟁사 평균 초과)\n`);

// Save results
const output = {
  asterasys: asterasysAvg,
  competitor: competitorAvg,
  gap: competitorAvg.organic - asterasysAvg.organic,
  details: organicScores,
  youtube: youtubeStats,
  blog: blogStats,
  news: newsStats
};

fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'processed', 'organic-viral-analysis.json'),
  JSON.stringify(output, null, 2)
);

console.log('\n✅ Analysis complete. Results saved to data/processed/organic-viral-analysis.json');
