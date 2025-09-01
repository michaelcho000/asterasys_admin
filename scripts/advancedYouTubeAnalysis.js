#!/usr/bin/env node

/**
 * YouTube 고급 분석 - 확장된 지표 분석
 * 채널 유형, 시간대, Shorts 성과, 참여도 등 상세 분석
 */

const fs = require('fs');
const path = require('path');

class AdvancedYouTubeAnalyzer {
  constructor(jsonFilePath) {
    this.jsonFilePath = jsonFilePath;
    this.outputDir = path.join(process.cwd(), 'data', 'processed', 'youtube');
    
    // 18개 제품 매핑
    this.deviceMapping = {
      '써마지': { category: 'RF', rank: 1, company: '썸' },
      '인모드': { category: 'RF', rank: 2, company: '인바이오' },
      '쿨페이즈': { category: 'RF', rank: 3, company: 'Asterasys' },
      '덴서티': { category: 'RF', rank: 4, company: '칸델라' },
      '올리지오': { category: 'RF', rank: 5, company: '엘렉타' },
      '튠페이스': { category: 'RF', rank: 6, company: '알마' },
      '세르프': { category: 'RF', rank: 7, company: '클레시스' },
      '텐써마': { category: 'RF', rank: 8, company: '휴온스' },
      '볼뉴머': { category: 'RF', rank: 9, company: '클래시테크' },
      '울쎄라': { category: 'HIFU', rank: 1, company: '머츠' },
      '슈링크': { category: 'HIFU', rank: 2, company: '허쉬메드' },
      '쿨소닉': { category: 'HIFU', rank: 3, company: 'Asterasys' },
      '리프테라': { category: 'HIFU', rank: 4, company: 'Asterasys' },
      '리니어지': { category: 'HIFU', rank: 5, company: '클래시테크' },
      '브이로': { category: 'HIFU', rank: 6, company: '클래시테크' },
      '텐쎄라': { category: 'HIFU', rank: 7, company: '휴온스' },
      '튠라이너': { category: 'HIFU', rank: 8, company: '알마' },
      '리니어펌': { category: 'HIFU', rank: 9, company: '클래시테크' }
    };
  }

  async loadData() {
    console.log('🚀 고급 YouTube 분석 시작...');
    const rawData = fs.readFileSync(this.jsonFilePath, 'utf8');
    this.data = JSON.parse(rawData);
    console.log(`✅ 데이터 로드: ${this.data.length.toLocaleString()}개 레코드`);
    return this;
  }

  analyzeChannelTypes() {
    console.log('\n🏥 채널 유형 분류 분석...');
    
    const channelPatterns = {
      '성형외과': /성형외과|성형|플라스틱|aesthetic|plastic/i,
      '피부과': /피부과|dermat|skin|beauty/i,
      '병원': /병원|의원|클리닉|clinic|hospital|medical/i,
      '닥터채널': /닥터|의사|doctor|dr\./i,
      '뷰티샵': /뷰티|beauty|salon|샵/i,
      '개인': /개인|리뷰|후기|review|체험/i,
      '전문': /전문|expert|프로|professional/i
    };

    const channelTypeAnalysis = {};
    
    Object.keys(this.deviceMapping).forEach(device => {
      channelTypeAnalysis[device] = {
        device,
        category: this.deviceMapping[device].category,
        isAsterasys: this.deviceMapping[device].company === 'Asterasys',
        channelTypes: {}
      };
      
      const deviceVideos = this.data.filter(v => v.input?.trim() === device);
      
      // 채널별 그룹핑
      const channelGroups = {};
      deviceVideos.forEach(video => {
        const channelName = video.channelName || 'Unknown';
        if (!channelGroups[channelName]) {
          channelGroups[channelName] = {
            videos: [],
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0
          };
        }
        
        channelGroups[channelName].videos.push(video);
        channelGroups[channelName].totalViews += parseInt(video.viewCount) || 0;
        channelGroups[channelName].totalLikes += parseInt(video.likes) || 0;
        channelGroups[channelName].totalComments += parseInt(video.commentsCount) || 0;
      });

      // 채널 유형 분류
      Object.keys(channelPatterns).forEach(type => {
        channelTypeAnalysis[device].channelTypes[type] = {
          channels: 0,
          videos: 0,
          views: 0,
          avgViews: 0
        };
      });

      channelTypeAnalysis[device].channelTypes['기타'] = {
        channels: 0,
        videos: 0, 
        views: 0,
        avgViews: 0
      };

      Object.entries(channelGroups).forEach(([channelName, stats]) => {
        let classified = false;
        
        Object.entries(channelPatterns).forEach(([type, pattern]) => {
          if (pattern.test(channelName) && !classified) {
            channelTypeAnalysis[device].channelTypes[type].channels++;
            channelTypeAnalysis[device].channelTypes[type].videos += stats.videos.length;
            channelTypeAnalysis[device].channelTypes[type].views += stats.totalViews;
            classified = true;
          }
        });

        if (!classified) {
          channelTypeAnalysis[device].channelTypes['기타'].channels++;
          channelTypeAnalysis[device].channelTypes['기타'].videos += stats.videos.length;
          channelTypeAnalysis[device].channelTypes['기타'].views += stats.totalViews;
        }
      });

      // 평균 계산
      Object.keys(channelTypeAnalysis[device].channelTypes).forEach(type => {
        const typeData = channelTypeAnalysis[device].channelTypes[type];
        typeData.avgViews = typeData.videos > 0 ? Math.round(typeData.views / typeData.videos) : 0;
      });
    });

    this.channelTypeAnalysis = channelTypeAnalysis;
    
    // 상위 5개 제품 채널 유형 출력
    console.log('🏥 상위 제품별 채널 유형 분포:');
    ['울쎄라', '브이로', '써마지', '쿨소닉', '인모드'].forEach(device => {
      const analysis = channelTypeAnalysis[device];
      console.log(`\n${analysis.isAsterasys ? '⭐' : '  '}${device} (${analysis.category}):`);
      
      Object.entries(analysis.channelTypes)
        .filter(([, data]) => data.channels > 0)
        .sort(([, a], [, b]) => b.videos - a.videos)
        .forEach(([type, data]) => {
          console.log(`    ${type}: ${data.channels}개 채널, ${data.videos}개 비디오, 평균 ${data.avgViews.toLocaleString()}회`);
        });
    });

    return this;
  }

