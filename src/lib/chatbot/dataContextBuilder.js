/**
 * Asterasys Data Context Builder - Enhanced RAG System
 * 21개 CSV 파일 전체를 활용한 포괄적 데이터 컨텍스트 구성
 */

// 21개 CSV 데이터 소스 맵핑
const DATA_SOURCES = {
  // 핵심 판매/발행 데이터
  sale: 'sale',
  blog_rank: 'blog_rank',
  cafe_rank: 'cafe_rank',
  news_rank: 'news_rank',
  youtube_rank: 'youtube_rank',

  // 채널별 상세 데이터
  blog_author: 'blog_author',
  blog_participation: 'blog_participation',
  blog_comparison: 'blog_comparison',
  cafe_post: 'cafe_post',
  cafe_author: 'cafe_author',
  cafe_participation: 'cafe_participation',
  news_post: 'news_post',

  // YouTube 분석
  youtube_post: 'youtube_post',
  youtube_channel_subs: 'youtube_channel_subs',
  youtube_efficiency: 'youtube_efficiency',
  youtube_video_type: 'youtube_video_type',

  // 광고 및 트래픽
  outdoor_ad: 'outdoor_ad',
  targeting_ad: 'targeting_ad',
  traffic: 'traffic',
  'naver datalab': 'naver datalab',
  facebook_targeting: 'facebook_targeting'
}

// JSON 인사이트 파일 (CSV에 없는 심층 분석 데이터)
const JSON_INSIGHTS = {
  llm_insights: 'llm-insights', // 채널별 전략, 현황, 인사이트
  organic_viral: 'organic-viral-analysis' // Organic/Managed 비율 분석
}

export class DataContextBuilder {
  constructor(month) {
    this.month = month
    // Vercel serverless 환경에서는 직접 파일 시스템 접근
    this.useFileSystem = typeof window === 'undefined'
    console.log('[RAG] DataContextBuilder initialized')
    console.log('[RAG] - Month:', month)
    console.log('[RAG] - Use filesystem:', this.useFileSystem)
  }

  /**
   * 이전 월 계산 (YYYY-MM 형식)
   */
  getPreviousMonth(month) {
    const [year, monthNum] = month.split('-').map(Number)
    if (monthNum === 1) {
      return `${year - 1}-12`
    }
    return `${year}-${String(monthNum - 1).padStart(2, '0')}`
  }

  /**
   * N개월 전까지의 월 배열 생성
   */
  getMonthRange(currentMonth, monthsBack) {
    const months = [currentMonth]
    let month = currentMonth
    for (let i = 0; i < monthsBack; i++) {
      month = this.getPreviousMonth(month)
      months.push(month)
    }
    return months
  }

