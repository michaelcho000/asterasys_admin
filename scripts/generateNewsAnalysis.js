#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/**
 * 개별 제품 뉴스 CSV 파일들을 분석하여 news analysis.csv 생성
 *
 * 사용법:
 *   node scripts/generateNewsAnalysis.js --month=2025-10
 */

const PRODUCT_NAMES = [
  '덴서티', '리니어지', '리프테라', '볼뉴머', '브이로', '세르프',
  '슈링크', '써마지', '올리지오', '울쎄라', '인모드',
  '쿨소닉', '쿨페이즈', '텐써마', '텐쎄라', '튠라이너', '튠페이스', '리니어펌'
];

const ASTERASYS_PRODUCTS = ['쿨페이즈', '리프테라', '쿨소닉'];

const CATEGORY_MAP = {
  '기업소식': 'category_기업소식',
  '병원발행': 'category_병원발행',
  '연예인': 'category_연예인',
  '투자·주식': 'category_투자·주식',
  '고객반응': 'category_고객반응',
  '기술자료': 'category_기술자료',
  '의학': 'category_의학',
  '기타': 'category_기타'
};

const COMPETITORS = ['울쎄라', '써마지', '인모드', '슈링크', '볼뉴머', '올리지오'];

function parseArgs(argv) {
  return argv.slice(2).reduce((acc, item) => {
    if (!item.startsWith('--')) return acc;
    const [rawKey, rawValue] = item.replace(/^--/, '').split('=');
    const key = rawKey.trim();
    const value = rawValue === undefined ? true : rawValue.trim();
    acc[key] = value;
    return acc;
  }, {});
}

