/**
 * Centralized Calculation Logic for Asterasys Dashboard
 * Version: 1.1.0
 * Last Updated: 2025-09-03
 * 
 * This file contains ALL calculation formulas and data processing logic
 * to ensure consistency across the entire application.
 */

import { formatContext, formatNumber } from '../src/utils/formatNumber.js'

const ASTERASYS_PRODUCTS = ['쿨페이즈', '리프테라', '쿨소닉'];

const RF_PRODUCTS = [
  '써마지', '인모드', '쿨페이즈', '덴서티', '올리지오', 
  '튠페이스', '세르프', '텐써마', '볼뉴머'
];

const HIFU_PRODUCTS = [
  '울쎄라', '슈링크', '쿨소닉', '리프테라', '리니어지', 
  '브이로', '텐쎄라', '튠라이너', '리니어펌'
];

/**
 * Parse integer value from string (handles comma-separated numbers)
 */
const parseValue = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    return parseInt(value.replace(/,/g, '')) || 0;
  }
  return 0;
};

/**
 * Calculate total comments (댓글 + 대댓글)
 */
const calculateTotalComments = (comments, replies) => {
  return parseValue(comments) + parseValue(replies);
};

/**
 * Calculate market share percentage
 */
const calculateMarketShare = (asterasysValue, marketTotal) => {
  if (marketTotal === 0) return 0;
  return ((asterasysValue / marketTotal) * 100).toFixed(1);
};

/**
 * Filter Asterasys products from dataset
 */
const filterAsterasysProducts = (data, keyField = '키워드') => {
  return data.filter(item => ASTERASYS_PRODUCTS.includes(item[keyField]));
};

/**
 * Calculate product ranking based on 발행량 + 댓글수
 * Note: 판매량 is NOT used for ranking (reference only)
 */
const calculateProductRanking = (products) => {
  return products
    .map(product => ({
      ...product,
      rankingScore: product.publishCount + product.commentCount
    }))
    .sort((a, b) => b.rankingScore - a.rankingScore)
    .map((product, index) => ({
      ...product,
      rank: index + 1
    }));
};

/**
 * Calculate month-over-month change metrics
 */
const calculateMoMChange = (current, previous) => {
  if (!previous || previous === 0) {
    return { change: 0, changePercent: 0, trend: 'neutral' };
  }

  const change = current - previous;
  const changePercent = ((change / previous) * 100).toFixed(1);
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

  return { change, changePercent: parseFloat(changePercent), trend };
};

/**
 * KPI Card Calculations
 */
