# 카페 분석 페이지 - 완전 기획서

## 🎯 페이지 구조 (블로그 페이지 참조)

```javascript
// 블로그 페이지 구조
BlogAnalysisPage
├── PageHeader
├── BlogInsightsCards          // KPI 카드 섹션
├── BlogProductFocusCard       // Asterasys 제품 집중 카드
├── BlogEngagementCorrelationChart // 검색/참여 상관 차트
└── BlogMarketLeaderboard      // 시장 순위 테이블

// 카페 페이지 구조 (동일 패턴)
CafeAnalysisPage
├── PageHeader
├── CafeInsightsCards          // KPI 카드 섹션 (참여도 & 판매 상관관계 중심)
├── CafeROIAnalysisCard        // 판매 전환율 & ROI 분석 카드
├── CafeEngagementHeatmapChart // 조회수-댓글-판매량 3차원 상관관계
└── CafeMarketingEffectivenessTable // 마케팅 효과성 테이블
```

## 📊 전체 제품 데이터 매트릭스 (18개 제품)

### 🔥 고주파(RF) - 9개 제품
| 순위 | 제품명 | 카페발행량 | 댓글수 | 대댓글수 | 조회수 | 판매량 | 8월판매 | 검색량 | 전환율 |
|------|--------|-----------|--------|----------|---------|---------|----------|---------|--------|
| 1 | **써마지** | 1,258 | 7,357 | 2,023 | 99,041 | 미공개 | 미공개 | 83,230 | - |
| 2 | **쿨페이즈** [Asterasys] | 789 | 5,255 | 706 | 45,450 | 169 | 10 | 11,390 | 21.4% |
| 3 | **인모드** | 752 | 3,866 | 1,163 | 58,850 | 미공개 | 미공개 | 69,550 | - |
| 4 | **덴서티** | 489 | 2,113 | 412 | 41,778 | 509 | 7 | 86,590 | 104.1% |
| 5 | **세르프** | 212 | 1,000 | 225 | 19,013 | 415 | 34 | 33,390 | 195.8% |
| 6 | **올리지오** | 194 | 1,108 | 337 | 12,395 | 1,220 | 188 | 33,800 | 628.9% |
| 7 | **튠페이스** | 150 | 1,251 | 296 | 12,525 | 365 | 40 | 19,770 | 243.3% |
| 8 | **텐써마** | 84 | 435 | 144 | 10,136 | 582 | 14 | 14,260 | 692.9% |
| 9 | **볼뉴머** | 77 | 457 | 141 | 6,022 | 551 | 8 | 114,390 | 715.6% |

### 🌊 초음파(HIFU) - 9개 제품
| 순위 | 제품명 | 카페발행량 | 댓글수 | 대댓글수 | 조회수 | 판매량 | 8월판매 | 검색량 | 전환율 |
|------|--------|-----------|--------|----------|---------|---------|----------|---------|--------|
| 1 | **울쎄라** | 1,321 | 6,565 | 1,758 | 70,341 | 미공개 | 미공개 | 196,470 | - |
| 2 | **쿨소닉** [Asterasys] | 605 | 4,275 | 600 | 26,467 | 31 | 8 | 18,510 | 5.1% |
| 3 | **슈링크** | 551 | 3,189 | 1,003 | 51,733 | 1,734 | 2 | 92,960 | 314.7% |
| 4 | **리프테라** [Asterasys] | 503 | 3,706 | 598 | 28,225 | 495 | 3 | 28,800 | 98.4% |
| 5 | **리니어지** | 146 | 210 | 37 | 10,498 | 403 | 5 | 7,170 | 276.0% |
| 6 | **브이로** | 83 | 613 | 139 | 8,199 | 467 | 24 | 2,080 | 562.7% |
| 7 | **텐쎄라** | 52 | 238 | 58 | 2,594 | 417 | 1 | 7,390 | 801.9% |
| 8 | **튠라이너** | 40 | 183 | 90 | 4,250 | 365 | 40 | 6,450 | 912.5% |
| 9 | **리니어펌** | 3 | 13 | 0 | 51 | 402 | 0 | 2,040 | 13,400% |

## 📋 데이터 소스 매핑 상세

