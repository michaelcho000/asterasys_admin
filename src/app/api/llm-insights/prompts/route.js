import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// GET: 실제 프롬프트 템플릿 반환 (월별)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || '2025-09'

    // 프롬프트 설정 파일 경로 (월별로 저장)
    const PROMPT_CONFIG_FILE = path.join(
      process.cwd(),
      `data/processed/prompt-config-${month}.json`
    )

    let promptConfig

    try {
      // 저장된 프롬프트 설정 로드
      const data = await fs.readFile(PROMPT_CONFIG_FILE, 'utf-8')
      promptConfig = JSON.parse(data)
    } catch (error) {
      // 없으면 기본 템플릿 반환
      promptConfig = getDefaultPromptTemplate(month)
    }

    return NextResponse.json(promptConfig)
  } catch (error) {
    console.error('프롬프트 로드 오류:', error)
    return NextResponse.json(
      { error: '프롬프트 로드 실패: ' + error.message },
      { status: 500 }
    )
  }
}

// POST: 프롬프트 설정 저장 (월별)
export async function POST(request) {
  try {
    const body = await request.json()
    const { month, promptConfig } = body

    if (!month || !promptConfig) {
      return NextResponse.json(
        { error: 'month와 promptConfig가 필요합니다.' },
        { status: 400 }
      )
    }

    const PROMPT_CONFIG_FILE = path.join(
      process.cwd(),
      `data/processed/prompt-config-${month}.json`
    )

    // 저장 시간 추가
    promptConfig.updatedAt = new Date().toISOString()
    promptConfig.month = month

    // 디렉토리 생성
    const dir = path.dirname(PROMPT_CONFIG_FILE)
    await fs.mkdir(dir, { recursive: true })

    // 저장
    await fs.writeFile(
      PROMPT_CONFIG_FILE,
      JSON.stringify(promptConfig, null, 2),
      'utf-8'
    )

    return NextResponse.json({
      success: true,
      message: '프롬프트 설정이 저장되었습니다.',
      file: PROMPT_CONFIG_FILE
    })
  } catch (error) {
    console.error('프롬프트 저장 오류:', error)
    return NextResponse.json(
      { error: '프롬프트 저장 실패: ' + error.message },
      { status: 500 }
    )
  }
}

