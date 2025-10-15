# 2025년 9월 데이터 업로드 가이드

이 폴더는 2025년 9월 실적 CSV 원본을 보관하는 전용 위치입니다. 8월과 동일한 파일명을 유지해야 `npm run process-data -- --month=2025-09` 실행 시 자동으로 매핑됩니다.

## 1. 필수 CSV 목록
다음 파일 21개를 **한 번에** 업로드해주세요. 모든 파일은 UTF-8(CRLF 무관) 이어야 하며, 헤더 구조는 8월과 동일해야 합니다.

```
asterasys_total_data - autocomplete.csv
asterasys_total_data - bad writing.csv
asterasys_total_data - blog_post.csv
asterasys_total_data - blog_rank.csv
asterasys_total_data - blog_user_rank.csv
asterasys_total_data - bloger_Post.csv
asterasys_total_data - cafe_comments.csv
asterasys_total_data - cafe_post.csv
asterasys_total_data - cafe_rank.csv
asterasys_total_data - cafe_seo.csv
asterasys_total_data - facebook_targeting.csv
asterasys_total_data - kakao_opentalk.csv
asterasys_total_data - naver datalab.csv
asterasys_total_data - news analysis.csv
asterasys_total_data - news_rank.csv
asterasys_total_data - news_release.csv
asterasys_total_data - ott.csv
asterasys_total_data - sale.csv
asterasys_total_data - traffic.csv
asterasys_total_data - youtube_comments.csv
asterasys_total_data - youtube_contents.csv
```

- 임시/백업 파일(`*.backup`, `~$*.csv`)은 `data/raw/archive/2025-09/` 로 이동해주세요.
- YouTube 스크래퍼 JSON은 `data/raw/2025-09/dataset_youtube-scraper_YYYY-MM-DD_HH-mm-ss.json` 형태로 추가하면 됩니다.

## 2. 처리 순서
1. CSV 업로드 완료 후 다음 명령으로 파이프라인을 실행합니다.
   ```bash
   npm run process-data -- --month=2025-09
   npm run youtube:process -- --month=2025-09
   ```
2. 처리 완료 시 `data/processed/2025-09/` 와 `data/raw/generated/2025-09/` 에 결과물이 생성됩니다.
3. 처리 과정에서 최신 월이 자동으로 `config/latest-month.json` 에 `"2025-09"` 으로 갱신됩니다.

## 3. 검증 체크리스트
- `/api/data/files/cafe_rank?month=2025-09` 호출이 200을 반환하는지 확인합니다.
- 대시보드 헤더에서 2025년 9월을 선택했을 때 모든 위젯이 9월 데이터로 갱신되는지 점검합니다.
- 필요 시 8월 데이터를 재처리하려면 `npm run process-data -- --month=2025-08 --set-latest=false` 를 사용합니다.

## 4. 참고
- 생성된 2차 CSV(`youtube_products.csv`, `youtube_market_share.csv`)는 `data/raw/generated/2025-09/` 에 보존되며, 자동으로 `/api/data/youtube-*` 엔드포인트에서 참조됩니다.
- 업로드 후 이 README는 그대로 두고 실제 데이터만 교체하면 됩니다.



  - 사용자는 data/raw에 8월 CSV를 업로드하고, npm run process-data가 이를 파싱해 data/processed/*.json과 data/raw/generated/*.csv를 생성합니다.
      - src/lib/data-processing/csvParser.js가 블로그·카페·뉴스·유튜브 등 핵심 채널 데이터를 읽어 JS 객체로 만들고,
      - MetricsCalculator가 KPI/채널 통계를 계산해 kpis.json, channels.json, dashboard.json 등을 작성합니다.
  - 다수의 API(/api/data/files/[filename], /api/data/cafe-posts, /api/data/youtube-ads 등)는 매 요청마다 data/raw의 CSV를 직접 읽어 브라우저로 전달합니다. 이들 컴포넌트(카페 리포트, 유튜브 광고 표, KPI 카드 등)는 API 응답을 그대로 시각화에 사용합니다.
  - Prisma/SQLite는 사실상 인증 스키마만 존재하며(사용자, 세션, 조직 등의 테이블), 실시간 지표는 DB에 저장하지 않고 파일 시스템에서 즉시 계산합니다.

  발견된 문제점

  - 단일 월 하드코딩: processData와 여러 컴포넌트가 dataMonth: '2025-08' 같이 고정된 값을 사용합니다. 새로운 월 데이터를 추가하면 이전 값이 덮어써지거나 UI가 혼동될 가능성이 높습니다.
  - 파일명 충돌·중복: 생성물(youtube_products.csv, youtube_market_share.csv)이 항상 동일 이름으로 덮어써 집니다. 월별 결과를 병행해 보존하기 어렵습니다.
  - API 성능/안정성: 대부분의 Next.js API가 매 요청마다 CSV 전체를 읽고(동기 I/O), 변환한 뒤 응답합니다. 월별 파일이 늘어나면 응답 지연·메모리 부담이 커지고, 파일이 잠시 없는 시점에 404가 반환될 수 있습니다.
  - UI의 정적 비교 수치: src/utils/fackData/에 하드코딩된 값(예: 8월 판매량)이 여전히 여러 컴포넌트에 남아 있어 CSV 기반 값과 불일치가 발생할 수 있습니다.
  - 데이터 디렉터리 구조: 현재 data/raw 루트에 모든 CSV가 섞여 있고, 백업 파일까지 혼재합니다. 월이 추가되면 파일 수가 급증해 관리가 어려워집니다.

  8월·9월 동시 지원을 위한 단계별 계획(코드 작성 전 구상)

  3. API 확장
      - /api/data/files/[filename] 및 단일 CSV를 읽는 API에 ?month=2025-09 쿼리 파라미터를 추가해 해당 월 폴설계합니다.
  4. UI 월 필터링
      - 전역 상태나 컨텍스트로 “선택 월”을 관리하는 얇은 래퍼를 기획합니다. 각 컴포넌트는 month 값을 받아 API 호출 시 ?month=를 붙여 데이터를 가져오도록 합니다.
      - 대시보드 상단(또는 필터 패널)에 월 선택 드롭다운을 배치해 8월↔9월 데이터를 전환하도록 UX를 기획합니다. 기본 선택은 최신 월.
  5. 데이터 업로드·검증 흐름
      - 9월 CSV 업로드 시 data/raw/2025-09/에 동일한 파일 세트를 투입하고, npm run process-data -- --month=2025-09 실행 → generated/2025-09 산출 → API가 9월 데이터를 제공하는지 검증합니다.
      - 테스트 플랜: npm run process-data -- --month=2025-08으로 기존 월도 재처리해 두 월 모두 가용한지 확인합니다.
  6. 문서 및 운영 체크
      - DATA_SOURCES.md에 월별 폴더 구조와 실행 절차를 업데이트하고, 9월 CSV 명세(필드 추가/변경 여부)에 대한 검증 체크리스트를 준비합니다.
      - 백업 CSV(*.backup)는 별도 아카이브 폴더로 이동하거나 명시적으로 무시하도록 가이드를 마련합니다.