# 블로그 분석 페이지 - YouTube 스타일 기획

## 🎯 페이지 구조 (YouTube 페이지 참조)

```javascript
// YouTube 페이지 구조
YouTubeAnalysisPage
├── PageHeader
├── YouTubeInsightsCards      // KPI 카드 섹션
├── YouTubeSponsorAdCard       // 스폰서 광고 카드
├── YouTubeSalesCorrelationChart // 판매 상관관계 차트
└── YouTubeComprehensiveTable  // 종합 데이터 테이블

// 블로그 페이지 구조 (동일 패턴)
BlogAnalysisPage
├── PageHeader
├── BlogInsightsCards          // KPI 카드 섹션
├── BlogProductFocusCard       // Asterasys 제품 집중 카드
├── BlogEngagementCorrelationChart // 검색/참여 상관 차트
├── BlogMarketLeaderboard      // 시장 순위 테이블
└── BlogAuthorSpotlight (옵션) // 상위 블로거 하이라이트
```

## 📊 전체 제품 목록 (18개)

### 고주파(RF) - 9개 제품
1. **써마지** - 발행량 6,243 (1위), 검색량 83,230
2. **인모드** - 발행량 4,142 (2위), 검색량 69,550
3. **덴서티** - 발행량 811 (3위), 검색량 86,590
4. **올리지오** - 발행량 784 (4위), 검색량 33,800
5. **볼뉴머** - 발행량 414 (5위), 검색량 114,390
6. **텐써마** - 발행량 355 (6위), 검색량 14,260
7. **세르프** - 발행량 342 (7위), 검색량 33,390
8. **튠페이스** - 발행량 251 (8위), 검색량 19,770
9. **쿨페이즈** [Asterasys] - 발행량 101 (9위), 검색량 11,390

### 초음파(HIFU) - 9개 제품
1. **울쎄라** - 발행량 8,904 (1위), 검색량 196,470
2. **슈링크** - 발행량 4,284 (2위), 검색량 92,960
3. **텐쎄라** - 발행량 269 (3위), 검색량 7,390
4. **리니어지** - 발행량 255 (4위), 검색량 7,170
5. **브이로** - 발행량 194 (5위), 검색량 2,080
6. **리프테라** [Asterasys] - 발행량 176 (6위), 검색량 28,800
7. **튠라이너** - 발행량 74 (7위), 검색량 6,450
8. **쿨소닉** [Asterasys] - 발행량 34 (8위), 검색량 18,510
9. **리니어펌** - 발행량 30 (9위), 검색량 2,040

## 📊 컴포넌트 상세 기획

### 1️⃣ BlogInsightsCards (YouTubeInsightsCards 스타일)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ KPI 카드 4개 (col-xxl-3 col-xl-3 col-lg-6 col-md-6)                      │
├──────────────┬──────────────┬──────────────┬──────────────┐            │
│ 📝 블로그    │ 🏢 Asterasys │ 💬 평균     │ 🔍 콘텐츠   │            │
│ 발행량       │ 점유율       │ 참여율      │ 생성 지수   │            │
│              │              │              │              │            │
│ 26,663       │ 1.17%        │ 68.4%       │ 12.3        │            │
│ 전체 발행수  │ 311/26,663   │ 댓글/발행   │ 발행/1K검색 │            │
│              │              │              │              │            │
│ [Progress Bar] [Progress Bar] [Progress Bar] [Progress Bar]│            │
│ vs 시장평균   │ vs 경쟁사    │ vs 업계평균  │ vs 업계평균  │            │
└──────────────┴──────────────┴──────────────┴──────────────┘            │
└─────────────────────────────────────────────────────────────────────────┘

