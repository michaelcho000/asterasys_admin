# YouTube JSON 포맷 분석 결과

## 비교 요약

### 기존 8월/9월 JSON (26개 필드)
```json
{
  "title": "...",
  "type": "shorts",
  "id": "...",
  "url": "...",
  "thumbnailUrl": "...",
  "viewCount": 243,
  "date": "2025-08-28T08:17:01.000Z",
  "likes": 6,
  "location": null,
  "channelName": "...",
  "channelUrl": "...",
  "channelId": "...",
  "channelUsername": "...",
  "numberOfSubscribers": 67,
  "duration": "00:00:25",
  "commentsCount": 0,
  "text": "",
  "subtitles": null,
  "order": 0,
  "commentsTurnedOff": false,
  "fromYTUrl": "...",
  "isMonetized": null,
  "hashtags": [],
  "formats": [],
  "isMembersOnly": false,
  "input": "세르프"
}
```

### 사용자 제공 새 JSON (10개 필드)
```json
{
  "title": "...",
  "id": "...",
  "url": "...",
  "viewCount": 227,
  "date": "2025-11-01T12:00:52.000Z",
  "likes": 0,
  "channelName": "...",
  "channelUrl": "...",
  "numberOfSubscribers": 1,
  "duration": "00:00:36"
}
```

---

## 필드별 사용 현황 분석

### ✅ 필수 필드 (반드시 필요)

| 필드 | 사용자 제공 | 사용 위치 | 용도 |
|------|-----------|----------|------|
| **input** | ❌ **누락** | processYoutubeData.cjs, extractAsterasysChannels.js | **제품 키워드 구분 (매우 중요!)** |
| **commentsCount** | ❌ **누락** | processYoutubeData.cjs, extractAsterasysChannels.js | 댓글 수 집계 |
| **viewCount** | ✅ 있음 | 모든 스크립트 | 조회수 집계 |
| **likes** | ✅ 있음 | 모든 스크립트 | 좋아요 수 집계 |
| **channelName** | ✅ 있음 | 모든 스크립트 | 채널 이름 |
| **channelUrl** | ✅ 있음 | extractAsterasysChannels.js | 채널 URL |
| **numberOfSubscribers** | ✅ 있음 | processYoutubeData.cjs | 구독자 수 |
| **date** | ✅ 있음 | processYoutubeData.cjs | 날짜 분석 (주차/요일/시간) |
| **url** | ✅ 있음 | extractAsterasysChannels.js | 영상 URL |
| **title** | ✅ 있음 | extractAsterasysChannels.js | 영상 제목 |

### 🔶 중요 필드 (강력 권장)

| 필드 | 사용자 제공 | 사용 위치 | 용도 | 대체 가능 여부 |
|------|-----------|----------|------|--------------|
| **type** | ❌ 누락 | processYoutubeData.cjs, extractAsterasysChannels.js | Shorts/Video 구분 | url에서 `/shorts/` 확인으로 부분 대체 가능 |
| **channelId** | ❌ 누락 | processYoutubeData.cjs, extractAsterasysChannels.js | 채널 고유 식별 | channelName으로 대체 가능하지만 정확도 낮음 |
| **channelUsername** | ❌ 누락 | processYoutubeData.cjs | 채널 유형 분류 (병원/브랜드/크리에이터) | 생략 가능하지만 정확도 낮아짐 |

### ⚪ 선택 필드 (현재 사용 안 함)

사용하지 않는 필드들 (제거해도 무방):
- thumbnailUrl
- location
- text
- subtitles
- order
- commentsTurnedOff
- fromYTUrl
- isMonetized
- hashtags
- formats
- isMembersOnly
- duration (현재는 저장만 하고 분석에 미사용)
- id (저장만 하고 분석에 미사용)

---

## 결론 및 권장사항

### ❌ **현재 사용자 제공 JSON으로는 작동 불가**

**필수 누락 필드:**
1. **`input`** - 제품 키워드 (가장 중요!)
2. **`commentsCount`** - 댓글 수 집계

**권장 추가 필드:**
3. `type` - Shorts/Video 구분 (또는 url만으로 판단)
4. `channelId` - 채널 중복 제거
5. `channelUsername` - 채널 유형 분류

### ✅ **최소 필수 JSON 포맷 (13개 필드)**

```json
{
  "input": "리프테라",          // ⚠️ 필수! 제품 키워드
  "title": "...",
  "type": "shorts",             // 권장 (또는 url에서 판단)
  "id": "...",                  // 선택
  "url": "...",
  "viewCount": 227,
  "date": "2025-11-01T12:00:52.000Z",
  "likes": 0,
  "commentsCount": 0,           // ⚠️ 필수! 댓글 수
  "channelId": "...",           // 권장 (채널 구분)
  "channelName": "...",
  "channelUrl": "...",
  "channelUsername": "...",     // 권장 (채널 유형 분류)
  "numberOfSubscribers": 1,
  "duration": "00:00:36"        // 선택
}
```

### 📋 **수정 사항**

사용자가 제공한 JSON에 다음 필드를 **반드시 추가**해야 합니다:

1. **`input`** - 검색 키워드 (예: "리프테라", "쿨페이즈", "울쎄라")
2. **`commentsCount`** - 댓글 수 (숫자)
3. **`type`** - "shorts" 또는 "video" (권장)
4. **`channelId`** - 채널 고유 ID (권장)
5. **`channelUsername`** - 채널 사용자명 (권장)

---

## 처리 흐름

```
YouTube JSON 데이터
    ↓
processYoutubeData.cjs → youtube_market_share.csv (generated/)
    ↓
extractAsterasysChannels.js → asterasys_channels_data.json (processed/youtube/)
    ↓
웹 API (/api/data/youtube-analysis, /api/data/youtube-channels)
    ↓
웹 컴포넌트 (YouTubeInsightsCards, etc.)
```

모든 처리 단계에서 `input`, `commentsCount` 필드를 참조하므로, 이 필드들이 없으면 전체 파이프라인이 작동하지 않습니다.
