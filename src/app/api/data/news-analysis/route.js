import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';


// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const csvFilePath = path.join(process.cwd(), 'data', 'raw', 'asterasys_total_data - news analysis.csv');
    
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json({ error: 'News analysis data file not found' }, { status: 404 });
    }
    
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Remove BOM if present
    const cleanContent = csvContent.replace(/^\uFEFF/, '');
    
    const records = parse(cleanContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,  // Allow inconsistent column counts
      skip_records_with_error: true  // Skip problematic records
    });
    
    // Filter out empty records and the last row which seems to be incomplete
    const validRecords = records.filter(record => 
      record.product_name && 
      record.product_name.length > 0 && 
      record.total_articles && 
      record.total_articles !== '0' &&
      record.total_articles !== '' &&
      !isNaN(parseInt(record.total_articles))
    );
    
    // Identify Asterasys products and classify by HIFU/RF
    const asterasysProducts = ['쿨페이즈', '쿨소닉', '리프테라'];
    
    // Product classification by technology type
    const rfProductNames = ['써마지', '인모드', '쿨페이즈', '덴서티', '올리지오', '튠페이스', '세르프', '텐써마', '볼뉴머'];
    const hifuProductNames = ['울쎄라', '슈링크', '쿨소닉', '리프테라', '리니어지', '브이로', '텐쎄라', '튠라이너', '리니어펌'];
    
    // Create individual product data with category breakdowns
    const rfProducts = [];
    const hifuProducts = [];
    let totalArticles = 0;
    
    validRecords.forEach(record => {
      const articles = parseInt(record.total_articles) || 0;
      const productName = record.product_name;
      totalArticles += articles;
      
      const productData = {
        product_name: productName,
        total_articles: articles,
        isAsterasys: asterasysProducts.includes(productName),
        // Store category data directly from CSV columns
        category_기업소식: parseFloat(record.category_기업소식) || 0,
        category_병원발행: parseFloat(record.category_병원발행) || 0,
        category_연예인: parseFloat(record.category_연예인) || 0,
        category_투자주식: parseFloat(record['category_투자·주식'] || record.category_투자주식) || 0,
        category_고객반응: parseFloat(record.category_고객반응) || 0,
        category_기술자료: parseFloat(record.category_기술자료) || 0,
        category_의학: parseFloat(record.category_의학) || 0,
        category_기타: parseFloat(record.category_기타) || 0,
        dominant_category: record.dominant_category,
        dominant_percentage: parseFloat(record.dominant_percentage) || 0,
        campaign_intensity: record.campaign_intensity,
        campaign_score: parseFloat(record.campaign_score) || 0,
        marketing_score: parseInt(record.marketing_keyword_score) || 0,
        avg_daily_articles: parseFloat(record.avg_daily_articles) || 0,
        spike_dates_count: parseInt(record.spike_dates_count) || 0
      };
      
      if (rfProductNames.includes(productName)) {
        rfProducts.push(productData);
      } else if (hifuProductNames.includes(productName)) {
        hifuProducts.push(productData);
      }
    });
    
    // Sort products by total articles (descending)
    rfProducts.sort((a, b) => b.total_articles - a.total_articles);
    hifuProducts.sort((a, b) => b.total_articles - a.total_articles);
    
    // Enhanced KPI metrics calculation
    const asterasysData = validRecords.filter(record => 
      asterasysProducts.includes(record.product_name)
    );
    
    const asterasysArticles = asterasysData.reduce((sum, record) => 
      sum + (parseInt(record.total_articles) || 0), 0
    );
    
    const marketSharePercentage = totalArticles > 0 ? 
      ((asterasysArticles / totalArticles) * 100).toFixed(1) : '0.0';

    // Daily average articles calculation (8월 31일 기준)
    const AUGUST_DAYS = 31;
    
    const totalDailyAverage = validRecords.reduce((sum, record) => {
      const totalArticles = parseInt(record.total_articles) || 0;
      return sum + (totalArticles / AUGUST_DAYS);
    }, 0) / validRecords.length;

    const asterasysDailyAverage = asterasysData.reduce((sum, record) => {
      const totalArticles = parseInt(record.total_articles) || 0;
      return sum + (totalArticles / AUGUST_DAYS);
    }, 0) / asterasysData.length;

    // Asterasys vs Market average ratio
    const asterasysVsMarketRatio = totalDailyAverage > 0 ? 
      ((asterasysDailyAverage / totalDailyAverage) * 100).toFixed(1) : '0.0';
    
    // Enhanced campaign intensity with detailed metrics
    const campaignIntensity = {
      'HIGH': validRecords.filter(r => r.campaign_intensity === 'HIGH'),
      'MEDIUM': validRecords.filter(r => r.campaign_intensity === 'MEDIUM'),
      'LOW': validRecords.filter(r => r.campaign_intensity === 'LOW'),
      'NONE': validRecords.filter(r => r.campaign_intensity === 'NONE')
    };
    
    // Peak performance analysis
    const peakPerformance = validRecords
      .map(record => ({
        product_name: record.product_name,
        peak_articles: parseInt(record.peak_articles) || 0,
        peak_date: record.peak_date,
        isAsterasys: asterasysProducts.includes(record.product_name)
      }))
      .sort((a, b) => b.peak_articles - a.peak_articles);
    
    // Celebrity influence analysis
    const celebrityData = validRecords
      .filter(record => record.celebrity_usage && record.celebrity_usage !== '없음')
      .map(record => ({
        product_name: record.product_name,
        celebrity_usage: record.celebrity_usage,
        total_articles: parseInt(record.total_articles) || 0,
        isAsterasys: asterasysProducts.includes(record.product_name)
      }));
    
    // Campaign ROI correlation data
    const campaignROI = validRecords.map(record => ({
      product_name: record.product_name,
      campaign_score: parseFloat(record.campaign_score) || 0,
      marketing_score: parseInt(record.marketing_keyword_score) || 0,
      total_articles: parseInt(record.total_articles) || 0,
      campaign_intensity: record.campaign_intensity,
      isAsterasys: asterasysProducts.includes(record.product_name)
    }));
    
    // Temporal activity analysis
    const activityAnalysis = validRecords.map(record => ({
      product_name: record.product_name,
      analysis_period: record.analysis_period,
      avg_daily_articles: parseFloat(record.avg_daily_articles) || 0,
      max_daily_articles: parseInt(record.max_daily_articles) || 0,
      spike_dates_count: parseInt(record.spike_dates_count) || 0,
      total_articles: parseInt(record.total_articles) || 0,
      isAsterasys: asterasysProducts.includes(record.product_name)
    }));
    
    // Competitor analysis data
    const competitorAnalysis = validRecords
      .filter(record => record.competitor_mentions_detail && record.competitor_mentions_detail !== '없음')
      .map(record => ({
        product_name: record.product_name,
        competitor_mentions_count: parseInt(record.competitor_mentions_count) || 0,
        top_competitor_mentioned: record.top_competitor_mentioned,
        competitor_mentions_detail: record.competitor_mentions_detail,
        total_articles: parseInt(record.total_articles) || 0,
        isAsterasys: asterasysProducts.includes(record.product_name)
      }));
    
    const response = {
      rfProducts,
      hifuProducts,
      summary: {
        totalProducts: validRecords.length,
        totalArticles,
        asterasysArticles,
        marketShare: marketSharePercentage,
        totalDailyAverage: totalDailyAverage.toFixed(1),
        asterasysDailyAverage: asterasysDailyAverage.toFixed(1),
        asterasysVsMarketRatio: asterasysVsMarketRatio,
        averageMarketingScore: Math.round(
          validRecords.reduce((sum, record) => 
            sum + (parseInt(record.marketing_keyword_score) || 0), 0
          ) / validRecords.length
        ),
        peakArticles: peakPerformance[0]?.peak_articles || 0,
        peakProduct: peakPerformance[0]?.product_name || 'N/A',
        celebrityProductsCount: celebrityData.length
      },
      campaignIntensity,
      peakPerformance: peakPerformance.slice(0, 5),
      celebrityData,
      campaignROI,
      activityAnalysis,
      competitorAnalysis,
      topPerformers: validRecords
        .sort((a, b) => (parseInt(b.marketing_keyword_score) || 0) - (parseInt(a.marketing_keyword_score) || 0))
        .slice(0, 10)
        .map(record => ({
          product_name: record.product_name,
          total_articles: parseInt(record.total_articles) || 0,
          marketing_score: parseInt(record.marketing_keyword_score) || 0,
          campaign_intensity: record.campaign_intensity,
          dominant_category: record.dominant_category,
          isAsterasys: asterasysProducts.includes(record.product_name)
        })),
      asterasysProducts: asterasysData.map(record => ({
        product_name: record.product_name,
        total_articles: parseInt(record.total_articles) || 0,
        marketing_score: parseInt(record.marketing_keyword_score) || 0,
        campaign_intensity: record.campaign_intensity,
        dominant_category: record.dominant_category,
        dominant_percentage: parseFloat(record.dominant_percentage) || 0
      })),
      rawData: validRecords
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error processing news analysis data:', error);
    return NextResponse.json(
      { error: 'Failed to process news analysis data' },
      { status: 500 }
    );
  }
}