### 1️⃣ cafe_rank.csv → 카페 활동 기본 지표
**파일 경로**: `data/raw/2025-08/asterasys_total_data - cafe_rank.csv`
```csv
컬럼 구조:
- 키워드: 제품명 (18개)
- 그룹: 고주파/초음파 카테고리
- 총 발행량: 카페 포스팅 수
- 총 댓글수: 직접 댓글
- 총 대댓글수: 댓글의 답글
- 총 조회수: 누적 조회수
- 발행량 순위: 카테고리 내 순위

사용처:
→ CafeInsightsCards (KPI 계산)
→ CafeEngagementHeatmapChart (X축: 발행량, 버블크기: 조회수)
→ CafeMarketingEffectivenessTable (기본 활동 지표)
```

### 2️⃣ sale.csv → 판매 성과 지표
**파일 경로**: `data/raw/2025-08/asterasys_total_data - sale.csv`
```csv
컬럼 구조:
- 키워드: 제품명 (16개, 써마지/인모드/울쎄라 미포함)
- 그룹: 고주파/초음파 카테고리
- 총 판매량: 누적 판매 대수
- 8월 판매량: 월간 판매 실적

사용처:
→ CafeInsightsCards (전환율 계산)
→ CafeROIAnalysisCard (제품별 판매 성과)
→ CafeEngagementHeatmapChart (Y축: 판매량, 색상: 전환율)
→ CafeMarketingEffectivenessTable (전환율 컬럼)

누락 데이터: 써마지, 인모드, 울쎄라 (상위 3개 제품 판매량 비공개)
```

### 3️⃣ traffic.csv → 검색량 연동
**파일 경로**: `data/raw/2025-08/asterasys_total_data - traffic.csv`
```csv
컬럼 구조:
- 키워드: 제품명 (18개 전체)
- 그룹: 고주파/초음파 카테고리
- 월감 검색량: 월간 검색 볼륨
- 검색량 순위: 카테고리 내 검색 순위

사용처:
→ CafeInsightsCards (검색 대비 카페 활동 효율)
→ CafeEngagementHeatmapChart (검색량 대비 포지셔닝)
→ CafeMarketingEffectivenessTable (검색량 컬럼 및 효율성 계산)
```

### 4️⃣ cafe_post.csv → 실제 포스팅 활동
**파일 경로**: `data/raw/2025-08/asterasys_total_data - cafe_post.csv`
```csv
컬럼 구조:
- 기기구분: 주로 리프테라 (Asterasys 자체 마케팅)
- No.: 포스팅 순번
- 작업일: 포스팅 날짜
- 진행카페: 카페명 (여우야, 재잘재잘, 성형위키백과 등)
- 작업ULR: 실제 포스팅 링크
- 닉네임: 포스터 닉네임

사용처:
→ CafeROIAnalysisCard (Asterasys 자체 마케팅 활동 분석)
→ 월별 포스팅 패턴 분석 (시계열 차트)
→ 주요 카페별 활동 분포
```

### 5️⃣ cafe_comments.csv → 고객 반응 분석
**파일 경로**: `data/raw/2025-08/asterasys_total_data - cafe_comments.csv`
```csv
컬럼 구조:
- 기기구분: 주로 리프테라
- NO.: 댓글 순번
- 작업일: 댓글 날짜
- 진행카페: 카페명
- 작업ULR: 댓글 링크
- 닉네임: 댓글 작성자
- 댓글내용: 실제 고객 반응 텍스트

사용처:
→ CafeROIAnalysisCard (고객 반응 품질 분석)
→ 감성 분석 (긍정/부정 반응 비율)
→ 주요 키워드 추출 (워드클라우드)
```

### 6️⃣ cafe_seo.csv → SEO 노출 성과
**파일 경로**: `data/raw/2025-08/asterasys_total_data - cafe_seo.csv`
```csv
컬럼 구조:
- 기기구분: 주로 리프테라
- 키워드: SEO 타겟 키워드
- 링크: 노출 페이지 URL
- 노출현황: 검색 노출 횟수
- 스마트블록: 스마트블록 노출 여부
- 인기글: 인기글 선정 여부 (O/공백)
- 카페순위: 해당 키워드 카페 내 순위

사용처:
→ CafeROIAnalysisCard (SEO 성과 지표)
→ 키워드별 노출 효율성 분석
→ 인기글 선정률 및 순위 추이
```

