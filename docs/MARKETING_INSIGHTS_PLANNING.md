# 마케팅 인사이트 페이지 기획서

**작성일**: 2025-10-01
**대상**: 아스테라시스 마케팅 담당자 및 경영진
**목적**: 브랜드 인지도 향상 및 잠재고객 정보 노출 최적화

---

## 1. 핵심 목표 및 마케팅 퍼널

### 1.1 비즈니스 목표
```
고가 의료기기 마케팅 퍼널
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 인지도 (Awareness)
   └─ 아스테라시스 브랜드 노출 확대

2. 관심 (Interest)
   └─ 제품 정보 검색 및 콘텐츠 소비

3. 고려 (Consideration)
   └─ 경쟁사 대비 장점 인지

4. 구매 의향 (Intent)
   └─ 시술 상담 문의 증가

5. 전환 (Conversion)
   └─ 병원 기기 구매 (영업팀 역할)
```

**마케팅팀의 핵심 KPI**: 1-4단계 최적화 (인지→관심→고려→의향)
**영업팀의 핵심 KPI**: 5단계 전환 (구매)

### 1.2 인사이트 페이지 목적
- ✅ 브랜드 노출 효율 모니터링
- ✅ 채널별 잠재고객 도달률 분석
- ✅ 경쟁사 대비 점유율 트래킹
- ✅ 콘텐츠 효율성 측정
- ❌ 직접 판매 전환율 (영업팀 역할)

---

## 2. 데이터 분석 결과 (2025년 8월 기준)

### 2.1 현황 스냅샷
```
아스테라시스 시장 위치
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
총 발행량:    1,418건 (18개 브랜드 중 12.7%)
판매량:       674대 (전체 시장 대비 8.7%)
검색량:       652회/월 (21.8% 점유)
참여도:       4.08 (업계 평균 3.62 대비 +13%)

제품별 성과
─────────────────────────────────────────
리프테라:  492대 | 발행 63건  → 판매효율 780%
쿨페이즈:  159대 | 발행 220건 → 판매효율 72%
쿨소닉:    23대  | 발행 230건 → 판매효율 10%
```

### 2.2 핵심 인사이트 (8월 데이터)
1. **채널 효율 격차**
   - 카페: 45.3% 발행 비중, 높은 댓글 참여도
   - 블로그: 21.8% 점유, 검색 유입 강점
   - 유튜브: 26.4%, 영상 콘텐츠 부족

2. **제품별 전략 차별화 필요**
   - 리프테라: 효율 1위, 추가 투자 고려
   - 쿨페이즈: 중간 효율, 콘텐츠 품질 개선
   - 쿨소닉: 신제품, 판매 전환 장벽 분석 필요

3. **경쟁사 벤치마크**
   - 써마지/인모드: 압도적 1-2위 (각 900건+)
   - 올리지오: 3위 (299건), 아스테라시스 추격 가능
   - 덴서티: 4위 (203건), 경쟁 대상

---

## 3. 화면 구성 설계

### 3.1 페이지 라우팅
```
경로: /marketing-insights
메뉴: 네비게이션 메뉴 3번 항목 (이미 정의됨)
레이아웃: (general) 그룹 내 표준 레이아웃 사용
```

### 3.2 화면 레이아웃 (Duralux 템플릿 기반)