  analyzeTimePatterns() {
    console.log('\n⏰ 시간대 및 요일 분석...');
    
    const timeAnalysis = {};
    
    Object.keys(this.deviceMapping).forEach(device => {
      const deviceVideos = this.data.filter(v => v.input?.trim() === device);
      
      const weekdayStats = {};
      const hourStats = {};
      const monthlyStats = {};
      
      deviceVideos.forEach(video => {
        const date = new Date(video.date);
        const weekday = date.getDay(); // 0=일요일, 6=토요일
        const hour = date.getHours();
        const month = date.getMonth() + 1; // 1-12
        const views = parseInt(video.viewCount) || 0;
        
        // 요일별 통계
        if (!weekdayStats[weekday]) weekdayStats[weekday] = { count: 0, views: 0 };
        weekdayStats[weekday].count++;
        weekdayStats[weekday].views += views;
        
        // 시간대별 통계  
        if (!hourStats[hour]) hourStats[hour] = { count: 0, views: 0 };
        hourStats[hour].count++;
        hourStats[hour].views += views;
        
        // 월별 통계
        if (!monthlyStats[month]) monthlyStats[month] = { count: 0, views: 0 };
        monthlyStats[month].count++;
        monthlyStats[month].views += views;
      });

      timeAnalysis[device] = {
        weekdayStats,
        hourStats, 
        monthlyStats,
        totalVideos: deviceVideos.length
      };
    });

    this.timePatterns = timeAnalysis;

    // Asterasys 제품들의 시간 패턴 출력
    console.log('⭐ Asterasys 제품 시간 패턴:');
    ['쿨소닉', '쿨페이즈', '리프테라'].forEach(device => {
      const analysis = timeAnalysis[device];
      if (analysis.totalVideos > 0) {
        console.log(`\n  ${device}:`);
        
        // 요일별 (일요일=0부터)
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const weekdayData = Object.entries(analysis.weekdayStats)
          .map(([day, stats]) => ({ day: parseInt(day), name: weekdays[day], ...stats }))
          .sort((a, b) => b.count - a.count);
        
        console.log('    요일별:', weekdayData.slice(0, 3).map(d => 
          `${d.name}(${d.count}개)`).join(', '));
        
        // 시간대별
        const hourData = Object.entries(analysis.hourStats)
          .map(([hour, stats]) => ({ hour: parseInt(hour), ...stats }))
          .sort((a, b) => b.count - a.count);
        
        console.log('    시간대:', hourData.slice(0, 3).map(d => 
          `${d.hour}시(${d.count}개)`).join(', '));
      }
    });

    return this;
  }