function analyzeProduct(productName, newsFilePath) {
  console.log(`\n📊 ${productName} 분석 중...`);

  if (!fs.existsSync(newsFilePath)) {
    console.log(`   ⚠️  파일 없음: ${newsFilePath}`);
    return null;
  }

  const csvContent = fs.readFileSync(newsFilePath, 'utf-8');

  // BOM 제거
  const cleanContent = csvContent.replace(/^\uFEFF/, '');

  let records;
  try {
    records = parse(cleanContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true
    });
  } catch (error) {
    console.log(`   ❌ 파싱 실패: ${error.message}`);
    return null;
  }

  if (records.length === 0) {
    console.log(`   ⚠️  데이터 없음`);
    return {
      product_name: productName,
      total_articles: 0,
      analysis_period: '',
      avg_daily_articles: 0,
      max_daily_articles: 0,
      dominant_category: '',
      dominant_percentage: 0,
      category_기업소식: 0,
      category_병원발행: 0,
      category_연예인: 0,
      'category_투자·주식': 0,
      category_고객반응: 0,
      category_기술자료: 0,
      category_의학: 0,
      category_기타: 0,
      campaign_intensity: 'NONE',
      campaign_score: 0.0,
      spike_dates_count: 0,
      peak_date: '',
      peak_articles: 0,
      number_promotion_articles: 0,
      unique_numbers_count: 0,
      celebrity_usage: '없음',
      marketing_keyword_score: 0,
      competitor_mentions_count: 0,
      top_competitor_mentioned: '없음',
      competitor_mentions_detail: '없음'
    };
  }

  // 1. 기본 통계
  const totalArticles = records.length;

  // 2. 날짜 분석
  const dates = records
    .map(r => r.published_at?.substring(0, 10))
    .filter(d => d && d.length === 10)
    .sort();

  const startDate = dates.length > 0 ? dates[0] : '';
  const endDate = dates.length > 0 ? dates[dates.length - 1] : '';
  const analysisPeriod = dates.length > 0 ? `${startDate} ~ ${endDate}` : '';

  // 일별 기사 수 계산
  const dailyCounts = {};
  dates.forEach(date => {
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  const dailyValues = Object.values(dailyCounts);
  const avgDaily = dailyValues.length > 0
    ? (dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length).toFixed(1)
    : 0;
  const maxDaily = dailyValues.length > 0 ? Math.max(...dailyValues) : 0;

  // 피크 날짜
  const peakDate = Object.entries(dailyCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  // 3. 카테고리 분석
  const categoryCounts = {};
  records.forEach(record => {
    const category = record.analysis_category || '기타';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  const categoryPercentages = {};
  Object.keys(CATEGORY_MAP).forEach(cat => {
    const count = categoryCounts[cat] || 0;
    categoryPercentages[cat] = ((count / totalArticles) * 100).toFixed(1);
  });

  // 지배적 카테고리
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]);
  const dominantCategory = sortedCategories[0]?.[0] || '기타';
  const dominantPercentage = ((sortedCategories[0]?.[1] || 0) / totalArticles * 100).toFixed(1);

  // 4. 캠페인 강도 분석
  const spikeDates = Object.entries(dailyCounts).filter(([_, count]) => count >= 5).length;
  let campaignIntensity = 'NONE';
  let campaignScore = 0.0;

  if (maxDaily >= 15 || spikeDates >= 5) {
    campaignIntensity = 'HIGH';
    campaignScore = 0.8;
  } else if (maxDaily >= 8 || spikeDates >= 2) {
    campaignIntensity = 'MEDIUM';
    campaignScore = 0.6;
  } else if (maxDaily >= 5 || spikeDates >= 1) {
    campaignIntensity = 'LOW';
    campaignScore = 0.3;
  }

  // 5. 숫자 프로모션 분석 (제목에 숫자 포함)
  const numberPattern = /\d{1,3}(만|천)?원|[0-9]+%|[0-9]+회/g;
  let numberPromotionArticles = 0;
  const uniqueNumbers = new Set();

  records.forEach(record => {
    const title = record.title || '';
    const matches = title.match(numberPattern);
    if (matches) {
      numberPromotionArticles++;
      matches.forEach(m => uniqueNumbers.add(m));
    }
  });

  // 6. 연예인 언급 분석
  const celebrities = ['전지현', '이민호', '김태희', '수지', '송혜교', '한소희'];
  const celebrityMentions = {};

  records.forEach(record => {
    const text = `${record.title || ''} ${record.text || ''}`;
    celebrities.forEach(celeb => {
      if (text.includes(celeb)) {
        celebrityMentions[celeb] = (celebrityMentions[celeb] || 0) + 1;
      }
    });
  });

  const celebrityUsage = Object.keys(celebrityMentions).length > 0
    ? Object.entries(celebrityMentions)
        .map(([name, count]) => `${name}(${count})`)
        .join('; ')
    : '없음';

  // 7. 마케팅 키워드 점수
  const marketingKeywords = ['할인', '이벤트', '프로모션', '특가', '무료', '증정', '경품'];
  let marketingScore = 0;

  records.forEach(record => {
    const text = `${record.title || ''} ${record.text || ''}`;
    marketingKeywords.forEach(keyword => {
      if (text.includes(keyword)) marketingScore++;
    });
  });

  // 8. 경쟁사 언급 분석
  const competitorMentions = {};

  records.forEach(record => {
    const text = `${record.title || ''} ${record.text || ''}`;
    COMPETITORS.forEach(comp => {
      if (text.includes(comp)) {
        competitorMentions[comp] = (competitorMentions[comp] || 0) + 1;
      }
    });
    // 자기 자신도 카운트
    if (text.includes(productName)) {
      competitorMentions[productName] = (competitorMentions[productName] || 0) + 1;
    }
  });

  const totalCompetitorMentions = Object.keys(competitorMentions).length;
  const topCompetitor = Object.entries(competitorMentions)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '없음';

  const competitorDetail = Object.keys(competitorMentions).length > 0
    ? Object.entries(competitorMentions)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => `${name}(${count})`)
        .join('; ')
    : '없음';

  console.log(`   ✅ 총 ${totalArticles}건, ${dominantCategory} ${dominantPercentage}%`);

  return {
    product_name: productName,
    total_articles: totalArticles,
    analysis_period: analysisPeriod,
    avg_daily_articles: parseFloat(avgDaily),
    max_daily_articles: maxDaily,
    dominant_category: dominantCategory,
    dominant_percentage: parseFloat(dominantPercentage),
    category_기업소식: parseFloat(categoryPercentages['기업소식'] || 0),
    category_병원발행: parseFloat(categoryPercentages['병원발행'] || 0),
    category_연예인: parseFloat(categoryPercentages['연예인'] || 0),
    'category_투자·주식': parseFloat(categoryPercentages['투자·주식'] || 0),
    category_고객반응: parseFloat(categoryPercentages['고객반응'] || 0),
    category_기술자료: parseFloat(categoryPercentages['기술자료'] || 0),
    category_의학: parseFloat(categoryPercentages['의학'] || 0),
    category_기타: parseFloat(categoryPercentages['기타'] || 0),
    campaign_intensity: campaignIntensity,
    campaign_score: campaignScore,
    spike_dates_count: spikeDates,
    peak_date: peakDate,
    peak_articles: maxDaily,
    number_promotion_articles: numberPromotionArticles,
    unique_numbers_count: uniqueNumbers.size,
    celebrity_usage: celebrityUsage,
    marketing_keyword_score: marketingScore,
    competitor_mentions_count: totalCompetitorMentions,
    top_competitor_mentioned: topCompetitor,
    competitor_mentions_detail: competitorDetail
  };
}

async function main() {
  try {
    const args = parseArgs(process.argv);
    const month = args.month || '2025-10';

    console.log('🚀 뉴스 분석 시작...');
    console.log(`📅 대상 월: ${month}`);
    console.log(`📁 입력 파일: 루트 폴더의 news_*.csv`);
    console.log(`📁 출력 파일: data/raw/${month}/asterasys_total_data - news analysis.csv`);

    const results = [];

    // 각 제품별 분석
    for (const productName of PRODUCT_NAMES) {
      const newsFilePath = path.join(process.cwd(), `news_${productName}.csv`);
      const analysis = analyzeProduct(productName, newsFilePath);

      if (analysis) {
        results.push(analysis);
      }
    }

    // 발행량 순으로 정렬 (많은 순)
    results.sort((a, b) => b.total_articles - a.total_articles);

    console.log('\n📈 분석 완료 요약:');
    console.log(`   총 제품 수: ${results.length}개`);
    console.log(`   총 기사 수: ${results.reduce((sum, r) => sum + r.total_articles, 0)}건`);

    console.log('\n🏆 제품별 순위 (기사 수 기준):');
    results.forEach((result, index) => {
      const isAsterasys = ASTERASYS_PRODUCTS.includes(result.product_name) ? '⭐' : '';
      console.log(`   ${index + 1}위: ${result.product_name} (${result.total_articles}건) ${isAsterasys}`);
    });

    // CSV 생성
    const headers = [
      'product_name', 'total_articles', 'analysis_period', 'avg_daily_articles', 'max_daily_articles',
      'dominant_category', 'dominant_percentage',
      'category_기업소식', 'category_병원발행', 'category_연예인', 'category_투자·주식',
      'category_고객반응', 'category_기술자료', 'category_의학', 'category_기타',
      'campaign_intensity', 'campaign_score', 'spike_dates_count',
      'peak_date', 'peak_articles',
      'number_promotion_articles', 'unique_numbers_count',
      'celebrity_usage', 'marketing_keyword_score',
      'competitor_mentions_count', 'top_competitor_mentioned', 'competitor_mentions_detail'
    ];

    const csvLines = [
      headers.join(','),
      ...results.map(result =>
        headers.map(header => {
          const value = result[header];
          // 쉼표나 세미콜론이 포함된 경우 따옴표로 감싸기
          if (typeof value === 'string' && (value.includes(',') || value.includes(';'))) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ];

    const csvContent = '\uFEFF' + csvLines.join('\n');

    // 출력 디렉토리들
    const outputPaths = [
      path.join(process.cwd(), 'data', 'raw', month, 'asterasys_total_data - news analysis.csv'),
      path.join(process.cwd(), 'public', 'data', 'raw', month, 'asterasys_total_data - news analysis.csv')
    ];

    outputPaths.forEach(outputPath => {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(outputPath, csvContent, 'utf-8');
      console.log(`\n💾 생성 완료: ${outputPath}`);
    });

    console.log('\n🎉 뉴스 분석 완료!');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

main();
