// Asterasys 블로그 마케팅 종합 데이터 (4개 CSV 통합)
// blog_post.csv + blog_rank.csv + blog_user_rank.csv + bloger_Post.csv

export const asterasysBlogAnalysis = {
    // 병원별 블로그 운영 성과 (blog_post.csv 기반)
    hospitalBlogPerformance: [
        { hospital: "사르티네의원", 리프테라: 1, 쿨페이즈: 1, 쿨소닉: 2, total: 4 },
        { hospital: "비본영의원", 리프테라: 0, 쿨페이즈: 2, 쿨소닉: 2, total: 4 },
        { hospital: "리마인드피부과", 리프테라: 2, 쿨페이즈: 2, 쿨소닉: 0, total: 4 },
        { hospital: "유어힐의원", 리프테라: 2, 쿨페이즈: 2, 쿨소닉: 0, total: 4 },
        { hospital: "온리영의원", 리프테라: 3, 쿨페이즈: 2, 쿨소닉: 0, total: 5 },
        { hospital: "리부팅의원", 리프테라: 3, 쿨페이즈: 2, 쿨소닉: 0, total: 5 },
        { hospital: "온리빛의원", 리프테라: 0, 쿨페이즈: 3, 쿨소닉: 1, total: 4 },
        { hospital: "기타", 리프테라: 2, 쿨페이즈: 0, 쿨소닉: 0, total: 2 }
    ],

    // 시장 순위 성과 (blog_rank.csv 기반)
    marketRankingPerformance: {
        쿨페이즈: { 
            totalPosts: 38, 
            rank: 9, 
            hospitalPosts: 18, 
            generalPosts: 20, 
            comments: 2, 
            category: "RF" 
        },
        리프테라: { 
            totalPosts: 63, 
            rank: 6, 
            hospitalPosts: 34, 
            generalPosts: 29, 
            comments: 105, 
            category: "HIFU" 
        },
        쿨소닉: { 
            totalPosts: 13, 
            rank: 8, 
            hospitalPosts: 8, 
            generalPosts: 5, 
            comments: 11, 
            category: "HIFU" 
        }
    },

    // 병원 블로그 개별 순위 (blog_user_rank.csv 기반 - 주요 병원만)
    topPerformingHospitals: {
        쿨페이즈: [
            { hospital: "유어힐의원", posts: 4, rank: 1 },
            { hospital: "더블에이의원", posts: 2, rank: 2 },
            { hospital: "피부미용 연세봄봄의원", posts: 2, rank: 3 }
        ],
        리프테라: [
            { hospital: "닥터에버스의원", posts: 9, rank: 1 },
            { hospital: "닥터에버스", posts: 8, rank: 2 },
            { hospital: "유어힐의원", posts: 2, rank: 3 }
        ],
        쿨소닉: [
            { hospital: "튠클리닉", posts: 2, rank: 1 },
            { hospital: "도곡동 리드성형외과", posts: 1, rank: 2 },
            { hospital: "리네이처의원", posts: 1, rank: 3 }
        ]
    },

    // 체험단 캠페인 (bloger_Post.csv 기반)
    influencerCampaign: {
        period: "8/12-8/15 (4일간)",
        totalPosts: 12,
        distribution: {
            리프테라: { posts: 4, hospitals: ["스위츠", "비본영", "리마인드", "유어힐"] },
            쿨페이즈: { posts: 4, hospitals: ["스위츠", "비본영", "리마인드", "유어힐"] },
            쿨소닉: { posts: 4, hospitals: ["스위츠", "비본영", "리마인드", "유어힐"] }
        }
    }
}

// PaymentRecordChart용 병원별 블로그 성과 데이터
export const hospitalBlogChartData = {
    series: [
        {
            name: "⭐ 리프테라 운영 포스팅",
            type: "bar",
            data: [1, 0, 2, 2, 3, 3, 0, 2, 0, 0, 0, 0] // 8개 병원별 data
        },
        {
            name: "⭐ 쿨페이즈 운영 포스팅", 
            type: "bar",
            data: [1, 2, 2, 2, 2, 2, 3, 0, 0, 0, 0, 0]
        },
        {
            name: "⭐ 쿨소닉 운영 포스팅",
            type: "line",
            data: [2, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
        }
    ],
    categories: [
        "사르티네의원", "비본영의원", "리마인드피부과", "유어힐의원", 
        "온리영의원", "리부팅의원", "온리빛의원", "기타협력병원",
        "체험단캠페인", "외부블로거", "인플루언서", "미디어"
    ],
    kpiCards: [
        { title: "운영 블로그", value: "24건", progress: "100%", color: "primary" },
        { title: "협력 병원", value: "8개", progress: "100%", color: "success" },
        { title: "체험단", value: "12건", progress: "100%", color: "warning" },
        { title: "시장 순위", value: "6-9위", progress: "67%", color: "info" }
    ]
}

// LeadsOverviewChart용 블로그 채널 구성비 데이터  
export const blogChannelMixData = {
    series: [60, 25, 15], // 병원자체 60%, 자사운영 25%, 체험단 15%
    labels: ["병원 자체 블로그", "Asterasys 운영", "체험단 캠페인"],
    colors: ["#3454d1", "#f59e0b", "#10b981"],
    
    // 9개 그리드 상세 데이터
    detailMetrics: [
        { title: "병원수", value: "173개", subtitle: "전체 등록" },
        { title: "운영수", value: "24건", subtitle: "직접 관리" }, 
        { title: "체험단", value: "12건", subtitle: "4일 캠페인" },
        { title: "RF순위", value: "9위", subtitle: "쿨페이즈" },
        { title: "HIFU순위", value: "6-8위", subtitle: "리프테라/쿨소닉" },
        { title: "댓글", value: "118개", subtitle: "총 반응" },
        { title: "병원블로그", value: "60건", subtitle: "전문성 중심" },
        { title: "일반블로그", value: "54건", subtitle: "대중성 중심" },
        { title: "성과지수", value: "7.2", subtitle: "종합 평가" }
    ]
}