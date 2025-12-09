#!/usr/bin/env node

/**
 * 전체키워드_통합분석 CSV를 news analysis CSV로 변환
 *
 * 사용법:
 *   node scripts/generateNewsAnalysis.cjs --month=2025-11
 */

const fs = require('fs')
const path = require('path')

// 분석 대상 제품 목록
const TARGET_PRODUCTS = [
  '써마지', '울쎄라', '올리지오', '볼뉴머', '쿨페이즈', '덴서티',
  '슈링크', '세르프', '인모드', '쿨소닉', '리니어지', '텐써마',
  '리프테라', '튠페이스', '브이로', '텐쎄라', '튠라이너', '리니어펌'
]

// 제품별 그룹 매핑
const PRODUCT_GROUPS = {
  '써마지': '고주파', '올리지오': '고주파', '볼뉴머': '고주파', '쿨페이즈': '고주파',
  '덴서티': '고주파', '세르프': '고주파', '인모드': '고주파', '텐써마': '고주파', '튠페이스': '고주파',
  '울쎄라': '초음파', '슈링크': '초음파', '쿨소닉': '초음파', '리니어지': '초음파',
  '리프테라': '초음파', '브이로': '초음파', '텐쎄라': '초음파', '튠라이너': '초음파', '리니어펌': '초음파'
}

// 카테고리 매핑
const CATEGORY_MAP = {
  '기업소식': 'category_기업소식',
  '병원발행': 'category_병원발행',
  '연예인': 'category_연예인',
  '투자·주식': 'category_투자·주식',
  '투자/주식': 'category_투자·주식',
  '고객반응': 'category_고객반응',
  '기술자료': 'category_기술자료',
  '의학': 'category_의학',
  '기타': 'category_기타',
  '관련없음': 'category_기타'
}

function parseArgs(argv) {
  return argv.slice(2).reduce((acc, item) => {
    if (!item.startsWith('--')) return acc
    const [rawKey, rawValue] = item.replace(/^--/, '').split('=')
    acc[rawKey.trim()] = rawValue === undefined ? true : rawValue.trim()
    return acc
  }, {})
}

function parseCSV(content) {
  // BOM 제거 및 CRLF 정규화
  content = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  const data = []
  let headers = []
  let currentRow = []
  let currentField = ''
  let inQuotes = false
  let isFirstRow = true

  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    const nextChar = content[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 이스케이프된 따옴표
        currentField += '"'
        i++
      } else {
        // 따옴표 시작/끝
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim())
      currentField = ''
    } else if (char === '\n' && !inQuotes) {
      currentRow.push(currentField.trim())
      currentField = ''

      if (isFirstRow) {
        headers = currentRow
        isFirstRow = false
      } else if (currentRow.length >= 2 && currentRow[0]) {
        // 유효한 데이터 행인 경우
        const row = {}
        headers.forEach((header, index) => {
          row[header] = currentRow[index] || ''
        })
        data.push(row)
      }
      currentRow = []
    } else {
      currentField += char
    }
  }

  // 마지막 행 처리
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (!isFirstRow && currentRow.length >= 2 && currentRow[0]) {
      const row = {}
      headers.forEach((header, index) => {
        row[header] = currentRow[index] || ''
      })
      data.push(row)
    }
  }

  return data
}

function extractCategory(row) {
  // analysis_category 필드에서 카테고리 추출
  const categoryField = row['analysis_category'] || ''

  // 직접 매핑된 카테고리
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (categoryField.includes(key)) {
      return key
    }
  }

  // analysis_reasoning에서 추출 시도
  const reasoning = row['analysis_reasoning'] || ''
  if (reasoning.includes('병원') || reasoning.includes('의료진')) return '병원발행'
  if (reasoning.includes('기업') || reasoning.includes('마케팅')) return '기업소식'
  if (reasoning.includes('연예인') || reasoning.includes('인플루언서')) return '연예인'
  if (reasoning.includes('투자') || reasoning.includes('주식')) return '투자·주식'

  return '기타'
}

