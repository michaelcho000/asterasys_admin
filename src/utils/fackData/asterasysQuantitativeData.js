// Asterasys 정량 데이터 - 순수 CSV 기반 (추론/분석 완전 배제)
// 데이터 출처: 21개 실제 CSV 파일 - 2025년 8월

// Asterasys 전체 판매량 계산 (실제 CSV 기반)
// 리프테라: 492대 + 쿨페이즈: 159대 + 쿨소닉: 23대 = 674대

export const asterasysQuantitativeData = {
    // 핵심 순위 카드 데이터 (5개)
    coreRankingCards: [
        {
            id: 1,
            title: "블로그 순위",
            subtitle: "쿨페이즈 (RF)",
            value: "38",
            unit: "건",
            rank: "9위",
            source: "blog_rank.csv",
            field: "발행량합, 발행량순위",
            icon: "feather-edit-3",
            color: "warning"
        },
        {
            id: 2,
            title: "카페 순위",
            subtitle: "쿨소닉 (HIFU)",
            value: "230",
            unit: "건",
            rank: "3위", 
            source: "cafe_rank.csv",
            field: "총발행량, 발행량순위",
            icon: "feather-message-circle",
            color: "success"
        },
        {
            id: 3,
            title: "Asterasys 판매량",
            subtitle: "3종 제품 합계",
            value: "674",
            unit: "대",
            rank: "",
            source: "sale.csv",
            field: "판매량 합계",
            icon: "feather-shopping-cart",
            color: "primary"
        },
        {
            id: 4,
            title: "뉴스 순위",
            subtitle: "뉴스 발행량",
            value: "220",
            unit: "건",
            rank: "4위",
            source: "news_rank.csv", 
            field: "총발행량, 발행량순위",
            icon: "feather-file-text",
            color: "info"
        },
        {
            id: 5,
            title: "유튜브 순위",
            subtitle: "검색량 기준",
            value: "230",
            unit: "건",
            rank: "3위",
            source: "youtube_rank.csv",
            field: "월감검색량, 검색량순위", 
            icon: "feather-youtube",
            color: "danger"
        }
    ],

    // 참여도 데이터 카드 (4개)
    engagementCards: [
        {
            id: 6,
            title: "블로그 댓글",
            value: "2",
            unit: "개",
            subtitle: "쿨페이즈",
            source: "blog_rank.csv",
            field: "댓글총개수",
            icon: "feather-message-square"
        },
        {
            id: 7,
            title: "카페 댓글",
            value: "5,013",
            unit: "개", 
            subtitle: "3종 합계",
            source: "cafe_rank.csv",
            field: "총댓글수",
            calculation: "1,670 + 1,530 + 1,813",
            icon: "feather-message-circle"
        },
        {
            id: 8,
            title: "카페 조회수",
            value: "35,405",
            unit: "회",
            subtitle: "3종 합계", 
            source: "cafe_rank.csv",
            field: "총조회수",
            calculation: "12,558 + 12,948 + 9,899",
            icon: "feather-eye"
        },
        {
            id: 9,
            title: "대댓글",
            value: "694",
            unit: "개",
            subtitle: "3종 합계",
            source: "cafe_rank.csv", 
            field: "총대댓글수",
            calculation: "232 + 210 + 252",
            icon: "feather-corner-down-right"
        }
    ],

    // 운영 성과 카드 (6개)
    operationalCards: [
        {
            id: 10,
            title: "유튜브 광고",
            value: "₩132",
            subtitle: "평균 CPV",
            additionalData: {
                impressions: "11,176,597",
                views: "1,966,959"
            },
            source: "youtube_sponsor ad.csv",
            field: "평균CPV, 노출수, 조회수",
            icon: "feather-youtube"
        },
        {
            id: 11,
            title: "페이스북 광고",
            value: "17,845",
            unit: "명",
            subtitle: "도달수",
            additionalData: {
                impressions: "29,511",
                clicks: "889"
            },
            source: "facebook_targeting.csv", 
            field: "도달수, 노출, 클릭수",
            icon: "feather-facebook"
        },
        {
            id: 12,
            title: "블로그 발행",
            value: "24",
            unit: "건",
            subtitle: "총 게시물",
            additionalData: {
                hospitals: "8개 병원"
            },
            source: "blog_post.csv",
            field: "총발행수",
            icon: "feather-edit"
        },
        {
            id: 13,
            title: "뉴스 릴리즈",
            value: "12",
            unit: "건", 
            subtitle: "4일간",
            additionalData: {
                period: "8/12-8/15",
                outlets: "3개 언론사"
            },
            source: "news_release.csv",
            field: "릴리즈 건수",
            icon: "feather-file-text"
        },
        {
            id: 14,
            title: "카페 SEO",
            value: "12",
            unit: "건",
            subtitle: "노출 성공",
            additionalData: {
                totalKeywords: "34개",
                successRate: "35%"
            },
            source: "cafe_seo.csv",
            field: "노출현황=2",
            icon: "feather-search"
        },
        {
            id: 15,
            title: "평판 관리", 
            value: "23",
            unit: "건",
            subtitle: "처리 완료",
            additionalData: {
                successRate: "100%",
                action: "게시중단"
            },
            source: "bad writing.csv",
            field: "검토결과",
            icon: "feather-shield"
        }
    ],

    // 자사 3종 제품별 정확한 수치
    asterasysProducts: {
        쿨페이즈: {
            technology: "RF",
            blog: { posts: 38, rank: 9, comments: 2, replies: 0 },
            cafe: { posts: 220, rank: 4, comments: 1670, replies: 232, views: 12558 },
            sales: { volume: 159 },
            source: "blog_rank.csv, cafe_rank.csv, sale.csv"
        },
        리프테라: {
            technology: "HIFU", 
            cafe: { posts: 202, rank: 4, comments: 1530, replies: 210, views: 12948 },
            sales: { volume: 492 },
            source: "cafe_rank.csv, sale.csv"
        },
        쿨소닉: {
            technology: "HIFU",
            cafe: { posts: 230, rank: 3, comments: 1813, replies: 252, views: 9899 },
            sales: { volume: 23 },
            source: "cafe_rank.csv, sale.csv"
        }
    },

    // 전체 판매량 계산 (실제 CSV 기반)
    totalSales: {
        asterasys: 674, // 492 + 159 + 23
        market: 7741, // 전체 시장 (processed data 기준)
        share: 8.71 // 674/7741 * 100
    }
}