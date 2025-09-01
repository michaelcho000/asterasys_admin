#!/usr/bin/env node

/**
 * YouTube 데이터 처리 스크립트 - Node.js 버전
 * Asterasys 대시보드용 YouTube 분석 데이터 생성
 */

const fs = require('fs');
const path = require('path');

class YouTubeDataProcessor {
  constructor(jsonFilePath) {
    this.jsonFilePath = jsonFilePath;
    this.outputDir = path.join(process.cwd(), 'data', 'processed', 'youtube');
    
    // 18개 의료기기 전체 매핑 (기존 CSV 데이터와 일치)
    this.deviceMapping = {
      // RF 기기들 (9개)
      '써마지': { category: 'RF', rank: 1, company: '썸', isAsterasys: false },
      '인모드': { category: 'RF', rank: 2, company: '인바이오', isAsterasys: false },
      '쿨페이즈': { category: 'RF', rank: 3, company: 'Asterasys', isAsterasys: true }, // ⭐
      '덴서티': { category: 'RF', rank: 4, company: '칸델라', isAsterasys: false },
      '올리지오': { category: 'RF', rank: 5, company: '엘렉타', isAsterasys: false },
      '튠페이스': { category: 'RF', rank: 6, company: '알마', isAsterasys: false },
      '세르프': { category: 'RF', rank: 7, company: '클레시스', isAsterasys: false },
      '텐써마': { category: 'RF', rank: 8, company: '휴온스', isAsterasys: false },
      '볼뉴머': { category: 'RF', rank: 9, company: '클래시테크', isAsterasys: false },
      
      // HIFU 기기들 (9개)
      '울쎄라': { category: 'HIFU', rank: 1, company: '머츠', isAsterasys: false },
      '슈링크': { category: 'HIFU', rank: 2, company: '허쉬메드', isAsterasys: false },
      '쿨소닉': { category: 'HIFU', rank: 3, company: 'Asterasys', isAsterasys: true }, // ⭐
      '리프테라': { category: 'HIFU', rank: 4, company: 'Asterasys', isAsterasys: true }, // ⭐
      '리니어지': { category: 'HIFU', rank: 5, company: '클래시테크', isAsterasys: false },
      '브이로': { category: 'HIFU', rank: 6, company: '클래시테크', isAsterasys: false },
      '텐쎄라': { category: 'HIFU', rank: 7, company: '휴온스', isAsterasys: false },
      '튠라이너': { category: 'HIFU', rank: 8, company: '알마', isAsterasys: false },
      '리니어펌': { category: 'HIFU', rank: 9, company: '클래시테크', isAsterasys: false }
    };
    
    this.asterasysProducts = ['쿨페이즈', '리프테라', '쿨소닉']; // Asterasys 3개 제품
  }

  async loadData() {
    console.log('🚀 YouTube 데이터 로딩 시작...');
    console.log(`📁 파일: ${this.jsonFilePath}`);
    
    try {
      const rawData = fs.readFileSync(this.jsonFilePath, 'utf8');
      this.data = JSON.parse(rawData);
      console.log(`✅ 데이터 로드 완료: ${this.data.length.toLocaleString()}개 레코드`);
      return this;
    } catch (error) {
      console.error('❌ 데이터 로드 실패:', error.message);
      throw error;
    }
  }

  processBasicStats() {
    console.log('\n📊 기본 통계 분석...');
    
    // 검색 키워드 분포 분석
    const keywordCounts = {};
    const deviceCounts = {};
    
    this.data.forEach(video => {
      const keyword = video.input?.trim();
      if (keyword) {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        
        // 18개 제품 분류
        if (this.deviceMapping[keyword]) {
          deviceCounts[keyword] = (deviceCounts[keyword] || 0) + 1;
        }
      }
    });

    // 검색 키워드 정렬
    const sortedKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a);

    console.log('\n🔍 검색 키워드 분포 (상위 15개):');
    sortedKeywords.slice(0, 15).forEach(([keyword, count]) => {
      const isAsterasys = this.deviceMapping[keyword]?.isAsterasys ? '⭐' : '';
      const category = this.deviceMapping[keyword]?.category || '';
      console.log(`  ${keyword}${isAsterasys}: ${count.toLocaleString()}개 ${category}`);
    });