  /**
   * 질문 분석하여 필요한 데이터 소스 결정
   */
  analyzeQuery(query) {
    const lowerQuery = query.toLowerCase()
    const requiredSources = new Set()
    let monthsToLoad = 1 // 기본값: 현재 월만

    // 항상 기본 데이터 포함 (판매, 순위)
    requiredSources.add('sale')
    requiredSources.add('blog_rank')
    requiredSources.add('cafe_rank')
    requiredSources.add('news_rank')

    // 판매 관련
    if (this.matches(lowerQuery, ['판매', '매출', 'sale', '판매량', '수익'])) {
      requiredSources.add('sale')
      requiredSources.add('youtube_efficiency')
    }

    // 블로그 관련
    if (this.matches(lowerQuery, ['블로그', 'blog', '작성자', '포스팅'])) {
      requiredSources.add('blog_rank')
      requiredSources.add('blog_author')
      requiredSources.add('blog_participation')
      requiredSources.add('blog_comparison')
    }

    // 카페 관련
    if (this.matches(lowerQuery, ['카페', 'cafe', '게시글', '댓글'])) {
      requiredSources.add('cafe_rank')
      requiredSources.add('cafe_post')
      requiredSources.add('cafe_author')
      requiredSources.add('cafe_participation')
    }

    // 뉴스 관련
    if (this.matches(lowerQuery, ['뉴스', 'news', '언론', '기사', '보도'])) {
      requiredSources.add('news_rank')
      requiredSources.add('news_post')
    }

    // YouTube 관련
    if (this.matches(lowerQuery, ['유튜브', 'youtube', '영상', '조회수', '채널'])) {
      requiredSources.add('youtube_rank')
      requiredSources.add('youtube_post')
      requiredSources.add('youtube_channel_subs')
      requiredSources.add('youtube_efficiency')
      requiredSources.add('youtube_video_type')
    }

    // 광고 관련
    if (this.matches(lowerQuery, ['광고', 'ad', '타겟팅', '옥외', 'ott', '페이스북'])) {
      requiredSources.add('outdoor_ad')
      requiredSources.add('targeting_ad')
      requiredSources.add('facebook_targeting')
    }

    // 트래픽/검색 관련
    if (this.matches(lowerQuery, ['트래픽', 'traffic', '검색', '네이버', 'datalab'])) {
      requiredSources.add('traffic')
      requiredSources.add('naver datalab')
    }

    // 제품 관련 - 특정 제품 언급시 모든 데이터 로드
    if (this.matches(lowerQuery, ['쿨페이즈', '리프테라', '쿨소닉', '써마지', '인모드', '울쎄라', '슈링크'])) {
      // 제품별 상세 분석을 위해 모든 채널 데이터 추가
      Object.keys(DATA_SOURCES).forEach(source => requiredSources.add(source))
    }

    // 비교/분석/전체 관련 - 포괄적 데이터 필요
    if (this.matches(lowerQuery, ['비교', '분석', '전체', '종합', '모든', '경쟁사', 'vs', '대비'])) {
      Object.keys(DATA_SOURCES).forEach(source => requiredSources.add(source))
    }

    // 상관관계, 인사이트, 전략 관련 - JSON 인사이트 필요
    if (this.matches(lowerQuery, ['상관관계', '인사이트', '전략', 'organic', 'managed', '바이럴', '성장', '추천'])) {
      requiredSources.add('llm_insights')
      requiredSources.add('organic_viral')
    }

    // YouTube-판매 상관관계 특정 질문
    if (this.matches(lowerQuery, ['유튜브', 'youtube']) && this.matches(lowerQuery, ['판매', '상관관계', '효율', '연관'])) {
      requiredSources.add('youtube_efficiency')
      requiredSources.add('llm_insights')
      requiredSources.add('youtube_post')
      requiredSources.add('sale')
    }

    // 월별 비교/트렌드 분석 (이전 월 데이터 필요)
    if (this.matches(lowerQuery, ['증감', '증가', '감소', '변화', '성장', '하락', '추이', '추세'])) {
      monthsToLoad = 2 // 현재 월 + 전월
    }

    if (this.matches(lowerQuery, ['전월', '지난달', '이전 달', '전월 대비', 'mom', 'month over month'])) {
      monthsToLoad = 2 // 현재 월 + 전월
    }

    if (this.matches(lowerQuery, ['트렌드', '패턴', '경향'])) {
      monthsToLoad = 3 // 현재 월 + 2개월
    }

    if (this.matches(lowerQuery, ['최근 3개월', '3개월', '분기'])) {
      monthsToLoad = 3
    }

    if (this.matches(lowerQuery, ['최근 6개월', '6개월', '반기', '상반기', '하반기'])) {
      monthsToLoad = 6
    }

    return { sources: Array.from(requiredSources), monthsToLoad }
  }

  matches(text, keywords) {
    return keywords.some(keyword => text.includes(keyword))
  }

