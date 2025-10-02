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

// 이전 월 계산 헬퍼
function getPreviousMonth(monthStr) {
  const [year, month] = monthStr.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  date.setMonth(date.getMonth() - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

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

  const dataContents = {
    current: {},
    previous: null
  }

  // 현재 월 데이터 로드
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file)
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const dataType = file.split(' - ')[1].replace('.csv', '')
      dataContents.current[dataType] = content
      console.log(`  ✓ ${dataType}`)
    } catch (error) {
      console.warn(`  ⚠ ${file} 로드 실패:`, error.message)
    }
  }

  // 이전 월 데이터 로드 시도
  const previousMonth = getPreviousMonth(targetMonth)
  const prevDataDir = path.join(__dirname, `../data/raw/${previousMonth}`)

  console.log(`\n📂 이전 월 데이터 확인 중... (${previousMonth})`)

  try {
    await fs.access(prevDataDir)
    dataContents.previous = {}

    for (const file of files) {
      const filePath = path.join(prevDataDir, file)
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        const dataType = file.split(' - ')[1].replace('.csv', '')
        dataContents.previous[dataType] = content
        console.log(`  ✓ ${dataType}`)
      } catch (error) {
        // 개별 파일 로드 실패는 무시
      }
    }
    console.log('  → 이전 월 데이터 있음 (비교 분석 모드)')
  } catch (error) {
    console.log('  → 이전 월 데이터 없음 (첫 월 분석 모드)')
  }

  return dataContents
}

