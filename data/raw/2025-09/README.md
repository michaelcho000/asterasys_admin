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