  /**
   * 데이터 페칭 및 컨텍스트 구성 (CSV + JSON 인사이트)
   */
  async buildContext(query) {
    const { sources: requiredSources, monthsToLoad } = this.analyzeQuery(query)
    const months = this.getMonthRange(this.month, monthsToLoad - 1)

    const context = {
      month: this.month,
      months: months, // 로드된 모든 월
      monthsToLoad: monthsToLoad,
      data: {}, // { '2025-09': { sale: ..., blog_rank: ... }, '2025-08': { ... } }
      insights: {}, // JSON 인사이트 (현재 월만)
      sources: [],
      query: query
    }

    try {
      console.log(`[RAG] Loading ${requiredSources.length} data sources for ${monthsToLoad} month(s): "${query}"`)
      console.log(`[RAG] Months to load: ${months.join(', ')}`)

      // 각 월별로 데이터 페칭
      for (const month of months) {
        context.data[month] = {}

        const fetchPromises = requiredSources.map(async (source) => {
          try {
            // JSON 인사이트 파일 처리 (현재 월만)
            if (JSON_INSIGHTS[source] && month === this.month) {
              try {
                const fs = require('fs')
                const path = require('path')

                const jsonFileName = source === 'llm_insights'
                  ? `llm-insights-${month}.json`
                  : 'organic-viral-analysis.json'

                const jsonFilePath = path.join(process.cwd(), 'public/data/processed', jsonFileName)

                console.log(`[RAG] Loading JSON insight ${source} from:`, jsonFilePath)

                if (!fs.existsSync(jsonFilePath)) {
                  console.error(`[RAG] ❌ JSON file not found:`, jsonFilePath)
                  return { source, data: null, month }
                }

                const jsonContent = fs.readFileSync(jsonFilePath, 'utf8')
                const jsonData = JSON.parse(jsonContent)
                console.log(`[RAG] ✅ Loaded JSON insight ${source} for ${month}`)
                return { source, data: jsonData, isInsight: true, month }
              } catch (err) {
                console.error(`[RAG] ❌ Error loading JSON insight ${source}:`, err.message)
                return { source, data: null, month }
              }
            }

            // CSV 데이터 처리 - 직접 파일 읽기
            if (!JSON_INSIGHTS[source]) {
              try {
                const fs = require('fs')
                const path = require('path')

                const filename = DATA_SOURCES[source]
                const csvFilePath = path.join(
                  process.cwd(),
                  'public/data/raw',
                  month,
                  `asterasys_total_data - ${filename}.csv`
                )

                console.log(`[RAG] Loading CSV ${source} from:`, csvFilePath)

                if (!fs.existsSync(csvFilePath)) {
                  console.error(`[RAG] ❌ CSV file not found:`, csvFilePath)
                  return { source, data: null, month }
                }

                const csvContent = fs.readFileSync(csvFilePath, 'utf8')

                // naver datalab 특별 처리
                if (filename === 'naver datalab') {
                  const lines = csvContent.split('\n')
                  const dataLines = lines.slice(6)

                  if (dataLines.length === 0) {
                    console.error(`[RAG] ❌ Empty naver datalab file`)
                    return { source, data: null, month }
                  }

                  const marketData = []
                  for (let i = 1; i < dataLines.length; i++) {
                    const line = dataLines[i].trim()
                    if (!line) continue

                    const cols = line.split(',')
                    if (cols.length >= 6) {
                      marketData.push({
                        날짜: cols[0],
                        리프테라: parseFloat(cols[1]) || 0,
                        쿨페이즈: parseFloat(cols[3]) || 0,
                        쿨소닉: parseFloat(cols[5]) || 0
                      })
                    }
                  }

                  const data = {
                    success: true,
                    filename,
                    month,
                    asterasysData: marketData,
                    marketData,
                    dataCount: {
                      asterasys: marketData.length,
                      market: marketData.length
                    }
                  }

                  console.log(`[RAG] ✅ Loaded naver datalab for ${month}:`, marketData.length, 'rows')
                  return { source, data, isInsight: false, month }
                }

                // 일반 CSV 처리
                const lines = csvContent.split('\n').filter((line) => line.trim())

                if (lines.length === 0) {
                  console.error(`[RAG] ❌ Empty CSV file:`, csvFilePath)
                  return { source, data: null, month }
                }

                const headers = lines[0].split(',').map((h) => h.trim())
                const rows = lines.slice(1).map((line) => {
                  const values = []
                  let currentValue = ''
                  let inQuotes = false

                  for (let i = 0; i < line.length; i++) {
                    const char = line[i]
                    if (char === '"') {
                      inQuotes = !inQuotes
                    } else if (char === ',' && !inQuotes) {
                      values.push(currentValue.trim())
                      currentValue = ''
                    } else {
                      currentValue += char
                    }
                  }
                  values.push(currentValue.trim())

                  const row = {}
                  headers.forEach((header, index) => {
                    row[header] = values[index] || null
                  })
                  return row
                })

                const asterasysData = rows.filter((row) =>
                  row.키워드?.includes('쿨페이즈') ||
                  row.키워드?.includes('리프테라') ||
                  row.키워드?.includes('쿨소닉') ||
                  row.기기구분?.includes('쿨페이즈') ||
                  row.기기구분?.includes('리프테라') ||
                  row.기기구분?.includes('쿨소닉')
                )

                const data = {
                  success: true,
                  filename,
                  month,
                  headers,
                  asterasysData,
                  marketData: rows,
                  dataCount: {
                    asterasys: asterasysData.length,
                    market: rows.length
                  }
                }

                console.log(`[RAG] ✅ Loaded CSV ${source} for ${month}:`, asterasysData.length, 'asterasys rows,', rows.length, 'total rows')
                return { source, data, isInsight: false, month }
              } catch (err) {
                console.error(`[RAG] ❌ Error loading CSV ${source}:`, err.message)
                return { source, data: null, month }
              }
            }

            return { source, data: null, month }
          } catch (error) {
            console.error(`[RAG] Error fetching ${source} for ${month}:`, error)
            return { source, data: null, month }
          }
        })

        const results = await Promise.all(fetchPromises)

        // 결과 병합 (월별로 구분)
        results.forEach(({ source, data, isInsight, month: resultMonth }) => {
          if (data) {
            if (isInsight) {
              context.insights[source] = data
            } else {
              context.data[resultMonth][source] = data
            }
            if (!context.sources.includes(source)) {
              context.sources.push(source)
            }
          }
        })
      }

      // Detailed summary of what was loaded
      console.log('='.repeat(80))
      console.log(`[RAG] 📊 Context Build Summary:`)
      console.log(`[RAG] - Query: "${query}"`)
      console.log(`[RAG] - Requested sources: ${requiredSources.length}`)
      console.log(`[RAG] - Successfully loaded: ${context.sources.length}`)
      console.log(`[RAG] - Months processed: ${monthsToLoad} (${months.join(', ')})`)
      console.log(`[RAG] - Loaded sources: [${context.sources.join(', ')}]`)

      if (context.sources.length === 0) {
        console.error('[RAG] ❌ CRITICAL: NO DATA SOURCES LOADED!')
        console.error('[RAG] All file reads failed - check file paths and permissions')
      } else if (context.sources.length < requiredSources.length) {
        const failedSources = requiredSources.filter(s => !context.sources.includes(s))
        console.warn(`[RAG] ⚠️  Partial load: ${failedSources.length} sources failed:`)
        console.warn(`[RAG] Failed: [${failedSources.join(', ')}]`)
      } else {
        console.log('[RAG] ✅ All requested sources loaded successfully!')
      }
      console.log('='.repeat(80))

      return context

    } catch (error) {
      console.error('='.repeat(80))
      console.error('[RAG] ❌ Critical error building context:', error)
      console.error('[RAG] Error stack:', error.stack)
      console.error('='.repeat(80))
      return context
    }
  }

