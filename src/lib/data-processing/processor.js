import fs from 'fs';
import path from 'path';
import CSVParser from './csvParser.js';
import MetricsCalculator from '../metrics/calculator.js';

/**
 * Main data processor that orchestrates CSV parsing and metrics calculation
 */

export class DataProcessor {
  constructor() {
    this.outputPath = path.join(process.cwd(), 'data', 'processed');
    this.parser = new CSVParser();
  }

  /**
   * Process all CSV files and generate dashboard data
   */
  async processData() {
    try {
      console.log('Starting data processing...');
      
      // Step 1: Parse all CSV files
      console.log('Parsing CSV files...');
      const rawData = await this.parser.parseAllData();
      
      // Step 2: Calculate metrics
      console.log('Calculating metrics...');
      const calculator = new MetricsCalculator(rawData);
      const kpis = calculator.calculateDashboardKPIs();
      
      // Step 3: Generate channel-specific data
      console.log('Generating channel-specific data...');
      const channelData = this.generateChannelData(rawData, calculator);
      
      // Step 4: Generate processed dashboard data
      const dashboardData = {
        raw: rawData,
        kpis,
        channels: channelData,
        meta: {
          processedAt: new Date().toISOString(),
          dataMonth: '2025-08',
          version: '1.0.0'
        }
      };

      // Step 5: Save all processed data
      await this.saveProcessedData(dashboardData);
      
      console.log('Data processing completed successfully!');
      return dashboardData;
      
    } catch (error) {
      console.error('Error in data processing:', error);
      throw error;
    }
  }

  /**
   * Generate channel-specific processed data
   */
  generateChannelData(rawData, calculator) {
    return {
      blog: {
        overview: this.generateBlogOverview(rawData.blog),
        byType: this.generateBlogByType(rawData.blog),
        topInfluencers: this.generateTopBlogInfluencers(rawData.blogUsers),
        engagement: calculator.calculateEngagement('blog')
      },
      cafe: {
        overview: this.generateCafeOverview(rawData.cafe),
        engagement: calculator.calculateEngagement('cafe'),
        topPerformers: this.getTopPerformers(rawData.cafe, 'totalViews')
      },
      news: {
        overview: this.generateNewsOverview(rawData.news),
        topPerformers: this.getTopPerformers(rawData.news, 'totalPosts')
      },
      youtube: {
        contents: this.generateYouTubeOverview(rawData.youtubeContents),
        engagement: this.generateYouTubeEngagement(rawData.youtubeComments)
      },
      search: {
        overview: this.generateSearchOverview(rawData.traffic),
        topKeywords: this.getTopPerformers(rawData.traffic, 'monthlySearchVolume')
      },
      sales: {
        overview: this.generateSalesOverview(rawData.sales),
        topProducts: this.getTopPerformers(rawData.sales, 'sales')
      }
    };
  }

  /**
   * Generate blog channel overview
   */
  generateBlogOverview(blogData) {
    const totalPosts = blogData.reduce((sum, item) => sum + (item.totalPosts || 0), 0);
    const totalComments = blogData.reduce((sum, item) => sum + (item.totalComments || 0) + (item.totalReplies || 0), 0);
    
    return {
      totalPosts,
      totalComments,
      avgEngagement: totalPosts > 0 ? totalComments / totalPosts : 0,
      uniqueProducts: [...new Set(blogData.map(item => item.keyword))].length
    };
  }

  /**
   * Generate blog data by type (hospital, place, general)
   */
  generateBlogByType(blogData) {
    const types = ['병원블로그', '플레이스블로그', '일반블로그'];
    
    return types.map(type => {
      const typeData = blogData.filter(item => item.blogType === type);
      const totalPosts = typeData.reduce((sum, item) => sum + (item.totalPosts || 0), 0);
      const totalComments = typeData.reduce((sum, item) => sum + (item.totalComments || 0) + (item.totalReplies || 0), 0);
      
      return {
        type,
        totalPosts,
        totalComments,
        avgEngagement: totalPosts > 0 ? totalComments / totalPosts : 0,
        products: typeData.length
      };
    });
  }

  /**
   * Generate top blog influencers
   */
  generateTopBlogInfluencers(blogUsersData) {
    return blogUsersData
      .sort((a, b) => (b.totalPosts || 0) - (a.totalPosts || 0))
      .slice(0, 10)
      .map(user => ({
        name: user.blogName,
        url: user.url,
        posts: user.totalPosts || 0,
        keyword: user.keyword,
        rank: user.rank
      }));
  }

