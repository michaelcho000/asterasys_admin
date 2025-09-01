// 채널별 마케팅 성과 분포 데이터 (실제 CSV 기반)
// blog_rank.csv + cafe_rank.csv + youtube_rank.csv + news_rank.csv
//
// ===== DATA UPDATE INSTRUCTIONS =====
// 이 파일은 CSV 데이터 교체 시 수동 업데이트가 필요합니다
//
// 1. CSV 파일에서 Asterasys 제품별 발행량 집계:
//    - cafe_rank.csv → 카페 발행량 합계
//    - youtube_rank.csv → 유튜브 발행량 합계  
//    - news_rank.csv → 뉴스 발행량 합계
//    - blog_rank.csv → 블로그 발행량 합계
//
// 2. count 값 업데이트:
//    - 각 채널별 Asterasys 제품 (쿨페이즈, 리프테라, 쿨소닉) 발행량 합계
//
// 3. percentage 계산:
//    - (해당 채널 count / totalChannelCount) × 100
//    - totalChannelCount는 자동으로 계산됨
//
// ===== END INSTRUCTIONS =====
//
export const asterasysChannelData = [
    {
        id: 1,
        channel: "카페",
        count: 652,
        percentage: 45.3,
        subtitle: "네이버 카페",
        color: "#3b82f6"
    },
    {
        id: 2, 
        channel: "유튜브",
        count: 380,
        percentage: 26.4,
        subtitle: "동영상 콘텐츠",
        color: "#ef4444"
    },
    {
        id: 3,
        channel: "뉴스",
        count: 290,
        percentage: 20.1,
        subtitle: "언론 보도",
        color: "#10b981"
    },
    {
        id: 4,
        channel: "블로그",
        count: 114,
        percentage: 7.9,
        subtitle: "블로그 포스팅",
        color: "#f59e0b"
    }
]

// 총 합계: 1,436건
export const totalChannelCount = asterasysChannelData.reduce((sum, item) => sum + item.count, 0)