  /**
   * 컨텍스트를 Claude가 이해할 수 있는 구조화된 문자열로 변환
   */
  formatContextForClaude(context) {
    try {
      if (!context || !context.sources || context.sources.length === 0) {
        console.error('='.repeat(80))
        console.error('[RAG] ❌❌❌ CRITICAL ERROR: NO DATA SOURCES LOADED ❌❌❌')
        console.error('[RAG] Context object:', JSON.stringify(context, null, 2))
        console.error('='.repeat(80))
        throw new Error('NO DATA SOURCES LOADED - Check file paths and permissions in logs above')
      }

      const isMultiMonth = context.monthsToLoad > 1
    let formatted = isMultiMonth
      ? `# 📊 Asterasys 마케팅 데이터 (${context.months.join(', ')})\n\n`
      : `# 📊 Asterasys 마케팅 데이터 (${context.month})\n\n`

    if (isMultiMonth) {
      formatted += `## 🔄 월별 비교 분석 모드\n`
      formatted += `**로드된 월**: ${context.months.join(' → ')}\n`
      formatted += `**비교 가능**: 전월 대비 증감률, 트렌드 분석, 월별 성장 패턴\n\n`

      // 월별 판매 집계 요약 추가
      formatted += `## 📊 판매 집계 요약 (Asterasys 제품)\n\n`

      const salesSummaries = []
      try {
        context.months.forEach(month => {
          const monthData = context.data[month]
          if (monthData && monthData.sale) {
            try {
              const summary = this.aggregateSalesData(monthData.sale, month)
              if (summary) {
                salesSummaries.push(summary)
              }
            } catch (err) {
              console.warn(`[RAG] Failed to aggregate sales data for ${month}:`, err.message)
            }
          }
        })
      } catch (err) {
        console.error('[RAG] Error in sales aggregation loop:', err)
      }

      if (salesSummaries.length > 0) {
        salesSummaries.forEach(summary => {
          formatted += `### ${summary.month}\n`
          formatted += `**총 판매량**: ${summary.total.toLocaleString('ko-KR')}대\n`
          summary.products.forEach(product => {
            formatted += `- ${product.name}: ${product.sales.toLocaleString('ko-KR')}대\n`
          })
          formatted += `\n`
        })

        // 증감률 계산 (2개월 이상인 경우)
        if (salesSummaries.length >= 2) {
          const current = salesSummaries[0]
          const previous = salesSummaries[1]
          const change = current.total - previous.total
          const changeRate = ((change / previous.total) * 100).toFixed(1)

          formatted += `### 📈 전월 대비 증감\n`
          formatted += `**총 판매**: ${current.total.toLocaleString('ko-KR')}대 → ${change > 0 ? '증가' : '감소'} ${Math.abs(change).toLocaleString('ko-KR')}대 (${changeRate > 0 ? '+' : ''}${changeRate}%)\n\n`

          // 제품별 증감
          formatted += `**제품별 증감:**\n`
          current.products.forEach((currentProduct) => {
            const previousProduct = previous.products.find(p => p.name === currentProduct.name)
            if (previousProduct) {
              const productChange = currentProduct.sales - previousProduct.sales
              const productChangeRate = previousProduct.sales > 0
                ? ((productChange / previousProduct.sales) * 100).toFixed(1)
                : 'N/A'
              formatted += `- ${currentProduct.name}: ${previousProduct.sales.toLocaleString('ko-KR')}대 → ${currentProduct.sales.toLocaleString('ko-KR')}대 (${productChange > 0 ? '+' : ''}${productChange}대, ${productChangeRate !== 'N/A' ? (productChangeRate > 0 ? '+' : '') + productChangeRate + '%' : 'N/A'})\n`
            }
          })
          formatted += `\n`
        }
      } else {
        formatted += `*판매 데이터 없음*\n\n`
      }
    }

    // JSON 인사이트 먼저 표시 (더 중요한 심층 분석)
    if (context.insights && Object.keys(context.insights).length > 0) {
      formatted += `## 🧠 심층 인사이트 (JSON 분석)\n\n`

      if (context.insights.llm_insights) {
        const insights = context.insights.llm_insights
        formatted += `### 채널별 인사이트\n`
        if (insights.channels) {
          Object.entries(insights.channels).forEach(([channel, data]) => {
            if (data.insight) {
              formatted += `**${channel}**: ${data.insight.substring(0, 500)}...\n\n`
            }
          })
        }

        if (insights.viral) {
          formatted += `### 바이럴 전략\n`
          if (insights.viral.strategy) {
            formatted += `${insights.viral.strategy.content.substring(0, 800)}...\n\n`
          }
        }
      }

      if (context.insights.organic_viral) {
        const ov = context.insights.organic_viral
        formatted += `### Organic/Managed 분석\n`
        formatted += `- Asterasys: Organic ${ov.asterasys.organic}%, Managed ${ov.asterasys.managed}%\n`
        formatted += `- 경쟁사 평균: Organic ${ov.competitor.organic}%, Managed ${ov.competitor.managed}%\n`
        formatted += `- 격차: ${ov.gap}%p\n\n`
      }
    }

    // 월별 데이터 표시
    context.months.forEach((month, index) => {
      const monthData = context.data[month] || {}
      const isCurrentMonth = month === context.month

      if (isMultiMonth) {
        formatted += `\n## 📅 ${month}${isCurrentMonth ? ' (현재)' : ''}\n\n`
      }

      // 판매 데이터
      if (monthData.sale) {
        formatted += `### 판매 현황\n`
        formatted += this.formatTableData(monthData.sale, ['제품명', '판매량', '시장점유율'])
        formatted += `\n`
      }

      // 순위 데이터 (블로그, 카페, 뉴스, 유튜브)
      const rankSources = ['blog_rank', 'cafe_rank', 'news_rank', 'youtube_rank']
      const rankTitles = {
        blog_rank: '블로그 순위',
        cafe_rank: '카페 순위',
        news_rank: '뉴스 순위',
        youtube_rank: 'YouTube 순위'
      }

      rankSources.forEach(source => {
        if (monthData[source]) {
          formatted += `### ${rankTitles[source]}\n`
          formatted += this.formatTableData(monthData[source], ['순위', '제품명', '발행량', '참여도'])
          formatted += `\n`
        }
      })

      // 채널별 상세 데이터
      if (monthData.blog_author) {
        formatted += `### 블로그 작성자 분석\n`
        formatted += this.formatTableData(monthData.blog_author, ['작성자', '게시물수', '영향력'])
        formatted += `\n`
      }

      if (monthData.youtube_efficiency) {
        formatted += `### YouTube 판매 효율성\n`
        formatted += this.formatTableData(monthData.youtube_efficiency, ['제품', '조회수', '판매량', '효율성'])
        formatted += `\n`
      }

      // 트래픽 데이터
      if (monthData.traffic) {
        formatted += `### 트래픽 현황\n`
        formatted += this.formatTableData(monthData.traffic, ['채널', '방문자수', '증감률'])
        formatted += `\n`
      }

      // 광고 데이터
      if (monthData.outdoor_ad) {
        formatted += `### 옥외광고(OTT) 현황\n`
        formatted += this.formatTableData(monthData.outdoor_ad, ['제품', '노출수', '도달률'])
        formatted += `\n`
      }
    })

      return formatted
    } catch (error) {
      console.error('='.repeat(80))
      console.error('[RAG] ❌ formatContextForClaude error:', error)
      console.error('[RAG] Error stack:', error.stack)
      console.error('='.repeat(80))
      throw error // Re-throw to make error visible instead of hiding it
    }
  }