const KPICalculations = {
  // 블로그 발행량
  blogPublish: (blogData, prevBlogData = null) => {
    const asterasysData = filterAsterasysProducts(blogData);
    const asterasysTotal = asterasysData.reduce((sum, item) =>
      sum + parseValue(item['발행량합']), 0);
    const marketTotal = blogData.reduce((sum, item) =>
      sum + parseValue(item['발행량합']), 0);
    const marketShare = marketTotal > 0 ? (asterasysTotal / marketTotal) * 100 : 0;

    // Calculate MoM change
    let momMetrics = { change: 0, changePercent: 0, trend: 'neutral' };
    if (prevBlogData) {
      const prevAsterasysData = filterAsterasysProducts(prevBlogData);
      const prevAsterasysTotal = prevAsterasysData.reduce((sum, item) =>
        sum + parseValue(item['발행량합']), 0);
      momMetrics = calculateMoMChange(asterasysTotal, prevAsterasysTotal);
    }

    return {
      asterasysTotal,
      marketTotal,
      marketShare,
      value: asterasysTotal,
      total: marketTotal,
      percentage: calculateMarketShare(asterasysTotal, marketTotal),
      context: formatContext('전체 블로그 대비', calculateMarketShare(asterasysTotal, marketTotal), asterasysTotal, marketTotal, '건'),
      ...momMetrics
    };
  },
  
  // 카페 발행량
  cafePublish: (cafeData, prevCafeData = null) => {
    const asterasysData = filterAsterasysProducts(cafeData);
    const asterasysTotal = asterasysData.reduce((sum, item) =>
      sum + parseValue(item['총 발행량']), 0);
    const marketTotal = cafeData.reduce((sum, item) =>
      sum + parseValue(item['총 발행량']), 0);
    const marketShare = marketTotal > 0 ? (asterasysTotal / marketTotal) * 100 : 0;

    // Calculate MoM change
    let momMetrics = { change: 0, changePercent: 0, trend: 'neutral' };
    if (prevCafeData) {
      const prevAsterasysData = filterAsterasysProducts(prevCafeData);
      const prevAsterasysTotal = prevAsterasysData.reduce((sum, item) =>
        sum + parseValue(item['총 발행량']), 0);
      momMetrics = calculateMoMChange(asterasysTotal, prevAsterasysTotal);
    }

    return {
      asterasysTotal,
      marketTotal,
      marketShare,
      value: asterasysTotal,
      total: marketTotal,
      percentage: calculateMarketShare(asterasysTotal, marketTotal),
      context: formatContext('전체 카페 대비', calculateMarketShare(asterasysTotal, marketTotal), asterasysTotal, marketTotal, '건'),
      ...momMetrics
    };
  },
  
  // 뉴스 발행량
  newsPublish: (newsData, prevNewsData = null) => {
    const asterasysData = filterAsterasysProducts(newsData);
    const asterasysTotal = asterasysData.reduce((sum, item) =>
      sum + parseValue(item['총 발행량']), 0);
    const marketTotal = newsData.reduce((sum, item) =>
      sum + parseValue(item['총 발행량']), 0);
    const marketShare = marketTotal > 0 ? (asterasysTotal / marketTotal) * 100 : 0;

    // Calculate MoM change
    let momMetrics = { change: 0, changePercent: 0, trend: 'neutral' };
    if (prevNewsData) {
      const prevAsterasysData = filterAsterasysProducts(prevNewsData);
      const prevAsterasysTotal = prevAsterasysData.reduce((sum, item) =>
        sum + parseValue(item['총 발행량']), 0);
      momMetrics = calculateMoMChange(asterasysTotal, prevAsterasysTotal);
    }

    return {
      asterasysTotal,
      marketTotal,
      marketShare,
      value: asterasysTotal,
      total: marketTotal,
      percentage: calculateMarketShare(asterasysTotal, marketTotal),
      context: formatContext('전체 뉴스 대비', calculateMarketShare(asterasysTotal, marketTotal), asterasysTotal, marketTotal, '건'),
      ...momMetrics
    };
  },
  
  // 검색량 (from traffic.csv)
  searchVolume: (trafficData, prevTrafficData = null) => {
    const asterasysData = filterAsterasysProducts(trafficData);
    const asterasysTotal = asterasysData.reduce((sum, item) =>
      sum + parseValue(item['월간 검색량']), 0);
    const marketTotal = trafficData.reduce((sum, item) =>
      sum + parseValue(item['월간 검색량']), 0);
    const marketShare = marketTotal > 0 ? (asterasysTotal / marketTotal) * 100 : 0;

    // Calculate MoM change
    let momMetrics = { change: 0, changePercent: 0, trend: 'neutral' };
    if (prevTrafficData) {
      const prevAsterasysData = filterAsterasysProducts(prevTrafficData);
      const prevAsterasysTotal = prevAsterasysData.reduce((sum, item) =>
        sum + parseValue(item['월간 검색량']), 0);
      momMetrics = calculateMoMChange(asterasysTotal, prevAsterasysTotal);
    }

    return {
      asterasysTotal,
      marketTotal,
      marketShare,
      value: asterasysTotal,
      total: marketTotal,
      percentage: calculateMarketShare(asterasysTotal, marketTotal),
      context: formatContext('전체 검색 대비', calculateMarketShare(asterasysTotal, marketTotal), asterasysTotal, marketTotal, '회'),
      ...momMetrics
    };
  },
  
  // 판매량 (새로운 CSV 형식: 총 판매량과 월간 판매량으로 구분)
  salesVolume: (salesData, prevSalesData = null) => {
    const asterasysData = filterAsterasysProducts(salesData);

    // 총 판매량 기준 계산
    const asterasysTotalSales = asterasysData.reduce((sum, item) =>
      sum + parseValue(item['총 판매량']), 0);
    const marketTotalSales = salesData.reduce((sum, item) =>
      sum + parseValue(item['총 판매량']), 0);

    // 월간 판매량 컬럼명 동적 감지
    let monthlyColumnName = null;
    let monthLabel = '해당월';

    if (salesData.length > 0) {
      const firstItem = salesData[0];
      const monthColumns = Object.keys(firstItem).filter(key => key.includes('월 판매량'));
      if (monthColumns.length > 0) {
        monthlyColumnName = monthColumns[0];
        // "8월 판매량" -> "8월" 추출
        monthLabel = monthlyColumnName.replace(' 판매량', '');
      }
    }

    // 월간 판매량 기준 계산
    const asterasysMonthSales = monthlyColumnName
      ? asterasysData.reduce((sum, item) => sum + parseValue(item[monthlyColumnName]), 0)
      : 0;
    const marketMonthSales = monthlyColumnName
      ? salesData.reduce((sum, item) => sum + parseValue(item[monthlyColumnName]), 0)
      : 0;

    const marketShare = marketTotalSales > 0 ? (asterasysTotalSales / marketTotalSales) * 100 : 0;
    const monthMarketShare = marketMonthSales > 0 ? (asterasysMonthSales / marketMonthSales) * 100 : 0;

    // Calculate MoM change (총 판매량 기준)
    let momMetrics = { change: 0, changePercent: 0, trend: 'neutral' };
    if (prevSalesData) {
      const prevAsterasysData = filterAsterasysProducts(prevSalesData);
      const prevAsterasysTotalSales = prevAsterasysData.reduce((sum, item) =>
        sum + parseValue(item['총 판매량']), 0);
      momMetrics = calculateMoMChange(asterasysTotalSales, prevAsterasysTotalSales);
    }

    return {
      asterasysTotal: asterasysTotalSales,
      marketTotal: marketTotalSales,
      asterasysMonth: asterasysMonthSales,
      marketMonth: marketMonthSales,
      monthLabel,
      marketShare,
      monthMarketShare,
      value: asterasysTotalSales,
      total: marketTotalSales,
      percentage: calculateMarketShare(asterasysTotalSales, marketTotalSales),
      context: formatContext('전체 시장 대비', calculateMarketShare(asterasysTotalSales, marketTotalSales), asterasysTotalSales, marketTotalSales, '대') +
               ` | ${monthLabel}: ${asterasysMonthSales}대 (시장 점유율 ${monthMarketShare.toFixed(1)}%)`,
      ...momMetrics
    };
  }
};

