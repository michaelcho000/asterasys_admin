# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Asterasys Marketing Intelligence Dashboard - a specialized medical device marketing analytics platform built on the Duralux premium template. The project integrates real CSV data for RF (고주파) and HIFU (초음파) medical device market analysis.

**Tech Stack**: Next.js 14.2.32, React 18, Bootstrap 5.3.3, ApexCharts, SCSS

## Key Commands

### Development
```bash
npm run dev                    # Start development server
npm run build                  # Build for production  
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run lint:fix              # Fix ESLint issues
npm run type-check            # TypeScript type checking
```

### Data Processing
```bash
npm run process-data          # Process CSV files to JSON
npm run ingest               # Alias for process-data
```

### Database (Prisma)
```bash
npm run db:generate          # Generate Prisma client
npm run db:push             # Push schema to database
npm run db:migrate          # Run migrations in development
npm run db:studio           # Open Prisma Studio
```

### Testing & Quality
```bash
npm run test                # Run Jest tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
npm run format             # Format code with Prettier
npm run format:check       # Check code formatting
```

## Architecture Overview

### Core Data System
- **CSV Source**: 21 medical device marketing CSV files in `data/raw/`
- **Processing Pipeline**: `scripts/processData.js` converts CSV to JSON
- **Dynamic API**: `src/app/api/data/files/[filename]/route.js` for runtime data access
- **Data Hooks**: `src/hooks/useAsterasysData.js` for React data fetching

### Component Architecture

**Duralux Template Foundation**:
- `src/components/widgetsStatistics/` - KPI and statistics widgets
- `src/components/widgetsCharts/` - Chart components (ApexCharts)
- `src/components/widgetsList/` - List and progress widgets
- `src/components/widgetsTables/` - Data table components
- `src/components/shared/` - Shared UI components

**Custom Asterasys Components**:
- `src/components/asterasys/` - Asterasys-specific business logic components
- `AsteraysKPIStatistics.jsx` - Main KPI cards with dropdown interactions
- `PaymentRecordChart.jsx` - RF/HIFU market analysis (bar + line chart)
- `LeadsOverviewChart.jsx` - Channel marketing performance (donut chart)
- `AsteraysProductPortfolio.jsx` - Product portfolio analysis cards

### Data Structure

**21개 CSV 데이터 시트 (전체 목록)**:
```
asterasys_total_data - autocomplete.csv
asterasys_total_data - bad writing.csv
asterasys_total_data - bloger_Post.csv
asterasys_total_data - blog_post.csv
asterasys_total_data - blog_rank.csv
asterasys_total_data - blog_user_rank.csv
asterasys_total_data - cafe_comments.csv
asterasys_total_data - cafe_post.csv
asterasys_total_data - cafe_rank.csv
asterasys_total_data - cafe_seo.csv
asterasys_total_data - facebook_targeting.csv
asterasys_total_data - kakao_opentalk.csv
asterasys_total_data - news_rank.csv
asterasys_total_data - news_release.csv
asterasys_total_data - ott.csv
asterasys_total_data - sale.csv
asterasys_total_data - traffic.csv
asterasys_total_data - youtube_comments.csv
asterasys_total_data - youtube_contents.csv
asterasys_total_data - youtube_rank.csv
asterasys_total_data - youtube_sponsor ad.csv
```

**RF (고주파) 9개 제품 전체**:
1. 써마지 (시장 1위)
2. 인모드 (시장 2위)
3. **쿨페이즈** ⭐ (Asterasys, 시장 3위)
4. 덴서티 (시장 4위)
5. 올리지오 (시장 5위)
6. 튠페이스 (시장 6위)
7. 세르프 (시장 7위)
8. 텐써마 (시장 8위)
9. 볼뉴머 (시장 9위)

**HIFU (초음파) 9개 제품 전체**:
1. 울쎄라 (시장 1위)
2. 슈링크 (시장 2위)
3. **쿨소닉** ⭐ (Asterasys, 시장 3위)
4. **리프테라** ⭐ (Asterasys, 시장 4위)
5. 리니어지 (시장 5위)
6. 브이로 (시장 6위)
7. 텐쎄라 (시장 7위)
8. 튠라이너 (시장 8위)
9. 리니어펌 (시장 9위)

**Asterasys 3개 제품 포트폴리오**:
- **쿨페이즈** (RF): 159대 판매, 발행량 38건, 댓글 1,670개, 검색량 220회
- **리프테라** (HIFU): 492대 판매, 발행량 63건, 댓글 1,530개, 검색량 202회  
- **쿨소닉** (HIFU): 23대 판매, 발행량 13건, 댓글 1,813개, 검색량 230회

**마케팅 채널별 성과 데이터**:
- 카페: 652건 (45.3%)
- 유튜브: 380건 (26.4%)
- 뉴스: 290건 (20.1%)
- 블로그: 114건 (7.9%)

**Market Metrics**: 발행량, 댓글수, 검색량 (순위 산정용) + 판매량 (참고용)

### Layout System
```
DuplicateLayout (main wrapper)
├── Header (navigation + search)
├── NavigationMenu (sidebar)
└── main.nxl-container
    └── div.nxl-content
        └── PageHeader + main-content
```

### Data Integration Pattern
1. CSV files contain real medical device marketing data
2. Dynamic filename-based API endpoints for data access  
3. React hooks abstract data fetching logic
4. Components use actual data instead of mock data
5. Rankings calculated from 발행량 + 댓글수 합산 (판매량은 참고용만)

## Critical Business Rules

### Data Integrity
- **No Synthetic Data**: Only use real CSV data from the 21 source files
- **Ranking Logic**: Based on 발행량 + 댓글수 합산, NOT sales data
- **Asterasys Products**: Must be highlighted in all visualizations
- **Market Share**: Calculate Asterasys share vs total market for each category

### UI/UX Standards
- **Duralux Template**: Maximize use of purchased template components
- **Blue Brand Colors**: Primary brand color for Asterasys elements
- **Interactive Elements**: Dropdowns, toggles, hover states for data exploration
- **Responsive Design**: Bootstrap 5.3.3 grid system

### Component Patterns
- All chart components use ApexCharts for consistency
- Custom data hooks (`useAsterasysData`) for data fetching
- CardHeader + CardLoader pattern for all widgets
- Blue color scheme (#3b82f6, #1e40af) for brand consistency

## Development Notes

### Key Files to Understand
- `src/app/page.js` - Main dashboard layout
- `src/utils/fackData/asterasysKPIData.js` - Core business data
- `src/utils/chartsLogic/` - Chart configurations
- `data/raw/asterasys_total_data - *.csv` - Source data files

### Custom Hooks
- `useCardTitleActions()` - Card interaction state management
- `useAsterasysData(filename)` - CSV data fetching
- `useBootstrapUtils()` - Bootstrap integration

### Medical Device Context
This dashboard analyzes the Korean medical device market with focus on:
- **RF (고주파)**: Radio frequency treatments (쿨페이즈)
- **HIFU (초음파)**: High-intensity focused ultrasound (리프테라, 쿨소닉)
- Marketing channels: Blog, Cafe, YouTube, News, Search
- Hospital partnerships and content marketing performance