## 💰 핵심 KPI 계산식 정의

### 1️⃣ 판매 전환율 (Sales Conversion Rate)
```javascript
전환율 = (총 판매량 / 총 발행량) × 100

예시:
- 쿨페이즈: (169 / 789) × 100 = 21.4%
- 리프테라: (495 / 503) × 100 = 98.4%
- 쿨소닉: (31 / 605) × 100 = 5.1%

시장 평균:
- 고주파: (3,206 / 4,005) × 100 = 80.0% (판매 데이터 있는 제품만)
- 초음파: (4,314 / 1,943) × 100 = 222.0% (판매 데이터 있는 제품만)
```

### 2️⃣ 참여도 품질 지수 (Engagement Quality Index)
```javascript
참여도 = ((총 댓글수 + 총 대댓글수) / 총 조회수) × 100

예시:
- 쿨페이즈: ((5,255 + 706) / 45,450) × 100 = 13.1%
- 리프테라: ((3,706 + 598) / 28,225) × 100 = 15.2%
- 쿨소닉: ((4,275 + 600) / 26,467) × 100 = 18.4%

시장 평균: ((총 댓글 78,738 + 총 대댓글 21,719) / 총 조회수 1,011,996) × 100 = 9.9%
```

### 3️⃣ 마케팅 ROI (Marketing Return on Investment)
```javascript
ROI = Asterasys 전환율 / 경쟁사 평균 전환율

예시:
- 쿨페이즈 ROI: 21.4% / 80.0% = 0.27x (고주파 내)
- 리프테라 ROI: 98.4% / 222.0% = 0.44x (초음파 내)
- 쿨소닉 ROI: 5.1% / 222.0% = 0.02x (초음파 내)

주의: 상위 제품들(써마지, 인모드, 울쎄라) 판매 데이터 없어 실제 시장 평균은 더 낮을 가능성
```

### 4️⃣ 조회수 대비 판매 효율 (View-to-Sale Efficiency)
```javascript
효율성 = (총 판매량 / 총 조회수) × 1000 (1K조회당 판매)

예시:
- 쿨페이즈: (169 / 45,450) × 1000 = 3.72대/1K조회
- 리프테라: (495 / 28,225) × 1000 = 17.54대/1K조회
- 쿨소닉: (31 / 26,467) × 1000 = 1.17대/1K조회

Asterasys 평균: (695 / 100,142) × 1000 = 6.94대/1K조회
시장 평균(판매 데이터 있는 제품): (7,654 / 456,234) × 1000 = 16.78대/1K조회
```

## 📊 컴포넌트 상세 기획

### 1️⃣ CafeInsightsCards (BlogInsightsCards 스타일)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ KPI 카드 4개 (col-xxl-3 col-xl-3 col-lg-6 col-md-6)                      │
├──────────────┬──────────────┬──────────────┬──────────────┐            │
│ 💰 시장 판매 │ 💬 참여도   │ 📈 Asterasys│ 👁 조회수   │            │
│ 점유율       │ 품질 지수   │ ROI 평균     │ 판매 효율   │            │
│              │              │              │              │            │
│ 8.3%         │ 15.6%       │ 0.24x       │ 6.9대/1K    │            │
│ 695대/8,349대│ Asterasys   │ vs 경쟁사    │ Asterasys   │            │
│              │              │              │              │            │
│ [Progress Bar] [Progress Bar] [Progress Bar] [Progress Bar]│            │
│ vs 발행점유율 │ vs 시장평균  │ vs 시장평균  │ vs 시장평균  │            │
└──────────────┴──────────────┴──────────────┴──────────────┘            │
└─────────────────────────────────────────────────────────────────────────┘

데이터 매핑:
- cafe_rank.csv: 발행량, 댓글수, 대댓글수, 조회수
- sale.csv: 판매량 (16개 제품만)
- traffic.csv: 검색량 참조