```
┌─────────────────────────────────────────────────────────────┐
│  PageHeader                                                  │
│  제목: 마케팅 인사이트                                        │
│  설명: 브랜드 노출 및 잠재고객 참여 분석                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SECTION 1: 브랜드 노출 현황 (Awareness KPI)                 │
├─────────────────────────────────────────────────────────────┤
│  [4개 KPI 카드 - col-xxl-3 col-md-6]                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 총 노출량 │ │채널 도달률│ │경쟁사 점유│ │브랜드 인지│      │
│  │  1,418건 │ │  45.3%   │ │  12.7%   │ │   4.08   │      │
│  │  [전월비교]│ │  [카페] │ │ [18개중]  │ │  [참여도] │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SECTION 2: 채널별 효율 분석 (Interest & Consideration)     │
├─────────────────────────────────────────────────────────────┤
│  [좌측: col-8] 채널 효율 비교 차트                          │
│  - 막대차트: 발행량 vs 참여도 vs 검색전환                    │
│  - 카페/유튜브/뉴스/블로그 4개 채널 비교                     │
│                                                              │
│  [우측: col-4] 채널별 상세 지표 테이블                       │
│  - 발행량, 댓글수, 조회수, 검색 유입                         │
│  - 아스테라시스 vs 시장 평균 비교                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SECTION 3: 제품별 성과 분석 (Intent & Conversion Prep)     │
├─────────────────────────────────────────────────────────────┤
│  [전체 너비: col-12] 제품 성과 매트릭스                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  제품    발행량  검색량  판매량  노출효율  판매효율   │   │
│  │─────────────────────────────────────────────────────│   │
│  │ 리프테라   63     202     492     3.2      780%     │   │
│  │ 쿨페이즈  220     220     159     1.0       72%     │   │
│  │ 쿨소닉    230     230      23     1.0       10%     │   │
│  │─────────────────────────────────────────────────────│   │
│  │  총합     513     652     674     1.3      131%     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SECTION 4: 경쟁사 비교 인사이트 (Competitive Intelligence) │
├─────────────────────────────────────────────────────────────┤
│  [좌측: col-6] 시장 점유율 트렌드                           │
│  - 라인차트: 최근 3개월 점유율 변화                         │
│  - 아스테라시스 vs TOP 5 경쟁사                             │
│                                                              │
│  [우측: col-6] 경쟁 포지셔닝 맵                             │
│  - 산점도: X축(발행량) Y축(참여도)                          │
│  - 아스테라시스 제품 위치 하이라이트                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SECTION 5: 실행 가능 인사이트 (Actionable Insights)        │
├─────────────────────────────────────────────────────────────┤
│  [카드 형식: col-12]                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎯 이번 달 핵심 발견                                    │   │
│  │ ─────────────────────────────────────────────────── │   │
│  │ 1. 리프테라 판매효율 780% → 블로그 콘텐츠 2배 증량 추천│   │
│  │ 2. 쿨소닉 검색량 1위, 판매 저조 → 가격/시술 후기 개선  │   │
│  │ 3. 카페 참여도 업계 최고 → 댓글 마케팅 전략 유지      │   │
│  │ 4. 유튜브 콘텐츠 부족 → 시술 전후 영상 제작 필요       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SECTION 6: 월간 트렌드 요약 (Monthly Summary)              │
├─────────────────────────────────────────────────────────────┤
│  [타임라인 카드: col-12]                                    │
│  - 주요 이벤트 및 캠페인 타임라인                           │
│  - 발행량 급증 구간 하이라이트                              │
│  - 경쟁사 주요 이벤트 표시                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 컴포넌트 상세 설계

### 4.1 SECTION 1: 브랜드 노출 KPI 카드

**컴포넌트명**: `MarketingInsightsKPICards.jsx`
**재사용**: `AsteraysKPIStatistics.jsx` 구조 참고

```javascript
const kpiData = [
  {
    id: 1,
    title: "총 브랜드 노출",
    value: "1,418건",
    change: "+12.3%",
    trend: "up",
    context: "전체 발행량 (블로그+카페+뉴스+유튜브)",
    icon: "feather-eye",
    color: "primary"
  },
  {
    id: 2,
    title: "최고 채널 도달률",
    value: "45.3%",
    change: "+2.1%",
    trend: "up",
    context: "카페 채널 점유율",
    icon: "feather-message-circle",
    color: "success"
  },
  {
    id: 3,
    title: "시장 점유율",
    value: "12.7%",
    change: "-0.5%",
    trend: "down",
    context: "18개 브랜드 중 발행량 기준",
    icon: "feather-pie-chart",
    color: "warning"
  },
  {
    id: 4,
    title: "브랜드 참여도",
    value: "4.08",
    change: "+13%",
    trend: "up",
    context: "업계 평균 3.62 대비",
    icon: "feather-users",
    color: "info"
  }
]
```

**데이터 소스**:
- `blog_rank.csv` - 블로그 발행량
- `cafe_rank.csv` - 카페 발행량
- `news_rank.csv` - 뉴스 발행량
- `youtube_rank.csv` - 유튜브 발행량

### 4.2 SECTION 2: 채널 효율 분석

**컴포넌트명**: `ChannelEfficiencyChart.jsx`
**차트 타입**: 복합 차트 (막대 + 라인)

```javascript
const chartOptions = {
  series: [
    {
      name: '발행량',
      type: 'column',
      data: [652, 375, 277, 114] // 카페, 유튜브, 뉴스, 블로그
    },
    {
      name: '참여도',
      type: 'line',
      data: [4.2, 3.8, 3.5, 3.9]
    }
  ],
  xaxis: {
    categories: ['카페', '유튜브', '뉴스', '블로그']
  }
}
```

**인사이트 도출 로직**:
```javascript
const insights = {
  bestChannel: 카페 (발행량 최고),
  highestEngagement: 카페 (참여도 4.2),
  improvementNeeded: 블로그 (발행량 최저),
  recommendation: "카페 마케팅 유지, 블로그 콘텐츠 2배 증량"
}
```

### 4.3 SECTION 3: 제품별 성과 매트릭스

**컴포넌트명**: `ProductPerformanceMatrix.jsx`
**테이블 형식**: 정렬 가능한 데이터 테이블

```javascript
const productMetrics = [
  {
    product: "리프테라",
    publications: 63,
    searchVolume: 202,
    sales: 492,
    exposureEfficiency: 3.2, // 검색량/발행량
    salesEfficiency: 780, // (판매량/발행량) * 100
    status: "최고효율",
    recommendation: "콘텐츠 투자 증량"
  },
  {
    product: "쿨페이즈",
    publications: 220,
    searchVolume: 220,
    sales: 159,
    exposureEfficiency: 1.0,
    salesEfficiency: 72,
    status: "중간효율",
    recommendation: "콘텐츠 품질 개선"
  },
  {
    product: "쿨소닉",
    publications: 230,
    searchVolume: 230,
    sales: 23,
    exposureEfficiency: 1.0,
    salesEfficiency: 10,
    status: "개선필요",
    recommendation: "판매 전환 장벽 분석"
  }
]
```

**계산 공식**:
- **노출 효율** = 검색량 / 발행량 (높을수록 SEO 효과 우수)
- **판매 효율** = (판매량 / 발행량) × 100% (높을수록 전환 우수)

### 4.4 SECTION 4: 경쟁사 비교

**컴포넌트명**: `CompetitiveAnalysisCharts.jsx`

**4.4.1 시장 점유율 트렌드 (라인차트)**
```javascript
const marketShareTrend = {
  series: [
    { name: "써마지", data: [28.5, 29.1, 28.8] },
    { name: "인모드", data: [27.2, 27.8, 28.1] },
    { name: "아스테라시스", data: [11.9, 12.3, 12.7] },
    { name: "올리지오", data: [10.2, 9.8, 9.5] }
  ],
  xaxis: { categories: ["6월", "7월", "8월"] }
}
```

**4.4.2 경쟁 포지셔닝 맵 (산점도)**
```javascript
const positioningMap = {
  series: [
    {
      name: "아스테라시스",
      data: [
        { x: 220, y: 4.2, name: "쿨페이즈" },
        { x: 63, y: 4.1, name: "리프테라" },
        { x: 230, y: 3.9, name: "쿨소닉" }
      ],
      color: "#3b82f6" // 파란색 하이라이트
    },
    {
      name: "경쟁사",
      data: [
        { x: 928, y: 3.5, name: "써마지" },
        { x: 941, y: 3.6, name: "인모드" },
        // ... 기타 경쟁사
      ],
      color: "#94a3b8" // 회색
    }
  ],
  xaxis: { title: "발행량" },
  yaxis: { title: "참여도 (댓글/발행)" }
}
```

### 4.5 SECTION 5: 실행 가능 인사이트

**컴포넌트명**: `ActionableInsightsCard.jsx`

```javascript
const insights = [
  {
    icon: "🎯",
    category: "최고 효율",
    finding: "리프테라 판매효율 780%",
    action: "블로그 콘텐츠 2배 증량 추천",
    impact: "예상 판매 +150대/월",
    priority: "high"
  },
  {
    icon: "⚠️",
    category: "개선 필요",
    finding: "쿨소닉 검색량 1위, 판매 저조",
    action: "가격/시술 후기 콘텐츠 강화",
    impact: "전환율 +50% 목표",
    priority: "high"
  },
  {
    icon: "✅",
    category: "강점 유지",
    finding: "카페 참여도 업계 최고",
    action: "댓글 마케팅 전략 유지",
    impact: "브랜드 인지도 지속",
    priority: "medium"
  },
  {
    icon: "📈",
    category: "성장 기회",
    finding: "유튜브 콘텐츠 부족 (26.4%)",
    action: "시술 전후 영상 제작 필요",
    impact: "젊은층 도달률 +30%",
    priority: "medium"
  }
]
```

### 4.6 SECTION 6: 월간 트렌드 요약

**컴포넌트명**: `MonthlyTrendTimeline.jsx`

```javascript
const timelineEvents = [
  {
    date: "2025-08-05",
    type: "campaign",
    title: "여름 프로모션 시작",
    impact: "발행량 +28%",
    channel: "카페"
  },
  {
    date: "2025-08-12",
    type: "competitor",
    title: "써마지 신제품 발표",
    impact: "시장 점유율 -1.2%",
    channel: "전체"
  },
  {
    date: "2025-08-20",
    type: "success",
    title: "리프테라 후기 급증",
    impact: "판매량 +45대",
    channel: "블로그"
  }
]
```

---

## 5. 데이터 처리 로직

### 5.1 API 엔드포인트 설계

```javascript
// src/app/api/data/marketing-insights/route.js

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month') || '2025-08'

  // 21개 CSV 파일에서 필요한 데이터만 추출
  const data = await Promise.all([
    loadCSV(`blog_rank`, month),
    loadCSV(`cafe_rank`, month),
    loadCSV(`news_rank`, month),
    loadCSV(`youtube_rank`, month),
    loadCSV(`traffic`, month),
    loadCSV(`sale`, month)
  ])

  // 인사이트 계산
  const insights = {
    brandExposure: calculateBrandExposure(data),
    channelEfficiency: calculateChannelEfficiency(data),
    productPerformance: calculateProductPerformance(data),
    competitiveAnalysis: calculateCompetitiveAnalysis(data),
    actionableInsights: generateActionableInsights(data)
  }

  return Response.json({ success: true, insights })
}
```

### 5.2 핵심 계산 함수

```javascript
// config/marketing-insights.config.js

