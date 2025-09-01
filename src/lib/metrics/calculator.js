import fs from 'fs';
import path from 'path';

// Load products mapping
const productsMapping = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'data', 'mappings', 'products.json'), 'utf8')
);

/**
 * Metrics Calculator for Asterasys Dashboard
 * Calculates KPIs like SOV, Engagement, Momentum, etc.
 */

export class MetricsCalculator {
  constructor(data) {
    this.data = data;
    this.products = productsMapping.products;
    this.categories = productsMapping.categories;
  }

  /**
   * Get product information by keyword
   */
  getProductInfo(keyword) {
    return this.products[keyword] || {
      name: keyword,
      category: 'Unknown',
      brand: 'competitor',
      color: '#cccccc',
      priority: 999
    };
  }

  /**
   * Filter data by brand (asterasys vs competitor)
   */
  filterByBrand(data, brand = 'all') {
    if (brand === 'all') return data;
    
    return data.filter(item => {
      const productInfo = this.getProductInfo(item.keyword);
      return productInfo.brand === brand;
    });
  }

  /**
   * Filter data by category (RF vs HIFU)
   */
  filterByCategory(data, category = 'all') {
    if (category === 'all') return data;
    
    return data.filter(item => {
      const productInfo = this.getProductInfo(item.keyword);
      return productInfo.category === category;
    });
  }

  /**
   * Calculate Share of Voice (SOV) by channel
   */
  calculateSOV(channel = 'all') {
    let data;
    
    switch (channel) {
      case 'blog':
        data = this.data.blog;
        break;
      case 'cafe':
        data = this.data.cafe;
        break;
      case 'news':
        data = this.data.news;
        break;
      case 'search':
        data = this.data.traffic;
        break;
      default:
        // Combine all channels for total SOV
        data = [
          ...this.data.blog.map(item => ({ ...item, posts: item.totalPosts })),
          ...this.data.cafe.map(item => ({ ...item, posts: item.totalPosts })),
          ...this.data.news.map(item => ({ ...item, posts: item.totalPosts })),
        ];
    }

    const totalPosts = data.reduce((sum, item) => sum + (item.posts || item.totalPosts || 0), 0);
    
    const sovResults = {};
    
    data.forEach(item => {
      const keyword = item.keyword;
      const posts = item.posts || item.totalPosts || 0;
      const productInfo = this.getProductInfo(keyword);
      
      if (!sovResults[keyword]) {
        sovResults[keyword] = {
          keyword,
          posts,
          sov: totalPosts > 0 ? (posts / totalPosts) * 100 : 0,
          ...productInfo
        };
      }
    });

    return Object.values(sovResults).sort((a, b) => b.posts - a.posts);
  }

  /**
   * Calculate engagement metrics
   */
  calculateEngagement(channel = 'all') {
    let data;
    
    switch (channel) {
      case 'blog':
        data = this.data.blog;
        break;
      case 'cafe':
        data = this.data.cafe;
        break;
      default:
        data = [...this.data.blog, ...this.data.cafe];
    }

    const engagementResults = {};

    data.forEach(item => {
      const keyword = item.keyword;
      const posts = item.totalPosts || 0;
      const comments = (item.totalComments || 0) + (item.totalReplies || 0);
      const engagement = posts > 0 ? (comments / posts) : 0;
      const productInfo = this.getProductInfo(keyword);

      if (!engagementResults[keyword]) {
        engagementResults[keyword] = {
          keyword,
          posts,
          comments,
          engagement,
          ...productInfo
        };
      } else {
        engagementResults[keyword].posts += posts;
        engagementResults[keyword].comments += comments;
        engagementResults[keyword].engagement = 
          engagementResults[keyword].posts > 0 
            ? engagementResults[keyword].comments / engagementResults[keyword].posts
            : 0;
      }
    });

    return Object.values(engagementResults).sort((a, b) => b.engagement - a.engagement);
  }

