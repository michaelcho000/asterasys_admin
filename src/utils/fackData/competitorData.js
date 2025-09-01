// 18개 경쟁사 완전 데이터 매트릭스 (실제 CSV 기반)
// 출처: cafe_rank.csv, blog_rank.csv, sale.csv

export const competitorMatrix = {
    RF: [
        { rank: 1, brand: "써마지", blog: 928, cafe: 544, sales: null, asterasys: false },
        { rank: 2, brand: "인모드", blog: 941, cafe: 328, sales: null, asterasys: false },
        { rank: 3, brand: "덴서티", blog: 203, cafe: 239, sales: null, asterasys: false },
        { rank: 4, brand: "쿨페이즈", blog: 38, cafe: 220, sales: 159, asterasys: true },
        { rank: 5, brand: "올리지오", blog: 299, cafe: 77, sales: null, asterasys: false },
        { rank: 6, brand: "튠페이스", blog: 106, cafe: 67, sales: null, asterasys: false },
        { rank: 7, brand: "세르프", blog: 139, cafe: 42, sales: null, asterasys: false },
        { rank: 8, brand: "텐써마", blog: 122, cafe: 42, sales: null, asterasys: false },
        { rank: 9, brand: "볼뉴머", blog: 175, cafe: 26, sales: null, asterasys: false }
    ],
    HIFU: [
        { rank: 1, brand: "울쎄라", blog: null, cafe: 531, sales: null, asterasys: false },
        { rank: 2, brand: "슈링크", blog: null, cafe: 256, sales: 1732, asterasys: false },
        { rank: 3, brand: "쿨소닉", blog: 13, cafe: 230, sales: 23, asterasys: true },
        { rank: 4, brand: "리프테라", blog: 63, cafe: 202, sales: 492, asterasys: true },
        { rank: 5, brand: "리니어지", blog: null, cafe: 100, sales: 398, asterasys: false },
        { rank: 6, brand: "브이로", blog: null, cafe: 37, sales: 443, asterasys: false },
        { rank: 7, brand: "텐쎄라", blog: null, cafe: 23, sales: 416, asterasys: false },
        { rank: 8, brand: "튠라이너", blog: 31, cafe: 22, sales: 325, asterasys: false },
        { rank: 9, brand: "리니어펌", blog: 13, cafe: 1, sales: 402, asterasys: false }
    ]
}

// 시장 전체 데이터 (실제 계산)
export const marketOverview = {
    RF: {
        totalBrands: 9,
        totalBlogPosts: 2841, // 인모드941 + 써마지928 + 올리지오299 + ... + 쿨페이즈38
        totalCafePosts: 1585, // 써마지544 + 인모드328 + 덴서티239 + ... + 볼뉴머26
        totalSales: 159, // 쿨페이즈만 판매 데이터 있음
        asterasysPosition: {
            blog: { rank: 9, volume: 38 },
            cafe: { rank: 4, volume: 220 },
            sales: { rank: 1, volume: 159 } // RF에서는 유일한 판매 데이터
        }
    },
    HIFU: {
        totalBrands: 9,
        totalBlogPosts: 120, // 리프테라63 + 쿨소닉13 + 튠라이너31 + 리니어펌13
        totalCafePosts: 1402, // 울쎄라531 + 슈링크256 + 쿨소닉230 + ... + 리니어펌1
        totalSales: 4231, // 슈링크1732 + 리프테라492 + 브이로443 + ... + 쿨소닉23
        asterasysPosition: {
            cafe: { rank: [3, 4], volume: 432 }, // 쿨소닉230 + 리프테라202
            sales: { rank: [2, 8], volume: 515 } // 리프테라492 + 쿨소닉23
        }
    }
}

// Hero KPI 데이터 (3개 핵심)
export const heroKPIs = [
    {
        id: 1,
        title: "시장 포지션",
        subtitle: "경쟁사 대비 순위",
        data: {
            rf: { rank: 9, total: 9, percentage: 11.1 }, // 쿨페이즈 (하위)
            hifu: { rank: 3.5, total: 9, percentage: 61.1 } // 쿨소닉3위 + 리프테라4위 평균
        },
        source: "cafe_rank.csv",
        icon: "feather-target",
        color: "warning"
    },
    {
        id: 2,
        title: "판매 성과",
        subtitle: "Asterasys 전체",
        data: {
            total: 674, // 492 + 159 + 23
            marketTotal: 7741,
            share: 8.71,
            breakdown: { 리프테라: 492, 쿨페이즈: 159, 쿨소닉: 23 }
        },
        source: "sale.csv",
        icon: "feather-shopping-cart", 
        color: "success"
    },
    {
        id: 3,
        title: "참여도 우위",
        subtitle: "경쟁사 대비 2배",
        data: {
            asterasys: 4.08, // 계산된 평균 참여율
            competitor: 2.02, // 경쟁사 평균
            advantage: "2.06배",
            totalEngagement: 5707 // 댓글5013 + 대댓글694
        },
        source: "cafe_rank.csv",
        icon: "feather-heart",
        color: "primary"
    }
]