데이터 매핑:
- 고주파: 9개 제품 총 발행량 12,443
- 초음파: 9개 제품 총 발행량 14,220
- 총합: 26,663
- Asterasys: 쿨페이즈(101) + 리프테라(176) + 쿨소닉(34) = 311
```

### 2️⃣ BlogProductFocusCard (YouTubeSponsorAdCard 스타일)
```
┌─────────────────────────────────────────────────────────┐
│ ⭐ Asterasys 제품 집중                                   │
│ ─────────────────────────────────────────────────────── │
│ [탭] 전체 | 쿨페이즈 | 리프테라 | 쿨소닉                │
│                                                          │
│ • 핵심 지표 요약                                         │
│   발행량 176건 (전체 1.3%)                               │
│   참여도 156% (댓글 148, 대댓글 8)                       │
│   검색량 28,800건 / 순위 3위                             │
│                                                          │
│ • 기술 포지션                                            │
│   [도넛] HIFU 56% | RF 44%                               │
│                                                          │
│ • 블로그 유형 구성                                       │
│   병원 82% | 일반 12% | 플레이스 6%                     │
│   [Progress Bars]                                         │
│                                                          │
│ • 검색 → 블로그 전환 지표                                │
│   검색 1천건당 블로그 6.1건 (업계 평균 21.5건)           │
│   개선 제안: 리뷰 협업 확대                               │
└─────────────────────────────────────────────────────────┘

특징:
- Asterasys 3개 제품과 전체 시장을 탭으로 전환하며 비교.
- 선택된 제품의 발행·참여·검색량을 카드 상단에 배치하고, 기술군/블로그 유형 비중을 시각화.
- 검색 대비 효율 지표를 강조해 제품별 성과 개선 포인트를 제시.
```

### 3️⃣ BlogEngagementCorrelationChart (YouTubeSalesCorrelationChart 스타일)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📈 검색량 vs 블로그 콘텐츠 생성 지수                                    │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│ [카테고리 선택] 🔘 전체  ⚪ 고주파(RF)  ⚪ 초음파(HIFU)                │
│                                                                          │
│  콘텐츠 생성 지수 (발행량/1K검색)                                       │
│     100 │                                                               │
│      93 │• 브이로 (93.3)                                               │
│         │                                                               │
│      75 │• 써마지 (75.0)                                              │
│         │                                                               │
│      60 │• 인모드 (59.5)                                              │
│         │                                                               │
│      45 │• 울쎄라 (45.3) • 슈링크 (46.1)                             │
│         │                                                               │
│      36 │• 텐쎄라 (36.4)                                              │
│      35 │• 리니어지 (35.6)                                            │
│         │                                                               │
│      25 │• 텐써마 (24.9)                                              │
│      23 │• 올리지오 (23.2)                                            │
│         │                                                               │
│      15 │• 리니어펌 (14.7)                                            │
│      12 │• 튠페이스 (12.7)                                            │
│      11 │• 튠라이너 (11.5)                                            │
│      10 │• 세르프 (10.2)                                              │
│       9 │• 덴서티 (9.4) • 쿨페이즈 [Asterasys] (8.9)                │
│         │                                                               │
│       6 │• 리프테라 [Asterasys] (6.1)                                │
│       4 │• 볼뉴머 (3.6)                                               │
│       2 │• 쿨소닉 [Asterasys] (1.8)                                  │
│         └─────────────────────────────────────────────────────────────│
│                                                                          │
│ [인사이트 카드]                                                          │
│ • 콘텐츠 생성 효율 1위: 브이로 (검색 1천건당 93.3개 블로그)            │
│ • 쿨페이즈: 검색 1천건당 8.9개 블로그 생성 (업계 평균: 21.5개)         │
│ • Asterasys 평균: 5.6개/1K검색 (개선 여지 있음)                        │
└─────────────────────────────────────────────────────────────────────────┘

특징:
- 콘텐츠 생성 지수 = (블로그 발행량 / 검색량) × 1000
- 18개 전체 제품 표시
- Asterasys 제품 [Asterasys] 배지로 강조
```

