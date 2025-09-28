# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev                    # Start development server at localhost:3000
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run lint:fix              # Fix ESLint issues
npm run type-check            # TypeScript type checking (non-strict mode)
```

### Data Processing
```bash
npm run process-data          # Process 21 CSV files to JSON (data/raw/ → data/processed/)
npm run youtube:process       # Process YouTube data
node scripts/processYouTubeDataNode.js       # YouTube JSON to CSV conversion
node scripts/analyzeYoutubeSalesCorrelation.js # YouTube-sales correlation analysis
```

### Database (Prisma with PostgreSQL)
```bash
npm run db:generate          # Generate Prisma client after schema changes
npm run db:push             # Push schema to database (dev)
npm run db:migrate          # Create and run migrations
npm run db:studio           # Open Prisma Studio GUI (localhost:5555)
```

### Testing
```bash
npm run test                # Run Jest tests (70% coverage requirement)
npm run test:watch         # Run tests in watch mode
npx jest [file]            # Run specific test file
```

## Architecture

### Tech Stack
- **Next.js 14.2.32** with App Router
- **React 18** with TypeScript (non-strict mode)
- **Bootstrap 5.3.3** + SCSS for styling
- **ApexCharts** for data visualization
- **PostgreSQL** + Prisma ORM
- **NextAuth.js** for authentication
- **Stripe** for payments
- **Sentry** for error tracking

### Project Structure
```
src/
├── app/                      # Next.js App Router
│   ├── api/data/            # 21 specialized data endpoints
│   └── (general)/           # Authenticated route group
│       ├── channel/         # Marketing channel dashboards (youtube/blog/cafe/news)
│       ├── market-analysis/ # Market analysis sections
│       └── product/         # Product analysis
├── components/
│   ├── asterasys/           # 39 custom business components
│   ├── widgetsCharts/       # Chart components (ApexCharts)
│   └── widgetsStatistics/   # KPI and statistics widgets
├── hooks/useAsterasysData.js # Custom data fetching hook
└── lib/data-processing/processor.js # DataProcessor class for CSV→JSON
```

### Data Pipeline
1. **Source**: 21 CSV files in `data/raw/asterasys_total_data - *.csv`
2. **Processing**: `DataProcessor` class converts CSV to structured JSON
3. **Output**: 4 JSON files (dashboard.json, kpis.json, channels.json, raw.json)
4. **API Access**: Dynamic filename-based endpoints at `/api/data/files/[filename]`
5. **Frontend**: `useAsterasysData` hook for React components

### Key Business Context

**Medical Device Market (Korea)**:
- **RF (고주파)**: 9 products, Asterasys 쿨페이즈 ranked #3
- **HIFU (초음파)**: 9 products, Asterasys 리프테라 #3, 쿨소닉 #4

**Asterasys Performance (August 2025)**:
- Market Share: 12.7% of publications, 8.7% of sales
- 3 products: 쿨페이즈 (159 sales), 리프테라 (492 sales), 쿨소닉 (23 sales)
- Engagement advantage: 4.08 vs 3.62 industry average

**Marketing Channels**:
- Cafe: 45.3% | YouTube: 26.4% | News: 20.1% | Blog: 7.9%

### Critical Implementation Rules

1. **Data Integrity**: Use only real CSV data from 21 source files
2. **Ranking Logic**: Based on 발행량 + 댓글수 (NOT sales data)
3. **Brand Highlighting**: Asterasys products must be highlighted in visualizations
4. **Color Scheme**: Blue brand colors (#3b82f6, #1e40af)
5. **Template Base**: Maximize Duralux premium template components

### Key Files
- `src/app/page.js` - Main dashboard with data mapping
- `src/app/(general)/channel/youtube/page.js` - YouTube dashboard
- `scripts/processData.js` - CSV processing pipeline
- `src/utils/fackData/asterasysKPIData.js` - Core business data
- `prisma/schema.prisma` - Database schema

### Development Patterns
- **Imports**: Use path aliases (@/*, @components/*, @utils/*, @hooks/*)
- **Charts**: Always use ApexCharts for consistency
- **Data Fetching**: useAsterasysData hook for CSV data
- **Components**: CardHeader + CardLoader pattern for widgets
- **TypeScript**: Non-strict mode (`strict: false`, `noImplicitAny: false`)

### Testing & Quality
- Jest with 70% coverage requirement
- Husky pre-commit hooks with lint-staged
- ESLint + Prettier for code formatting
- Bundle analysis with `npm run analyze`

### YouTube Analysis System
- 1,159 videos analyzed across 18 medical device brands
- Asterasys: 11 videos (0.95% market share)
- Automated processing pipeline with correlation analysis
- 4 specialized YouTube API endpoints

### Claude Code Agents
Available specialized agents in `.claude/agents/`:
- `@frontend-developer` - React, responsive design
- `@data-analyst` - Quantitative analysis, visualization
- `@code-reviewer` - Code quality, security
- `@debugger` - Error diagnosis, performance