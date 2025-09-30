/**
 * LLM Insights Analysis Script
 *
 * Claude API를 사용하여 마케팅 데이터를 분석하고 인사이트를 생성합니다.
 * 결과는 data/processed/llm-insights.json에 저장됩니다.
 *
 * Usage: node scripts/analyzeLLMInsights.js
 */

const Anthropic = require('@anthropic-ai/sdk')
const fs = require('fs').promises
const path = require('path')
require('dotenv').config({ path: '.env.local' })

// 명령줄 인자로 월 선택 (기본값: 2025-09)
const targetMonth = process.argv[2] || '2025-09'
const DATA_DIR = path.join(__dirname, `../data/raw/${targetMonth}`)
const OUTPUT_FILE = path.join(__dirname, `../data/processed/llm-insights-${targetMonth}.json`)

// 데이터 파일 로드 (월간 비교 포함)
async function loadDataFiles() {
  console.log(`📂 데이터 파일 로드 중... (${targetMonth})`)

  const files = [
    'asterasys_total_data - blog_rank.csv',
    'asterasys_total_data - cafe_rank.csv',
    'asterasys_total_data - news_rank.csv',
    'asterasys_total_data - youtube_rank.csv',
    'asterasys_total_data - sale.csv',
    'asterasys_total_data - traffic.csv'
  ]

  // 이전 월 데이터 로드 (비교용)
  const previousMonth = getPreviousMonth(targetMonth)
  const prevDataDir = path.join(__dirname, `../data/raw/${previousMonth}`)

  console.log(`📂 이전 월 데이터 로드 중... (${previousMonth})`)

  const dataContents = {}

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file)
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const dataType = file.split(' - ')[1].replace('.csv', '')
      dataContents[dataType] = content
      console.log(`  ✓ ${dataType}`)
    } catch (error) {
      console.warn(`  ⚠ ${file} 로드 실패:`, error.message)
    }
  }

  return dataContents
}

// Claude API로 분석 실행
async function analyzeWithClaude(dataContents) {
  console.log('\n🤖 Claude API 분석 시작...')

  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
  })

  const prompt = `당신은 마케팅 데이터 분석 전문가입니다.
아래 의료기기 마케팅 데이터를 분석하여 다음 섹션별로 인사이트를 제공해주세요:

# 제공된 데이터:

## Blog Rank Data (블로그 순위)
${dataContents.blog_rank?.substring(0, 3000)}
...

## Cafe Rank Data (카페 순위)
${dataContents.cafe_rank?.substring(0, 3000)}
...

## News Rank Data (뉴스 순위)
${dataContents.news_rank?.substring(0, 3000)}
...

## YouTube Rank Data (유튜브 순위)
${dataContents.youtube_rank?.substring(0, 3000)}
...

## Sales Data (판매 데이터)
${dataContents.sale}

## Traffic Data (트래픽 데이터)
${dataContents.traffic}

# 우리 제품:
- 리프테라
- 쿨페이즈
- 쿨소닉

# 경쟁사:
- 인모드, 써마지, 올리지오, 덴서티, 세르프, 볼뉴머, 텐써마, 울쎄라 등

# 분석 요청사항:

다음 JSON 형식으로 각 섹션별 인사이트를 작성해주세요:

\`\`\`json
{
  "generatedAt": "2025-10-01T14:30:00Z",
  "status": "draft",
  "sections": [
    {
      "id": "viral-strategy",
      "title": "바이럴 전략 분석",
      "targetCard": "ViralTypeAnalysis",
      "position": "insights",
      "insights": [
        {
          "type": "critical",
          "title": "핵심 문제점",
          "content": "...",
          "badge": "danger"
        },
        {
          "type": "opportunity",
          "title": "개선 방향",
          "content": "...",
          "badge": "success"
        }
      ]
    },
    {
      "id": "channel-efficiency",
      "title": "채널 효율성 분석",
      "targetCard": "ChannelCompetitivePosition",
      "position": "strategy",
      "insights": [
        {
          "type": "strength",
          "channel": "카페",
          "content": "...",
          "badge": "success"
        },
        {
          "type": "weakness",
          "channel": "뉴스",
          "content": "...",
          "badge": "danger"
        }
      ]
    },
    {
      "id": "competitive-position",
      "title": "경쟁 포지션 분석",
      "targetCard": "MarketingInsightsKPICards",
      "position": "summary",
      "insights": [
        {
          "type": "market-share",
          "content": "...",
          "metric": "12.7%",
          "trend": "up"
        }
      ]
    }
  ],
  "summary": {
    "keyFindings": [
      "핵심 발견사항 1",
      "핵심 발견사항 2"
    ],
    "recommendations": [
      "실행 권장사항 1",
      "실행 권장사항 2"
    ]
  }
}
\`\`\`

# 분석 시 주의사항:
1. 구체적인 수치와 데이터 근거를 포함하세요
2. 실행 가능한 인사이트를 제공하세요
3. 경쟁사와의 비교를 명확히 하세요
4. 우리 제품(리프테라, 쿨페이즈, 쿨소닉)의 강점/약점을 구분하세요
5. 각 채널(카페, 블로그, 뉴스, 유튜브)별 특성을 반영하세요`

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 20000,
    temperature: 1,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  })

  console.log('✓ 분석 완료')
  return message.content[0].text
}