// Claude API로 분석 실행
async function analyzeWithClaude(dataContents) {
  console.log('\n🤖 Claude API 분석 시작...')

  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
  })

  const isFirstMonth = !dataContents.previous
  const data = dataContents.current

  // 첫 월 vs 이후 월 프롬프트 분기
  let prompt

  if (isFirstMonth) {
    // 첫 월: 4섹션 통일 구조
    prompt = `당신은 마케팅 데이터 분석 전문가입니다.
아래 ${targetMonth} 의료기기 마케팅 데이터를 분석하여 정확한 JSON 구조로 인사이트를 제공해주세요.

# 제공된 데이터:

## Blog Rank Data
${data.blog_rank?.substring(0, 3000)}
...

## Cafe Rank Data
${data.cafe_rank?.substring(0, 3000)}
...

## News Rank Data
${data.news_rank?.substring(0, 3000)}
...

## YouTube Rank Data
${data.youtube_rank?.substring(0, 3000)}
...

## Sales Data
${data.sale}

## Traffic Data
${data.traffic}

# 우리 제품:
- 리프테라, 쿨페이즈, 쿨소닉

# 경쟁사:
- 써마지, 인모드, 울쎄라, 슈링크, 올리지오, 덴서티, 세르프, 볼뉴머 등

# JSON 구조 (정확히 따를 것):

\`\`\`json
{
  "month": "${targetMonth}",
  "isFirstMonth": true,
  "viral": {
    "current": {
      "title": "현재 분석",
      "content": "## 우리 제품 현황\\n\\n- **쿨페이즈**: 블로그 101건(9위), 카페 789건(2위, 조회수 45,450) - 카페 중심 강세\\n- **리프테라**: 블로그 176건(6위), 카페 503건(4위, 조회수 28,225) - 균형적 분포\\n- **쿨소닉**: 블로그 34건(8위), 카페 605건(2위, 조회수 26,467) - 카페 집중 전략\\n\\n## 경쟁사 대비 분석\\n\\n**고주파 시장**: 써마지(블로그 6,243건, 1위), 인모드(4,142건, 2위) 압도적 우위. 쿨페이즈는 발행량 기준 최하위권이나 **카페에서 2위**로 특화 영역 확보\\n\\n**초음파 시장**: 울쎄라(8,904건, 1위), 슈링크(4,284건, 2위) 선두. 리프테라는 176건으로 6위이나 **카페 참여도(3,706 댓글) 높음**. 쿨소닉은 블로그 최하위(34건)지만 **카페 2위** 달성"
    },
    "strategy": {
      "title": "향후 전략",
      "content": "## 다음 달 집중 과제\\n\\n**1순위: 카페 우위 극대화**\\n- 쿨페이즈: 789→1,000건 목표 (써마지 1,258건 추격)\\n- 쿨소닉: 조회수 26,467→40,000 목표 (댓글 유도 캠페인)\\n- 리프테라: 4위→3위 도약 (월 100건 증대)\\n\\n**2순위: 블로그 취약점 보완**\\n- 쿨페이즈: 101→250건 (병원 블로그 50개 확보)\\n- 쿨소닉: 34→100건 (최하위 탈출)\\n- 리프테라: 일반 블로그 비중 확대 (75→150건)\\n\\n**3순위: 유튜브·뉴스 신규 진입**\\n- 쿨페이즈: 유튜브 2→50건 (시술 과정 영상 제작)\\n- 쿨소닉: 뉴스 12→30건 (기술 보도자료 배포)\\n- 리프테라: 유튜브 7→30건 (전후 사례 중심)\\n\\n## 경쟁 브랜드 벤치마킹\\n\\n**써마지 성공 요인**: 일반 블로그 비중 53%로 자연 확산 우수, 유튜브 1,010건으로 영상 콘텐츠 강세\\n\\n**울쎄라 강점**: 뉴스 198건으로 신뢰도 기반 구축, 블로그 일반 비중 51%로 Organic 확산 성공\\n\\n**우리의 적용 방안**: (1) 병원 블로그에서 일반 블로거 협업으로 전환, (2) 유튜브 시술 영상 월 50건 제작, (3) 학회 발표 중심 뉴스 PR 강화"
    },
    "situation": {
      "title": "현재 상황",
      "content": "## 채널별 Organic/Managed 비율 분석\\n\\n**우리 제품 (추정 Organic 18%)**\\n- 블로그: 일반 블로그 비중 낮음 (쿨페이즈 40%, 쿨소닉 41%, 리프테라 43%)\\n- 카페: 높은 참여도이나 **조회수 대비 댓글 비율 과다** (관리형 의심)\\n- 뉴스/유튜브: 최하위권 (자생적 확산 부족)\\n\\n**경쟁사 평균 (추정 Organic 35%)**\\n- 써마지: 일반 블로그 53%, 유튜브 1,010건으로 **자연 확산 우수**\\n- 울쎄라: 뉴스 198건, 블로그 일반 비중 51%로 **신뢰도 기반 구축**\\n\\n## 격차 원인\\n\\n카페 중심 전략의 **즉각적 효과**는 있으나, 장기적 **브랜드 인지도 형성 취약**. 검색 트래픽은 높으나(쿨소닉 18,510, 리프테라 28,800) 콘텐츠 발행량 미달로 **전환율 저하** 추정"
    },
    "growth": {
      "title": "성장 방향",
      "content": "## 핵심 성장 전략\\n\\n**1. 검색량-콘텐츠 갭 해소**\\n- 리프테라: 월간 검색 28,800 vs 블로그 176건 → **200% 증대 필요**\\n- 쿨소닉: 검색 18,510 vs 블로그 34건 → **300% 증대 시급**\\n- 쿨페이즈: 검색 11,390 vs 블로그 101건 → 적정 수준 유지\\n\\n**2. 판매-마케팅 연계 강화**\\n- 쿨페이즈: ${targetMonth.split('-')[1]}월 판매 10대, 카페 789건 → **전환율 1.3% 개선**\\n- 리프테라: ${targetMonth.split('-')[1]}월 판매 3대, 블로그 176건 → 병원 네트워크 30개 확대\\n- 쿨소닉: ${targetMonth.split('-')[1]}월 판매 8대, 카페 605건 → ROI 최적 채널\\n\\n**3. Organic 비율 단계적 목표**\\n- 현재 18% → 다음 달 목표 22% (4%p 상승)\\n- 3개월 후 목표 28% (10%p 상승)\\n- 방법: 유튜브 월 100건, 일반 블로그 비중 60% 이상\\n\\n**4. 크로스 채널 시너지**\\n- 카페 인기 토픽 → 블로그 심층 콘텐츠 전환\\n- 유튜브 영상 → 뉴스 보도자료 연계\\n- 병원 블로그 → 일반 블로그 자연 확산 유도"
    }
  },
  "channels": {
    "cafe": {
      "insight": "**쿨페이즈 789건(2위)**, **쿨소닉 605건(2위)**으로 강력한 카페 장악력 보유. 리프테라 503건(4위)도 상위권. 조회수 합계 100,142로 경쟁사 대비 참여도 우수하나, 써마지(1,258건, 1위)와 354건 격차 존재. **전략**: 월 100건씩 증대하여 3개월 내 1위 추격. 댓글 비율(쿨페이즈 5,255개) 활용해 진정성 콘텐츠 전환 필요. 카페가 유일한 강점 채널이므로 **조회수 40% 증대** 목표로 질적 개선 병행. 경쟁사 대비 **Managed 의존도 낮추기** 위해 자발적 후기 유도 캠페인 시급."
    },
    "blog": { "insight": "..." },
    "news": { "insight": "..." },
    "youtube": { "insight": "..." }
  }
}
\`\`\`

# 마크다운 작성 규칙:

1. **볼드체**: \`**텍스트**\` (강조할 제품명, 수치)
2. **목록**: \`- 항목\` 또는 \`• 항목\`
3. **제목**: \`## 제목\` (섹션 구분)
4. **줄바꿈**: \`\\n\\n\` (문단 구분)

# 중요 제약사항:

1. **4개 섹션 모두 필수** (current, strategy, situation, growth)
2. **향후 전략**에는 반드시 "다음 달 집중 과제" + "경쟁 브랜드 벤치마킹" 포함
3. **Q4, Q1, 2026 같은 장기 계획 절대 금지** - 다음 달 계획에만 집중
4. 구체적 수치 포함 (예: "789건, 2위")
5. 마크다운 형식 사용
6. ${targetMonth} 데이터만 사용`
  } else {
    // 이후 월: 4섹션 통일 구조 (비교 분석)
    const previousMonth = getPreviousMonth(targetMonth)
    const prevData = dataContents.previous

    prompt = `당신은 마케팅 데이터 분석 전문가입니다.
아래 ${previousMonth}와 ${targetMonth} 의료기기 마케팅 데이터를 비교 분석하여 정확한 JSON 구조로 인사이트를 제공해주세요.

# 제공된 데이터:

## 현재 월 (${targetMonth}):

### Blog Rank
${data.blog_rank?.substring(0, 2500)}
...

### Cafe Rank
${data.cafe_rank?.substring(0, 2500)}
...

### News Rank
${data.news_rank?.substring(0, 2500)}
...

### YouTube Rank
${data.youtube_rank?.substring(0, 2500)}
...

### Sales Data
${data.sale}

## 전월 (${previousMonth}):

### Blog Rank
${prevData.blog_rank?.substring(0, 1500)}
...

### Cafe Rank
${prevData.cafe_rank?.substring(0, 1500)}
...

# 우리 제품:
- 리프테라, 쿨페이즈, 쿨소닉

# 경쟁사:
- 써마지, 인모드, 울쎄라, 슈링크, 올리지오, 덴서티, 세르프, 볼뉴머 등

# JSON 구조 (정확히 따를 것):

\`\`\`json
{
  "month": "${targetMonth}",
  "previousMonth": "${previousMonth}",
  "isFirstMonth": false,
  "viral": {
    "current": {
      "title": "현재 분석",
      "content": "## 우리 제품 현황\\n\\n- **쿨페이즈**: 블로그 132건(+30.7%, 9위), 카페 598건(-24.2%, 2→4위 하락) - 카페 약세\\n- **리프테라**: 블로그 358건(+103.4%, 6위), 카페 430건(-14.5%, 4위) - 블로그 급성장\\n- **쿨소닉**: 블로그 68건(+100%, 9위), 카페 522건(-13.7%, 2→3위) - 블로그 개선\\n\\n## 경쟁사 대비 분석\\n\\n**고주파 시장**: 써마지 블로그 14,476건(+131.9%, 1위), 카페 1,702건(+35.3%, 1위)로 격차 확대. 쿨페이즈는 카페에서 2→4위 하락\\n\\n**초음파 시장**: 울쎄라 블로그 17,718건(+99%, 1위), 카페 2,369건(+79.3%, 1위). 리프테라는 블로그 +103.4% 급성장했으나 카페는 -14.5% 하락"
    },
    "strategy": {
      "title": "향후 전략",
      "content": "## 다음 달 집중 과제\\n\\n**1순위: 카페 하락세 긴급 반전**\\n- 쿨페이즈: 598→700건 목표 (체험단 100명 모집)\\n- 쿨소닉: 522→600건 목표 (댓글 참여 캠페인)\\n- 리프테라: 430→500건 목표 (진정성 후기 이벤트)\\n\\n**2순위: 블로그 성장세 가속화**\\n- 리프테라: +103.4% 모멘텀 유지 (협력 병원 15개 추가)\\n- 쿨페이즈/쿨소닉: 병원블로그 비중 확대 (플레이스블로그 전환)\\n\\n**3순위: 유튜브·뉴스 신규 투자**\\n- 유튜브: 시술 영상 월 50건 제작\\n- 뉴스: 학회 발표 보도자료 월 5건\\n\\n## 경쟁 브랜드 벤치마킹\\n\\n**써마지 성공 요인**: 블로그 +131.9%, 카페 +35.3% 동시 성장으로 전 채널 강세 유지\\n\\n**울쎄라 강점**: 카페 +79.3% 급증, 뉴스 161건으로 신뢰도 기반 병행\\n\\n**우리의 적용 방안**: (1) 블로그 성장세를 카페로 연계 (크로스 프로모션), (2) 써마지처럼 전 채널 동시 투자 전략, (3) 울쎄라처럼 뉴스 PR로 신뢰도 구축"
    },
    "situation": {
      "title": "현재 상황",
      "content": "## 채널별 Organic/Managed 비율 분석\\n\\n**우리 제품 (추정 Organic 20%)**\\n- 블로그: 일반 블로그 비중 증가 (리프테라 +103.4% 성장 견인)\\n- 카페: 전월 대비 평균 -17.5% 하락으로 Managed 의존도 감소 추세\\n- 유튜브: 신규 집계로 Organic 확산 시작\\n\\n**경쟁사 평균 (추정 Organic 38%)**\\n- 써마지: 블로그+카페 동시 성장으로 **전 채널 균형**\\n- 울쎄라: 카페 +79.3% 급증, 뉴스 161건으로 **신뢰도 우위**\\n\\n## 격차 원인\\n\\n블로그 급성장(+100%)에도 카페 하락(-17.5%)으로 **채널 간 불균형** 심화. 경쟁사는 전 채널 동시 성장 전략 구사 중"
    },
    "growth": {
      "title": "성장 방향",
      "content": "## 핵심 성장 전략\\n\\n**1. 블로그-카페 크로스 채널 시너지**\\n- 리프테라 블로그 358건(+103.4%) → 카페 유입 전환 캠페인\\n- 블로그 인기 주제를 카페 토론 주제로 연계\\n- 목표: 블로그 성장세를 카페로 전이하여 하락세 반전\\n\\n**2. 판매-마케팅 연계 강화**\\n- 리프테라: 블로그 급증 → 판매 전환율 모니터링\\n- 쿨페이즈: 카페 하락 → 판매 영향도 분석 및 대응\\n- 쿨소닉: ROI 최적 채널 집중 투자\\n\\n**3. Organic 비율 단계적 목표**\\n- ${previousMonth} 18% → ${targetMonth} 20% (2%p 상승 추정)\\n- 다음 달 목표 24% (블로그+유튜브 확대)\\n- 방법: 일반 블로거 협업 프로그램, 유튜브 월 100건\\n\\n**4. 전 채널 균형 성장**\\n- 써마지 벤치마킹: 블로그+카페 동시 투자\\n- 카페만 의존하지 않고 뉴스/유튜브 병행\\n- 채널별 목표: 블로그 +50%, 카페 +10%, 유튜브 +80%"
    }
  },
  "channels": {
    "cafe": {
      "insight": "**우리 제품**: 쿨페이즈 598건(-24.2%, 2→4위 하락), 쿨소닉 522건(-13.7%, 2→3위 하락), 리프테라 430건(-14.5%, 4위 유지). **경쟁사**: 써마지 1,702건(+35.3%, 1위), 인모드 835건(+11%, 2위), 울쎄라 2,369건(+79.3%, 1위)가 격차 확대. **위기 상황**: 3개 제품 모두 전월 대비 두 자릿수 하락, 써마지/울쎄라 대비 1/3~1/5 수준. **전략**: (1) 체험단 긴급 모집 (쿨페이즈 100명, 쿨소닉 50명), (2) 실사용 후기 이벤트 (리프테라 댓글 참여 경품), (3) 의사 Q&A 세션 주 2회 운영으로 참여도 20% 향상, (4) 경쟁사 대비 차별화 콘텐츠 (통증/회복기간 비교 인포그래픽) 집중 배포. 목표: 다음 달 합산 1,800건 달성으로 하락세 반전."
    },
    "blog": { "insight": "..." },
    "news": { "insight": "..." },
    "youtube": { "insight": "..." }
  }
}
\`\`\`

# 마크다운 작성 규칙:

1. **볼드체**: \`**텍스트**\` (제품명, 수치 강조)
2. **목록**: \`- 항목\`
3. **제목**: \`## 제목\`
4. **줄바꿈**: \`\\n\\n\`

# 중요 제약사항:

1. **4개 섹션 모두 필수** (current, strategy, situation, growth)
2. **향후 전략**에는 반드시 "다음 달 집중 과제" + "경쟁 브랜드 벤치마킹" 포함
3. **Q4, Q1, 2026 같은 장기 계획 절대 금지** - 다음 달 계획에만 집중
4. 반드시 증감률 표시 (예: "+35.3%", "-14.5%")
5. 순위 변화 명시 (예: "2→4위")
6. ${previousMonth} 대비 ${targetMonth} 변화 중심 분석`
  }

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
async function saveInsights(analysisResult, isFirstMonth) {
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
    insights.month = targetMonth
    insights.isFirstMonth = isFirstMonth

    if (!isFirstMonth) {
      insights.previousMonth = getPreviousMonth(targetMonth)
    }

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
    console.log(`  - 대상 월: ${targetMonth}`)
    console.log(`  - 첫 월 여부: ${isFirstMonth ? 'Yes' : 'No'}`)
    if (!isFirstMonth) {
      console.log(`  - 비교 월: ${insights.previousMonth}`)
    }
    console.log(`  - 채널 수: ${Object.keys(insights.channels || {}).length}`)

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
    const isFirstMonth = !dataContents.previous
    await saveInsights(analysisResult, isFirstMonth)

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