계산 로직:
1. 시장 판매 점유율: Asterasys 판매량 / 전체 판매량(판매 데이터 있는 제품만)
2. 참여도 품질 지수: Asterasys 평균 참여율 vs 시장 평균
3. ROI 평균: 3개 제품 ROI의 평균값
4. 조회수 판매 효율: 1K조회당 판매 대수
```

### 2️⃣ CafeROIAnalysisCard (BlogProductFocusCard 스타일)
```
┌─────────────────────────────────────────────────────────┐
│ 💎 Asterasys 제품별 판매 전환 분석                       │
│ ─────────────────────────────────────────────────────── │
│ [탭] 전체 통합 | 쿨페이즈 | 리프테라 | 쿨소닉           │
│                                                          │
│ [선택: 쿨페이즈]                                         │
│ • 핵심 성과 지표                                         │
│   총 판매량 169대 (8월 10대) / 전환율 21.4%              │
│   카페 발행량 789건 (고주파 2위)                         │
│   조회수 45,450뷰 / 참여도 13.1%                         │
│                                                          │
│ • 경쟁사 대비 포지션                                     │
│   [미니 바 차트] 고주파 내 전환율 순위                   │
│   볼뉴머(715.6%) > 텐써마(692.9%) > 올리지오(628.9%)     │
│   > 튠페이스(243.3%) > 세르프(195.8%) > 덴서티(104.1%)   │
│   > 쿨페이즈(21.4%) > 써마지(미공개) > 인모드(미공개)    │
│                                                          │
│ • 월별 성과 추이 (8월 기준)                              │
│   [미니 라인] 8월 판매량 10대 / 월평균 예상 21대         │
│   성장률: 47.6% (8월 실적 기준)                          │
│                                                          │
│ • 마케팅 효율성 분석                                     │
│   검색량 대비: 11,390검색 → 789발행 → 169판매           │
│   검색→카페: 6.93% | 카페→판매: 21.4%                   │
│   총 퍼널 효율: 1.48% (검색→판매)                        │
└─────────────────────────────────────────────────────────┘

데이터 매핑:
- cafe_rank.csv: 발행량, 조회수, 댓글 데이터
- sale.csv: 판매량, 8월 판매량
- traffic.csv: 검색량
- cafe_post.csv: 자체 마케팅 활동 (리프테라 중심)

탭별 내용:
- 전체 통합: 3개 제품 합계 및 평균
- 개별 제품: 해당 제품 상세 분석 + 경쟁사 비교
```

### 3️⃣ CafeEngagementHeatmapChart (BlogEngagementCorrelationChart 스타일)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔥 카페 활동 vs 판매 성과 3차원 분석                                     │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│ [필터] 🔘 전체 18개  ⚪ 고주파 9개  ⚪ 초음파 9개  ⚪ 판매데이터만     │
│                                                                          │
│  판매량 (Y축, 로그 스케일)                                              │
│   10000│                                                                │
│        │                                                                │
│    1000│● 슈링크(1734)    ● 올리지오(1220)                             │
│        │           ● 텐써마(582)  ● 볼뉴머(551)                        │
│        │    ● 리프테라[Asterasys](495)  ● 브이로(467)                 │
│        │         ● 세르프(415)  ● 리니어펌(402)                        │
│        │              ● 튠라이너(365)  ● 튜페이스(365)                │
│     100│    ● 쿨페이즈[Asterasys](169)                                 │
│        │                                                                │
│      10│● 쿨소닉[Asterasys](31)                                        │
│        │                                                                │
│       1│────────────────────────────────────────→ 카페 발행량 (X축)    │
│        0    200   400   600   800  1000  1200                         │
│                                                                          │
│ 🔍 버블 크기 = 조회수 | 🎨 색상 = 전환율 (빨강:높음 → 파랑:낮음)        │
│                                                                          │
│ [성과 인사이트 카드]                                                     │
│ • 🏆 최고 효율: 리니어펌 (발행량 3건 → 판매 402대, 13,400% 전환율)      │
│ • 🎯 균형형: 리프테라 (발행량 503건 → 판매 495대, 98.4% 전환율)         │
│ • 📢 마케팅 중심: 쿨페이즈 (발행량 789건 → 판매 169대, 21.4% 전환율)    │
│ • 🚀 신제품: 쿨소닉 (발행량 605건 → 판매 31대, 5.1% 전환율)            │
│ • ❓ 미공개: 써마지, 인모드, 울쎄라 (상위 발행량이지만 판매 데이터 없음)  │
└─────────────────────────────────────────────────────────────────────────┘

데이터 매핑:
- X축: cafe_rank.csv의 '총 발행량'
- Y축: sale.csv의 '총 판매량' (로그 스케일)
- 버블 크기: cafe_rank.csv의 '총 조회수'
- 색상: 계산된 전환율 (빨강→주황→파랑)

특수 처리:
- 판매 데이터 없는 제품(써마지, 인모드, 울쎄라)은 회색 표시
- 이상치(리니어펌 13,400%)는 별도 주석 처리
- Asterasys 제품은 테두리 강조 + [Asterasys] 라벨
```