// 분석 결과 저장
async function saveInsights(analysisResult) {
  console.log('\n💾 분석 결과 저장 중...')

  try {
    // JSON 추출 (```json ... ``` 블록에서)
    const jsonMatch = analysisResult.match(/```json\n([\s\S]*?)\n```/)
    let insights

    if (jsonMatch) {
      insights = JSON.parse(jsonMatch[1])
    } else {
      // JSON 블록이 없으면 전체를 파싱 시도
      insights = JSON.parse(analysisResult)
    }

    // 메타데이터 추가
    insights.generatedAt = new Date().toISOString()
    insights.status = 'draft'
    insights.model = 'claude-sonnet-4-5-20250929'

    // 출력 디렉토리 생성
    const outputDir = path.dirname(OUTPUT_FILE)
    await fs.mkdir(outputDir, { recursive: true })

    // JSON 저장
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(insights, null, 2),
      'utf-8'
    )

    console.log(`✓ 저장 완료: ${OUTPUT_FILE}`)
    console.log(`\n📊 분석 결과 요약:`)
    console.log(`  - 섹션 수: ${insights.sections?.length || 0}`)
    console.log(`  - 핵심 발견: ${insights.summary?.keyFindings?.length || 0}개`)
    console.log(`  - 권장사항: ${insights.summary?.recommendations?.length || 0}개`)

  } catch (error) {
    console.error('❌ JSON 파싱 오류:', error.message)

    // 원본 텍스트 저장
    const errorOutputFile = OUTPUT_FILE.replace('.json', '-raw.txt')
    await fs.writeFile(errorOutputFile, analysisResult, 'utf-8')
    console.log(`⚠ 원본 텍스트 저장: ${errorOutputFile}`)

    throw error
  }
}

// 메인 실행
async function main() {
  console.log('🚀 LLM 인사이트 분석 시작\n')
  console.log('=' .repeat(60))

  try {
    // API 키 확인
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY가 .env.local에 설정되지 않았습니다')
    }

    // 1. 데이터 로드
    const dataContents = await loadDataFiles()

    // 2. Claude API 분석
    const analysisResult = await analyzeWithClaude(dataContents)

    // 3. 결과 저장
    await saveInsights(analysisResult)

    console.log('\n' + '='.repeat(60))
    console.log('✅ 분석 완료!')
    console.log('\n다음 단계:')
    console.log('  1. http://localhost:3000/insights-preview 에서 결과 확인')
    console.log('  2. 필요시 수정 및 승인')
    console.log('  3. 승인 후 실제 페이지에 반영')

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

module.exports = { loadDataFiles, analyzeWithClaude, saveInsights }
