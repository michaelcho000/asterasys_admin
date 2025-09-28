# 데이터 소스 매핑

이 문서는 월별 원본 CSV가 어떤 API와 웹 UI 컴포넌트에 연결되는지 한눈에 파악할 수 있도록 정리한 것입니다. 모든 원본 CSV는 `data/raw/<YYYY-MM>/` 구조(예: `data/raw/2025-08/`)로 보관하며, `generated/<YYYY-MM>/` 폴더는 파이프라인이 생성한 2차 가공 CSV를 보관합니다.

## 채널·콘텐츠 통합 데이터
- **`asterasys_total_data - blog_rank.csv`**  
  - 주요 API: `/api/data/files/blog_rank`, `npm run process-data`
  - 화면: 메인 대시보드 KPI 카드(AsteraysKPIStatistics), PaymentRecordChart, LeadsOverviewChart, LatestLeads, 경쟁사 대시보드(AsterasysCompetitiveDashboard)
- **`asterasys_total_data - cafe_rank.csv`**  
  - 주요 API: `/api/data/files/cafe_rank`, `npm run process-data`
  - 화면: KPI 카드, PaymentRecordChart, LeadsOverviewChart, LatestLeads, 경쟁사 대시보드
- **`asterasys_total_data - news_rank.csv`**  
  - 주요 API: `/api/data/files/news_rank`, `npm run process-data`
  - 화면: KPI 카드, LeadsOverviewChart, LatestLeads, 경쟁사 대시보드
- **`asterasys_total_data - traffic.csv`**  
  - 주요 API: `/api/data/files/traffic`, `npm run process-data`
  - 화면: KPI 카드(검색량), PaymentRecordChart, LatestLeads, AsteraysProductPortfolio
- **`asterasys_total_data - sale.csv`**  
  - 주요 API: `/api/data/files/sale`, `npm run process-data`
  - 화면: KPI 카드(판매량), LatestLeads, AsteraysProductPortfolio, YouTubeSalesCorrelationChart(간접)
- **`asterasys_total_data - blog_user_rank.csv`**  
  - 파이프라인: `npm run process-data`에서 인플루언서 순위를 계산하여 TopInfluencersTable에 제공
- **`asterasys_total_data - youtube_rank.csv`**  
  - 주요 API: `/api/data/files/youtube_rank`
  - 화면: LeadsOverviewChart, LatestLeads, 경쟁사 대시보드

## 사용자 제작/운영 데이터
- **`asterasys_total_data - blog_post.csv`** → `/api/data/blog-posts` → HospitalBlogTable (보고서 > 병원 블로그)
- **`asterasys_total_data - bloger_Post.csv`** → `/api/data/experience-posts` → ExperiencePostTable (보고서 > 체험단 포스트)
- **`asterasys_total_data - cafe_post.csv`** → `/api/data/cafe-posts` → CafePostsTable (보고서 > 카페 운영)
- **`asterasys_total_data - cafe_comments.csv`** → `/api/data/cafe-comments` → CafeCommentsTable (보고서 > 카페 댓글)
- **`asterasys_total_data - cafe_seo.csv`** → `/api/data/cafe-seo` → CafeSeoTable (보고서 > 카페 SEO)
- **`asterasys_total_data - autocomplete.csv`** → `/api/data/auto-complete` → AutoCompleteTable (보고서 > 자동완성 작업)
- **`asterasys_total_data - facebook_targeting.csv`**  
  - 주요 API: `/api/data/targeting-ads`, `/api/data/files/facebook_targeting`
  - 화면: TargetingAdsTable, FacebookTargetingWidget
- **`asterasys_total_data - youtube_sponsor ad.csv`**  
  - 주요 API: `/api/data/youtube-ads`, `/api/data/youtube-sponsor`
  - 화면: YouTubeAdsTable, YouTubeSponsorAdCard
- **`asterasys_total_data - ott.csv`** → `/api/data/outdoor-ads` → OutdoorAdsTable
- **`asterasys_total_data - naver datalab.csv`** → `/api/data/files/naver datalab` → TasksOverviewChart, AsteraysProductPortfolio(검색 트렌드 비교)
- **`asterasys_total_data - news analysis.csv`** → `/api/data/news-analysis` → 뉴스 KPI·분석 위젯(NewsExecutiveKPICards, NewsProductCategoryRadar 등)
- **`asterasys_total_data - youtube_comments.csv`** → `/api/data/youtube-comments` → YouTubeCommentsTable
- **`asterasys_total_data - youtube_contents.csv`**  
  - 파이프라인: `npm run process-data`에서 YouTube 채널 수/콘텐츠 통계를 계산하여 YouTubeInsightsCards 등에 활용

## 기타 참고 데이터
- **`asterasys_total_data - news_release.csv`**, **`asterasys_total_data - bad writing.csv`**, **`asterasys_total_data - kakao_opentalk.csv`**  
  - 현재는 운영 리포트(AsterasysOperationalReports)나 내부 자료에서만 참조되며, UI 실시간 연동은 준비 중입니다.
- **`dataset_youtube-scraper_*.json`**  
  - 유튜브 원본 JSON. `scripts/processYoutubeData.cjs`/`processYouTubeData.py`/`processYouTubeDataNode.js`가 이 파일을 읽어 2차 지표를 생성합니다.

## 월별 처리 워크플로우
1. 새 CSV와 YouTube JSON을 `data/raw/<YYYY-MM>/`에 업로드합니다. 기존 월을 재처리할 때는 `--set-latest=false`로 최신 월 갱신을 건너뛰세요.
2. `npm run process-data -- --month=<YYYY-MM>`을 실행해 `data/processed/<YYYY-MM>/` 산출물을 생성합니다.
3. `npm run youtube:process -- --month=<YYYY-MM>`으로 `youtube_products.csv`와 YouTube 세부 지표를 갱신합니다.
4. `node scripts/processYoutubeSalesMatching.js --month=<YYYY-MM>` → `node scripts/analyzeYoutubeSalesCorrelation.js --month=<YYYY-MM>` 순서로 판매·상관분석 JSON을 업데이트합니다.
5. `npm run youtube:channels -- --month=<YYYY-MM>`을 실행하면 `data/processed/youtube/<YYYY-MM>/asterasys_channels_data.json`이 생성되어 `/api/data/youtube-channels?month=`에서 바로 노출됩니다.

> `scripts/processYouTubeDataNode.js`는 실험용 분석 스크립트입니다. 월별 폴더를 자동으로 인식하지 않으므로 필요 시 JSON 경로를 직접 수정한 뒤 일회성으로 사용하세요.

## generated/ (파이프라인 산출물)
- **`generated/youtube_products.csv`**  
  - 생성 스크립트: `scripts/processYoutubeData.cjs`
  - 주요 API: `/api/data/youtube-products`
  - 화면: YouTubeComprehensiveTable, YouTubeSalesCorrelationChart, Data 분석 스크립트
- **`generated/youtube_market_share.csv`**  
  - 생성 스크립트: `scripts/processYoutubeData.cjs`, `scripts/processYouTubeDataNode.js`, `scripts/processYouTubeData.py`
  - 주요 API: `/api/data/youtube-analysis`
  - 화면: YouTubeAnalysisTable, YouTubeInsightsCards, 관련 뉴스 요약 컴포넌트

> 위 표에 없는 CSV는 현재 UI와 직접 연결되어 있지 않으며, 필요 시 새로운 API/컴포넌트로 확장할 수 있습니다.