### 4️⃣ CafeMarketingEffectivenessTable (BlogMarketLeaderboard 스타일)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📊 카페 마케팅 효과성 종합 순위표                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│ [필터] 카테고리: 전체 ▼ | 정렬: 전환율 ▼ | 표시: 판매데이터만 ☑        │
│                                                                          │
│ ┌─────┬────────────────┬──────┬──────┬──────┬──────┬──────┬──────┬─────┐│
│ │순위 │제품명          │카테고리│발행량│조회수│댓글수│판매량│전환율│효율 ││
│ ├─────┼────────────────┼──────┼──────┼──────┼──────┼──────┼──────┼─────┤│
│ │ 1   │리니어펌        │HIFU  │3     │51    │13    │402   │13,400%│788.2││
│ │ 2   │튠라이너        │HIFU  │40    │4,250 │273   │365   │912.5%│85.9 ││
│ │ 3   │텐쎄라          │HIFU  │52    │2,594 │296   │417   │801.9%│160.8││
│ │ 4   │텐써마          │RF    │84    │10,136│579   │582   │692.9%│57.4 ││
│ │ 5   │볼뉴머          │RF    │77    │6,022 │598   │551   │715.6%│91.5 ││
│ │ 6   │올리지오        │RF    │194   │12,395│1,445 │1,220 │628.9%│98.5 ││
│ │ 7   │브이로          │HIFU  │83    │8,199 │752   │467   │562.7%│57.0 ││
│ │ 8   │슈링크          │HIFU  │551   │51,733│4,192 │1,734 │314.7%│33.5 ││
│ │ 9   │리니어지        │HIFU  │146   │10,498│247   │403   │276.0%│38.4 ││
│ │ 10  │튠페이스        │RF    │150   │12,525│1,547 │365   │243.3%│29.1 ││
│ │ 11  │세르프          │RF    │212   │19,013│1,225 │415   │195.8%│21.8 ││
│ │ 12  │덴서티          │RF    │489   │41,778│2,525 │509   │104.1%│12.2 ││
│ │ 13  │리프테라[Asterasys]│HIFU│503   │28,225│4,304 │495   │98.4% │17.5 ││
│ │ 14  │쿨페이즈[Asterasys]│RF │789   │45,450│5,961 │169   │21.4% │3.7  ││
│ │ 15  │쿨소닉[Asterasys]│HIFU │605   │26,467│4,875 │31    │5.1%  │1.2  ││
│ │ -   │써마지          │RF    │1,258 │99,041│9,380 │미공개│-     │-    ││
│ │ -   │인모드          │RF    │752   │58,850│5,029 │미공개│-     │-    ││
│ │ -   │울쎄라          │HIFU  │1,321 │70,341│8,323 │미공개│-     │-    ││
│ └─────┴────────────────┴──────┴──────┴──────┴──────┴──────┴──────┴─────┘│
│                                                                          │
│ 💡 효율 = (판매량/조회수) × 1000 (1K조회당 판매대수)                     │
│ 📈 Asterasys 종합 성과: 판매량 695대 / 발행량 1,897건 / 전환율 36.6%    │
│ [페이지] < 1 2 >                                                        │
└─────────────────────────────────────────────────────────────────────────┘

데이터 매핑:
- 기본 데이터: cafe_rank.csv (발행량, 조회수, 댓글수)
- 판매 데이터: sale.csv (판매량) - 16개 제품만
- 계산 필드: 전환율, 효율성 지수
- 정렬/필터: 전환율, 효율성, 카테고리별

