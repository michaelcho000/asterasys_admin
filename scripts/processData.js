#!/usr/bin/env node

/**
 * Data processing script for Asterasys Dashboard
 * Run examples:
 *   npm run process-data -- --month=2025-09
 *   npm run process-data -- --month=2025-08 --set-latest=false
 */

import { DataProcessor } from '../src/lib/data-processing/processor.js'
import {
  getLatestMonth,
  isValidMonth,
  setLatestMonth
} from '../src/lib/server/monthConfig.js'

function parseArgs(argv) {
  return argv.slice(2).reduce((acc, item) => {
    if (!item.startsWith('--')) {
      return acc
    }

    const [rawKey, rawValue] = item.replace(/^--/, '').split('=')
    const key = rawKey.trim()
    const value = rawValue === undefined ? true : rawValue.trim()
    acc[key] = value
    return acc
  }, {})
}

async function main() {
  try {
    const args = parseArgs(process.argv)
    const requestedMonth = typeof args.month === 'string' ? args.month : undefined
    const shouldUpdateLatest = args['set-latest'] === 'false' ? false : true

    const defaultMonth = getLatestMonth()
    const month = requestedMonth || defaultMonth

    if (!month) {
      console.error('❌ 월 정보를 찾을 수 없습니다. --month=YYYY-MM 형식으로 지정해 주세요.')
      process.exit(1)
    }

    if (!isValidMonth(month)) {
      console.error(`❌ 잘못된 월 형식입니다: ${month}. YYYY-MM 형식을 사용하세요.`)
      process.exit(1)
    }

    console.log('🚀 Starting Asterasys data processing...')
    console.log('=====================================')
    console.log(`📅 대상 월: ${month}`)

    const processor = new DataProcessor({ month })
    const result = await processor.processData()

    if (shouldUpdateLatest) {
      setLatestMonth(month)
    }

    const uniqueKeywords = new Set()
    ;['blog', 'cafe', 'news'].forEach((channel) => {
      (result.raw?.[channel] || []).forEach((item) => {
        if (item?.keyword) uniqueKeywords.add(item.keyword)
      })
    })

    console.log('\n✅ Processing completed successfully!')
    console.log('=====================================')
    console.log(`📊 Unique products tracked: ${uniqueKeywords.size}`)
    console.log(`📈 Market share (Asterasys): ${result.kpis.overview.asterasysMarketShare.toFixed(2)}%`)
    console.log(`💰 Sales share (Asterasys): ${result.kpis.overview.asterasysSalesShare.toFixed(2)}%`)
    console.log(`🎯 Total market posts: ${result.kpis.overview.totalMarketPosts.toLocaleString()}`)
    console.log(`💵 Total market sales: ${result.kpis.overview.totalMarketSales.toLocaleString()}`)
    console.log('\n📁 Generated files:')
    console.log(`  - data/processed/${month}/dashboard.json`)
    console.log(`  - data/processed/${month}/kpis.json`)
    console.log(`  - data/processed/${month}/channels.json`)
    console.log(`  - data/processed/${month}/raw.json`)
    console.log('\n🎉 Ready to start the dashboard!')

  } catch (error) {
    console.error('❌ Processing failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()