  /**
   * Calculate category performance (RF vs HIFU)
   */
  calculateCategoryPerformance() {
    const rfProducts = Object.keys(this.products).filter(
      key => this.products[key].category === 'RF'
    );
    const hifuProducts = Object.keys(this.products).filter(
      key => this.products[key].category === 'HIFU'
    );

    const calculateCategoryStats = (products, categoryName) => {
      let totalPosts = 0;
      let totalComments = 0;
      let totalViews = 0;
      let totalSales = 0;
      let totalSearch = 0;

      products.forEach(product => {
        // Blog data
        const blogData = this.data.blog.filter(item => item.keyword === product);
        blogData.forEach(item => {
          totalPosts += item.totalPosts || 0;
          totalComments += (item.totalComments || 0) + (item.totalReplies || 0);
        });

        // Cafe data
        const cafeData = this.data.cafe.filter(item => item.keyword === product);
        cafeData.forEach(item => {
          totalPosts += item.totalPosts || 0;
          totalComments += (item.totalComments || 0) + (item.totalReplies || 0);
          totalViews += item.totalViews || 0;
        });

        // News data
        const newsData = this.data.news.filter(item => item.keyword === product);
        newsData.forEach(item => {
          totalPosts += item.totalPosts || 0;
        });

        // Sales data
        const salesData = this.data.sales.filter(item => item.keyword === product);
        salesData.forEach(item => {
          totalSales += item.sales || 0;
        });

        // Search data
        const searchData = this.data.traffic.filter(item => item.keyword === product);
        searchData.forEach(item => {
          totalSearch += item.monthlySearchVolume || 0;
        });
      });

      return {
        category: categoryName,
        productCount: products.length,
        totalPosts,
        totalComments,
        totalViews,
        totalSales,
        totalSearch,
        engagement: totalPosts > 0 ? totalComments / totalPosts : 0
      };
    };

    const rfStats = calculateCategoryStats(rfProducts, 'RF');
    const hifuStats = calculateCategoryStats(hifuProducts, 'HIFU');

    const totalPosts = rfStats.totalPosts + hifuStats.totalPosts;
    const totalSales = rfStats.totalSales + hifuStats.totalSales;

    return {
      rf: {
        ...rfStats,
        marketShare: totalPosts > 0 ? (rfStats.totalPosts / totalPosts) * 100 : 0,
        salesShare: totalSales > 0 ? (rfStats.totalSales / totalSales) * 100 : 0
      },
      hifu: {
        ...hifuStats,
        marketShare: totalPosts > 0 ? (hifuStats.totalPosts / totalPosts) * 100 : 0,
        salesShare: totalSales > 0 ? (hifuStats.totalSales / totalSales) * 100 : 0
      }
    };
  }

