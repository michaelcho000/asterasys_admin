# LLM 인사이트 분석 시스템

Claude API를 활용하여 마케팅 데이터를 자동 분석하고, 검수 후 웹 페이지에 반영하는 시스템입니다.

## 📋 사용 방법

### 1단계: 분석 실행

터미널에서 다음 명령어를 실행하세요:

```bash
npm run analyze-insights
```

이 명령어는:
- `data/raw/` 폴더의 모든 CSV 데이터를 로드
- Claude API (claude-sonnet-4-5-20250929)를 사용하여 분석
- 결과를 `data/processed/llm-insights.json`에 저장

**예상 소요 시간**: 1-2분

### 2단계: 검수 페이지 확인

브라우저에서 검수 페이지를 엽니다:

```
http://localhost:3000/insights-preview
```

이 페이지에서:
- ✅ 분석 결과를 섹션별로 확인
- ✏️ 필요시 텍스트 수정
- 🔄 특정 섹션 재분석
- 💾 임시 저장

### 3단계: 승인 및 배포

검수가 완료되면:
1. "승인하고 배포" 버튼 클릭
2. 상태가 `draft` → `approved`로 변경
3. 실제 마케팅 인사이트 페이지에 반영

## 🔧 설정

### API 키 설정

`.env.local` 파일에 Claude API 키가 설정되어 있습니다:

```env
CLAUDE_API_KEY=sk-ant-api03-...
```

### 모델 설정

`scripts/analyzeLLMInsights.js` 파일에서 다음 설정을 사용합니다:

```javascript
{
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 20000,
  temperature: 1
}
```

## 📂 파일 구조

```
asterasys_admin/
├── scripts/
│   └── analyzeLLMInsights.js      # 분석 스크립트
├── src/
│   ├── app/
│   │   ├── insights-preview/       # 검수 페이지
│   │   │   └── page.js
│   │   └── api/
│   │       └── llm-insights/       # API 엔드포인트
│   │           ├── route.js        # GET/PUT
│   │           └── reanalyze/
│   │               └── route.js    # POST
├── data/
│   ├── raw/                        # 원본 CSV 데이터
│   └── processed/
│       └── llm-insights.json       # 분석 결과 (gitignore)
├── .env.local                      # API 키 (gitignore)
└── package.json                    # npm scripts
```

## 🎯 분석 결과 구조

```json
{
  "generatedAt": "2025-10-01T14:30:00Z",
  "status": "draft",
  "model": "claude-sonnet-4-5-20250929",
  "sections": [
    {
      "id": "viral-strategy",
      "title": "바이럴 전략 분석",
      "targetCard": "ViralTypeAnalysis",
      "position": "insights",
      "insights": [
        {
          "type": "critical",
          "title": "핵심 문제점",
          "content": "...",
          "badge": "danger"
        }
      ]
    }
  ],
  "summary": {
    "keyFindings": ["..."],
    "recommendations": ["..."]
  }
}
```

## 🔄 워크플로우

```
1. 데이터 분석
   npm run analyze-insights
   ↓
2. 검수 페이지
   http://localhost:3000/insights-preview
   ↓
3. 수정/재분석 (필요시)
   - 텍스트 편집
   - 섹션별 재분석
   ↓
4. 승인
   "승인하고 배포" 버튼 클릭
   ↓
5. 실제 페이지 반영
   status: draft → approved
```

## 📌 주의사항

1. **API 키 보안**
   - `.env.local` 파일은 gitignore에 포함됨
   - 절대 커밋하지 마세요

2. **분석 결과 검수**
   - 승인 전 반드시 검수 페이지에서 확인
   - 수치와 인사이트의 정확성 검증

3. **재분석**
   - 데이터 업데이트 시 재분석 필요
   - 비용 고려하여 필요시에만 실행

## 🚀 실제 페이지 반영

승인된 인사이트는 다음 컴포넌트에 자동 반영됩니다:

- `MarketingInsightsKPICards` - 요약 인사이트
- `ViralTypeAnalysis` - 바이럴 전략 분석
- `ChannelCompetitivePosition` - 채널별 전략

## 💰 비용 관리

Claude API 사용 시 토큰 비용이 발생합니다:
- Sonnet 4.5: $3 / 1M input tokens, $15 / 1M output tokens
- 1회 분석: 약 $0.10-0.30 예상
- 필요시에만 재분석 권장

## 🐛 문제 해결

### 분석 실패 시

```bash
# 로그 확인
npm run analyze-insights

# API 키 확인
cat .env.local
```

### 검수 페이지 오류 시

```bash
# 서버 재시작
npm run dev

# 브라우저 캐시 삭제
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

## 📞 지원

문제 발생 시:
1. 콘솔 로그 확인
2. 네트워크 탭에서 API 응답 확인
3. `llm-insights-raw.txt` 파일 확인 (JSON 파싱 실패 시)