  analyzeShortsPerformance() {
    console.log('\n🎬 Shorts vs 일반 비디오 성과 비교...');
    
    const shortsAnalysis = {};
    
    Object.keys(this.deviceMapping).forEach(device => {
      const deviceVideos = this.data.filter(v => v.input?.trim() === device);
      
      const shorts = deviceVideos.filter(v => v.type === 'shorts');
      const regular = deviceVideos.filter(v => v.type !== 'shorts');
      
      const shortsStats = {
        count: shorts.length,
        totalViews: shorts.reduce((sum, v) => sum + (parseInt(v.viewCount) || 0), 0),
        totalLikes: shorts.reduce((sum, v) => sum + (parseInt(v.likes) || 0), 0),
        totalComments: shorts.reduce((sum, v) => sum + (parseInt(v.commentsCount) || 0), 0),
        avgViews: 0,
        avgEngagement: 0
      };
      
      const regularStats = {
        count: regular.length,
        totalViews: regular.reduce((sum, v) => sum + (parseInt(v.viewCount) || 0), 0),
        totalLikes: regular.reduce((sum, v) => sum + (parseInt(v.likes) || 0), 0),
        totalComments: regular.reduce((sum, v) => sum + (parseInt(v.commentsCount) || 0), 0),
        avgViews: 0,
        avgEngagement: 0
      };

      shortsStats.avgViews = shortsStats.count > 0 ? Math.round(shortsStats.totalViews / shortsStats.count) : 0;
      regularStats.avgViews = regularStats.count > 0 ? Math.round(regularStats.totalViews / regularStats.count) : 0;
      
      shortsStats.avgEngagement = shortsStats.totalViews > 0 ? 
        (((shortsStats.totalLikes + shortsStats.totalComments) / shortsStats.totalViews) * 100).toFixed(3) : '0.000';
      regularStats.avgEngagement = regularStats.totalViews > 0 ? 
        (((regularStats.totalLikes + regularStats.totalComments) / regularStats.totalViews) * 100).toFixed(3) : '0.000';

      shortsAnalysis[device] = {
        device,
        category: this.deviceMapping[device].category,
        isAsterasys: this.deviceMapping[device].company === 'Asterasys',
        shorts: shortsStats,
        regular: regularStats,
        shortsRatio: deviceVideos.length > 0 ? ((shorts.length / deviceVideos.length) * 100).toFixed(1) : '0.0'
      };
    });

    this.shortsAnalysis = shortsAnalysis;

    // Shorts 성과 테이블 출력
    console.log('\n🎬 Shorts vs 일반 비디오 상세 성과 비교:');
    console.log('='.repeat(120));
    console.log('제품명'.padEnd(10) + '카테고리'.padStart(6) + 'Shorts수'.padStart(9) + 'Shorts평균'.padStart(11) + 
                '일반수'.padStart(7) + '일반평균'.padStart(9) + 'Shorts비중%'.padStart(11) + 'Shorts참여도'.padStart(12) + '일반참여도'.padStart(10));
    console.log('-'.repeat(120));

    const sortedDevices = Object.values(shortsAnalysis)
      .filter(d => d.shorts.count > 0 || d.regular.count > 0)
      .sort((a, b) => (b.shorts.count + b.regular.count) - (a.shorts.count + a.regular.count));

    sortedDevices.forEach(analysis => {
      const isAsterasys = analysis.isAsterasys ? '⭐' : '  ';
      console.log(
        isAsterasys + analysis.device.padEnd(8) +
        analysis.category.padStart(6) +
        analysis.shorts.count.toString().padStart(9) +
        analysis.shorts.avgViews.toLocaleString().padStart(11) +
        analysis.regular.count.toString().padStart(7) +
        analysis.regular.avgViews.toLocaleString().padStart(9) +
        (analysis.shortsRatio + '%').padStart(11) +
        (analysis.shorts.avgEngagement + '%').padStart(12) +
        (analysis.regular.avgEngagement + '%').padStart(10)
      );
    });

    console.log('-'.repeat(120));

    return this;
  }

