# Asterasys CSV 데이터 호출 가이드

**시스템**: 파일명 기반 동적 데이터 호출
**API**: `/api/data/files/[filename]`
**업데이트**: 2025년 8월 30일

---

## 📁 **21개 CSV 파일 호출 방법**

### **핵심 순위 데이터 (5개)**
```bash
"blog_rank 데이터 보여줘"     → blog_rank.csv 호출
"cafe_rank 데이터 보여줘"     → cafe_rank.csv 호출  
"news_rank 데이터 보여줘"     → news_rank.csv 호출
"youtube_rank 데이터 보여줘"  → youtube_rank.csv 호출
"sale 데이터 보여줘"          → sale.csv 호출
```

### **블로그 관련 데이터 (4개)**
```bash
"blog_post 데이터 보여줘"     → blog_post.csv 호출
"blog_user_rank 데이터 보여줘" → blog_user_rank.csv 호출
"bloger_Post 데이터 보여줘"   → bloger_Post.csv 호출
```

### **카페 관련 데이터 (4개)**
```bash
"cafe_post 데이터 보여줘"     → cafe_post.csv 호출
"cafe_comments 데이터 보여줘" → cafe_comments.csv 호출
"cafe_seo 데이터 보여줘"      → cafe_seo.csv 호출
```

### **유튜브 관련 데이터 (4개)**
```bash
"youtube_contents 데이터 보여줘"  → youtube_contents.csv 호출
"youtube_comments 데이터 보여줘" → youtube_comments.csv 호출
"youtube_sponsor ad 데이터 보여줘" → youtube_sponsor ad.csv 호출
```

### **운영 관련 데이터 (5개)**
```bash
"news_release 데이터 보여줘"      → news_release.csv 호출
"facebook_targeting 데이터 보여줘" → facebook_targeting.csv 호출
"ott 데이터 보여줘"               → ott.csv 호출
"bad writing 데이터 보여줘"       → bad writing.csv 호출
"autocomplete 데이터 보여줘"      → autocomplete.csv 호출
```

### **기타 데이터 (2개)**
```bash
"traffic 데이터 보여줘"          → traffic.csv 호출
"kakao_opentalk 데이터 보여줘"   → kakao_opentalk.csv 호출
```

---

## 🎯 **호출 예시**

### **단일 파일 호출**
```
요청: "blog_rank 데이터 분석해줘"
응답: blog_rank.csv 파일의 Asterasys 데이터 + 전체 시장 데이터 표시
```

### **다중 파일 호출**
```
요청: "blog_rank, cafe_rank, sale 데이터로 종합 분석해줘"
응답: 3개 파일의 데이터를 통합하여 종합 KPI 대시보드 표시
```

### **카테고리별 호출**
```
요청: "블로그 관련 모든 데이터 보여줘"
응답: blog_rank + blog_post + blog_user_rank + bloger_Post 통합 분석
```

---

## 📊 **자동 처리 기능**

### **Asterasys 데이터 자동 추출**
- 모든 CSV에서 쿨페이즈, 리프테라, 쿨소닉 데이터만 자동 필터링
- 경쟁사 데이터도 함께 제공하여 비교 분석 가능

### **실시간 데이터 동기화**
- CSV 파일 업데이트 시 즉시 API 반영
- 하드코딩된 데이터 완전 제거
- 토큰 효율적 접근

---

## 🚀 **시스템 구조**

```
사용자 요청: "cafe_rank 데이터 보여줘"
    ↓
API 호출: /api/data/files/cafe_rank
    ↓  
CSV 파싱: asterasys_total_data - cafe_rank.csv
    ↓
데이터 추출: Asterasys 3종 + 전체 시장 데이터
    ↓
대시보드 반영: 실시간 차트 및 KPI 업데이트
```

---

## ⚡ **사용 시 장점**

### **토큰 효율성**
- CSV 파일 직접 읽기 불필요
- API 호출만으로 데이터 접근
- 클로드 코드 작업 시 토큰 절약

### **데이터 정확성**
- 실제 CSV 파일과 100% 동기화
- 수동 입력 오류 완전 제거
- 실시간 업데이트 보장

### **확장성**
- 새로운 CSV 파일 추가 시 자동 인식
- 파일명만으로 즉시 접근 가능
- 유지보수 편의성

---

**🎯 이제 21개 모든 CSV 데이터가 파일명 호출로 즉시 대시보드에 반영됩니다!**

**사용법**: "파일명 + 데이터 보여줘" → 즉시 실제 CSV 데이터 반영