function extractCelebrities(articles) {
  const celebrities = []
  const celebrityPatterns = [
    /수지/, /이민호/, /김나영/, /김성령/, /백지연/
  ]

  articles.forEach(article => {
    const text = (article.text || '') + (article.title || '')
    celebrityPatterns.forEach(pattern => {
      const match = text.match(pattern)
      if (match) {
        const name = match[0]
        const existing = celebrities.find(c => c.name === name)
        if (existing) {
          existing.count++
        } else {
          celebrities.push({ name, count: 1 })
        }
      }
    })
  })

  if (celebrities.length === 0) return '없음'
  return celebrities.map(c => `${c.name}(${c.count})`).join('; ')
}

function extractCompetitorMentions(articles, productName) {
  const competitors = {}

  articles.forEach(article => {
    const text = (article.text || '') + (article.title || '')
    TARGET_PRODUCTS.forEach(product => {
      if (text.includes(product)) {
        competitors[product] = (competitors[product] || 0) + 1
      }
    })
  })

  const sorted = Object.entries(competitors)
    .sort((a, b) => b[1] - a[1])

  const detail = sorted.map(([name, count]) => `${name}(${count})`).join('; ')
  const topCompetitor = sorted[0] ? sorted[0][0] : productName

  return {
    count: sorted.length,
    top: topCompetitor,
    detail: detail || productName
  }
}

function calculateCampaignIntensity(avgDaily, maxDaily) {
  if (avgDaily >= 10 || maxDaily >= 30) return 'HIGH'
  if (avgDaily >= 3 || maxDaily >= 10) return 'MEDIUM'
  if (avgDaily >= 1 || maxDaily >= 3) return 'LOW'
  return 'NONE'
}

function getCampaignScore(intensity) {
  switch (intensity) {
    case 'HIGH': return 0.8
    case 'MEDIUM': return 0.6
    case 'LOW': return 0.3
    default: return 0
  }
}

