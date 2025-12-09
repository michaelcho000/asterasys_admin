#!/usr/bin/env node

/**
 * news_rank.csv의 총 발행량에 맞게 news analysis.csv를 조정
 */

const fs = require('fs')
const path = require('path')

function parseArgs(argv) {
  return argv.slice(2).reduce((acc, item) => {
    if (!item.startsWith('--')) return acc
    const [rawKey, rawValue] = item.replace(/^--/, '').split('=')
    acc[rawKey.trim()] = rawValue === undefined ? true : rawValue.trim()
    return acc
  }, {})
}

function parseCSV(content) {
  content = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = content.split('\n').filter(l => l.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split(',')
  const data = []

  for (let i = 1; i < lines.length; i++) {
    const values = []
    let current = ''
    let inQuotes = false

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const row = {}
    headers.forEach((h, idx) => row[h.trim()] = values[idx] || '')
    if (row[headers[0].trim()]) data.push(row)
  }

  return data
}

function main() {
  const args = parseArgs(process.argv)
  const month = args.month || '2025-11'

  console.log('📊 News Analysis 데이터 조정')
  console.log(`📅 대상 월: ${month}`)

  const rawDir = path.join(process.cwd(), 'data', 'raw', month)

  // news_rank.csv 읽기
  const rankPath = path.join(rawDir, 'asterasys_total_data - news_rank.csv')
  const rankContent = fs.readFileSync(rankPath, 'utf8')
  const rankData = parseCSV(rankContent)

  // news_rank를 map으로 변환
  const rankMap = {}
  rankData.forEach(row => {
    rankMap[row['키워드']] = {
      total: parseInt(row['총 발행량']) || 0,
      group: row['그룹'],
      rank: parseInt(row['발행량 순위']) || 0
    }
  })

  console.log('\n📋 news_rank 기준 데이터:')
  Object.entries(rankMap).forEach(([k, v]) => {
    console.log(`  ${k}: ${v.total}개`)
  })

  // news analysis.csv 읽기
  const analysisPath = path.join(rawDir, 'asterasys_total_data - news analysis.csv')
  const analysisContent = fs.readFileSync(analysisPath, 'utf8')
  const analysisData = parseCSV(analysisContent)

  // 조정된 데이터 생성
  const adjustedData = analysisData.map(row => {
    const productName = row['product_name']
    const rankInfo = rankMap[productName]

    if (!rankInfo) {
      console.log(`  ⚠️ ${productName}: news_rank에 없음`)
      return row
    }

    const oldTotal = parseInt(row['total_articles']) || 0
    const newTotal = rankInfo.total

    if (oldTotal === newTotal) {
      return row
    }

    // 비율 계산
    const ratio = oldTotal > 0 ? newTotal / oldTotal : 1

    // 조정된 값 계산
    const adjusted = { ...row }
    adjusted['total_articles'] = newTotal

    // 일일 평균 조정
    const analysisStr = row['analysis_period'] || ''
    const dates = analysisStr.split(' ~ ')
    if (dates.length === 2) {
      const start = new Date(dates[0])
      const end = new Date(dates[1])
      const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1)
      adjusted['avg_daily_articles'] = (newTotal / days).toFixed(1)
    }

    // max_daily_articles 조정 (비율 적용)
    const oldMax = parseFloat(row['max_daily_articles']) || 0
    adjusted['max_daily_articles'] = Math.round(oldMax * ratio)

    // peak_articles 조정
    const oldPeak = parseInt(row['peak_articles']) || 0
    adjusted['peak_articles'] = Math.round(oldPeak * ratio)

    // number_promotion_articles 조정
    const oldPromo = parseInt(row['number_promotion_articles']) || 0
    adjusted['number_promotion_articles'] = Math.round(oldPromo * ratio)

    // marketing_keyword_score 조정
    const oldMarketing = parseInt(row['marketing_keyword_score']) || 0
    adjusted['marketing_keyword_score'] = Math.round(oldMarketing * ratio)

    // campaign_intensity 재계산
    const avgDaily = parseFloat(adjusted['avg_daily_articles'])
    const maxDaily = parseInt(adjusted['max_daily_articles'])
    if (avgDaily >= 10 || maxDaily >= 30) {
      adjusted['campaign_intensity'] = 'HIGH'
      adjusted['campaign_score'] = 0.8
    } else if (avgDaily >= 3 || maxDaily >= 10) {
      adjusted['campaign_intensity'] = 'MEDIUM'
      adjusted['campaign_score'] = 0.6
    } else if (avgDaily >= 1 || maxDaily >= 3) {
      adjusted['campaign_intensity'] = 'LOW'
      adjusted['campaign_score'] = 0.3
    } else {
      adjusted['campaign_intensity'] = 'NONE'
      adjusted['campaign_score'] = 0
    }

    console.log(`  ✓ ${productName}: ${oldTotal} → ${newTotal} (${ratio > 1 ? '+' : ''}${((ratio - 1) * 100).toFixed(0)}%)`)

    return adjusted
  })

  // 정렬 (total_articles 기준 내림차순)
  adjustedData.sort((a, b) => parseInt(b['total_articles']) - parseInt(a['total_articles']))

  // CSV 출력 생성
  const headers = Object.keys(analysisData[0])
  let csv = headers.join(',') + '\n'

  adjustedData.forEach(row => {
    const values = headers.map(h => {
      const val = row[h]
      const strVal = String(val || '')
      // 쉼표나 특수문자가 있으면 따옴표로 감싸기
      if (strVal && (strVal.includes(',') || strVal.includes('"') || strVal.includes(';'))) {
        return `"${strVal}"`
      }
      return strVal
    })
    csv += values.join(',') + '\n'
  })

  // 저장
  fs.writeFileSync(analysisPath, '\ufeff' + csv, 'utf8')
  console.log(`\n✅ 저장 완료: ${path.relative(process.cwd(), analysisPath)}`)

  // public 폴더에도 복사
  const publicPath = path.join(process.cwd(), 'public', 'data', 'raw', month, 'asterasys_total_data - news analysis.csv')
  fs.writeFileSync(publicPath, '\ufeff' + csv, 'utf8')
  console.log(`✅ 복사 완료: ${path.relative(process.cwd(), publicPath)}`)
}

main()