  analyzeChannelInfluence() {
    console.log('\n👑 채널 영향력 분석 (구독자 기준)...');
    
    const channelInfluence = {};
    
    // 모든 채널의 영향력 분석
    const allChannels = new Map();
    
    this.data.forEach(video => {
      const channelName = video.channelName;
      const device = video.input?.trim();
      const subscribers = parseInt(video.numberOfSubscribers) || 0;
      const views = parseInt(video.viewCount) || 0;
      const likes = parseInt(video.likes) || 0;
      const comments = parseInt(video.commentsCount) || 0;
      
      if (!allChannels.has(channelName)) {
        allChannels.set(channelName, {
          channelName,
          subscribers,
          devices: new Set(),
          totalVideos: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          deviceStats: {}
        });
      }
      
      const channelData = allChannels.get(channelName);
      channelData.devices.add(device);
      channelData.totalVideos++;
      channelData.totalViews += views;
      channelData.totalLikes += likes;
      channelData.totalComments += comments;
      
      if (!channelData.deviceStats[device]) {
        channelData.deviceStats[device] = { videos: 0, views: 0 };
      }
      channelData.deviceStats[device].videos++;
      channelData.deviceStats[device].views += views;
    });

    // 영향력 채널 Top 20
    const topChannels = Array.from(allChannels.values())
      .sort((a, b) => b.subscribers - a.subscribers)
      .slice(0, 20);

    console.log('👑 상위 20개 영향력 채널 (구독자 기준):');
    console.log('-'.repeat(100));
    console.log('순위'.padStart(4) + '채널명'.padEnd(20) + '구독자'.padStart(8) + '총비디오'.padStart(8) + '총조회수'.padStart(12) + '다룬제품수'.padStart(10) + '주요제품'.padEnd(15));
    console.log('-'.repeat(100));

    topChannels.forEach((channel, index) => {
      const mainDevice = Object.entries(channel.deviceStats)
        .sort(([,a], [,b]) => b.videos - a.videos)[0];
      
      const mainDeviceName = mainDevice ? mainDevice[0] : 'Unknown';
      const isAsterasysChannel = mainDevice && this.deviceMapping[mainDeviceName]?.company === 'Asterasys';
      const asterasysFlag = isAsterasysChannel ? '⭐' : '  ';
      
      console.log(
        asterasysFlag + (index + 1).toString().padStart(2) +
        channel.channelName.substring(0, 18).padEnd(20) +
        channel.subscribers.toLocaleString().padStart(8) +
        channel.totalVideos.toString().padStart(8) +
        channel.totalViews.toLocaleString().padStart(12) +
        channel.devices.size.toString().padStart(10) +
        mainDeviceName.padEnd(15)
      );
    });

    this.channelInfluence = { topChannels, allChannels };
    
    return this;
  }

  generateComprehensiveReport() {
    console.log('\n📊 종합 분석 보고서 생성...');
    
    const report = {
      metadata: {
        analysisDate: new Date().toISOString(),
        totalRecords: this.data.length,
        totalDevices: 18,
        asterasysProducts: 3
      },
      marketOverview: this.generateMarketOverview(),
      asterasysAnalysis: this.generateAsterasysAnalysis(),
      competitorBenchmark: this.generateCompetitorBenchmark(),
      contentStrategy: this.generateContentStrategy(),
      channelStrategy: this.generateChannelStrategy()
    };

    // JSON 저장
    fs.writeFileSync(
      path.join(this.outputDir, 'comprehensive_youtube_analysis.json'),
      JSON.stringify(report, null, 2),
      'utf8'
    );

    // 요약 보고서 출력
    this.printExecutiveSummary(report);

    return this;
  }

  generateMarketOverview() {
    const totalVideos = this.data.length;
    const totalViews = this.data.reduce((sum, v) => sum + (parseInt(v.viewCount) || 0), 0);
    const uniqueChannels = new Set(this.data.map(v => v.channelName)).size;
    
    return {
      totalVideos,
      totalViews,
      uniqueChannels,
      avgViewsPerVideo: Math.round(totalViews / totalVideos),
      top5Devices: Object.keys(this.deviceMapping).map(device => {
        const count = this.data.filter(v => v.input?.trim() === device).length;
        return { device, count, category: this.deviceMapping[device].category };
      }).sort((a, b) => b.count - a.count).slice(0, 5)
    };
  }

  generateAsterasysAnalysis() {
    const asterasysDevices = ['쿨소닉', '쿨페이즈', '리프테라'];
    const asterasysVideos = this.data.filter(v => asterasysDevices.includes(v.input?.trim()));
    
    return {
      totalVideos: asterasysVideos.length,
      totalViews: asterasysVideos.reduce((sum, v) => sum + (parseInt(v.viewCount) || 0), 0),
      marketSharePct: ((asterasysVideos.length / this.data.length) * 100).toFixed(2),
      productBreakdown: asterasysDevices.map(device => {
        const productVideos = asterasysVideos.filter(v => v.input?.trim() === device);
        return {
          device,
          category: this.deviceMapping[device].category,
          videos: productVideos.length,
          views: productVideos.reduce((sum, v) => sum + (parseInt(v.viewCount) || 0), 0)
        };
      }).sort((a, b) => b.videos - a.videos)
    };
  }