/**
 * Channel Distribution Calculations
 */
const ChannelCalculations = {
  calculateDistribution: (blogData, cafeData, newsData, youtubeData) => {
    const channels = [
      {
        name: '카페',
        value: filterAsterasysProducts(cafeData).reduce((sum, item) => 
          sum + parseValue(item['총 발행량']), 0),
        color: '#3b82f6'
      },
      {
        name: '유튜브',
        value: filterAsterasysProducts(youtubeData).reduce((sum, item) => 
          sum + parseValue(item['총 발행량']), 0),
        color: '#10b981'
      },
      {
        name: '뉴스',
        value: filterAsterasysProducts(newsData).reduce((sum, item) => 
          sum + parseValue(item['총 발행량']), 0),
        color: '#f59e0b'
      },
      {
        name: '블로그',
        value: filterAsterasysProducts(blogData).reduce((sum, item) => 
          sum + parseValue(item['발행량합']), 0),
        color: '#ef4444'
      }
    ];
    
    const total = channels.reduce((sum, channel) => sum + channel.value, 0);
    
    return channels.map(channel => ({
      ...channel,
      percentage: total > 0 ? ((channel.value / total) * 100).toFixed(1) : '0'
    }));
  }
};

/**
 * Product Chart Calculations (Payment Record Chart)
 */
