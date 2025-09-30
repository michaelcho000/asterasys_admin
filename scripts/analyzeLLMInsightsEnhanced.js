/**
 * Enhanced LLM Insights Analysis Script
 *
 * 기능:
 * - 월간 데이터 비교 (전월 대비)
 * - 경쟁사 벤치마킹
 * - 아웃라이어 탐지
 * - 시각화용 메트릭 생성
 *
 * Usage: node scripts/analyzeLLMInsightsEnhanced.js [YYYY-MM]
 */

const Anthropic = require('@anthropic-ai/sdk')
const fs = require('fs').promises
const path = require('path')
const csvParser = require('csv-parser')
const { createReadStream } = require('fs')
require('dotenv').config({ path: '.env.local' })

// 설정
const targetMonth = process.argv[2] || '2025-09'
const DATA_DIR = path.join(__dirname, `../data/raw/${targetMonth}`)
const OUTPUT_FILE = path.join(__dirname, `../data/processed/llm-insights-${targetMonth}.json`)

// 이전 월 계산
function getPreviousMonth(month) {
  const [year, monthNum] = month.split('-')
  const date = new Date(year, parseInt(monthNum) - 1, 1)
  date.setMonth(date.getMonth() - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const previousMonth = getPreviousMonth(targetMonth)
const PREV_DATA_DIR = path.join(__dirname, `../data/raw/${previousMonth}`)

// CSV 파싱 헬퍼
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = []
    createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

// 데이터 분석 및 메트릭 생성
async function analyzeData() {
  console.log(`\n📊 데이터 분석 시작 (${targetMonth} vs ${previousMonth})`)

  const analysis = {
    month: targetMonth,
    previousMonth: previousMonth,
    competitors: {},
    outliers: [],
    trends: {},
    visualMetrics: {}
  }

  try {
    // 현재 월 데이터 로드
    const blogCurrent = await parseCSV(path.join(DATA_DIR, 'asterasys_total_data - blog_rank.csv'))
    const cafeCurrent = await parseCSV(path.join(DATA_DIR, 'asterasys_total_data - cafe_rank.csv'))
    const youtubeCurrent = await parseCSV(path.join(DATA_DIR, 'asterasys_total_data - youtube_rank.csv'))
    const saleCurrent = await parseCSV(path.join(DATA_DIR, 'asterasys_total_data - sale.csv'))

    // 이전 월 데이터 로드 (존재하는 경우)
    let blogPrevious, cafePrevious, youtubePrevious, salePrevious
    try {
      blogPrevious = await parseCSV(path.join(PREV_DATA_DIR, 'asterasys_total_data - blog_rank.csv'))
      cafePrevious = await parseCSV(path.join(PREV_DATA_DIR, 'asterasys_total_data - cafe_rank.csv'))
      youtubePrevious = await parseCSV(path.join(PREV_DATA_DIR, 'asterasys_total_data - youtube_rank.csv'))
      salePrevious = await parseCSV(path.join(PREV_DATA_DIR, 'asterasys_total_data - sale.csv'))
      console.log(`  ✓ 이전 월 데이터 로드 완료`)
    } catch (error) {
      console.log(`  ⚠ 이전 월 데이터 없음 (비교 생략)`)
    }

    // 경쟁사 분석
    analysis.competitors = analyzeCompetitors(blogCurrent, cafeCurrent, youtubeCurrent, saleCurrent)

    // 아웃라이어 탐지
    analysis.outliers = detectOutliers(blogCurrent, cafeCurrent, youtubeCurrent)

    // 트렌드 분석 (전월 대비)
    if (blogPrevious) {
      analysis.trends = analyzeTrends(
        { blog: blogCurrent, cafe: cafeCurrent, youtube: youtubeCurrent, sale: saleCurrent },
        { blog: blogPrevious, cafe: cafePrevious, youtube: youtubePrevious, sale: salePrevious }
      )
    }

    // 시각화용 메트릭
    analysis.visualMetrics = generateVisualMetrics(analysis)

    console.log(`  ✓ 분석 완료: 경쟁사 ${Object.keys(analysis.competitors).length}개, 아웃라이어 ${analysis.outliers.length}개`)

    return analysis

  } catch (error) {
    console.error('  ❌ 데이터 분석 실패:', error.message)
    return analysis
  }
}

// 경쟁사 분석
function analyzeCompetitors(blog, cafe, youtube, sale) {
  const competitors = {}

  // 주요 경쟁사 목록
  const competitorList = ['써마지', '인모드', '울쎄라', '슈링크', '올리지오', '덴서티', '세르프', '볼뉴머']
  const ourProducts = ['리프테라', '쿨페이즈', '쿨소닉']

  competitorList.forEach(competitor => {
    const blogData = blog.filter(row => row['키워드'] === competitor)
    const cafeData = cafe.filter(row => row['키워드'] === competitor)
    const youtubeData = youtube.filter(row => row['키워드'] === competitor)
    const saleData = sale.filter(row => row['키워드'] === competitor)

    if (blogData.length > 0 || cafeData.length > 0 || youtubeData.length > 0) {
      competitors[competitor] = {
        blog: {
          count: parseInt(blogData[0]?.['발행량합'] || 0),
          rank: parseInt(blogData[0]?.['순위'] || 999)
        },
        cafe: {
          count: parseInt(cafeData[0]?.['총 발행량'] || 0),
          comments: parseInt(cafeData[0]?.['총 댓글'] || 0),
          rank: parseInt(cafeData[0]?.['순위'] || 999)
        },
        youtube: {
          count: parseInt(youtubeData[0]?.['총 발행량'] || 0),
          views: parseInt(youtubeData[0]?.['총 조회수'] || 0),
          rank: parseInt(youtubeData[0]?.['순위'] || 999)
        },
        sales: parseInt(saleData[0]?.['총 판매량'] || 0),
        strengths: [],
        weaknesses: []
      }

      // 강점 파악 (1-2위)
      if (competitors[competitor].blog.rank <= 2) competitors[competitor].strengths.push('블로그')
      if (competitors[competitor].cafe.rank <= 2) competitors[competitor].strengths.push('카페')
      if (competitors[competitor].youtube.rank <= 2) competitors[competitor].strengths.push('유튜브')

      // 약점 파악 (6위 이하)
      if (competitors[competitor].blog.rank >= 6) competitors[competitor].weaknesses.push('블로그')
      if (competitors[competitor].cafe.rank >= 6) competitors[competitor].weaknesses.push('카페')
      if (competitors[competitor].youtube.rank >= 6) competitors[competitor].weaknesses.push('유튜브')
    }
  })

  // 우리 제품 추가
  ourProducts.forEach(product => {
    const blogData = blog.filter(row => row['키워드'] === product)
    const cafeData = cafe.filter(row => row['키워드'] === product)
    const youtubeData = youtube.filter(row => row['키워드'] === product)
    const saleData = sale.filter(row => row['키워드'] === product)

    if (blogData.length > 0 || cafeData.length > 0 || youtubeData.length > 0) {
      competitors[product] = {
        blog: {
          count: parseInt(blogData[0]?.['발행량합'] || 0),
          rank: parseInt(blogData[0]?.['순위'] || 999)
        },
        cafe: {
          count: parseInt(cafeData[0]?.['총 발행량'] || 0),
          comments: parseInt(cafeData[0]?.['총 댓글'] || 0),
          rank: parseInt(cafeData[0]?.['순위'] || 999)
        },
        youtube: {
          count: parseInt(youtubeData[0]?.['총 발행량'] || 0),
          views: parseInt(youtubeData[0]?.['총 조회수'] || 0),
          rank: parseInt(youtubeData[0]?.['순위'] || 999)
        },
        sales: parseInt(saleData[0]?.['총 판매량'] || 0),
        isOurs: true,
        strengths: [],
        weaknesses: [],
        gaps: {}
      }

      // 우리 제품의 경쟁사 대비 격차 계산
      const topCompetitor = Object.entries(competitors)
        .filter(([name]) => !ourProducts.includes(name))
        .reduce((top, [name, data]) => {
          if (!top || data.blog.count > top.data.blog.count) {
            return { name, data }
          }
          return top
        }, null)

      if (topCompetitor) {
        competitors[product].gaps = {
          blog: {
            competitor: topCompetitor.name,
            ourCount: competitors[product].blog.count,
            theirCount: topCompetitor.data.blog.count,
            gap: topCompetitor.data.blog.count - competitors[product].blog.count,
            gapPercent: ((topCompetitor.data.blog.count - competitors[product].blog.count) / topCompetitor.data.blog.count * 100).toFixed(1)
          }
        }
      }
    }
  })

  return competitors
}

// 아웃라이어 탐지
function detectOutliers(blog, cafe, youtube) {
  const outliers = []

  // 조회수 아웃라이어 (평균의 3배 이상)
  const youtubeWithViews = youtube.filter(row => parseInt(row['총 조회수'] || 0) > 0)
  if (youtubeWithViews.length > 0) {
    const avgViews = youtubeWithViews.reduce((sum, row) => sum + parseInt(row['총 조회수'] || 0), 0) / youtubeWithViews.length
    const threshold = avgViews * 3

    youtubeWithViews.forEach(row => {
      const views = parseInt(row['총 조회수'] || 0)
      if (views > threshold) {
        outliers.push({
          type: '조회수 아웃라이어',
          channel: '유튜브',
          product: row['키워드'],
          value: views,
          average: Math.round(avgViews),
          ratio: (views / avgViews).toFixed(1),
          badge: 'warning',
          description: `평균(${Math.round(avgViews).toLocaleString()}회) 대비 ${(views / avgViews).toFixed(1)}배 높은 조회수`
        })
      }
    })
  }

  // 댓글 아웃라이어
  const cafeWithComments = cafe.filter(row => parseInt(row['총 댓글'] || 0) > 0)
  if (cafeWithComments.length > 0) {
    const avgComments = cafeWithComments.reduce((sum, row) => sum + parseInt(row['총 댓글'] || 0), 0) / cafeWithComments.length
    const threshold = avgComments * 3

    cafeWithComments.forEach(row => {
      const comments = parseInt(row['총 댓글'] || 0)
      if (comments > threshold) {
        outliers.push({
          type: '댓글 아웃라이어',
          channel: '카페',
          product: row['키워드'],
          value: comments,
          average: Math.round(avgComments),
          ratio: (comments / avgComments).toFixed(1),
          badge: 'info',
          description: `평균(${Math.round(avgComments).toLocaleString()}개) 대비 ${(comments / avgComments).toFixed(1)}배 높은 참여도`
        })
      }
    })
  }

  return outliers
}

// 트렌드 분석 (전월 대비)
function analyzeTrends(current, previous) {
  const trends = {
    products: {}
  }

  const ourProducts = ['리프테라', '쿨페이즈', '쿨소닉']

  ourProducts.forEach(product => {
    const blogCurr = current.blog.find(row => row['키워드'] === product)
    const blogPrev = previous.blog.find(row => row['키워드'] === product)
    const cafeCurr = current.cafe.find(row => row['키워드'] === product)
    const cafePrev = previous.cafe.find(row => row['키워드'] === product)
    const saleCurr = current.sale.find(row => row['키워드'] === product)
    const salePrev = previous.sale.find(row => row['키워드'] === product)

    if (blogCurr && blogPrev) {
      const blogChange = parseInt(blogCurr['발행량합'] || 0) - parseInt(blogPrev['발행량합'] || 0)
      const cafeChange = parseInt(cafeCurr?.['총 발행량'] || 0) - parseInt(cafePrev?.['총 발행량'] || 0)
      const saleChange = parseInt(saleCurr?.['월간 판매량'] || saleCurr?.['총 판매량'] || 0) -
                         parseInt(salePrev?.['월간 판매량'] || salePrev?.['총 판매량'] || 0)

      trends.products[product] = {
        blog: {
          change: blogChange,
          trend: blogChange > 0 ? 'up' : blogChange < 0 ? 'down' : 'stable',
          percent: blogPrev ? ((blogChange / parseInt(blogPrev['발행량합'])) * 100).toFixed(1) : 0
        },
        cafe: {
          change: cafeChange,
          trend: cafeChange > 0 ? 'up' : cafeChange < 0 ? 'down' : 'stable',
          percent: cafePrev ? ((cafeChange / parseInt(cafePrev['총 발행량'])) * 100).toFixed(1) : 0
        },
        sales: {
          change: saleChange,
          trend: saleChange > 0 ? 'up' : saleChange < 0 ? 'down' : 'stable'
        }
      }
    }
  })

  return trends
}

// 시각화용 메트릭 생성
function generateVisualMetrics(analysis) {
  const metrics = {
    topCompetitors: [],
    ourPosition: {},
    channelComparison: {},
    keyMetrics: []
  }

  // 상위 경쟁사 TOP 3
  const competitorsByBlog = Object.entries(analysis.competitors)
    .filter(([name, data]) => !data.isOurs)
    .sort((a, b) => b[1].blog.count - a[1].blog.count)
    .slice(0, 3)

  metrics.topCompetitors = competitorsByBlog.map(([name, data]) => ({
    name,
    metric: data.blog.count,
    label: `${data.blog.count.toLocaleString()}건`,
    badge: 'primary',
    strengths: data.strengths
  }))

  // 우리 포지션
  const ourProductsData = Object.entries(analysis.competitors)
    .filter(([name, data]) => data.isOurs)

  ourProductsData.forEach(([name, data]) => {
    metrics.ourPosition[name] = {
      blogRank: data.blog.rank,
      cafeRank: data.cafe.rank,
      youtubeRank: data.youtube.rank,
      gap: data.gaps?.blog,
      badge: data.blog.rank <= 3 ? 'success' : data.blog.rank <= 6 ? 'warning' : 'danger'
    }
  })

  // 주요 메트릭
  metrics.keyMetrics = [
    {
      label: '아웃라이어',
      value: analysis.outliers.length,
      badge: 'info',
      description: '비정상적 데이터 포인트'
    },
    {
      label: '경쟁사 분석',
      value: Object.keys(analysis.competitors).length,
      badge: 'primary',
      description: '분석된 제품 수'
    }
  ]

  return metrics
}

// Claude API로 분석
async function analyzeWithClaude(dataAnalysis) {
  console.log('\n🤖 Claude API 인사이트 생성 중...')

  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
  })

  // 분석 데이터를 텍스트로 변환
  const analysisText = JSON.stringify(dataAnalysis, null, 2)

  const prompt = `당신은 의료기기 마케팅 데이터 분석 전문가입니다.

아래 분석 데이터를 바탕으로 **시각화 중심의 인사이트**를 생성해주세요.

# 분석 데이터:
\`\`\`json
${analysisText.substring(0, 15000)}
\`\`\`

# 우리 제품:
- 리프테라, 쿨페이즈, 쿨소닉

# 요구사항:

다음 JSON 형식으로 **마케팅 담당자가 한눈에 파악할 수 있는** 인사이트를 생성하세요:

\`\`\`json
{
  "sections": [
    {
      "id": "competitor-benchmark",
      "title": "경쟁사 벤치마킹",
      "visualType": "comparison-cards",
      "insights": [
        {
          "competitor": "써마지",
          "strengths": ["블로그 1위", "카페 1위"],
          "metrics": {
            "blog": { "value": 14476, "badge": "primary", "label": "1위" },
            "cafe": { "value": 1702, "badge": "primary", "label": "1위" }
          },
          "ourGap": {
            "product": "리프테라",
            "blogGap": "97.5%",
            "gapBadge": "danger",
            "gapDescription": "써마지 대비 블로그 97.5% 부족"
          },
          "keyTakeaway": "병원블로그 + 일반블로그 균형 전략"
        }
      ]
    },
    {
      "id": "outliers",
      "title": "아웃라이어 분석",
      "visualType": "alert-cards",
      "insights": [
        {
          "type": "조회수 이상치",
          "channel": "유튜브",
          "product": "울쎄라",
          "value": "120만 조회수",
          "badge": "warning",
          "reason": "연예인 시술 영상 (전지현)",
          "actionable": "우리도 KOL 마케팅 검토"
        }
      ]
    },
    {
      "id": "trends",
      "title": "월간 트렌드",
      "visualType": "trend-indicators",
      "insights": [
        {
          "product": "리프테라",
          "changes": {
            "blog": { "value": "+15건", "percent": "+4.2%", "trend": "up", "badge": "success" },
            "cafe": { "value": "-30건", "percent": "-7.0%", "trend": "down", "badge": "danger" },
            "sales": { "value": "-10대", "trend": "down", "badge": "danger" }
          },
          "interpretation": "블로그는 증가했으나 판매는 감소. 전환율 개선 필요"
        }
      ]
    },
    {
      "id": "action-priorities",
      "title": "실행 우선순위",
      "visualType": "priority-buttons",
      "insights": [
        {
          "priority": 1,
          "label": "긴급",
          "action": "쿨페이즈 블로그 3배 증대",
          "badge": "danger",
          "metric": "132건 → 400건",
          "timeline": "2개월",
          "keyMetrics": ["블로그 9위 → 5위", "검색 유입 +150%"]
        }
      ]
    }
  ],
  "summary": {
    "keyMetrics": [
      { "label": "최대 격차", "value": "써마지 대비 97.5%", "badge": "danger" },
      { "label": "강점 채널", "value": "카페 (리프테라 4위)", "badge": "success" },
      { "label": "아웃라이어", "value": "3건 발견", "badge": "warning" }
    ]
  }
}
\`\`\`

**중요:**
1. 모든 수치에 badge 색상 지정 (primary/success/warning/danger/info)
2. 경쟁사별 강점을 명확히 표시
3. 아웃라이어는 "왜 튀었는지" 이유 포함
4. 실행 우선순위는 구체적 수치 목표 포함
5. 시각적으로 구분되도록 visualType 지정`

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 20000,
    temperature: 1,
    messages: [{ role: "user", content: prompt }]
  })

  console.log('✓ 인사이트 생성 완료')
  return message.content[0].text
}

