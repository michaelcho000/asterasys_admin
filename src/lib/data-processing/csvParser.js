import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

/**
 * CSV Parser for Asterasys Marketing Data
 * Handles Korean text encoding and data normalization
 */

export class CSVParser {
  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'raw');
    this.outputPath = path.join(process.cwd(), 'data', 'processed');
  }

  /**
   * Parse a CSV file with Korean text support
   */
  parseCSV(filename, options = {}) {
    try {
      const filePath = path.join(this.dataPath, filename);
      const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
      
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        ...options
      });

      return records;
    } catch (error) {
      console.error(`Error parsing ${filename}:`, error);
      return [];
    }
  }

  /**
   * Parse blog ranking data
   */
  parseBlogRank() {
    const records = this.parseCSV('asterasys_total_data - blog_rank.csv');
    
    return records.map(record => ({
      keyword: record['키워드']?.trim() || '',
      blogType: record['블로그유형']?.trim() || '',
      totalCount: this.parseNumber(record['총 개수']),
      totalComments: this.parseNumber(record['댓글 총 개수']),  
      totalReplies: this.parseNumber(record['대댓글 총 개수']),
      totalPosts: this.parseNumber(record['발행량합']),
      category: record['기기구분']?.trim() || '',
      rank: this.parseNumber(record['발행량 순위']),
      source: 'blog_rank'
    })).filter(record => record.keyword);
  }

  /**
   * Parse cafe ranking data  
   */
  parseCafeRank() {
    const records = this.parseCSV('asterasys_total_data - cafe_rank.csv');
    
    return records.map(record => ({
      keyword: record['키워드']?.trim() || '',
      group: record['그룹']?.trim() || '',
      totalPosts: this.parseNumber(record['총 발행량']),
      totalComments: this.parseNumber(record['총 댓글수']),
      totalReplies: this.parseNumber(record['총 대댓글수']), 
      totalViews: this.parseNumber(record['총 조회수']),
      rank: this.parseNumber(record['발행량 순위']),
      source: 'cafe_rank'
    })).filter(record => record.keyword);
  }

  /**
   * Parse traffic/search data
   */
  parseTraffic() {
    const records = this.parseCSV('asterasys_total_data - traffic.csv');
    
    return records.map(record => ({
      keyword: record['키워드']?.trim() || '',
      group: record['그룹']?.trim() || '', 
      monthlySearchVolume: this.parseNumber(record['월감 검색량']),
      searchRank: this.parseNumber(record['검색량 순위']),
      source: 'traffic'
    })).filter(record => record.keyword);
  }

  /**
   * Parse sales data
   */
  parseSales() {
    const records = this.parseCSV('asterasys_total_data - sale.csv');
    
    return records.map(record => ({
      keyword: record['키워드']?.trim() || '',
      group: record['그룹']?.trim() || '',
      sales: this.parseNumber(record['판매량']),
      source: 'sales'
    })).filter(record => record.keyword);
  }

  /**
   * Parse news ranking data
   */  
  parseNewsRank() {
    const records = this.parseCSV('asterasys_total_data - news_rank.csv');
    
    return records.map(record => ({
      keyword: record['키워드']?.trim() || '',
      group: record['그룹']?.trim() || '',
      totalPosts: this.parseNumber(record['총 발행량']),
      rank: this.parseNumber(record['발행량 순위']),
      source: 'news_rank'
    })).filter(record => record.keyword);
  }

  /**
   * Parse blog user ranking data
   */
  parseBlogUserRank() {
    const records = this.parseCSV('asterasys_total_data - blog_user_rank.csv');
    
    return records.map(record => ({
      keyword: record['키워드']?.trim() || '',
      blogName: record['블로그명']?.trim() || '',
      url: record['URL']?.trim() || '',
      totalPosts: this.parseNumber(record['총 발행 개수']),
      rank: this.parseNumber(record['순위']),
      source: 'blog_user_rank'
    })).filter(record => record.keyword);
  }

  /**
   * Parse YouTube content data
   */
  parseYouTubeContents() {
    const records = this.parseCSV('asterasys_total_data - youtube_contents.csv');
    
    return records.map(record => ({
      category: record['기기구분']?.trim() || '',
      hospitalName: record['병원명']?.trim() || '',
      url: record['url']?.trim() || '',
      uploadDate: record['업로드 날짜']?.trim() || '',
      source: 'youtube_contents'
    })).filter(record => record.category);
  }

  /**
   * Parse YouTube comments data
   */
  parseYouTubeComments() {
    const records = this.parseCSV('asterasys_total_data - youtube_comments.csv');
    
    return records.map(record => ({
      category: record['기기구분']?.trim() || '',
      channel: record['채널']?.trim() || '',
      link: record['링크']?.trim() || '', 
      commentCount: this.parseNumber(record['댓글수']),
      source: 'youtube_comments'
    })).filter(record => record.category);
  }

  /**
   * Parse number with Korean number formatting support
   */
  parseNumber(value) {
    if (!value || value === '') return 0;
    
    // Remove commas and convert to number
    const cleanValue = typeof value === 'string' 
      ? value.replace(/[,\s]/g, '') 
      : value;
    
    const num = parseFloat(cleanValue);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Parse all data sources and combine
   */
  async parseAllData() {
    try {
      const data = {
        blog: this.parseBlogRank(),
        cafe: this.parseCafeRank(), 
        traffic: this.parseTraffic(),
        sales: this.parseSales(),
        news: this.parseNewsRank(),
        blogUsers: this.parseBlogUserRank(),
        youtubeContents: this.parseYouTubeContents(),
        youtubeComments: this.parseYouTubeComments(),
        processedAt: new Date().toISOString(),
        dataMonth: '2025-08'
      };

      // Save processed data
      const outputFile = path.join(this.outputPath, 'asterasys_data.json');
      fs.mkdirSync(this.outputPath, { recursive: true });
      fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');

      console.log(`Processed data saved to: ${outputFile}`);
      console.log(`Data summary:
        - Blog records: ${data.blog.length}
        - Cafe records: ${data.cafe.length}
        - Traffic records: ${data.traffic.length}
        - Sales records: ${data.sales.length}
        - News records: ${data.news.length}
        - Blog users: ${data.blogUsers.length}
        - YouTube contents: ${data.youtubeContents.length}
        - YouTube comments: ${data.youtubeComments.length}
      `);

      return data;
    } catch (error) {
      console.error('Error processing data:', error);
      throw error;
    }
  }
}

export default CSVParser;