function processProductData(productName, articles) {
  if (articles.length === 0) {
    return null
  }

  // 날짜 파싱 및 정렬
  const dates = articles
    .map(a => a.published_at ? a.published_at.split('T')[0] : null)
    .filter(d => d)
    .sort()

  const startDate = dates[0] || ''
  const endDate = dates[dates.length - 1] || ''
  const analysisPeriod = startDate && endDate ? `${startDate} ~ ${endDate}` : ''

  // 일별 기사 수 계산
  const dailyCounts = {}
  dates.forEach(date => {
    dailyCounts[date] = (dailyCounts[date] || 0) + 1
  })

  const dailyValues = Object.values(dailyCounts)
  const totalDays = Object.keys(dailyCounts).length || 1
  const avgDaily = (articles.length / totalDays).toFixed(1)
  const maxDaily = Math.max(...dailyValues, 0)

  // 피크 날짜 찾기
  let peakDate = ''
  let peakArticles = 0
  for (const [date, count] of Object.entries(dailyCounts)) {
    if (count > peakArticles) {
      peakArticles = count
      peakDate = date
    }
  }

  // 스파이크 날짜 수 (평균의 2배 이상)
  const avgCount = articles.length / totalDays
  const spikeDates = dailyValues.filter(v => v >= avgCount * 2).length

  // 카테고리 분포
  const categories = {
    '기업소식': 0,
    '병원발행': 0,
    '연예인': 0,
    '투자·주식': 0,
    '고객반응': 0,
    '기술자료': 0,
    '의학': 0,
    '기타': 0
  }

  articles.forEach(article => {
    const cat = extractCategory(article)
    if (categories[cat] !== undefined) {
      categories[cat]++
    } else {
      categories['기타']++
    }
  })

  // 주요 카테고리 찾기
  let dominantCategory = '기타'
  let dominantCount = 0
  for (const [cat, count] of Object.entries(categories)) {
    if (count > dominantCount) {
      dominantCount = count
      dominantCategory = cat
    }
  }

  const total = articles.length
  const dominantPercentage = total > 0 ? ((dominantCount / total) * 100).toFixed(1) : 0

  // 카테고리별 퍼센트
  const categoryPercentages = {}
  for (const [cat, count] of Object.entries(categories)) {
    categoryPercentages[cat] = total > 0 ? ((count / total) * 100).toFixed(1) : 0
  }

  // 캠페인 강도
  const campaignIntensity = calculateCampaignIntensity(parseFloat(avgDaily), maxDaily)
  const campaignScore = getCampaignScore(campaignIntensity)

  // 숫자 프로모션 (가격 언급)
  const numberPromoArticles = articles.filter(a =>
    /\d+만\s*원|\d+원|할인|프로모션|이벤트/.test(a.text || '')
  ).length

  // 연예인 사용
  const celebrityUsage = extractCelebrities(articles)

  // 경쟁사 언급
  const competitorInfo = extractCompetitorMentions(articles, productName)

  // 마케팅 키워드 점수
  const marketingKeywords = ['신제품', '출시', '론칭', '이벤트', '프로모션', '할인', '특가']
  let marketingScore = 0
  articles.forEach(a => {
    const text = (a.text || '') + (a.title || '')
    marketingKeywords.forEach(kw => {
      if (text.includes(kw)) marketingScore++
    })
  })

  return {
    product_name: productName,
    total_articles: total,
    analysis_period: analysisPeriod,
    avg_daily_articles: avgDaily,
    max_daily_articles: maxDaily,
    dominant_category: dominantCategory,
    dominant_percentage: dominantPercentage,
    category_기업소식: categoryPercentages['기업소식'],
    category_병원발행: categoryPercentages['병원발행'],
    category_연예인: categoryPercentages['연예인'],
    'category_투자·주식': categoryPercentages['투자·주식'],
    category_고객반응: categoryPercentages['고객반응'],
    category_기술자료: categoryPercentages['기술자료'],
    category_의학: categoryPercentages['의학'],
    category_기타: categoryPercentages['기타'],
    campaign_intensity: campaignIntensity,
    campaign_score: campaignScore,
    spike_dates_count: spikeDates,
    peak_date: peakDate,
    peak_articles: peakArticles,
    number_promotion_articles: numberPromoArticles,
    unique_numbers_count: numberPromoArticles > 0 ? Math.min(numberPromoArticles, 5) : 0,
    celebrity_usage: celebrityUsage,
    marketing_keyword_score: marketingScore,
    competitor_mentions_count: competitorInfo.count,
    top_competitor_mentioned: competitorInfo.top,
    competitor_mentions_detail: `"${competitorInfo.detail}"`
  }
}

