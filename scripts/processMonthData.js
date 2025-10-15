#!/usr/bin/env node

/**
 * 월별 데이터 통합 처리 스크립트
 * - 기본 CSV 처리 (21개 파일)
 * - YouTube 채널 데이터
 * - YouTube-판매 상관관계 데이터
 *
 * 사용법:
 *   npm run process-month -- --month=2025-10
 *   npm run process-month -- --month=2025-11 --set-latest=true
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import {
  getLatestMonth,
  isValidMonth,
  setLatestMonth,
  monthExistsInRaw
} from '../src/lib/server/monthConfig.js'

const execAsync = promisify(exec)

function parseArgs(argv) {
  return argv.slice(2).reduce((acc, item) => {
    if (!item.startsWith('--')) return acc
    const [rawKey, rawValue] = item.replace(/^--/, '').split('=')
    const key = rawKey.trim()
    const value = rawValue === undefined ? true : rawValue.trim()
    acc[key] = value
    return acc
  }, {})
}

async function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`)
  try {
    const { stdout, stderr } = await execAsync(command)
    if (stdout) console.log(stdout)
    if (stderr && !stderr.includes('Warning')) console.error(stderr)
    console.log(`✅ ${description} 완료`)
    return true
  } catch (error) {
    console.error(`❌ ${description} 실패:`, error.message)
    return false
  }
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

    if (!monthExistsInRaw(month)) {
      console.error(`❌ 원본 데이터를 찾을 수 없습니다: data/raw/${month}`)
      console.error('먼저 CSV 파일을 data/raw/${month} 폴더에 업로드해 주세요.')
      process.exit(1)
    }

    console.log('╔════════════════════════════════════════════════╗')
    console.log('║   📊 Asterasys 월별 데이터 통합 처리 시작   ║')
    console.log('╚════════════════════════════════════════════════╝')
    console.log(`📅 대상 월: ${month}`)
    console.log(`⚙️  latest-month.json 업데이트: ${shouldUpdateLatest ? 'Yes' : 'No'}`)

    const results = {
      processData: false,
      youtubeChannels: false,
      youtubeSalesMatching: false
    }

    // 1. 기본 CSV 처리 (21개 파일)
    results.processData = await runCommand(
      `node scripts/processData.js --month=${month} --set-latest=false`,
      '1/3 기본 CSV 데이터 처리 (21개 파일)'
    )

    // 2. YouTube 채널 데이터 생성
    results.youtubeChannels = await runCommand(
      `node scripts/extractAsterasysChannels.js --month=${month}`,
      '2/3 YouTube 채널 데이터 생성'
    )

    // 3. YouTube-판매 상관관계 데이터 생성
    results.youtubeSalesMatching = await runCommand(
      `node scripts/processYoutubeSalesMatching.js --month=${month}`,
      '3/3 YouTube-판매 상관관계 데이터 생성'
    )

    // latest-month.json 업데이트
    if (shouldUpdateLatest && results.processData) {
      setLatestMonth(month)
      console.log(`\n✅ latest-month.json 업데이트: ${month}`)
    }

    // 결과 요약
    console.log('\n╔════════════════════════════════════════════════╗')
    console.log('║              📊 처리 결과 요약                ║')
    console.log('╚════════════════════════════════════════════════╝')
    console.log(`기본 CSV 처리:           ${results.processData ? '✅ 성공' : '❌ 실패'}`)
    console.log(`YouTube 채널 데이터:     ${results.youtubeChannels ? '✅ 성공' : '❌ 실패'}`)
    console.log(`YouTube-판매 상관관계:    ${results.youtubeSalesMatching ? '✅ 성공' : '❌ 실패'}`)

    const allSuccess = Object.values(results).every(v => v)

    if (allSuccess) {
      console.log('\n🎉 모든 데이터 처리가 성공적으로 완료되었습니다!')
      console.log('\n📁 생성된 데이터:')
      console.log(`  - data/processed/${month}/dashboard.json`)
      console.log(`  - data/processed/${month}/kpis.json`)
      console.log(`  - data/processed/${month}/channels.json`)
      console.log(`  - data/processed/${month}/raw.json`)
      console.log(`  - data/processed/youtube/${month}/asterasys_channels_data.json`)
      console.log(`  - data/processed/youtube/${month}/youtube_sales_exact_matching.json`)
      console.log('\n🚀 이제 대시보드를 시작할 수 있습니다!')
    } else {
      console.log('\n⚠️  일부 처리 작업이 실패했습니다. 위의 오류 메시지를 확인해 주세요.')
      process.exit(1)
    }

  } catch (error) {
    console.error('\n❌ 처리 실패:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()