### 4️⃣ BlogMarketLeaderboard (YouTubeComprehensiveTable 스타일)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📊 블로그 발행 상세 데이터                                              │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│ [필터] 카테고리: 전체 ▼ | 블로그 유형: 전체 ▼ | 정렬: 발행량 ▼       │
│                                                                          │
│ ┌─────┬──────────────┬──────┬──────┬──────┬──────┬──────┬──────┬─────┐│
│ │순위 │제품명        │카테고리│병원  │플레이스│일반  │총발행│댓글  │참여율│
│ ├─────┼──────────────┼──────┼──────┼──────┼──────┼──────┼──────┼─────┤│
│ │ 1   │울쎄라        │HIFU  │3,020 │1,372 │4,512 │8,904 │8,672 │97.4%││
│ │ 2   │써마지        │RF    │1,698 │1,200 │3,345 │6,243 │3,239 │51.9%││
│ │ 3   │슈링크        │HIFU  │1,118 │776   │2,390 │4,284 │3,792 │88.5%││
│ │ 4   │인모드        │RF    │1,000 │408   │2,734 │4,142 │4,940 │119.3%│
│ │ 5   │덴서티        │RF    │365   │47    │399   │811   │752   │92.7%││
│ │ 6   │올리지오      │RF    │446   │80    │258   │784   │1,081 │137.9%│
│ │ 7   │볼뉴머        │RF    │206   │21    │187   │414   │1,093 │264.0%│
│ │ 8   │텐써마        │RF    │189   │11    │155   │355   │655   │184.5%│
│ │ 9   │세르프        │RF    │201   │31    │110   │342   │317   │92.7%││
│ │ 10  │텐쎄라        │HIFU  │140   │18    │111   │269   │501   │186.2%│
│ │ 11  │리니어지      │HIFU  │107   │13    │135   │255   │213   │83.5%││
│ │ 12  │튠페이스      │RF    │81    │17    │153   │251   │674   │268.5%│
│ │ 13  │브이로        │HIFU  │60    │5     │129   │194   │395   │203.6%│
│ │ 14  │리프테라 [Asterasys]│HIFU│100 │1   │75    │176   │204   │115.9%│
│ │ 15  │쿨페이즈 [Asterasys]│RF  │61  │0   │40    │101   │31    │30.7%││
│ │ 16  │튠라이너      │HIFU  │19    │0     │55    │74    │172   │232.4%│
│ │ 17  │쿨소닉 [Asterasys]│HIFU │20   │0   │14    │34    │35    │102.9%│
│ │ 18  │리니어펌      │HIFU  │19    │1     │10    │30    │45    │150.0%│
│ └─────┴──────────────┴──────┴──────┴──────┴──────┴──────┴──────┴─────┘│
│                                                                          │
│ [페이지] < 1 >                                                          │
└─────────────────────────────────────────────────────────────────────────┘

특징:
- 18개 제품 전체를 한 번에 비교하고 정렬/필터 적용.
- RF/HIFU 토글과 블로그 유형 필터로 시나리오 분석.
- Asterasys 제품은 강조 배지 및 행 배경으로 구분.
- `performanceScore`를 게이지/Progress Bar로 시각화.
```

### 5️⃣ BlogAuthorSpotlight (옵션)
```
┌───────────────────────────────────────────────┐
│ 🧑‍⚕️ 상위 블로거 하이라이트                     │
│ ──────────────────────────────────────────── │
│ [필터] 전체 | 쿨페이즈 | 리프테라 | 쿨소닉       │
│                                               │
│ 1. 유어힐의원 (쿨페이즈)                        │
│    • 발행 4건 | 순위 1위 | 참여도 높음           │
│    • https://blog.naver.com/flexifble14306    │
│                                               │
│ 2. 피부미용 연세봄봄의원 (리프테라)              │
│    • 발행 2건 | 순위 3위 | 참여도 중간          │
│                                               │
│ [요약] 총 172명 블로거 | Asterasys 12명         │
└───────────────────────────────────────────────┘

특징:
- `blog_user_rank.csv` 기반, forward-fill로 제품 키워드 매칭.
- 참여도 라벨(높음/중간/보통)과 제품별 배지 제공.
- `useCardTitleActions` 연동으로 카드 확장/삭제/새로고침 지원.
```

## 🎨 스타일 가이드

### 색상 체계 (YouTube 페이지 참조)
```scss
// Primary Colors
$asterasys-blue: #3b82f6;
$asterasys-dark: #1e40af;

// Category Colors
$rf-color: #8b5cf6;      // 고주파 (보라)
$hifu-color: #06b6d4;    // 초음파 (청록)

// Status Colors
$success: #10b981;       // 상승/긍정
$danger: #ef4444;        // 하락/부정
$warning: #f59e0b;       // 주의/평균

