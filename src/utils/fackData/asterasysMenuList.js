// Asterasys Marketing Intelligence Dashboard - Navigation Menu
// PRD 요구사항 기반 메뉴 구조 (ASTERASYS_SCREEN_MENU_DESIGN.md 준수)
// Duralux 템플릿 구조 유지 + Asterasys 전용 메뉴

export const asterasysMenuList = [
    {
        id: 0,
        name: "대시보드 개요",
        path: "/",
        icon: 'feather-home',
        dropdownMenu: []
    },
    {
        id: 1,
        name: "시장 분석",
        path: "#",
        icon: 'feather-trending-up',
        dropdownMenu: [
            {
                id: 1,
                name: "경쟁사 순위",
                path: "/market-analysis/rankings",
                subdropdownMenu: false
            },
            {
                id: 2,
                name: "시장 점유율",
                path: "/market-analysis/market-share",
                subdropdownMenu: false
            },
            {
                id: 3,
                name: "기술별 비교",
                path: "/market-analysis/technology",
                subdropdownMenu: false
            }
        ]
    },
    {
        id: 2,
        name: "채널 성과",
        path: '#',
        icon: 'feather-bar-chart',
        dropdownMenu: [
            {
                id: 1,
                name: "블로그 분석",
                path: "/channel/blog",
                subdropdownMenu: false
            },
            {
                id: 2,
                name: "카페 분석",
                path: "/channel/cafe",
                subdropdownMenu: false
            },
            {
                id: 3,
                name: "뉴스 분석",
                path: "/channel/news",
                subdropdownMenu: false
            },
            {
                id: 4,
                name: "유튜브 분석",
                path: "/channel/youtube",
                subdropdownMenu: false
            },
            {
                id: 5,
                name: "판매 성과",
                path: "/channel/sales",
                subdropdownMenu: false
            }
        ]
    },
    {
        id: 3,
        name: "Asterasys 제품 분석",
        path: "#",
        icon: 'feather-package',
        dropdownMenu: [
            {
                id: 1,
                name: "포트폴리오 개요",
                path: "/product/portfolio",
                subdropdownMenu: false
            },
            {
                id: 2,
                name: "제품별 성과",
                path: "/product/performance", 
                subdropdownMenu: false
            },
            {
                id: 3,
                name: "경쟁 포지션",
                path: "/product/position",
                subdropdownMenu: false
            }
        ]
    },
    {
        id: 4,
        name: "운영 리포트",
        path: "#",
        icon: 'feather-file-text',
        dropdownMenu: [
            {
                id: 1,
                name: "콘텐츠 운영",
                path: "/reports/content",
                subdropdownMenu: false
            },
            {
                id: 2,
                name: "SEO 성과",
                path: "/reports/seo",
                subdropdownMenu: false
            },
            {
                id: 3,
                name: "광고 성과",
                path: "/reports/advertising",
                subdropdownMenu: false
            },
            {
                id: 4,
                name: "평판 관리",
                path: "/reports/reputation",
                subdropdownMenu: false
            }
        ]
    },
    {
        id: 5,
        name: "데이터 내보내기",
        path: "#",
        icon: 'feather-download',
        dropdownMenu: [
            {
                id: 1,
                name: "경영진 리포트",
                path: "/export/executive",
                subdropdownMenu: false
            },
            {
                id: 2,
                name: "상세 분석 리포트",
                path: "/export/detailed",
                subdropdownMenu: false
            },
            {
                id: 3,
                name: "원본 데이터 (CSV)",
                path: "/export/raw-data",
                subdropdownMenu: false
            }
        ]
    }
]