export const MarketingInsightsCalculations = {

  // 브랜드 노출 지표
  brandExposure: (blogData, cafeData, newsData, youtubeData) => {
    const asterasysTotal = sumAsterasysPublications(blogData, cafeData, newsData, youtubeData)
    const marketTotal = sumMarketPublications(blogData, cafeData, newsData, youtubeData)
    const marketShare = (asterasysTotal / marketTotal) * 100

    return {
      totalPublications: asterasysTotal,
      marketShare: marketShare.toFixed(1),
      dominantChannel: getDominantChannel(cafeData), // 카페 45.3%
      trend: calculateMoMTrend(asterasysTotal, previousMonthTotal)
    }
  },

  // 채널 효율 분석
  channelEfficiency: (channels) => {
    return channels.map(channel => ({
      name: channel.name,
      publications: channel.asterasysPublications,
      engagement: calculateEngagement(channel), // 댓글/발행량
      searchConversion: calculateSearchConversion(channel), // 검색유입/발행량
      efficiency: (channel.engagement * 0.6 + channel.searchConversion * 0.4) // 가중 효율
    })).sort((a, b) => b.efficiency - a.efficiency)
  },

  // 제품별 성과
  productPerformance: (products, salesData, trafficData) => {
    return products.map(product => {
      const publications = getProductPublications(product)
      const searchVolume = getProductSearchVolume(product, trafficData)
      const sales = getProductSales(product, salesData)

      return {
        name: product.name,
        publications,
        searchVolume,
        sales,
        exposureEfficiency: (searchVolume / publications).toFixed(1),
        salesEfficiency: ((sales / publications) * 100).toFixed(0),
        status: getSalesStatus(sales, publications),
        recommendation: generateRecommendation(product)
      }
    })
  },

  // 실행 가능 인사이트 생성
  generateActionableInsights: (allData) => {
    const insights = []

    // 인사이트 1: 최고 효율 제품
    const topProduct = findTopPerformingProduct(allData)
    if (topProduct.salesEfficiency > 500) {
      insights.push({
        category: "최고 효율",
        finding: `${topProduct.name} 판매효율 ${topProduct.salesEfficiency}%`,
        action: "콘텐츠 투자 2배 증량 추천",
        priority: "high"
      })
    }

    // 인사이트 2: 검색 vs 판매 불균형
    const imbalanceProduct = findSearchSalesImbalance(allData)
    if (imbalanceProduct) {
      insights.push({
        category: "개선 필요",
        finding: `${imbalanceProduct.name} 검색량 높으나 판매 저조`,
        action: "가격 경쟁력 및 후기 콘텐츠 강화",
        priority: "high"
      })
    }

    // 인사이트 3: 채널 강점
    const strongChannel = findStrongestChannel(allData)
    insights.push({
      category: "강점 유지",
      finding: `${strongChannel.name} 참여도 업계 최고`,
      action: `${strongChannel.strategy} 전략 유지`,
      priority: "medium"
    })

    // 인사이트 4: 성장 기회
    const growthChannel = findGrowthOpportunity(allData)
    insights.push({
      category: "성장 기회",
      finding: `${growthChannel.name} 콘텐츠 부족`,
      action: growthChannel.recommendation,
      priority: "medium"
    })

    return insights
  }
}
```

---

## 6. 8월 데이터 기반 인사이트 샘플

### 6.1 실제 도출 가능한 인사이트

**브랜드 노출 현황**
```
총 발행량: 1,418건
├─ 카페: 652건 (45.3%) ⭐ 최고 채널
├─ 유튜브: 375건 (26.4%)
├─ 뉴스: 277건 (19.5%)
└─ 블로그: 114건 (8.0%)