특징:
- 판매 데이터 없는 제품은 하단 별도 표시
- Asterasys 제품 [Asterasys] 배지 및 행 강조
- 이상치(리니어펌)는 별도 색상 처리
- 종합 성과 요약 하단 표시
```

## 🎨 스타일 가이드

### 색상 체계 (블로그 페이지 확장)
```scss
// Primary Colors (동일)
$asterasys-blue: #3b82f6;
$asterasys-dark: #1e40af;

// Category Colors (동일)
$rf-color: #8b5cf6;      // 고주파 (보라)
$hifu-color: #06b6d4;    // 초음파 (청록)

// 판매 성과 Colors
$conversion-excellent: #10b981;  // 100% 이상 (초록)
$conversion-good: #3b82f6;       // 50-100% (파랑)
$conversion-average: #f59e0b;    // 10-50% (주황)
$conversion-poor: #ef4444;       // 10% 이하 (빨강)
$conversion-none: #9ca3af;       // 데이터 없음 (회색)

// ROI 성과 Colors
$roi-outstanding: #7c3aed;       // 5x 이상 (보라)
$roi-excellent: #10b981;         // 2-5x (초록)
$roi-good: #3b82f6;              // 1-2x (파랑)
$roi-below: #f59e0b;             // 0.5-1x (주황)
$roi-poor: #ef4444;              // 0.5x 이하 (빨강)