// 결과 저장
async function saveResults(dataAnalysis, llmInsights) {
  console.log('\n💾 결과 저장 중...')

  try {
    // JSON 추출
    const jsonMatch = llmInsights.match(/```json\n([\s\S]*?)\n```/)
    let insights = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(llmInsights)

    // 메타데이터 추가
    const finalResult = {
      generatedAt: new Date().toISOString(),
      status: 'draft',
      model: 'claude-sonnet-4-5-20250929',
      month: targetMonth,
      previousMonth: previousMonth,
      dataAnalysis: dataAnalysis,
      ...insights
    }

    // 출력 디렉토리 생성
    const outputDir = path.dirname(OUTPUT_FILE)
    await fs.mkdir(outputDir, { recursive: true })

    // 저장
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(finalResult, null, 2), 'utf-8')

    console.log(`✓ 저장 완료: ${OUTPUT_FILE}`)
    console.log(`\n📊 결과 요약:`)
    console.log(`  - 대상 월: ${targetMonth}`)
    console.log(`  - 비교 월: ${previousMonth}`)
    console.log(`  - 섹션 수: ${insights.sections?.length || 0}`)
    console.log(`  - 경쟁사: ${Object.keys(dataAnalysis.competitors).length}개`)
    console.log(`  - 아웃라이어: ${dataAnalysis.outliers.length}개`)

  } catch (error) {
    console.error('❌ 저장 실패:', error.message)
    // 원본 저장
    await fs.writeFile(OUTPUT_FILE.replace('.json', '-raw.txt'), llmInsights, 'utf-8')
    throw error
  }
}

// 메인 실행
async function main() {
  console.log('🚀 Enhanced LLM 인사이트 분석 시작')
  console.log('='.repeat(60))

  try {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY가 .env.local에 설정되지 않았습니다')
    }

    // 1. 데이터 분석
    const dataAnalysis = await analyzeData()

    // 2. LLM 인사이트 생성
    const llmInsights = await analyzeWithClaude(dataAnalysis)

    // 3. 결과 저장
    await saveResults(dataAnalysis, llmInsights)

    console.log('\n' + '='.repeat(60))
    console.log('✅ 분석 완료!')
    console.log(`\n다음 단계:`)
    console.log(`  1. http://localhost:3000/insights-preview?month=${targetMonth} 에서 결과 확인`)
    console.log(`  2. 필요시 수정 및 승인`)
    console.log(`  3. 승인 후 실제 페이지에 반영`)

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { analyzeData, analyzeWithClaude, saveResults }