  /**
   * Generate cafe channel overview
   */
  generateCafeOverview(cafeData) {
    return {
      totalPosts: cafeData.reduce((sum, item) => sum + (item.totalPosts || 0), 0),
      totalComments: cafeData.reduce((sum, item) => sum + (item.totalComments || 0) + (item.totalReplies || 0), 0),
      totalViews: cafeData.reduce((sum, item) => sum + (item.totalViews || 0), 0),
      uniqueProducts: [...new Set(cafeData.map(item => item.keyword))].length
    };
  }

  /**
   * Generate news channel overview
   */
  generateNewsOverview(newsData) {
    return {
      totalArticles: newsData.reduce((sum, item) => sum + (item.totalPosts || 0), 0),
      uniqueProducts: [...new Set(newsData.map(item => item.keyword))].length,
      topRanked: newsData.filter(item => item.rank <= 5).length
    };
  }

  /**
   * Generate YouTube overview
   */
  generateYouTubeOverview(youtubeData) {
    const byCategory = {};
    youtubeData.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = {
          category: item.category,
          count: 0,
          hospitals: new Set()
        };
      }
      byCategory[item.category].count++;
      byCategory[item.category].hospitals.add(item.hospitalName);
    });

    Object.keys(byCategory).forEach(key => {
      byCategory[key].hospitals = byCategory[key].hospitals.size;
    });

    return {
      totalVideos: youtubeData.length,
      byCategory: Object.values(byCategory),
      uniqueHospitals: [...new Set(youtubeData.map(item => item.hospitalName))].length
    };
  }

  /**
   * Generate YouTube engagement data
   */
  generateYouTubeEngagement(commentsData) {
    const byCategory = {};
    commentsData.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = {
          category: item.category,
          totalComments: 0,
          channels: 0
        };
      }
      byCategory[item.category].totalComments += item.commentCount || 0;
      byCategory[item.category].channels++;
    });

    return {
      totalComments: commentsData.reduce((sum, item) => sum + (item.commentCount || 0), 0),
      byCategory: Object.values(byCategory),
      topChannels: commentsData
        .sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0))
        .slice(0, 10)
    };
  }

  /**
   * Generate search overview
   */
  generateSearchOverview(trafficData) {
    return {
      totalSearchVolume: trafficData.reduce((sum, item) => sum + (item.monthlySearchVolume || 0), 0),
      uniqueKeywords: trafficData.length,
      avgSearchVolume: trafficData.length > 0 
        ? trafficData.reduce((sum, item) => sum + (item.monthlySearchVolume || 0), 0) / trafficData.length 
        : 0
    };
  }

  /**
   * Generate sales overview
   */
  generateSalesOverview(salesData) {
    return {
      totalSales: salesData.reduce((sum, item) => sum + (item.sales || 0), 0),
      uniqueProducts: salesData.length,
      avgSalesPerProduct: salesData.length > 0
        ? salesData.reduce((sum, item) => sum + (item.sales || 0), 0) / salesData.length
        : 0
    };
  }

  /**
   * Get top performers by metric
   */
  getTopPerformers(data, metric, limit = 10) {
    return data
      .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
      .slice(0, limit);
  }

  /**
   * Save processed data to files
   */
  async saveProcessedData(dashboardData) {
    // Ensure output directory exists
    fs.mkdirSync(this.outputPath, { recursive: true });

    // Save main dashboard data
    const mainFile = path.join(this.outputPath, 'dashboard.json');
    fs.writeFileSync(mainFile, JSON.stringify(dashboardData, null, 2), 'utf8');

    // Save KPIs separately for fast loading
    const kpiFile = path.join(this.outputPath, 'kpis.json');
    fs.writeFileSync(kpiFile, JSON.stringify(dashboardData.kpis, null, 2), 'utf8');

    // Save channel data separately
    const channelsFile = path.join(this.outputPath, 'channels.json');
    fs.writeFileSync(channelsFile, JSON.stringify(dashboardData.channels, null, 2), 'utf8');

    // Save raw data separately
    const rawFile = path.join(this.outputPath, 'raw.json');
    fs.writeFileSync(rawFile, JSON.stringify(dashboardData.raw, null, 2), 'utf8');

    console.log(`Processed data saved to: ${this.outputPath}`);
    console.log(`Files created:
      - dashboard.json (complete data)
      - kpis.json (KPIs only)
      - channels.json (channel data)
      - raw.json (raw parsed data)
    `);
  }
}

export default DataProcessor;