    this.keywordStats = {
      totalKeywords: Object.keys(keywordCounts).length,
      keywordCounts,
      deviceCounts,
      sortedKeywords
    };

    return this;
  }

  analyzeMarketShare() {
    console.log('\n📈 시장 점유율 분석...');
    
    const marketData = [];
    const totalVideos = this.data.length;
    const totalViews = this.data.reduce((sum, v) => sum + (parseInt(v.viewCount) || 0), 0);
    
    // 18개 제품별 분석
    Object.keys(this.deviceMapping).forEach(deviceName => {
      const deviceVideos = this.data.filter(v => v.input?.trim() === deviceName);
      const videoCount = deviceVideos.length;
      const totalDeviceViews = deviceVideos.reduce((sum, v) => sum + (parseInt(v.viewCount) || 0), 0);
      const totalLikes = deviceVideos.reduce((sum, v) => sum + (parseInt(v.likes) || 0), 0);
      const totalComments = deviceVideos.reduce((sum, v) => sum + (parseInt(v.commentsCount) || 0), 0);
      const uniqueChannels = new Set(deviceVideos.map(v => v.channelName)).size;
      
      const deviceInfo = this.deviceMapping[deviceName];
      
      marketData.push({
        deviceName,
        category: deviceInfo.category,
        marketRank: deviceInfo.rank,
        company: deviceInfo.company,
        isAsterasys: deviceInfo.isAsterasys,
        videoCount,
        videoSharePct: ((videoCount / totalVideos) * 100).toFixed(2),
        totalViews: totalDeviceViews,
        viewSharePct: totalViews > 0 ? ((totalDeviceViews / totalViews) * 100).toFixed(2) : '0.00',
        avgViews: videoCount > 0 ? Math.round(totalDeviceViews / videoCount) : 0,
        totalLikes,
        totalComments,
        engagementRate: totalDeviceViews > 0 ? (((totalLikes + totalComments) / totalDeviceViews) * 100).toFixed(3) : '0.000',
        uniqueChannels,
        avgViewsPerChannel: uniqueChannels > 0 ? Math.round(totalDeviceViews / uniqueChannels) : 0
      });
    });

    // 비디오 수 기준 정렬
    this.marketShareData = marketData.sort((a, b) => b.videoCount - a.videoCount);

    console.log('\n🏆 시장 점유율 순위 (비디오 수 기준):');
    this.marketShareData.forEach((device, index) => {
      const asterasysFlag = device.isAsterasys ? '⭐' : '  ';
      const rankChange = device.marketRank !== (index + 1) ? 
        `(시장랭킹 ${device.marketRank}위 → YouTube ${index + 1}위)` : '';
      
      console.log(`${asterasysFlag}${index + 1}. ${device.deviceName} (${device.category})`);
      console.log(`    비디오: ${device.videoCount.toLocaleString()}개 (${device.videoSharePct}%)`);
      console.log(`    조회수: ${device.totalViews.toLocaleString()}회 (${device.viewSharePct}%)`);
      console.log(`    채널수: ${device.uniqueChannels}개 | 참여도: ${device.engagementRate}% ${rankChange}`);
    });

    return this;
  }

  analyzeAsterasysPerformance() {
    console.log('\n⭐ Asterasys 제품 성과 분석...');
    
    const asterasysData = this.marketShareData.filter(d => d.isAsterasys);
    const competitorData = this.marketShareData.filter(d => !d.isAsterasys);
    
    // Asterasys 총합
    const totalAsterasysVideos = asterasysData.reduce((sum, d) => sum + d.videoCount, 0);
    const totalAsterasysViews = asterasysData.reduce((sum, d) => sum + d.totalViews, 0);
    const totalAsterasysChannels = asterasysData.reduce((sum, d) => sum + d.uniqueChannels, 0);
    
    // 전체 시장 대비 점유율
    const totalMarketVideos = this.marketShareData.reduce((sum, d) => sum + d.videoCount, 0);
    const totalMarketViews = this.marketShareData.reduce((sum, d) => sum + d.totalViews, 0);
    
    const asterasysMarketShare = {
      videoSharePct: ((totalAsterasysVideos / totalMarketVideos) * 100).toFixed(2),
      viewSharePct: ((totalAsterasysViews / totalMarketViews) * 100).toFixed(2),
      avgViewsPerVideo: totalAsterasysVideos > 0 ? Math.round(totalAsterasysViews / totalAsterasysVideos) : 0
    };

    console.log(`📊 Asterasys 전체 성과:`);
    console.log(`  총 비디오: ${totalAsterasysVideos.toLocaleString()}개 (시장점유율 ${asterasysMarketShare.videoSharePct}%)`);
    console.log(`  총 조회수: ${totalAsterasysViews.toLocaleString()}회 (시장점유율 ${asterasysMarketShare.viewSharePct}%)`);
    console.log(`  평균 조회수: ${asterasysMarketShare.avgViewsPerVideo.toLocaleString()}회/비디오`);
    console.log(`  활성 채널: ${totalAsterasysChannels}개`);

    console.log(`\n🔥 Asterasys 제품별 상세:`);
    asterasysData.forEach(product => {
      console.log(`  ${product.deviceName} (${product.category}):`);
      console.log(`    YouTube 순위: ${this.marketShareData.findIndex(d => d.deviceName === product.deviceName) + 1}위 (시장랭킹 ${product.marketRank}위)`);
      console.log(`    비디오: ${product.videoCount.toLocaleString()}개 | 조회수: ${product.totalViews.toLocaleString()}회`);
      console.log(`    채널: ${product.uniqueChannels}개 | 참여도: ${product.engagementRate}%`);
    });

    this.asterasysInsights = {
      products: asterasysData,
      totalVideos: totalAsterasysVideos,
      totalViews: totalAsterasysViews,
      marketShare: asterasysMarketShare,
      topCompetitors: competitorData.slice(0, 5)
    };

    return this;
  }

  analyzeContentTrends() {
    console.log('\n📱 콘텐츠 트렌드 분석...');
    
    // 비디오 타입 분석 (Shorts vs 일반)
    const typeAnalysis = {};
    const categoryAnalysis = { RF: {}, HIFU: {} };
    
    this.data.forEach(video => {
      const deviceName = video.input?.trim();
      const deviceInfo = this.deviceMapping[deviceName];
      
      if (!deviceInfo) return;
      
      const videoType = video.type || 'video';
      const category = deviceInfo.category;
      
      // 타입별 분석
      if (!typeAnalysis[deviceName]) {
        typeAnalysis[deviceName] = { shorts: 0, video: 0, shortsViews: 0, videoViews: 0 };
      }
      
      const views = parseInt(video.viewCount) || 0;
      if (videoType === 'shorts') {
        typeAnalysis[deviceName].shorts++;
        typeAnalysis[deviceName].shortsViews += views;
      } else {
        typeAnalysis[deviceName].video++;
        typeAnalysis[deviceName].videoViews += views;
      }
      
      // 카테고리별 분석
      if (!categoryAnalysis[category][deviceName]) {
        categoryAnalysis[category][deviceName] = { count: 0, views: 0, engagement: 0 };
      }
      
      const likes = parseInt(video.likes) || 0;
      const comments = parseInt(video.commentsCount) || 0;
      
      categoryAnalysis[category][deviceName].count++;
      categoryAnalysis[category][deviceName].views += views;
      categoryAnalysis[category][deviceName].engagement += likes + comments;
    });

    // Shorts 효과 분석
    console.log('\n🎬 Shorts vs 일반 비디오 분석 (상위 10개):');
    Object.entries(typeAnalysis)
      .sort(([,a], [,b]) => (b.shorts + b.video) - (a.shorts + a.video))
      .slice(0, 10)
      .forEach(([device, stats]) => {
        const totalVideos = stats.shorts + stats.video;
        const totalViews = stats.shortsViews + stats.videoViews;
        const shortsRatio = ((stats.shorts / totalVideos) * 100).toFixed(1);
        const shortsViewRatio = totalViews > 0 ? ((stats.shortsViews / totalViews) * 100).toFixed(1) : '0.0';
        const avgShortsViews = stats.shorts > 0 ? Math.round(stats.shortsViews / stats.shorts) : 0;
        const avgVideoViews = stats.video > 0 ? Math.round(stats.videoViews / stats.video) : 0;
        
        const isAsterasys = this.deviceMapping[device]?.isAsterasys ? '⭐' : '  ';
        console.log(`${isAsterasys}${device}:`);
        console.log(`    Shorts: ${stats.shorts}개 (${shortsRatio}%) | 평균 ${avgShortsViews.toLocaleString()}회`);
        console.log(`    일반영상: ${stats.video}개 (${(100-shortsRatio).toFixed(1)}%) | 평균 ${avgVideoViews.toLocaleString()}회`);
        console.log(`    Shorts 조회수 비중: ${shortsViewRatio}%`);
    });

    // RF vs HIFU 카테고리 분석
    console.log('\n⚡ RF vs HIFU 카테고리 비교:');
    ['RF', 'HIFU'].forEach(category => {
      const categoryDevices = Object.entries(categoryAnalysis[category])
        .sort(([,a], [,b]) => b.count - a.count);
      
      const totalCategoryVideos = categoryDevices.reduce((sum, [, stats]) => sum + stats.count, 0);
      const totalCategoryViews = categoryDevices.reduce((sum, [, stats]) => sum + stats.views, 0);
      
      console.log(`\n  ${category} 카테고리 (총 ${totalCategoryVideos.toLocaleString()}개 비디오, ${totalCategoryViews.toLocaleString()}회 조회):`);
      
      categoryDevices.slice(0, 5).forEach(([device, stats], index) => {
        const sharePercent = ((stats.count / totalCategoryVideos) * 100).toFixed(1);
        const avgViews = stats.count > 0 ? Math.round(stats.views / stats.count) : 0;
        const isAsterasys = this.deviceMapping[device]?.isAsterasys ? '⭐' : '  ';
        
        console.log(`${isAsterasys}  ${index + 1}. ${device}: ${stats.count.toLocaleString()}개 (${sharePercent}%) | 평균 ${avgViews.toLocaleString()}회`);
      });
    });

    this.contentTrends = {
      typeAnalysis,
      categoryAnalysis,
      insights: {
        shortsPopularity: 'Shorts가 전반적으로 높은 비중 차지',
        categoryLeader: {
          RF: Object.keys(categoryAnalysis.RF).sort((a, b) => categoryAnalysis.RF[b].count - categoryAnalysis.RF[a].count)[0],
          HIFU: Object.keys(categoryAnalysis.HIFU).sort((a, b) => categoryAnalysis.HIFU[b].count - categoryAnalysis.HIFU[a].count)[0]
        }
      }
    };

    return this;
  }

  saveProcessedData() {
    console.log('\n💾 처리된 데이터 저장...');
    
    // 출력 디렉토리 생성
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // 1. 시장 점유율 데이터 (CSV 스타일)
    const marketShareCSV = [
      ['디바이스명', '카테고리', '시장랭킹', '회사', 'Asterasys여부', '비디오수', '비디오점유율%', '총조회수', '조회수점유율%', '평균조회수', '참여도%', '채널수'].join(','),
      ...this.marketShareData.map(d => [
        d.deviceName, d.category, d.marketRank, d.company, d.isAsterasys ? 'Y' : 'N',
        d.videoCount, d.videoSharePct, d.totalViews, d.viewSharePct, d.avgViews, d.engagementRate, d.uniqueChannels
      ].join(','))
    ].join('\n');
    
    fs.writeFileSync(path.join(this.outputDir, 'youtube_market_share.csv'), marketShareCSV, 'utf8');

    // 2. Asterasys 인사이트 JSON
    const asterasysReport = {
      summary: {
        총비디오수: this.asterasysInsights.totalVideos,
        총조회수: this.asterasysInsights.totalViews,
        시장점유율_비디오: this.asterasysInsights.marketShare.videoSharePct + '%',
        시장점유율_조회수: this.asterasysInsights.marketShare.viewSharePct + '%',
        평균조회수: this.asterasysInsights.marketShare.avgViewsPerVideo
      },
      제품별성과: this.asterasysInsights.products.map(p => ({
        제품명: p.deviceName,
        카테고리: p.category,
        YouTube순위: this.marketShareData.findIndex(d => d.deviceName === p.deviceName) + 1,
        시장순위: p.marketRank,
        비디오수: p.videoCount,
        조회수: p.totalViews,
        참여도: p.engagementRate + '%',
        채널수: p.uniqueChannels
      })),
      주요경쟁사: this.asterasysInsights.topCompetitors.slice(0, 3).map(c => ({
        제품명: c.deviceName,
        카테고리: c.category,
        비디오수: c.videoCount,
        조회수: c.totalViews,
        시장점유율: c.videoSharePct + '%'
      })),
      콘텐츠트렌드: {
        Shorts활용도: 'RF/HIFU 모든 제품에서 Shorts 콘텐츠 활발',
        RF카테고리_1위: this.contentTrends.insights.categoryLeader.RF,
        HIFU카테고리_1위: this.contentTrends.insights.categoryLeader.HIFU
      },
      분석일시: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(this.outputDir, 'asterasys_youtube_insights.json'), 
      JSON.stringify(asterasysReport, null, 2), 
      'utf8'
    );

    // 3. 대시보드용 요약 JSON
    const dashboardSummary = {
      overview: {
        totalVideos: this.data.length,
        totalDevices: 18,
        asterasysMarketShare: this.asterasysInsights.marketShare.videoSharePct,
        topDevice: this.marketShareData[0].deviceName,
        asterasysTopDevice: this.asterasysInsights.products.sort((a, b) => b.videoCount - a.videoCount)[0].deviceName
      },
      marketRankings: this.marketShareData.slice(0, 10).map((d, index) => ({
        rank: index + 1,
        device: d.deviceName,
        category: d.category,
        isAsterasys: d.isAsterasys,
        videos: d.videoCount,
        marketShare: d.videoSharePct + '%',
        views: d.totalViews
      })),
      asterasysProducts: this.asterasysInsights.products.map(p => ({
        name: p.deviceName,
        category: p.category,
        rank: this.marketShareData.findIndex(d => d.deviceName === p.deviceName) + 1,
        videos: p.videoCount,
        views: p.totalViews,
        channels: p.uniqueChannels
      })),
      contentInsights: [
        `총 ${Object.keys(this.keywordStats.keywordCounts).length}개 키워드 검색`,
        `Asterasys 시장점유율: ${this.asterasysInsights.marketShare.videoSharePct}%`,
        `${this.contentTrends.insights.categoryLeader.RF}이 RF 카테고리 1위`,
        `${this.contentTrends.insights.categoryLeader.HIFU}가 HIFU 카테고리 1위`
      ]
    };

    fs.writeFileSync(
      path.join(this.outputDir, 'youtube_dashboard_summary.json'), 
      JSON.stringify(dashboardSummary, null, 2), 
      'utf8'
    );

    console.log(`\n✅ 데이터 저장 완료: ${this.outputDir}`);
    console.log('생성된 파일:');
    console.log('  📊 youtube_market_share.csv - 시장점유율 상세 데이터');
    console.log('  ⭐ asterasys_youtube_insights.json - Asterasys 전용 분석');
    console.log('  📱 youtube_dashboard_summary.json - 대시보드용 요약');

    return this;
  }

  async processAll() {
    try {
      await this.loadData();
      this.processBasicStats();
      this.analyzeMarketShare();
      this.analyzeAsterasysPerformance();
      this.analyzeContentTrends();
      this.saveProcessedData();
      
      console.log('\n' + '='.repeat(60));
      console.log('🎉 YouTube 데이터 분석 완료!');
      console.log('='.repeat(60));
      console.log(`📊 총 ${this.data.length.toLocaleString()}개 비디오 분석`);
      console.log(`🏥 18개 의료기기 브랜드 (RF 9개 + HIFU 9개)`);
      console.log(`⭐ Asterasys 시장점유율: ${this.asterasysInsights.marketShare.videoSharePct}% (비디오 수 기준)`);
      console.log(`👁️ Asterasys 조회수 점유율: ${this.asterasysInsights.marketShare.viewSharePct}%`);
      console.log(`🔥 Asterasys 최고 제품: ${this.asterasysInsights.products.sort((a, b) => b.videoCount - a.videoCount)[0].deviceName}`);
      
    } catch (error) {
      console.error('❌ 처리 실패:', error.message);
      throw error;
    }
  }
}

// 실행
async function main() {
  const processor = new YouTubeDataProcessor(
    path.join(process.cwd(), 'data', 'raw', 'dataset_youtube-scraper_2025-08-28_09-52-54-390.json')
  );
  
  await processor.processAll();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = YouTubeDataProcessor;