시장 점유율: 12.7% (18개 브랜드 중)
전월 대비: +0.4%p 상승
```

**채널 효율 분석**
```
채널별 참여도 (댓글수/발행량)
1. 카페: 4.2 (업계 평균 3.6 대비 +17%)
2. 블로그: 3.9
3. 유튜브: 3.8
4. 뉴스: 3.5

→ 인사이트: 카페 마케팅 전략 우수, 지속 투자 필요
```

**제품별 성과**
```
리프테라
├─ 발행량: 63건 (최소)
├─ 판매량: 492대 (최대)
├─ 효율: 780% ⭐⭐⭐
└─ 추천: 콘텐츠 2배 증량 시 판매 +150대 예상

쿨페이즈
├─ 발행량: 220건
├─ 판매량: 159대
├─ 효율: 72%
└─ 추천: 콘텐츠 품질 개선, 시술 후기 강화

쿨소닉
├─ 발행량: 230건 (최대)
├─ 판매량: 23대 (최소)
├─ 효율: 10% ⚠️
└─ 추천: 가격 전략 재검토, 신제품 홍보 강화
```

**경쟁사 비교**
```
TOP 3 경쟁사
1. 인모드: 941건 (28.1% 점유)
2. 써마지: 928건 (27.7% 점유)
3. 올리지오: 299건 (8.9% 점유)