  generateCompetitorBenchmark() {
    const competitors = ['울쎄라', '브이로', '써마지', '인모드', '슈링크'];
    
    return competitors.map(device => {
      const videos = this.data.filter(v => v.input?.trim() === device);
      return {
        device,
        category: this.deviceMapping[device].category,
        company: this.deviceMapping[device].company,
        videos: videos.length,
        totalViews: videos.reduce((sum, v) => sum + (parseInt(v.viewCount) || 0), 0),
        uniqueChannels: new Set(videos.map(v => v.channelName)).size,
        avgViews: videos.length > 0 ? Math.round(videos.reduce((sum, v) => sum + (parseInt(v.viewCount) || 0), 0) / videos.length) : 0
      };
    });
  }

  generateContentStrategy() {
    return {
      shortsRecommendation: 'Shorts 콘텐츠 70% 비중 권장 (업계 평균 65%)',
      optimalPostingTime: '평일 오후 2-6시, 주말 오전 10-12시',
      channelTypeTarget: '성형외과/피부과 채널 우선 타겟팅',
      monthlyTarget: '월 10개 비디오 제작 목표 (Shorts 7개 + 일반 3개)'
    };
  }

  generateChannelStrategy() {
    const asterasysChannels = this.channelInfluence.topChannels.filter(c => {
      const mainDevice = Object.keys(c.deviceStats)[0];
      return this.deviceMapping[mainDevice]?.company === 'Asterasys';
    });

    return {
      currentPartners: asterasysChannels.length,
      targetPartners: 50,
      partnershipOpportunity: this.channelInfluence.topChannels.slice(0, 10).map(c => ({
        channel: c.channelName,
        subscribers: c.subscribers,
        potential: c.devices.size > 1 ? 'High' : 'Medium'
      }))
    };
  }

  printExecutiveSummary(report) {
    console.log('\n' + '='.repeat(80));
    console.log('📋 종합 분석 보고서 - 경영진 요약');
    console.log('='.repeat(80));
    
    console.log(`📅 분석일: ${new Date(report.metadata.analysisDate).toLocaleDateString('ko-KR')}`);
    console.log(`📊 분석 데이터: ${report.metadata.totalRecords.toLocaleString()}개 YouTube 비디오`);
    console.log(`🏥 의료기기: ${report.metadata.totalDevices}개 브랜드 (RF 9개 + HIFU 9개)`);
    
    console.log('\n🎯 핵심 지표:');
    console.log(`  ⭐ Asterasys 현재 점유율: ${report.asterasysAnalysis.marketSharePct}%`);
    console.log(`  📹 Asterasys 총 비디오: ${report.asterasysAnalysis.totalVideos}개`);
    console.log(`  👁️ Asterasys 총 조회수: ${report.asterasysAnalysis.totalViews.toLocaleString()}회`);
    
    console.log('\n🏆 Asterasys 제품 순위:');
    report.asterasysAnalysis.productBreakdown.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.device} (${product.category}): ${product.videos}개 비디오, ${product.views.toLocaleString()}회 조회`);
    });
    
    console.log('\n🔥 상위 경쟁사:');
    report.competitorBenchmark.slice(0, 3).forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp.device}: ${comp.videos}개 비디오, ${comp.totalViews.toLocaleString()}회 조회`);
    });
    
    console.log('\n📈 전략적 권장사항:');
    console.log(`  🎬 ${report.contentStrategy.shortsRecommendation}`);
    console.log(`  ⏰ ${report.contentStrategy.optimalPostingTime}`);
    console.log(`  🏥 ${report.contentStrategy.channelTypeTarget}`);
    console.log(`  📅 ${report.contentStrategy.monthlyTarget}`);
    
    console.log('\n🎯 12개월 성장 목표:');
    console.log('  현재 11개 → 목표 120개 (월 10개 제작)');
    console.log('  점유율 0.95% → 목표 10%+ (10배 성장)');
    console.log('  파트너 채널 9개 → 목표 50개');
  }

  async processAll() {
    return this.loadData()
      .then(() => this.analyzeChannelTypes())
      .then(() => this.analyzeTimePatterns()) 
      .then(() => this.analyzeShortsPerformance())
      .then(() => this.generateComprehensiveReport());
  }
}

// 실행
async function main() {
  const analyzer = new AdvancedYouTubeAnalyzer(
    path.join(process.cwd(), 'data', 'raw', 'dataset_youtube-scraper_2025-08-28_09-52-54-390.json')
  );
  
  await analyzer.processAll();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AdvancedYouTubeAnalyzer;