// 히트맵 Colors (전환율 기반)
$heatmap-hot: linear-gradient(45deg, #ef4444, #dc2626);     // 높은 전환율
$heatmap-warm: linear-gradient(45deg, #f59e0b, #d97706);    // 중간 전환율
$heatmap-cool: linear-gradient(45deg, #3b82f6, #2563eb);    // 낮은 전환율
$heatmap-cold: linear-gradient(45deg, #9ca3af, #6b7280);    // 데이터 없음
```

### 아이콘 매핑
```scss
// KPI 카드 아이콘
.icon-market-share::before { content: "💰"; }      // 시장 점유율
.icon-engagement::before { content: "💬"; }        // 참여도
.icon-roi::before { content: "📈"; }               // ROI
.icon-efficiency::before { content: "👁"; }        // 효율성

// 제품 카테고리 아이콘
.icon-rf::before { content: "⚡"; }                // 고주파
.icon-hifu::before { content: "🌊"; }              // 초음파
.icon-asterasys::before { content: "⭐"; }         // Asterasys

// 성과 등급 아이콘
.icon-excellent::before { content: "🏆"; }         // 우수
.icon-good::before { content: "🎯"; }              // 양호
.icon-average::before { content: "📊"; }           // 보통
.icon-poor::before { content: "⚠️"; }              // 개선 필요
```

## 📁 파일 구조 및 API 설계

### 컴포넌트 파일 구조
```
src/
├── app/(general)/channel/cafe/
│   └── page.js                              # 메인 페이지
├── components/asterasys/
│   ├── CafeInsightsCards.jsx                # KPI 카드 (시장 점유율 중심)
│   ├── CafeROIAnalysisCard.jsx              # ROI 분석 (제품별 탭)
│   ├── CafeEngagementHeatmapChart.jsx       # 3차원 히트맵
│   └── CafeMarketingEffectivenessTable.jsx  # 효과성 순위표
├── services/cafe/
│   ├── cafeDataProcessor.js                 # CSV 파싱 및 계산
│   ├── conversionCalculator.js              # 전환율 계산 로직
│   └── roiAnalyzer.js                       # ROI 분석 로직
└── utils/cafe/
    ├── cafeMetrics.js                       # 지표 계산 함수들
    └── cafeHelpers.js                       # 유틸리티 함수들
```

### API 엔드포인트 설계
```
└── app/api/data/
    ├── cafe-overview/route.js               # 전체 개요 및 KPI
    ├── cafe-products/route.js               # 제품별 상세 분석
    ├── cafe-correlation/route.js            # 상관관계 데이터
    ├── cafe-effectiveness/route.js          # 마케팅 효과성 순위
    └── cafe-insights/route.js               # 인사이트 및 추천
```

### API 응답 스키마

#### GET /api/data/cafe-overview
```json
{
  "success": true,
  "month": "2025-08",
  "summary": {
    "totalProducts": 18,
    "productsWithSales": 15,
    "totalCafePosts": 6304,
    "totalSales": 8349,
    "totalViews": 1011996,
    "totalEngagement": 100457,
    "asterasysData": {
      "posts": 1897,
      "sales": 695,
      "views": 100142,
      "engagement": 15936,
      "marketShare": 8.3,
      "conversionRate": 36.6,
      "roiAverage": 0.24
    }
  },
  "categoryBreakdown": [
    {
      "category": "RF",
      "products": 9,
      "totalPosts": 4005,
      "totalSales": 3206,
      "asterasysPosts": 789,
      "asterasysSales": 169
    },
    {
      "category": "HIFU",
      "products": 9,
      "totalPosts": 2299,
      "totalSales": 4314,
      "asterasysPosts": 1108,
      "asterasysSales": 526
    }
  ]
}
```

#### GET /api/data/cafe-products
```json
{
  "success": true,
  "products": [
    {
      "keyword": "쿨페이즈",
      "category": "RF",
      "rank": 2,
      "posts": 789,
      "comments": 5255,
      "replies": 706,
      "views": 45450,
      "sales": 169,
      "monthlySales": 10,
      "searchVolume": 11390,
      "conversionRate": 21.4,
      "efficiency": 3.72,
      "engagementRate": 13.1,
      "isAsterasys": true,
      "competitorComparison": {
        "categoryRank": 7,
        "categoryTotal": 9,
        "betterThan": ["써마지", "인모드"],
        "worseThan": ["볼뉴머", "텐써마", "올리지오", "튠페이스", "세르프", "덴서티"]
      }
    }
  ]
}
```

## 🗂 데이터 처리 로직

### CSV 파싱 및 조인 로직
```javascript
// services/cafe/cafeDataProcessor.js

export class CafeDataProcessor {
  constructor() {
    this.cafeRankData = null;
    this.salesData = null;
    this.trafficData = null;
    this.postData = null;
    this.commentsData = null;
    this.seoData = null;
  }

  async loadAllData(month = '2025-08') {
    // 6개 CSV 파일 동시 로드
    const files = [
      'cafe_rank.csv',
      'sale.csv',
      'traffic.csv',
      'cafe_post.csv',
      'cafe_comments.csv',
      'cafe_seo.csv'
    ];

    const data = await Promise.all(
      files.map(file => this.loadCSV(`data/raw/${month}/asterasys_total_data - ${file}`))
    );

    [this.cafeRankData, this.salesData, this.trafficData,
     this.postData, this.commentsData, this.seoData] = data;
  }

  getEnhancedProductData() {
    return this.cafeRankData.map(product => {
      const salesInfo = this.salesData.find(s => s.키워드 === product.키워드) || {};
      const trafficInfo = this.trafficData.find(t => t.키워드 === product.키워드) || {};

      return {
        keyword: product.키워드,
        category: product.그룹,
        posts: parseInt(product['총 발행량']) || 0,
        comments: parseInt(product['총 댓글수']) || 0,
        replies: parseInt(product['총 대댓글수']) || 0,
        views: parseInt(product['총 조회수']) || 0,
        rank: parseInt(product['발행량 순위']) || 0,
        sales: parseInt(salesInfo['총 판매량']) || null,
        monthlySales: parseInt(salesInfo['8월 판매량']) || null,
        searchVolume: parseInt(trafficInfo['월감 검색량']) || 0,
        searchRank: parseInt(trafficInfo[' 검색량 순위']) || 0,
        isAsterasys: ['쿨페이즈', '리프테라', '쿨소닉'].includes(product.키워드),
        // 계산 필드들
        conversionRate: this.calculateConversionRate(salesInfo, product),
        efficiency: this.calculateEfficiency(salesInfo, product),
        engagementRate: this.calculateEngagementRate(product),
        roi: this.calculateROI(salesInfo, product)
      };
    });
  }

  calculateConversionRate(salesInfo, cafeInfo) {
    const sales = parseInt(salesInfo['총 판매량']) || 0;
    const posts = parseInt(cafeInfo['총 발행량']) || 0;
    return posts > 0 ? (sales / posts) * 100 : null;
  }

  calculateEfficiency(salesInfo, cafeInfo) {
    const sales = parseInt(salesInfo['총 판매량']) || 0;
    const views = parseInt(cafeInfo['총 조회수']) || 0;
    return views > 0 ? (sales / views) * 1000 : null;
  }

  calculateEngagementRate(cafeInfo) {
    const comments = parseInt(cafeInfo['총 댓글수']) || 0;
    const replies = parseInt(cafeInfo['총 대댓글수']) || 0;
    const views = parseInt(cafeInfo['총 조회수']) || 0;
    return views > 0 ? ((comments + replies) / views) * 100 : 0;
  }
}
```

## ✅ 구현 체크리스트

### Phase 1 - 데이터 인프라
- [ ] CSV 파싱 로직 구현 (6개 파일)
- [ ] 데이터 조인 및 계산 로직
- [ ] API 엔드포인트 4개 구현

### Phase 2 - 핵심 컴포넌트
- [ ] CafeInsightsCards (시장 지향 KPI)
- [ ] CafeROIAnalysisCard (제품별 ROI)
- [ ] CafeEngagementHeatmapChart (3차원 히트맵)
- [ ] CafeMarketingEffectivenessTable (효과성 순위)

### Phase 3 - 사용자 경험
- [ ] 월 선택 연동 (useSelectedMonthStore)
- [ ] 히트맵 인터랙션 (호버, 클릭)
- [ ] 테이블 정렬/필터링
- [ ] 제품별 탭 전환

### Phase 4 - 고도화
- [ ] 실시간 계산 캐싱
- [ ] 성과 인사이트 자동 생성
- [ ] 데이터 내보내기
- [ ] 모바일 반응형 최적화

## 💡 핵심 비즈니스 인사이트

### 🏆 Asterasys 경쟁 우위
1. **리프테라**: 98.4% 전환율로 거의 완벽한 카페→판매 연결
2. **쿨페이즈**: 고주파 2위 발행량으로 강력한 브랜드 인지도
3. **쿨소닉**: 초음파 2위 발행량, 신제품으로 성장 잠재력

### ⚠️ 개선 영역
1. **쿨소닉**: 5.1% 낮은 전환율, 마케팅 메시지 최적화 필요
2. **전체 ROI**: 0.24x로 경쟁사 대비 효율성 개선 여지
3. **상위 브랜드**: 써마지, 인모드, 울쎄라 판매 데이터 확보 필요

### 📊 시장 특이사항
1. **리니어펌**: 3건 발행으로 402대 판매, 13,400% 전환율 (데이터 이상)
2. **상위 3개 브랜드**: 판매 데이터 비공개로 실제 시장 상황 불투명
3. **카테고리별 차이**: 초음파가 고주파보다 높은 평균 전환율

이 기획서는 모든 경쟁사 데이터와 명확한 파일 참조 구조를 포함하여 실제 구현 시 정확한 데이터 매핑이 가능하도록 설계되었습니다.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "\ubaa8\ub4e0 \uacbd\uc7c1\uc0ac \ub370\uc774\ud130 \uc0c1\uc138 \ubd84\uc11d \ubc0f \uc815\ub9ac", "status": "completed", "activeForm": "\ubaa8\ub4e0 \uacbd\uc7c1\uc0ac \ub370\uc774\ud130 \uc0c1\uc138 \ubd84\uc11d \ubc0f \uc815\ub9ac \uc911"}, {"content": "\ub370\uc774\ud130 \ud30c\uc77c\ubcc4 \ucc38\uc870 \uad6c\uc870 \uba85\ud655\ud654", "status": "completed", "activeForm": "\ub370\uc774\ud130 \ud30c\uc77c\ubcc4 \ucc38\uc870 \uad6c\uc870 \uba85\ud655\ud654 \uc911"}, {"content": "CAFE_ANALYSIS_DESIGN.md \ud30c\uc77c \ub514\ubca8\ub86d \ubc0f \uc644\uc131", "status": "completed", "activeForm": "CAFE_ANALYSIS_DESIGN.md \ud30c\uc77c \ub514\ubca8\ub86d \ubc0f \uc644\uc131 \uc911"}]