  /**
   * 테이블 데이터 포맷팅 헬퍼 - 마크다운 테이블 형식
   */
  formatTableData(data, columns, month = null) {
    if (!data) {
      return '데이터 없음\n'
    }

    // API 응답 객체인 경우 asterasysData 추출
    let items = data
    if (data.asterasysData && Array.isArray(data.asterasysData)) {
      items = data.asterasysData
    } else if (data.marketData && Array.isArray(data.marketData)) {
      items = data.marketData
    } else if (!Array.isArray(data)) {
      // Object인 경우 - 키-값 쌍으로 표시
      let result = ''
      Object.entries(data).slice(0, 20).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          result += `**${key}**: ${JSON.stringify(value).substring(0, 100)}\n`
        } else {
          result += `**${key}**: ${value}\n`
        }
      })
      return result
    }

    if (items.length === 0) {
      return '데이터 없음\n'
    }

    // 테이블 헤더 생성 (실제 데이터 키 사용)
    const firstItem = items[0]
    const headers = Object.keys(firstItem)

    // 마크다운 테이블 헤더
    let table = `| ${headers.join(' | ')} |\n`
    table += `| ${headers.map(() => '---').join(' | ')} |\n`

    // 데이터 행 (상위 15개만)
    items.slice(0, 15).forEach((item) => {
      const values = headers.map(header => {
        const value = item[header]
        // 숫자는 그대로, 문자열은 50자 제한
        if (typeof value === 'number') {
          return value.toLocaleString('ko-KR')
        }
        if (value === null || value === undefined) {
          return '-'
        }
        const str = String(value)
        return str.length > 50 ? str.substring(0, 47) + '...' : str
      })
      table += `| ${values.join(' | ')} |\n`
    })

    if (items.length > 15) {
      table += `\n*외 ${items.length - 15}개 항목 생략*\n`
    }

    return table
  }

  /**
   * 월별 판매 데이터 집계 (Asterasys 제품만)
   */
  aggregateSalesData(salesData, month) {
    try {
      if (!salesData || !salesData.asterasysData) {
        return null
      }

      if (!Array.isArray(salesData.asterasysData) || salesData.asterasysData.length === 0) {
        return null
      }

      if (!month || typeof month !== 'string' || !month.includes('-')) {
        console.warn('[RAG] Invalid month format:', month)
        return null
      }

      const monthNum = month.split('-')[1] // '2025-09' -> '09'
      const monthName = `${parseInt(monthNum)}월` // '09' -> '9월'
      const salesColumnName = `${monthName} 판매량`

      let total = 0
      const products = salesData.asterasysData.map(item => {
        const salesValue = item[salesColumnName]
        const sales = salesValue ? parseInt(salesValue) : 0
        total += sales
        return {
          name: item['키워드'] || item['제품명'] || 'Unknown',
          sales: sales
        }
      }).filter(p => p.name !== 'Unknown')

      return {
        month: monthName,
        total: total,
        products: products
      }
    } catch (error) {
      console.error('[RAG] aggregateSalesData error:', error)
      return null
    }
  }
}

/**
 * 간편 사용 함수
 */
export async function buildChatbotContext(query, month) {
  const builder = new DataContextBuilder(month)
  const context = await builder.buildContext(query)
  const formatted = builder.formatContextForClaude(context)

  return {
    raw: context,
    formatted,
    sources: context.sources
  }
}