const ProductChartCalculations = {
  processProductData: (blogData, cafeData) => {
    const productData = {
      RF: { products: [], categories: [], barSeries: [], lineSeries: [] },
      HIFU: { products: [], categories: [], barSeries: [], lineSeries: [] }
    };
    
    // Process each product
    const allProducts = [...RF_PRODUCTS, ...HIFU_PRODUCTS];
    
    allProducts.forEach(productName => {
      const blogItem = blogData.find(item => item['키워드'] === productName) || {};
      const cafeItem = cafeData.find(item => item['키워드'] === productName) || {};
      
      const publishData = parseValue(blogItem['발행량합']);
      const commentData = calculateTotalComments(
        cafeItem['총 댓글수'],
        cafeItem['총 대댓글수']
      );
      
      const category = RF_PRODUCTS.includes(productName) ? 'RF' : 'HIFU';
      const isAsterasys = ASTERASYS_PRODUCTS.includes(productName);
      
      productData[category].products.push({
        name: productName,
        publishData,
        commentData,
        totalScore: publishData + commentData,
        isAsterasys
      });
    });
    
    // Sort and rank products
    ['RF', 'HIFU'].forEach(category => {
      productData[category].products.sort((a, b) => b.totalScore - a.totalScore);
      productData[category].categories = productData[category].products.map(p => p.name);
      
      productData[category].barSeries = [
        {
          name: '발행량',
          type: 'column',
          data: productData[category].products.map(p => p.publishData)
        },
        {
          name: '댓글수',
          type: 'column',
          data: productData[category].products.map(p => p.commentData)
        }
      ];
      
      productData[category].lineSeries = [{
        name: '검색 트렌드',
        type: 'line',
        data: productData[category].products.map(p => p.totalScore)
      }];
    });
    
    return productData;
  },
  
  calculateCategoryMarketShare: (productData, category) => {
    const products = productData[category].products;
    const asterasysTotal = products
      .filter(p => p.isAsterasys)
      .reduce((sum, p) => sum + p.totalScore, 0);
    const categoryTotal = products
      .reduce((sum, p) => sum + p.totalScore, 0);
    
    return calculateMarketShare(asterasysTotal, categoryTotal);
  }
};

/**
 * Competitor Ranking Calculations (경쟁사 순위 현황)
 */