function main() {
  const args = parseArgs(process.argv)
  const month = args.month || '2025-11'

  console.log('📊 News Analysis 데이터 생성')
  console.log(`📅 대상 월: ${month}`)

  // 입력 파일 찾기
  const rawDir = path.join(process.cwd(), 'data', 'raw', month)
  const files = fs.readdirSync(rawDir)
  const inputFile = files.find(f => f.includes('전체키워드_통합분석') && f.endsWith('.csv'))

  if (!inputFile) {
    console.error('❌ 전체키워드_통합분석 CSV 파일을 찾을 수 없습니다.')
    process.exit(1)
  }

  const inputPath = path.join(rawDir, inputFile)
  console.log(`📂 입력 파일: ${inputFile}`)

  // CSV 읽기
  const content = fs.readFileSync(inputPath, 'utf8')
  const data = parseCSV(content)
  console.log(`📰 전체 기사 수: ${data.length}`)

  // 제품별 그룹화
  const productGroups = {}
  TARGET_PRODUCTS.forEach(p => productGroups[p] = [])

  data.forEach(row => {
    const keyword = row['검색키워드'] || ''
    if (TARGET_PRODUCTS.includes(keyword)) {
      productGroups[keyword].push(row)
    }
  })

  // 각 제품 처리
  const results = []
  for (const product of TARGET_PRODUCTS) {
    const articles = productGroups[product]
    if (articles.length > 0) {
      const result = processProductData(product, articles)
      if (result) {
        results.push(result)
        console.log(`  ✓ ${product}: ${articles.length}개 기사`)
      }
    }
  }

  // 기사 수 기준 내림차순 정렬
  results.sort((a, b) => b.total_articles - a.total_articles)

  // CSV 출력 생성
  const headers = [
    'product_name', 'total_articles', 'analysis_period', 'avg_daily_articles',
    'max_daily_articles', 'dominant_category', 'dominant_percentage',
    'category_기업소식', 'category_병원발행', 'category_연예인', 'category_투자·주식',
    'category_고객반응', 'category_기술자료', 'category_의학', 'category_기타',
    'campaign_intensity', 'campaign_score', 'spike_dates_count', 'peak_date',
    'peak_articles', 'number_promotion_articles', 'unique_numbers_count',
    'celebrity_usage', 'marketing_keyword_score', 'competitor_mentions_count',
    'top_competitor_mentioned', 'competitor_mentions_detail'
  ]

  let csv = headers.join(',') + '\n'
  results.forEach(row => {
    const values = headers.map(h => row[h] !== undefined ? row[h] : '')
    csv += values.join(',') + '\n'
  })

  // 출력 파일 저장
  const outputPath = path.join(rawDir, 'asterasys_total_data - news analysis.csv')
  fs.writeFileSync(outputPath, '\ufeff' + csv, 'utf8')
  console.log(`\n✅ 저장 완료: ${path.relative(process.cwd(), outputPath)}`)

  // public 폴더에도 복사
  const publicPath = path.join(process.cwd(), 'public', 'data', 'raw', month, 'asterasys_total_data - news analysis.csv')
  fs.mkdirSync(path.dirname(publicPath), { recursive: true })
  fs.writeFileSync(publicPath, '\ufeff' + csv, 'utf8')
  console.log(`✅ 복사 완료: ${path.relative(process.cwd(), publicPath)}`)

  // news_rank.csv 생성 (간단한 순위 데이터)
  console.log('\n📊 news_rank.csv 생성 중...')

  // 그룹별로 분리하여 순위 계산
  const rfProducts = results.filter(r => PRODUCT_GROUPS[r.product_name] === '고주파')
    .sort((a, b) => b.total_articles - a.total_articles)
    .map((r, idx) => ({ ...r, rank: idx + 1, group: '고주파' }))

  const hifuProducts = results.filter(r => PRODUCT_GROUPS[r.product_name] === '초음파')
    .sort((a, b) => b.total_articles - a.total_articles)
    .map((r, idx) => ({ ...r, rank: idx + 1, group: '초음파' }))

  // 리니어펌 추가 (기사가 없는 경우)
  if (!hifuProducts.find(p => p.product_name === '리니어펌')) {
    hifuProducts.push({ product_name: '리니어펌', total_articles: 0, rank: hifuProducts.length + 1, group: '초음파' })
  }

  const rankData = [...rfProducts, ...hifuProducts]

  let rankCsv = '키워드,그룹,총 발행량,발행량 순위\n'
  rankData.forEach(row => {
    rankCsv += `${row.product_name},${row.group},${row.total_articles},${row.rank}\n`
  })

  const rankOutputPath = path.join(rawDir, 'asterasys_total_data - news_rank.csv')
  fs.writeFileSync(rankOutputPath, '\ufeff' + rankCsv, 'utf8')
  console.log(`✅ 저장 완료: ${path.relative(process.cwd(), rankOutputPath)}`)

  const rankPublicPath = path.join(process.cwd(), 'public', 'data', 'raw', month, 'asterasys_total_data - news_rank.csv')
  fs.writeFileSync(rankPublicPath, '\ufeff' + rankCsv, 'utf8')
  console.log(`✅ 복사 완료: ${path.relative(process.cwd(), rankPublicPath)}`)

  console.log(`\n📊 총 ${results.length}개 제품 분석 완료`)
}

main()
