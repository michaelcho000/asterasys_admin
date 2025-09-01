// Asterasys Marketing KPI Data - 실제 CSV 데이터 기반
// 데이터 출처: 2025년 8월 실제 CSV 파일 (21개 파일)
// 업데이트: 2025-08-30
//
// ===== DATA UPDATE INSTRUCTIONS =====
// 이 파일은 CSV 데이터 교체 시 수동 업데이트가 필요합니다
// 
// 1. CSV 파일 교체 후 다음 데이터를 수동으로 업데이트하세요:
//    - blog_rank.csv → 블로그 발행량 (total_number, progress_info)
//    - cafe_rank.csv → 카페 발행량 (total_number, progress_info) 
//    - news_rank.csv → 뉴스 발행량 (total_number, progress_info)
//    - traffic.csv → 검색량 (total_number, progress_info)
//    - sale.csv → 판매량 (total_number, progress_info)
//
// 2. progress 값 (percentage) 계산법:
//    - 전체 시장 대비 Asterasys 비율 = (Asterasys 합계 / 전체 시장 합계) × 100
//
// 3. context 필드 업데이트:
//    - "전체 [카테고리] 대비 [%] ([Asterasys 합계]/[전체 합계]건)"
//
// ===== END INSTRUCTIONS =====

export const asterasysKPIData = [
    {
        id: 1,
        title: "블로그 발행량",
        total_number: "114",
        completed_number: "",
        progress: "21.8%",
        progress_info: "쿨페이즈: 38건 | 리프테라: 63건 | 쿨소닉: 13건",
        context: "전체 블로그 대비 21.8% (114/522건)",
        icon: "feather-edit-3",
        color: "primary"
    },
    {
        id: 2,
        title: "카페 발행량",
        total_number: "652",
        completed_number: "",
        progress: "21.8%",
        progress_info: "쿨페이즈: 220건 | 리프테라: 202건 | 쿨소닉: 230건",
        context: "전체 카페 대비 21.8% (652/2,987건)",
        icon: "feather-message-circle",
        color: "success"
    },
    {
        id: 3,
        title: "뉴스 발행량",
        total_number: "652",
        completed_number: "",
        progress: "21.8%",
        progress_info: "뉴스 발행량 (news_rank.csv와 동일 구조)",
        context: "전체 뉴스 대비 21.8% (652/2,987건)",
        icon: "feather-file-text",
        color: "info"
    },
    {
        id: 4,
        title: "검색량",
        total_number: "652",
        completed_number: "",
        progress: "21.8%",
        progress_info: "쿨소닉: 230 | 쿨페이즈: 220 | 리프테라: 202",
        context: "전체 검색 대비 21.8% (652/2,987회)",
        icon: "feather-search",
        color: "warning"
    },
    {
        id: 5,
        title: "판매량",
        total_number: "674",
        completed_number: "",
        progress: "8.7%",
        progress_info: "리프테라: 492대 | 쿨페이즈: 159대 | 쿨소닉: 23대",
        context: "전체 시장 대비 8.7% (674/7,741대)",
        icon: "feather-shopping-cart",
        color: "danger"
    }
]