// 기본 프롬프트 템플릿 생성
function getDefaultPromptTemplate(month) {
  const [year, monthNum] = month.split('-')

  return {
    month,
    version: '1.0',

    // LLM 설정
    llmConfig: {
      model: 'claude-sonnet-4-5-20250929',
      maxTokens: 20000,
      temperature: 1
    },

    // 시스템 프롬프트
    systemPrompt: `당신은 마케팅 데이터 분석 전문가입니다.
아래 {{MONTH}} 의료기기 마케팅 데이터를 분석하여 정확한 JSON 구조로 인사이트를 제공해주세요.`,

    // 데이터 섹션 템플릿
    dataSection: `# 제공된 데이터:

## Blog Rank Data
{{BLOG_DATA}}

## Cafe Rank Data
{{CAFE_DATA}}

## News Rank Data
{{NEWS_DATA}}

## YouTube Rank Data
{{YOUTUBE_DATA}}

## Sales Data
{{SALES_DATA}}

## Traffic Data
{{TRAFFIC_DATA}}`,

    // 제품 정보
    products: {
      ours: ['리프테라', '쿨페이즈', '쿨소닉'],
      competitors: ['써마지', '인모드', '울쎄라', '슈링크', '올리지오', '덴서티', '세르프', '볼뉴머']
    },

    productSection: `# 우리 제품:
- {{OUR_PRODUCTS}}

# 경쟁사:
- {{COMPETITOR_PRODUCTS}}`,

    // JSON 구조 예시
    jsonStructureTemplate: `# JSON 구조 (정확히 따를 것):

\`\`\`json
{
  "month": "{{MONTH}}",
  "isFirstMonth": {{IS_FIRST_MONTH}},
  "viral": {
    "current": {
      "title": "현재 분석",
      "content": "{{VIRAL_CURRENT_EXAMPLE}}"
    },
    "strategy": {
      "title": "향후 전략",
      "content": "{{VIRAL_STRATEGY_EXAMPLE}}"
    },
    "situation": {
      "title": "현재 상황",
      "content": "{{VIRAL_SITUATION_EXAMPLE}}"
    },
    "growth": {
      "title": "성장 방향",
      "content": "{{VIRAL_GROWTH_EXAMPLE}}"
    }
  },
  "channels": {
    "cafe": { "insight": "{{CHANNEL_CAFE_EXAMPLE}}" },
    "blog": { "insight": "..." },
    "news": { "insight": "..." },
    "youtube": { "insight": "..." }
  }
}
\`\`\``,

    // 바이럴 섹션 예시
    viralExamples: {
      current: `## 우리 제품 현황\\n\\n- **쿨페이즈**: 블로그 101건(9위), 카페 789건(2위, 조회수 45,450) - 카페 중심 강세\\n- **리프테라**: 블로그 176건(6위), 카페 503건(4위, 조회수 28,225) - 균형적 분포\\n- **쿨소닉**: 블로그 34건(8위), 카페 605건(2위, 조회수 26,467) - 카페 집중 전략\\n\\n## 경쟁사 대비 분석\\n\\n**고주파 시장**: 써마지(블로그 6,243건, 1위), 인모드(4,142건, 2위) 압도적 우위...`,

      strategy: `## 다음 달 집중 과제\\n\\n**1순위: 카페 우위 극대화**\\n- 쿨페이즈: 789→1,000건 목표 (써마지 1,258건 추격)\\n- 쿨소닉: 조회수 26,467→40,000 목표\\n\\n**2순위: 블로그 취약점 보완**\\n- 쿨페이즈: 101→250건 (병원 블로그 50개 확보)\\n\\n## 경쟁 브랜드 벤치마킹\\n\\n**써마지 성공 요인**: 일반 블로그 비중 53%로 자연 확산 우수...`,

      situation: `## 채널별 Organic/Managed 비율 분석\\n\\n**우리 제품 (추정 Organic 18%)**\\n- 블로그: 일반 블로그 비중 낮음\\n- 카페: 높은 참여도이나 조회수 대비 댓글 비율 과다\\n\\n**경쟁사 평균 (추정 Organic 35%)**\\n- 써마지: 일반 블로그 53%, 유튜브 1,010건으로 자연 확산 우수...`,

      growth: `## 핵심 성장 전략\\n\\n**1. 검색량-콘텐츠 갭 해소**\\n- 리프테라: 월간 검색 28,800 vs 블로그 176건 → 200% 증대 필요\\n\\n**2. 판매-마케팅 연계 강화**\\n- 쿨페이즈: ${monthNum}월 판매 10대, 카페 789건 → 전환율 1.3% 개선...`
    },

    // 채널 인사이트 예시
    channelExample: `**쿨페이즈 789건(2위)**, **쿨소닉 605건(2위)**으로 강력한 카페 장악력 보유. 리프테라 503건(4위)도 상위권. 조회수 합계 100,142로 경쟁사 대비 참여도 우수하나, 써마지(1,258건, 1위)와 354건 격차 존재. **전략**: 월 100건씩 증대하여 3개월 내 1위 추격...`,

    // 마크다운 작성 규칙
    markdownRules: {
      bold: '**텍스트** (강조할 제품명, 수치)',
      list: '- 항목 또는 • 항목',
      heading: '## 제목 (섹션 구분)',
      linebreak: '\\n\\n (문단 구분)'
    },

    markdownSection: `# 마크다운 작성 규칙:

1. **볼드체**: \`**텍스트**\` (강조할 제품명, 수치)
2. **목록**: \`- 항목\` 또는 \`• 항목\`
3. **제목**: \`## 제목\` (섹션 구분)
4. **줄바꿈**: \`\\n\\n\` (문단 구분)`,

    // 제약사항
    constraints: [
      '4개 섹션 모두 필수 (current, strategy, situation, growth)',
      '향후 전략에는 반드시 "다음 달 집중 과제" + "경쟁 브랜드 벤치마킹" 포함',
      'Q4, Q1, 2026 같은 장기 계획 절대 금지 - 다음 달 계획에만 집중',
      '구체적 수치 포함 (예: "789건, 2위")',
      '마크다운 형식 사용',
      `${month} 데이터만 사용`
    ],

    constraintsSection: `# 중요 제약사항:

1. **4개 섹션 모두 필수** (current, strategy, situation, growth)
2. **향후 전략**에는 반드시 "다음 달 집중 과제" + "경쟁 브랜드 벤치마킹" 포함
3. **Q4, Q1, 2026 같은 장기 계획 절대 금지** - 다음 달 계획에만 집중
4. 구체적 수치 포함 (예: "789건, 2위")
5. 마크다운 형식 사용
6. ${month} 데이터만 사용`,

    // 프롬프트 조합 함수에서 사용할 변수
    variables: {
      MONTH: month,
      IS_FIRST_MONTH: 'true',
      OUR_PRODUCTS: '리프테라, 쿨페이즈, 쿨소닉',
      COMPETITOR_PRODUCTS: '써마지, 인모드, 울쎄라, 슈링크, 올리지오, 덴서티, 세르프, 볼뉴머 등'
    }
  }
}