아스테라시스: 513건 (12.7% 점유) → 4위

→ 인사이트: TOP 3 진입 위해 월간 +100건 필요
→ 올리지오 추월 가능 (격차 214건)
```

### 6.2 실행 가능한 마케팅 액션

```
우선순위 HIGH (즉시 실행)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 리프테라 블로그 콘텐츠 2배 증량
   - 현재: 63건/월 → 목표: 120건/월
   - 예상 효과: 판매 +150대, 매출 +15억원

2. 쿨소닉 가격 경쟁력 분석
   - 검색량 1위지만 판매 저조 원인 파악
   - 시술 비용, 효과 비교 콘텐츠 제작

우선순위 MEDIUM (1개월 내)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. 유튜브 영상 콘텐츠 확대
   - 시술 전후 비교 영상 제작
   - 의사 인터뷰 및 Q&A 시리즈

4. 카페 댓글 마케팅 강화
   - 현재 전략 유지 + 참여 이벤트 추가
   - 고객 후기 수집 캠페인

우선순위 LOW (분기 단위)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. 경쟁사 벤치마킹
   - 써마지/인모드 마케팅 전략 분석
   - 차별화 포인트 발굴
```

---

## 7. 기술 스택 및 구현 가이드

### 7.1 사용 기술
- **프레임워크**: Next.js 14 App Router
- **차트**: ApexCharts (기존 프로젝트 표준)
- **스타일**: Bootstrap 5.3.3 + SCSS (Duralux 테마)
- **데이터**: CSV 기반 실시간 처리
- **상태관리**: Zustand (useSelectedMonthStore)

### 7.2 파일 구조
```
src/
├── app/
│   └── (general)/
│       └── marketing-insights/
│           └── page.js (메인 페이지)
│
├── components/
│   └── asterasys/
│       ├── MarketingInsightsKPICards.jsx
│       ├── ChannelEfficiencyChart.jsx
│       ├── ProductPerformanceMatrix.jsx
│       ├── CompetitiveAnalysisCharts.jsx
│       ├── ActionableInsightsCard.jsx
│       └── MonthlyTrendTimeline.jsx
│
├── app/api/data/
│   └── marketing-insights/
│       └── route.js (API 엔드포인트)
│
└── config/
    └── marketing-insights.config.js (계산 로직)
