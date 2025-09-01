#!/usr/bin/env node

/**
 * Data processing script for Asterasys Dashboard
 * Run: npm run process-data
 */

import { DataProcessor } from '../src/lib/data-processing/processor.js';

async function main() {
  try {
    console.log('🚀 Starting Asterasys data processing...');
    console.log('=====================================');
    
    const processor = new DataProcessor();
    const result = await processor.processData();
    
    console.log('\n✅ Processing completed successfully!');
    console.log('=====================================');
    console.log(`📊 Total products processed: ${Object.keys(result.raw.blog.concat(result.raw.cafe, result.raw.news)).reduce((acc, curr) => {
      if (!acc.includes(curr.keyword)) acc.push(curr.keyword);
      return acc;
    }, []).length}`);
    console.log(`📈 Market share (Asterasys): ${result.kpis.overview.asterasysMarketShare.toFixed(2)}%`);
    console.log(`💰 Sales share (Asterasys): ${result.kpis.overview.asterasysSalesShare.toFixed(2)}%`);
    console.log(`🎯 Total market posts: ${result.kpis.overview.totalMarketPosts.toLocaleString()}`);
    console.log(`💵 Total market sales: ${result.kpis.overview.totalMarketSales.toLocaleString()}`);
    console.log('\n📁 Generated files:');
    console.log('  - data/processed/dashboard.json');
    console.log('  - data/processed/kpis.json');
    console.log('  - data/processed/channels.json');
    console.log('  - data/processed/raw.json');
    console.log('\n🎉 Ready to start the dashboard!');
    
  } catch (error) {
    console.error('❌ Processing failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();