// Badge style (Asterasys)
.badge-asterasys {
  background-color: #3b82f6;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

// Card styles
.card {
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  border-radius: 8px;
}
```

### 레이아웃 그리드
```html
<!-- KPI Cards -->
<div className="row">
  <div className="col-xxl-3 col-xl-3 col-lg-6 col-md-6">...</div>
  <!-- 4 cards total -->
</div>

<!-- Main Content -->
<div className="row">
  <div className="col-xxl-4">BlogProductFocusCard</div>
  <div className="col-xxl-8">BlogEngagementCorrelationChart</div>
</div>

<!-- Table -->
<div className="row">
  <div className="col-12">BlogMarketLeaderboard</div>
</div>

<!-- Optional -->
<div className="row">
  <div className="col-xxl-4">BlogAuthorSpotlight</div>
</div>
```

## 📁 파일 구조

```
src/
├── app/(general)/channel/blog/
│   └── page.js                           # 메인 페이지
├── components/asterasys/
│   ├── BlogInsightsCards.jsx             # KPI 카드
│   ├── BlogProductFocusCard.jsx          # 제품 집중 카드
│   ├── BlogEngagementCorrelationChart.jsx # 상관관계 차트
│   ├── BlogMarketLeaderboard.jsx         # 시장 테이블
│   └── BlogAuthorSpotlight.jsx           # 블로거 카드 (옵션)
└── app/api/data/
    ├── blog-overview/route.js            # KPI 요약 API
    ├── blog-products/route.js            # 제품 세부 API
    ├── blog-engagement/route.js          # 상관관계/순위 API
    └── blog-authors/route.js             # 블로거 API
```

## 📈 데이터 흐름

```mermaid
graph TD
    A[blog_rank.csv] --> D[/api/data/blog-overview]
    A --> E[/api/data/blog-products]
    A --> F[/api/data/blog-engagement]
    B[blog_user_rank.csv] --> G[/api/data/blog-authors]
    C[traffic.csv] --> D
    C --> E
    C --> F

    D --> H[BlogInsightsCards]
    E --> I[BlogProductFocusCard]
    F --> J[BlogEngagementCorrelationChart]
    F --> K[BlogMarketLeaderboard]
    G --> L[BlogAuthorSpotlight]
```

## 🗂 데이터 소스 & 파생 지표 정의

### CSV 원본 구조

| 파일 | 주요 컬럼 | 노트 |
| --- | --- | --- |
| `asterasys_total_data - blog_rank.csv` | `키워드`, `블로그유형`, `총 개수`, `댓글 총 개수`, `대댓글 총 개수`, `발행량합`, `기기구분`, `발행량 순위` | 키워드별·유형별 발행 현황. 동일 키워드의 후속 행들은 `키워드`가 공란이므로 직전 값을 전진 채우기 해야 하며, `기기구분`은 고주파=RF, 초음파=HIFU를 의미. |
| `asterasys_total_data - blog_user_rank.csv` | `키워드`, `블로그명`, `URL`, `총 발행 개수`, `순위` | 키워드별 상위 블로거 10인. 첫 행만 키워드가 채워지고 이후 행은 공란 → 전진 채우기 필요. |
| `asterasys_total_data - traffic.csv` | `키워드`, `그룹`, `월감 검색량`, ` 검색량 순위` | 키워드별 월간 검색량. `그룹` 값이 RF/HIFU 구분과 직접 매칭. |

### 필수 파생 지표

- **총 발행량 합계**: `발행량합`을 전체 및 `기기구분`별로 합산.
- **Asterasys 발행량**: `키워드 ∈ {리프테라, 쿨페이즈, 쿨소닉}` 행의 `발행량합` 합계.
- **발행 점유율**: `아스테라시스 발행량 / 전체 발행량`. KPI 카드 및 미니 그래프에 사용.
- **참여도**: `(댓글 총 개수 + 대댓글 총 개수) / 총 개수`. BEI 용어는 제거하고 “참여도”로 표기.
- **검색 대비 발행 효율**: `발행량합 / 월감 검색량`. 0 또는 결측 검색량은 `null` 처리 후 UI에서 `--` 표시.
- **기술군 점유율**: 기술군별 발행량 비중(`기술군 합 / 전체 합 × 100`).
- **제품별 하이라이트 데이터**: 각 제품의 `발행량합`, `참여도`, `발행량 순위`, `기기구분`, 매칭된 `월감 검색량`, ` 검색량 순위`.
- **블로거 영향 점수(초안)**: `총 발행 개수 × (11 - 순위)` 또는 유사 가중치로 계산. 실제 가중치는 구현 시 Fine-tune.

### 정제 규칙

1. 공란 키워드는 직전 값 전진 채우기.
2. 수치형 컬럼은 정수 변환, 누락 시 0 적용(검색량은 `null` 허용).
3. `기기구분`이 비어 있으면 `미상`으로 라벨링해 필터에서 제외/표시를 판단.
4. 모든 파생 지표는 소수 1자리 이하 포맷. 표/카드에서는 단위(건, 회)를 명확히 표기.

## 🔌 API 스펙 (초안)

모든 엔드포인트는 `month=YYYY-MM` 쿼리 파라미터를 사용하며 미지정 시 최신 데이터(예: 2025-08)를 반환합니다.

### `GET /api/data/blog-overview`

KPI 카드와 기술군 점유율을 위한 요약 데이터.

```json
{
  "success": true,
  "month": "2025-08",
  "summary": {
    "totalPosts": 24385,
    "totalEngagement": 18240,
    "asterasysPosts": 311,
    "asterasysShare": 1.3,
    "averageParticipation": 0.31,
    "searchToPostRatio": 0.42
  },
  "technologyBreakdown": [
    { "technology": "RF", "posts": 12443, "share": 51.0 },
    { "technology": "HIFU", "posts": 11942, "share": 49.0 }
  ],
  "asterasys": [
    { "product": "리프테라", "technology": "HIFU", "posts": 176, "share": 56.6 },
    { "product": "쿨페이즈", "technology": "RF", "posts": 101, "share": 32.5 },
    { "product": "쿨소닉", "technology": "HIFU", "posts": 34, "share": 10.9 }
  ]
}
```

### `GET /api/data/blog-products`

제품 단위 카드/탭을 위한 상세 데이터.

```json
{
  "success": true,
  "products": [
    {
      "product": "리프테라",
      "technology": "HIFU",
      "rank": 6,
      "totalPosts": 176,
      "totalArticles": 100,
      "comments": 148,
      "replies": 8,
      "participation": 1.56,
      "searchVolume": 28800,
      "searchRank": 3,
      "searchToPostRatio": 0.61,
      "topBlogTypes": [
        { "type": "병원블로그", "posts": 176, "share": 82.0 }
      ]
    },
    "..."
  ]
}
```

### `GET /api/data/blog-engagement`

상관관계 차트 및 시장 리더보드용 데이터.

```json
{
  "success": true,
  "correlation": {
    "all": [
      {
        "keyword": "리프테라",
        "technology": "HIFU",
        "isAsterasys": true,
        "posts": 176,
        "participation": 1.56,
        "searchVolume": 28800,
        "searchToPostRatio": 0.61
      }
    ],
    "rf": [/* ... */],
    "hifu": [/* ... */]
  },
  "leaderboard": {
    "all": [
      {
        "rank": 1,
        "keyword": "덴서티",
        "technology": "RF",
        "totalPosts": 811,
        "participation": 1.34,
        "searchVolume": 86590,
        "performanceScore": 92.4,
        "isAsterasys": false
      }
    ],
    "rf": [/* ... */],
    "hifu": [/* ... */]
  }
}
```

### `GET /api/data/blog-authors`

상위 블로거/인플루언서 표기용 데이터.

```json
{
  "success": true,
  "authors": [
    {
      "product": "쿨페이즈",
      "name": "유어힐의원",
      "url": "https://blog.naver.com/flexifble14306",
      "totalPosts": 4,
      "rank": 1,
      "blogType": "병원블로그",
      "participationLabel": "고참여"
    }
  ],
  "totals": {
    "uniqueAuthors": 172,
    "asterasysAuthors": 12
  }
}
```

## 🧩 컴포넌트 별 데이터 요구사항

| 컴포넌트 | 사용 엔드포인트 | 필요한 주요 필드 | 구현 메모 |
| --- | --- | --- | --- |
| `BlogInsightsCards` | `/api/data/blog-overview` | `summary.totalPosts`, `summary.asterasysPosts`, `summary.averageParticipation`, `summary.searchToPostRatio`, `technologyBreakdown`, `asterasys` | `useSelectedMonthStore`로 월 동기화. KPI 카드 4개 + 하단 미니 그래프(기술군 점유율) 렌더. 진행바는 시장 평균 대비 비율로 계산. |
| `BlogProductFocusCard` | `/api/data/blog-products` | `product`, `technology`, `rank`, `totalPosts`, `participation`, `searchVolume`, `searchToPostRatio`, `topBlogTypes` | `/youtube` 스폰서 카드 레이아웃 재사용. 탭 버튼으로 3개 제품 + 전체. 표 내부에 검색량, 참여도, 블로그 유형 비중 표시. |
| `BlogEngagementCorrelationChart` | `/api/data/blog-engagement` | `correlation.{all,rf,hifu}` | ApexCharts 콤보차트 활용. 막대=발행량/참여도, 라인=검색량. 아스테라시스 제품은 강조 색(`bg-primary`). 기술 필터 토글. |
| `BlogMarketLeaderboard` | `/api/data/blog-engagement` | `leaderboard.{all,rf,hifu}` | `/youtube` 종합 테이블을 변형. 정렬/필터 유지, 참여도 열 추가. `performanceScore`로 상대적 점수 바 표시. |
| `BlogAuthorSpotlight` (옵션) | `/api/data/blog-authors` | `authors`, `totals` | 상위 블로거 10명 목록. `participationLabel`로 배지 출력, URL 링크. `useCardTitleActions` 훅으로 카드 액션 유지. |

### 공통 구현 지침

- 모든 클라이언트 컴포넌트는 `useSelectedMonthStore` 구독 및 `withMonthParam` 유틸을 사용해 달(月) 쿼리 적용.
- 로딩 상태는 기존 `CardLoader`로 처리, 오류 시 콘솔 로그 + 폴백 값 세팅.
- Asterasys 제품은 항상 별도 스타일(`badge bg-primary`, 차트 색상 강조)로 노출.
- 참여도는 퍼센트(×100)로 표기, 검색 대비 효율 등 비율 지표는 소수 1자리에서 반올림.
- CSV 기반 데이터 파서는 `src/services/blog` 또는 `src/lib/blog` 폴더에 유틸로 분리해 API 라우트에서 재사용.

## ✅ 구현 체크리스트

### Phase 1 - 기본 구조
- [ ] 페이지 파일 생성 (`blog/page.js`)
- [ ] PageHeader 컴포넌트 적용
- [ ] 기본 레이아웃 구성

### Phase 2 - 핵심 컴포넌트
- [ ] BlogInsightsCards (KPI 4개)
- [ ] BlogProductFocusCard (제품 집중 카드)
- [ ] BlogEngagementCorrelationChart (상관관계)
- [ ] BlogMarketLeaderboard (시장 테이블)
- [ ] BlogAuthorSpotlight (옵션)

### Phase 3 - API 엔드포인트
- [ ] blog-overview API
- [ ] blog-products API
- [ ] blog-engagement API
- [ ] blog-authors API

### Phase 4 - 인터랙션
- [ ] 월 선택 연동 (useSelectedMonthStore)
- [ ] 필터 기능
- [ ] 데이터 정렬
- [ ] 내보내기 기능

## 💡 핵심 차별점 (YouTube 페이지 대비)

1. **블로그 특화 지표**
   - 블로그 유형별 분석 (병원/플레이스/일반)
   - 댓글 참여율 중심
   - 콘텐츠 생성 지수 (검색 1천건당 블로그 발행수)

2. **Asterasys 3개 제품 모두 표시**
   - 쿨페이즈 (고주파) - 순위 15위
   - 리프테라 (초음파) - 순위 14위
   - 쿨소닉 (초음파) - 순위 17위

3. **18개 제품 완전 커버리지**
   - 고주파(RF): 써마지, 인모드, 덴서티, 올리지오, 볼뉴머, 텐써마, 세르프, 튠페이스, 쿨페이즈
   - 초음파(HIFU): 울쎄라, 슈링크, 텐쎄라, 리니어지, 브이로, 리프테라, 튠라이너, 쿨소닉, 리니어펌