const CompetitorRankingCalculations = {
  processCompetitorData: (cafeData, youtubeData, blogData, newsData) => {
    // 모든 제품 키워드 통합
    const allKeywords = [...new Set([
      ...cafeData.map(item => item['키워드']),
      ...youtubeData.map(item => item['키워드']),
      ...blogData.map(item => item['키워드']),
      ...newsData.map(item => item['키워드'])
    ])].filter(k => k);
    
    return allKeywords.map(keyword => {
      const cafeItem = cafeData.find(item => item['키워드'] === keyword) || {};
      const youtubeItem = youtubeData.find(item => item['키워드'] === keyword) || {};
      const blogItem = blogData.find(item => item['키워드'] === keyword) || {};
      const newsItem = newsData.find(item => item['키워드'] === keyword) || {};
      
      const cafeScore = parseValue(cafeItem['총 발행량']);
      const youtubeScore = parseValue(youtubeItem['총 발행량']);
      const blogScore = parseValue(blogItem['발행량합']);
      const newsScore = parseValue(newsItem['총 발행량']);
      const totalScore = cafeScore + youtubeScore + blogScore + newsScore;
      
      // 상태 판정
      let status = '성장필요';
      if (totalScore >= 2000) status = '시장지배';
      else if (totalScore >= 1200) status = '경쟁우위';
      else if (totalScore >= 800) status = '안정적';
      else if (totalScore >= 400) status = '성장세';
      
      return {
        keyword,
        category: cafeItem['그룹'] || youtubeItem['그룹'] || blogItem['기기구분'] || newsItem['그룹'],
        cafeScore,
        youtubeScore,
        blogScore,
        newsScore,
        totalScore,
        status,
        isAsterasys: ASTERASYS_PRODUCTS.includes(keyword)
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }
};

/**
 * Facebook Targeting Calculations
 */
const FacebookTargetingCalculations = {
  processFacebookData: (fbData) => {
    const products = {};
    
    fbData.forEach(item => {
      const product = item['기기구분'] || '기타';
      if (!products[product]) {
        products[product] = {
          name: product,
          campaigns: [],
          totalReach: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalResult: 0
        };
      }
      
      const reach = parseValue(item['도달수']);
      const impressions = parseValue(item['노출']);
      const clicks = parseValue(item['클릭수']);
      const result = parseValue(item['결과']);
      
      products[product].campaigns.push(item);
      products[product].totalReach += reach;
      products[product].totalImpressions += impressions;
      products[product].totalClicks += clicks;
      products[product].totalResult += result;
    });
    
    return Object.values(products);
  },
  
  calculateCTR: (clicks, impressions) => {
    return impressions > 0 ? (clicks / impressions) * 100 : 0;
  },
  
  calculateReachRate: (reach, impressions) => {
    return impressions > 0 ? (reach / impressions) * 100 : 0;
  }
};

/**
 * News Analysis Calculations
 */
const NewsAnalysisCalculations = {
  processNewsData: (newsAnalysisData) => {
    const totalArticles = newsAnalysisData.length;
    const asterasysArticles = newsAnalysisData.filter(article => 
      ASTERASYS_PRODUCTS.includes(article['제품명'])
    ).length;
    
    const marketShare = calculateMarketShare(asterasysArticles, totalArticles);
    const dailyAverage = (asterasysArticles / 30).toFixed(1);
    
    return {
      totalArticles,
      asterasysArticles,
      marketShare,
      dailyAverage,
      context: `전체 기사 ${formatNumber(totalArticles)}건 중 Asterasys ${formatNumber(asterasysArticles)}건 (${marketShare.toFixed(1)}%)`
    };
  }
};

/**
 * Trend Data Calculations (Naver DataLab)
 */
const TrendCalculations = {
  processTrendData: (naverData, productName, days = 30) => {
    const recentData = naverData.slice(-days);
    
    return {
      data: recentData.map(row => parseFloat(row[productName]) || 0),
      categories: recentData.map(row => new Date(row['날짜']).getDate()),
      current: parseFloat(recentData[recentData.length - 1]?.[productName]) || 0,
      previous: parseFloat(recentData[recentData.length - 8]?.[productName]) || 0,
      changePercent: function() {
        if (this.previous === 0) return 0;
        return ((this.current - this.previous) / this.previous * 100).toFixed(1);
      }
    };
  }
};

// Export all calculation functions
module.exports = {
  // Constants
  ASTERASYS_PRODUCTS,
  RF_PRODUCTS,
  HIFU_PRODUCTS,
  
  // Utility functions
  parseValue,
  calculateTotalComments,
  calculateMarketShare,
  filterAsterasysProducts,
  calculateProductRanking,
  
  // Component-specific calculations
  KPICalculations,
  ChannelCalculations,
  ProductChartCalculations,
  NewsAnalysisCalculations,
  TrendCalculations
};