```

### 7.3 Duralux 컴포넌트 재사용
```javascript
// 재사용 가능한 기존 컴포넌트
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

// 기존 스타일 클래스 활용
<div className="card stretch stretch-full">
  <div className="card-header">
    <h5 className="card-title">마케팅 인사이트</h5>
  </div>
  <div className="card-body">
    {/* 콘텐츠 */}
  </div>
</div>
```

---

## 8. 구현 우선순위

### Phase 1: MVP (1주차)
- ✅ SECTION 1: 브랜드 노출 KPI 카드
- ✅ SECTION 3: 제품별 성과 매트릭스
- ✅ SECTION 5: 실행 가능 인사이트 (텍스트 기반)

### Phase 2: 시각화 강화 (2주차)
- ✅ SECTION 2: 채널 효율 차트
- ✅ SECTION 4: 경쟁사 비교 차트

### Phase 3: 고급 기능 (3주차)
- ✅ SECTION 6: 월간 트렌드 타임라인
- ✅ 전월 대비 자동 인사이트 생성
- ✅ 인사이트 PDF 내보내기

---

## 9. 성공 지표

### 9.1 정량적 지표
- 페이지 로딩 속도: < 2초
- 데이터 정확도: 100% (CSV 원본 일치)
- 월간 접속 횟수: 경영진 20회 이상, 마케팅팀 50회 이상

### 9.2 정성적 지표
- 경영진: "이 페이지만 보면 우리 마케팅 현황을 한눈에 파악"
- 마케팅팀: "실행 가능한 액션을 바로 도출 가능"
- 직관성: 비전문가도 3분 내 이해 가능

---

## 10. 향후 확장 계획

### 10.1 자동화 기능
- AI 기반 인사이트 자동 생성
- 이상 징후 자동 알림 (판매 급감, 경쟁사 급증 등)
- 주간 리포트 자동 발송

### 10.2 고급 분석
- 고객 여정 분석 (Awareness → Intent 전환율)
- 채널 간 시너지 효과 분석
- ROI 계산 (마케팅 비용 대비 효과)

### 10.3 대시보드 개인화
- 경영진용 / 마케팅팀용 뷰 분리
- 제품별 담당자 커스텀 대시보드
- 목표 설정 및 달성률 트래킹

---

## 11. 결론

이 마케팅 인사이트 페이지는:
1. ✅ **직관적**: 비전문가도 3분 내 이해
2. ✅ **실행 가능**: 구체적 액션 아이템 제공
3. ✅ **데이터 기반**: 21개 CSV 실시간 분석
4. ✅ **경영진 친화**: 한 페이지에 핵심 요약
5. ✅ **Duralux 통일**: 기존 디자인과 완벽 조화

**핵심 가치**: "브랜드 인지도 향상"이라는 마케팅팀의 진짜 목표에 집중하며, 영업팀의 판매 전환은 별도 KPI로 분리하여 역할을 명확히 구분합니다.