  /**
   * Calculate Asterasys performance vs competitors
   */
  calculateAsterasysPeformance() {
    const asterasysProducts = ['쿨페이즈', '쿨소닉', '리프테라'];
    
    const calculateBrandStats = (products, brandName) => {
      let totalPosts = 0;
      let totalComments = 0;
      let totalViews = 0;
      let totalSales = 0;
      let totalSearch = 0;

      products.forEach(product => {
        // Combine all channel data for each product
        const allData = [
          ...this.data.blog.filter(item => item.keyword === product),
          ...this.data.cafe.filter(item => item.keyword === product),
          ...this.data.news.filter(item => item.keyword === product)
        ];

        allData.forEach(item => {
          totalPosts += item.totalPosts || 0;
          totalComments += (item.totalComments || 0) + (item.totalReplies || 0);
          totalViews += item.totalViews || 0;
        });

        // Sales data
        const salesData = this.data.sales.filter(item => item.keyword === product);
        salesData.forEach(item => {
          totalSales += item.sales || 0;
        });

        // Search data
        const searchData = this.data.traffic.filter(item => item.keyword === product);
        searchData.forEach(item => {
          totalSearch += item.monthlySearchVolume || 0;
        });
      });

      return {
        brand: brandName,
        productCount: products.length,
        totalPosts,
        totalComments,
        totalViews,
        totalSales,
        totalSearch,
        engagement: totalPosts > 0 ? totalComments / totalPosts : 0
      };
    };

    const competitorProducts = Object.keys(this.products).filter(
      key => this.products[key].brand === 'competitor'
    );

    const asterasysStats = calculateBrandStats(asterasysProducts, 'Asterasys');
    const competitorStats = calculateBrandStats(competitorProducts, 'Competitors');

    const totalMarketPosts = asterasysStats.totalPosts + competitorStats.totalPosts;
    const totalMarketSales = asterasysStats.totalSales + competitorStats.totalSales;

    return {
      asterasys: {
        ...asterasysStats,
        marketShare: totalMarketPosts > 0 ? (asterasysStats.totalPosts / totalMarketPosts) * 100 : 0,
        salesShare: totalMarketSales > 0 ? (asterasysStats.totalSales / totalMarketSales) * 100 : 0
      },
      competitors: {
        ...competitorStats,
        marketShare: totalMarketPosts > 0 ? (competitorStats.totalPosts / totalMarketPosts) * 100 : 0,
        salesShare: totalMarketSales > 0 ? (competitorStats.totalSales / totalMarketSales) * 100 : 0
      },
      total: {
        posts: totalMarketPosts,
        sales: totalMarketSales
      }
    };
  }

  /**
   * Get top performing products by metric
   */
  getTopProducts(metric = 'posts', limit = 10, brand = 'all') {
    const sovData = this.calculateSOV();
    let filteredData = brand === 'all' ? sovData : sovData.filter(item => item.brand === brand);
    
    // Add sales and search data
    filteredData = filteredData.map(item => {
      const salesData = this.data.sales.find(sale => sale.keyword === item.keyword);
      const searchData = this.data.traffic.find(traffic => traffic.keyword === item.keyword);
      
      return {
        ...item,
        sales: salesData?.sales || 0,
        searchVolume: searchData?.monthlySearchVolume || 0
      };
    });

    // Sort by requested metric
    switch (metric) {
      case 'sales':
        filteredData.sort((a, b) => b.sales - a.sales);
        break;
      case 'search':
        filteredData.sort((a, b) => b.searchVolume - a.searchVolume);
        break;
      case 'sov':
        filteredData.sort((a, b) => b.sov - a.sov);
        break;
      default:
        filteredData.sort((a, b) => b.posts - a.posts);
    }

    return filteredData.slice(0, limit);
  }

  /**
   * Calculate comprehensive dashboard KPIs
   */
  calculateDashboardKPIs() {
    const categoryPerformance = this.calculateCategoryPerformance();
    const asterasysPerformance = this.calculateAsterasysPeformance();
    const sovData = this.calculateSOV();
    const engagementData = this.calculateEngagement();

    const totalMarketPosts = asterasysPerformance.total.posts;
    const totalMarketSales = asterasysPerformance.total.sales;
    const totalSearchVolume = this.data.traffic.reduce((sum, item) => sum + (item.monthlySearchVolume || 0), 0);
    const avgEngagement = engagementData.reduce((sum, item) => sum + item.engagement, 0) / engagementData.length;

    return {
      overview: {
        totalMarketPosts,
        totalMarketSales,
        totalSearchVolume,
        avgEngagement,
        asterasysMarketShare: asterasysPerformance.asterasys.marketShare,
        asterasysSalesShare: asterasysPerformance.asterasys.salesShare
      },
      categories: categoryPerformance,
      brand: asterasysPerformance,
      topProducts: {
        byPosts: this.getTopProducts('posts', 5),
        bySales: this.getTopProducts('sales', 5),
        bySearch: this.getTopProducts('search', 5),
        asterasysOnly: this.getTopProducts('posts', 5, 'asterasys')
      },
      engagement: engagementData.slice(0, 10),
      processedAt: new Date().toISOString()
    };
  }
}

export default MetricsCalculator;