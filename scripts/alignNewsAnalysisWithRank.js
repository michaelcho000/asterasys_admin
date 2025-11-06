#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/**
 * news analysis.csv의 total_articles를 news_rank.csv의 총 발행량에 맞춰 조정
 *
 * 사용법:
 *   node scripts/alignNewsAnalysisWithRank.js --month=2025-10
 */

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

async function main() {
  try {
    const args = parseArgs(process.argv);
    const month = args.month || '2025-10';

    console.log('🔄 news analysis와 news_rank 동기화 시작...');
    console.log(`📅 대상 월: ${month}`);

    // 1. news_rank.csv 읽기
    const newsRankPath = path.join(process.cwd(), 'public', 'data', 'raw', month, 'asterasys_total_data - news_rank.csv');
    const newsRankContent = fs.readFileSync(newsRankPath, 'utf-8');
    const newsRankRecords = parse(newsRankContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });

    console.log(`\n📊 news_rank 데이터:`);
    const rankMap = {};
    let totalRank = 0;

    newsRankRecords.forEach(record => {
      const productName = record['키워드'];
      const publishCount = parseInt(record['총 발행량']) || 0;
      rankMap[productName] = publishCount;
      totalRank += publishCount;
      console.log(`   ${productName}: ${publishCount}건`);
    });

    console.log(`\n   총합: ${totalRank}건`);

    // 2. news analysis.csv 읽기
    const newsAnalysisPath = path.join(process.cwd(), 'data', 'raw', month, 'asterasys_total_data - news analysis.csv');
    const newsAnalysisContent = fs.readFileSync(newsAnalysisPath, 'utf-8');
    const cleanContent = newsAnalysisContent.replace(/^\uFEFF/, '');
    const newsAnalysisRecords = parse(cleanContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true
    });

    console.log(`\n📊 news analysis 현재 데이터:`);
    let totalAnalysis = 0;
    newsAnalysisRecords.forEach(record => {
      const articles = parseInt(record.total_articles) || 0;
      totalAnalysis += articles;
      console.log(`   ${record.product_name}: ${articles}건`);
    });
    console.log(`\n   총합: ${totalAnalysis}건`);
    console.log(`\n   차이: ${totalAnalysis - totalRank}건 (news analysis가 ${totalAnalysis > totalRank ? '더 많음' : '더 적음'})`);

    // 3. total_articles 조정
    console.log(`\n🔄 total_articles 조정 중...`);
    const updatedRecords = [];
    let newTotal = 0;

    newsAnalysisRecords.forEach(record => {
      const productName = record.product_name;
      const newArticles = rankMap[productName] !== undefined ? rankMap[productName] : 0;
      const oldArticles = parseInt(record.total_articles) || 0;

      // total_articles 업데이트
      record.total_articles = newArticles;

      // 비율 계산 (다른 지표들도 비율에 맞춰 조정)
      const ratio = oldArticles > 0 ? newArticles / oldArticles : 0;

      // 일일 평균 조정
      if (record.avg_daily_articles && oldArticles > 0) {
        record.avg_daily_articles = (parseFloat(record.avg_daily_articles) * ratio).toFixed(1);
      }

      // 최대 일일 기사 조정
      if (record.max_daily_articles && oldArticles > 0) {
        record.max_daily_articles = Math.max(1, Math.round(parseFloat(record.max_daily_articles) * ratio));
      }

      // 피크 기사 수 조정
      if (record.peak_articles && oldArticles > 0) {
        record.peak_articles = Math.max(1, Math.round(parseFloat(record.peak_articles) * ratio));
      }

      // 숫자 프로모션 조정
      if (record.number_promotion_articles && oldArticles > 0) {
        record.number_promotion_articles = Math.round(parseFloat(record.number_promotion_articles) * ratio);
      }

      // 마케팅 키워드 점수 조정
      if (record.marketing_keyword_score && oldArticles > 0) {
        record.marketing_keyword_score = Math.round(parseFloat(record.marketing_keyword_score) * ratio);
      }

      // 캠페인 강도 재계산
      const maxDaily = parseInt(record.max_daily_articles) || 0;
      const spikeCount = parseInt(record.spike_dates_count) || 0;

      if (maxDaily >= 15 || spikeCount >= 5) {
        record.campaign_intensity = 'HIGH';
        record.campaign_score = 0.8;
      } else if (maxDaily >= 8 || spikeCount >= 2) {
        record.campaign_intensity = 'MEDIUM';
        record.campaign_score = 0.6;
      } else if (maxDaily >= 5 || spikeCount >= 1) {
        record.campaign_intensity = 'LOW';
        record.campaign_score = 0.3;
      } else {
        record.campaign_intensity = 'NONE';
        record.campaign_score = 0.0;
      }

      updatedRecords.push(record);
      newTotal += newArticles;

      console.log(`   ${productName}: ${oldArticles} → ${newArticles}건 (${ratio.toFixed(2)}x)`);
    });

    // 발행량 순으로 정렬
    updatedRecords.sort((a, b) => parseInt(b.total_articles) - parseInt(a.total_articles));

    console.log(`\n📈 조정 완료:`);
    console.log(`   새 총합: ${newTotal}건 (목표: ${totalRank}건)`);
    console.log(`   일치 여부: ${newTotal === totalRank ? '✅ 일치' : '⚠️ 불일치'}`);

    // 4. CSV 저장
    const headers = Object.keys(updatedRecords[0]);
    const csvLines = [
      headers.join(','),
      ...updatedRecords.map(record =>
        headers.map(header => {
          const value = record[header];
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
      fs.writeFileSync(outputPath, csvContent, 'utf-8');
      console.log(`\n💾 저장 완료: ${outputPath}`);
    });

    console.log('\n🎉 동기화 완료!');

    // 5. Asterasys 제품 순위 확인
    console.log('\n⭐ Asterasys 제품 순위:');
    updatedRecords.forEach((record, index) => {
      if (['쿨페이즈', '리프테라', '쿨소닉'].includes(record.product_name)) {
        console.log(`   ${index + 1}위: ${record.product_name} (${record.total_articles}건)`);
      }
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

main();
