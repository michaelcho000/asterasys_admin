# 월별 데이터 처리 가이드

Asterasys Admin 대시보드의 월별 데이터 처리 방법을 설명합니다.

## 📋 개요

매월 새로운 데이터를 처리하기 위해서는 다음 3가지 작업이 필요합니다:
1. **기본 CSV 처리** (21개 파일)
2. **YouTube 채널 데이터 생성**
3. **YouTube-판매 상관관계 데이터 생성**

## 🚀 빠른 시작 (권장)

### 한 번에 모든 데이터 처리

```bash
# 10월 데이터 처리
npm run process-month -- --month=2025-10

# 11월 데이터 처리 (latest-month.json도 업데이트)
npm run process-month -- --month=2025-11 --set-latest=true
```

**이 명령어 하나로 모든 작업이 자동 실행됩니다!**

## 📁 사전 준비

데이터 처리 전에 다음 폴더에 CSV 파일을 업로드해야 합니다:

```
data/raw/2025-10/
├── asterasys_total_data - blog.csv
├── asterasys_total_data - cafe.csv
├── asterasys_total_data - news.csv
├── asterasys_total_data - sale.csv
├── asterasys_total_data - youtube_comments.csv
├── asterasys_total_data - youtube_contents.csv
├── asterasys_total_data - youtube_rank.csv
├── asterasys_total_data - youtube_sponsor ad.csv
├── dataset_youtube-scraper_2025-10.json
└── ... (21개 CSV 파일)
```

## 🔧 개별 작업 실행 (고급)

필요한 경우 각 단계를 개별적으로 실행할 수 있습니다:

### 1. 기본 CSV 처리만
```bash
npm run process-data -- --month=2025-10
```

### 2. YouTube 채널 데이터만
```bash
npm run youtube:channels -- --month=2025-10
```

### 3. YouTube-판매 상관관계만
```bash
npm run youtube:sales-matching -- --month=2025-10
```

## 📊 생성되는 파일

### 기본 데이터 파일
```
data/processed/2025-10/
├── dashboard.json      # 대시보드 메인 데이터
├── kpis.json          # KPI 지표
├── channels.json      # 채널별 데이터
└── raw.json          # 원본 데이터
```

### YouTube 데이터 파일
```
data/processed/youtube/2025-10/
├── asterasys_channels_data.json          # Asterasys YouTube 성과 카드
└── youtube_sales_exact_matching.json     # YouTube-판매 상관관계 카드
```

### 생성된 통계 파일
```
data/raw/generated/2025-10/
├── youtube_market_share.csv
└── youtube_products.csv
```

## ✅ 처리 완료 확인

모든 데이터 처리가 완료되면:

1. **latest-month.json 업데이트** (--set-latest=true 사용 시)
   ```json
   {
     "month": "2025-10"
   }
   ```

2. **대시보드 시작**
   ```bash
   npm run dev
   ```

3. **YouTube 카드 확인**
   - http://localhost:3000/channel/youtube?month=2025-10
   - "Asterasys YouTube 성과" 카드
   - "YouTube 성과 및 판매량 상관관계" 카드

## 🎯 월별 처리 체크리스트

- [ ] CSV 파일 업로드 (`data/raw/2025-XX/`)
- [ ] YouTube JSON 파일 업로드 (`dataset_youtube-scraper_2025-XX.json`)
- [ ] 통합 스크립트 실행 (`npm run process-month -- --month=2025-XX`)
- [ ] 처리 성공 확인 (모든 단계 ✅)
- [ ] latest-month.json 업데이트 확인
- [ ] 대시보드에서 데이터 표시 확인

## ⚠️ 문제 해결

### 스크립트 실행 실패
```bash
# 개별 스크립트로 문제 파악
npm run process-data -- --month=2025-10        # 1단계만
npm run youtube:channels -- --month=2025-10    # 2단계만
npm run youtube:sales-matching -- --month=2025-10  # 3단계만
```

### 필수 파일 누락
- `asterasys_total_data - sale.csv` 필수
- `dataset_youtube-scraper_2025-XX.json` 필수
- `data/raw/generated/2025-XX/youtube_products.csv` 필수

### 권한 문제
```bash
# Windows
icacls scripts/processMonthData.js /grant Everyone:F

# Mac/Linux
chmod +x scripts/processMonthData.js
```

## 📝 참고사항

- **자동화 없음**: 현재는 수동으로 스크립트를 실행해야 합니다
- **순차 실행**: 각 단계는 순서대로 실행됩니다 (병렬 처리 없음)
- **오류 시 중단**: 한 단계라도 실패하면 전체 프로세스가 중단됩니다
- **월 형식**: 반드시 `YYYY-MM` 형식을 사용해야 합니다 (예: 2025-10)

## 🔄 정기 업데이트 워크플로우

매월 1일:
1. 전월 데이터 CSV 다운로드
2. `data/raw/YYYY-MM/` 폴더에 업로드
3. `npm run process-month -- --month=YYYY-MM --set-latest=true` 실행
4. 대시보드 확인

## 📧 지원

문제가 발생하면 다음 정보를 포함하여 문의하세요:
- 실행한 명령어
- 오류 메시지 전문
- 처리 중인 월 (YYYY-MM)
- 업로드한 CSV 파일 목록