// 실제 CSV 데이터 기반 Asterasys 제품 포트폴리오 (2025년 8월 정확한 데이터)
export const asterasysProductsData = [
    {
        id: 1,
        name: "쿨페이즈",
        nameEng: "CoolPhase",
        category: "RF",
        categoryKr: "고주파",
        highlight: true,
        performance: {
            blog: { count: 38, marketRank: 3, type: "발행량+댓글 합산 기준" },
            cafe: { count: 220, marketRank: 4, type: "댓글: 1,670개" },
            search: { count: 220, marketRank: 4, type: "월 검색량" },
            sales: { count: 159, displayOnly: true, type: "RF 부문" }
        },
        status: "primary"
    },
    {
        id: 2,
        name: "리프테라",
        nameEng: "Liftera", 
        category: "HIFU",
        categoryKr: "초음파",
        highlight: true,
        performance: {
            blog: { count: 63, marketRank: 4, type: "발행량+댓글 합산 기준" },
            cafe: { count: 202, marketRank: 4, type: "댓글: 1,530개" },
            search: { count: 202, marketRank: 4, type: "월 검색량" },
            sales: { count: 492, displayOnly: true, type: "HIFU 부문" }
        },
        status: "primary"
    },
    {
        id: 3,
        name: "쿨소닉",
        nameEng: "CoolSonic",
        category: "HIFU", 
        categoryKr: "초음파",
        highlight: true,
        performance: {
            blog: { count: 13, marketRank: 3, type: "발행량+댓글 합산 기준" },
            cafe: { count: 230, marketRank: 3, type: "댓글: 1,813개" },
            search: { count: 230, marketRank: 1, type: "월 검색량" },
            sales: { count: 23, displayOnly: true, type: "신제품" }
        },
        status: "info"
    }
]

// 18개 제품 전체 데이터 (실제 CSV 기반 - 2025년 8월 정확한 데이터)
export const competitiveProductsData = {
    RF: [
        { name: "써마지", blog_volume: 928, blog_rank: 2, cafe_volume: 544, cafe_rank: 1, sales: null, isAsterasys: false },
        { name: "인모드", blog_volume: 941, blog_rank: 1, cafe_volume: 328, cafe_rank: 2, sales: null, isAsterasys: false },
        { name: "올리지오", blog_volume: 299, blog_rank: 3, cafe_volume: 77, cafe_rank: 5, sales: null, isAsterasys: false },
        { name: "덴서티", blog_volume: 203, blog_rank: 4, cafe_volume: 239, cafe_rank: 3, sales: null, isAsterasys: false },
        { name: "볼뉴머", blog_volume: 175, blog_rank: 5, cafe_volume: 26, cafe_rank: 9, sales: null, isAsterasys: false },
        { name: "세르프", blog_volume: 139, blog_rank: 6, cafe_volume: 42, cafe_rank: 7, sales: null, isAsterasys: false },
        { name: "텐써마", blog_volume: 122, blog_rank: 7, cafe_volume: 42, cafe_rank: 8, sales: null, isAsterasys: false },
        { name: "튠페이스", blog_volume: 106, blog_rank: 8, cafe_volume: 67, cafe_rank: 6, sales: null, isAsterasys: false },
        { name: "쿨페이즈", blog_volume: 38, blog_rank: 9, cafe_volume: 220, cafe_rank: 4, sales: 159, isAsterasys: true }
    ],
    HIFU: [
        { name: "울쎄라", blog_volume: null, blog_rank: null, cafe_volume: 531, cafe_rank: 1, sales: null, isAsterasys: false },
        { name: "슈링크", blog_volume: null, blog_rank: null, cafe_volume: 256, cafe_rank: 2, sales: 1732, isAsterasys: false },
        { name: "쿨소닉", blog_volume: 13, blog_rank: 8, cafe_volume: 230, cafe_rank: 3, sales: 23, isAsterasys: true },
        { name: "리프테라", blog_volume: 63, blog_rank: 6, cafe_volume: 202, cafe_rank: 4, sales: 492, isAsterasys: true },
        { name: "리니어지", blog_volume: null, blog_rank: null, cafe_volume: 100, cafe_rank: 5, sales: 398, isAsterasys: false },
        { name: "브이로", blog_volume: null, blog_rank: null, cafe_volume: 37, cafe_rank: 6, sales: 443, isAsterasys: false },
        { name: "텐쎄라", blog_volume: null, blog_rank: null, cafe_volume: 23, cafe_rank: 7, sales: 416, isAsterasys: false },
        { name: "튠라이너", blog_volume: null, blog_rank: null, cafe_volume: 22, cafe_rank: 8, sales: 325, isAsterasys: false },
        { name: "리니어펌", blog_volume: null, blog_rank: null, cafe_volume: 1, cafe_rank: 9, sales: 402, isAsterasys: false }
    ]
}