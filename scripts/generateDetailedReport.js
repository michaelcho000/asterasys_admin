#!/usr/bin/env node

/**
 * YouTube 상세 정량적 분석 보고서 생성
 * 18개 제품 모든 데이터의 정확한 수치 출력
 */

const fs = require('fs');
const path = require('path');

async function generateDetailedReport() {
  try {
    // 처리된 데이터 로드
    const csvPath = path.join(process.cwd(), 'data', 'processed', 'youtube', 'youtube_market_share.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      return row;
    });

    // 전체 시장 통계
    const totalVideos = data.reduce((sum, row) => sum + parseInt(row['비디오수'] || 0), 0);
    const totalViews = data.reduce((sum, row) => sum + parseInt(row['총조회수'] || 0), 0);
    const totalChannels = data.reduce((sum, row) => sum + parseInt(row['채널수'] || 0), 0);

    console.log('='.repeat(80));
    console.log('📊 YouTube 의료기기 시장 완전 분석 보고서');
    console.log('='.repeat(80));
    console.log(`📅 분석 기준일: 2025-08-28`);
    console.log(`📊 총 비디오: ${totalVideos.toLocaleString()}개`);
    console.log(`👁️ 총 조회수: ${totalViews.toLocaleString()}회`);
    console.log(`📺 총 채널수: ${totalChannels.toLocaleString()}개`);
    console.log(`🏥 분석 제품: 18개 (RF 9개 + HIFU 9개)`);

    console.log('\n' + '─'.repeat(120));
    console.log('📈 전체 18개 제품 상세 순위표 (YouTube 성과 기준)');
    console.log('─'.repeat(120));
    console.log('순위 | 제품명      | 카테고리 | 시장순위 | 회사        | 비디오수 | 점유율   | 총조회수      | 조회수점유율 | 평균조회수 | 참여도   | 채널수');
    console.log('─'.repeat(120));

    data.forEach((row, index) => {
      const rank = (index + 1).toString().padStart(2);
      const device = row['디바이스명'].padEnd(8);
      const category = row['카테고리'].padStart(4);
      const marketRank = row['시장랭킹'].padStart(2);
      const company = row['회사'].padEnd(8);
      const videoCount = parseInt(row['비디오수']).toLocaleString().padStart(6);
      const videoShare = (row['비디오점유율%'] + '%').padStart(6);
      const totalViews = parseInt(row['총조회수']).toLocaleString().padStart(10);
      const viewShare = (row['조회수점유율%'] + '%').padStart(6);
      const avgViews = parseInt(row['평균조회수']).toLocaleString().padStart(7);
      const engagement = (row['참여도%'] + '%').padStart(6);
      const channels = row['채널수'].padStart(4);
      
      const isAsterasys = row['Asterasys여부'] === 'Y' ? '⭐' : '  ';
      
      console.log(`${isAsterasys}${rank} | ${device} | ${category}   | ${marketRank}위     | ${company} | ${videoCount} | ${videoShare} | ${totalViews} | ${viewShare}   | ${avgViews} | ${engagement} | ${channels}`);
    });

    console.log('─'.repeat(120));

    // 카테고리별 분석
    const rfData = data.filter(row => row['카테고리'] === 'RF');
    const hifuData = data.filter(row => row['카테고리'] === 'HIFU');

    console.log('\n📊 카테고리별 세부 분석');
    console.log('─'.repeat(60));

    // RF 카테고리 분석
    const rfTotalVideos = rfData.reduce((sum, row) => sum + parseInt(row['비디오수']), 0);
    const rfTotalViews = rfData.reduce((sum, row) => sum + parseInt(row['총조회수']), 0);
    
    console.log('⚡ RF (고주파) 카테고리 - 9개 제품');
    console.log(`  📊 총 비디오: ${rfTotalVideos.toLocaleString()}개`);
    console.log(`  👁️ 총 조회수: ${rfTotalViews.toLocaleString()}회`);
    console.log(`  📱 평균 조회수: ${Math.round(rfTotalViews/rfTotalVideos).toLocaleString()}회`);
    
    console.log('\n  상위 5개 RF 제품:');
    rfData.slice(0, 5).forEach((row, index) => {
      const isAsterasys = row['Asterasys여부'] === 'Y' ? '⭐' : '  ';
      const marketRankChange = parseInt(row['시장랭킹']) !== (index + 1) ? ` (시장 ${row['시장랭킹']}위)` : '';
      console.log(`${isAsterasys}  ${index + 1}. ${row['디바이스명']}: ${parseInt(row['비디오수']).toLocaleString()}개 비디오, ${parseInt(row['총조회수']).toLocaleString()}회 조회${marketRankChange}`);
    });

    // HIFU 카테고리 분석  
    const hifuTotalVideos = hifuData.reduce((sum, row) => sum + parseInt(row['비디오수']), 0);
    const hifuTotalViews = hifuData.reduce((sum, row) => sum + parseInt(row['총조회수']), 0);
    
    console.log('\n🌊 HIFU (초음파) 카테고리 - 9개 제품');
    console.log(`  📊 총 비디오: ${hifuTotalVideos.toLocaleString()}개`);
    console.log(`  👁️ 총 조회수: ${hifuTotalViews.toLocaleString()}회`);
    console.log(`  📱 평균 조회수: ${Math.round(hifuTotalViews/hifuTotalVideos).toLocaleString()}회`);
    
    console.log('\n  상위 5개 HIFU 제품:');
    hifuData.slice(0, 5).forEach((row, index) => {
      const isAsterasys = row['Asterasys여부'] === 'Y' ? '⭐' : '  ';
      const marketRankChange = parseInt(row['시장랭킹']) !== (index + 1) ? ` (시장 ${row['시장랭킹']}위)` : '';
      console.log(`${isAsterasys}  ${index + 1}. ${row['디바이스명']}: ${parseInt(row['비디오수']).toLocaleString()}개 비디오, ${parseInt(row['총조회수']).toLocaleString()}회 조회${marketRankChange}`);
    });

    // Asterasys 심층 분석
    const asterasysData = data.filter(row => row['Asterasys여부'] === 'Y');
    const asterasysTotalVideos = asterasysData.reduce((sum, row) => sum + parseInt(row['비디오수']), 0);
    const asterasysTotalViews = asterasysData.reduce((sum, row) => sum + parseInt(row['총조회수']), 0);
    const asterasysTotalChannels = asterasysData.reduce((sum, row) => sum + parseInt(row['채널수']), 0);

    console.log('\n⭐ Asterasys 제품 상세 분석');
    console.log('─'.repeat(80));
    console.log(`📊 Asterasys 전체 성과:`);
    console.log(`  총 비디오 수: ${asterasysTotalVideos.toLocaleString()}개 (전체 시장의 ${((asterasysTotalVideos/totalVideos)*100).toFixed(2)}%)`);
    console.log(`  총 조회수: ${asterasysTotalViews.toLocaleString()}회 (전체 시장의 ${((asterasysTotalViews/totalViews)*100).toFixed(2)}%)`);
    console.log(`  평균 조회수: ${Math.round(asterasysTotalViews/asterasysTotalVideos).toLocaleString()}회/비디오`);
    console.log(`  활성 채널수: ${asterasysTotalChannels}개 (전체 시장의 ${((asterasysTotalChannels/totalChannels)*100).toFixed(2)}%)`);

    console.log('\n📊 Asterasys 제품별 정량 데이터:');
    asterasysData.forEach((row, index) => {
      const ytRank = data.findIndex(d => d['디바이스명'] === row['디바이스명']) + 1;
      console.log(`\n  ${index + 1}. ${row['디바이스명']} (${row['카테고리']})`);
      console.log(`     YouTube 순위: ${ytRank}위 / 18위 (시장순위: ${row['시장랭킹']}위)`);
      console.log(`     비디오 수: ${parseInt(row['비디오수']).toLocaleString()}개`);
      console.log(`     총 조회수: ${parseInt(row['총조회수']).toLocaleString()}회`);
      console.log(`     평균 조회수: ${parseInt(row['평균조회수']).toLocaleString()}회`);
      console.log(`     참여도: ${row['참여도%']}%`);
      console.log(`     활성 채널: ${row['채널수']}개`);
      console.log(`     시장점유율: ${row['비디오점유율%']}% (비디오 기준), ${row['조회수점유율%']}% (조회수 기준)`);
    });

    // 경쟁사 벤치마킹
    const topCompetitors = data.filter(row => row['Asterasys여부'] === 'N').slice(0, 5);
    
    console.log('\n🏆 상위 5개 경쟁사 벤치마킹');
    console.log('─'.repeat(80));
    topCompetitors.forEach((row, index) => {
      console.log(`${index + 1}. ${row['디바이스명']} (${row['카테고리']}) - ${row['회사']}`);
      console.log(`   비디오: ${parseInt(row['비디오수']).toLocaleString()}개 | 조회수: ${parseInt(row['총조회수']).toLocaleString()}회`);
      console.log(`   평균: ${parseInt(row['평균조회수']).toLocaleString()}회/비디오 | 참여도: ${row['참여도%']}% | 채널: ${row['채널수']}개`);
      console.log(`   시장점유율: ${row['비디오점유율%']}% (비디오), ${row['조회수점유율%']}% (조회수)`);
    });

    // 시장 갭 분석
    console.log('\n📉 Asterasys vs 경쟁사 갭 분석');
    console.log('─'.repeat(60));
    
    const topCompetitor = data[0]; // 울쎄라
    const topAsterasys = asterasysData.sort((a, b) => parseInt(b['비디오수']) - parseInt(a['비디오수']))[0]; // 쿨소닉
    
    const videoGap = Math.round(parseInt(topCompetitor['비디오수']) / parseInt(topAsterasys['비디오수']));
    const viewGap = Math.round(parseInt(topCompetitor['총조회수']) / parseInt(topAsterasys['총조회수']));
    const channelGap = Math.round(parseInt(topCompetitor['채널수']) / parseInt(topAsterasys['채널수']));
    
    console.log(`🥇 시장 1위 (${topCompetitor['디바이스명']}) vs ⭐ Asterasys 최고제품 (${topAsterasys['디바이스명']}):`);
    console.log(`  비디오 수 갭: ${videoGap}배 차이 (${topCompetitor['비디오수']}개 vs ${topAsterasys['비디오수']}개)`);
    console.log(`  조회수 갭: ${viewGap}배 차이 (${parseInt(topCompetitor['총조회수']).toLocaleString()}회 vs ${parseInt(topAsterasys['총조회수']).toLocaleString()}회)`);
    console.log(`  채널수 갭: ${channelGap}배 차이 (${topCompetitor['채널수']}개 vs ${topAsterasys['채널수']}개)`);

    // 성장 목표 계산
    console.log('\n🎯 성장 목표 시뮬레이션');
    console.log('─'.repeat(60));
    
    const targetShare5Percent = Math.ceil(totalVideos * 0.05); // 5% 점유율 목표
    const currentAsterasysVideos = asterasysTotalVideos;
    const requiredGrowth = targetShare5Percent - currentAsterasysVideos;
    
    console.log(`현재 Asterasys 총 비디오: ${currentAsterasysVideos}개`);
    console.log(`5% 점유율 달성 목표: ${targetShare5Percent}개`);
    console.log(`필요한 추가 비디오: ${requiredGrowth}개 (${Math.round(requiredGrowth/currentAsterasysVideos)}배 증가)`);
    console.log(`월간 목표 (12개월 계획): ${Math.ceil(requiredGrowth/12)}개/월`);

    // 상세 매트릭스 출력
    console.log('\n📊 완전 정량 데이터 매트릭스');
    console.log('─'.repeat(140));
    console.log('제품명'.padEnd(12) + '카테고리'.padStart(6) + '시장순위'.padStart(6) + 'YT순위'.padStart(6) + 
              '비디오수'.padStart(8) + '점유율%'.padStart(8) + '총조회수'.padStart(12) + '조회수점유%'.padStart(10) + 
              '평균조회수'.padStart(10) + '참여도%'.padStart(8) + '채널수'.padStart(6) + '회사명'.padStart(12));
    console.log('─'.repeat(140));

    data.forEach((row, index) => {
      const ytRank = index + 1;
      const isAsterasys = row['Asterasys여부'] === 'Y' ? '⭐' : '  ';
      
      console.log(
        isAsterasys + 
        row['디바이스명'].padEnd(10) + 
        row['카테고리'].padStart(6) + 
        (row['시장랭킹'] + '위').padStart(6) +
        (ytRank + '위').padStart(6) +
        parseInt(row['비디오수']).toLocaleString().padStart(8) +
        row['비디오점유율%'].padStart(7) +
        parseInt(row['총조회수']).toLocaleString().padStart(12) +
        row['조회수점유율%'].padStart(9) +
        parseInt(row['평균조회수']).toLocaleString().padStart(10) +
        row['참여도%'].padStart(7) +
        row['채널수'].padStart(6) +
        row['회사'].padStart(12)
      );
    });

    console.log('─'.repeat(140));
    console.log('\n📋 범례:');
    console.log('⭐ = Asterasys 제품 (쿨페이즈, 쿨소닉, 리프테라)');
    console.log('시장순위 = 실제 의료기기 시장 순위 (매출/점유율 기준)');
    console.log('YT순위 = YouTube 비디오 수 기준 순위');
    console.log('참여도 = (좋아요 + 댓글) / 조회수 × 100%');

  } catch (error) {
    console.error('❌ 보고서 생성 실패:', error.message);
  }
}

generateDetailedReport();