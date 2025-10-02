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
        id: 2,
        name: "채널 성과",
        path: '#',
        icon: 'feather-bar-chart',
        dropdownMenu: [
            {
                id: 1,
                name: "블로그 분석",
                path: "/channel/blog",
                subdropdownMenu: []
            },
            {
                id: 2,
                name: "카페 분석",
                path: "/channel/cafe",
                subdropdownMenu: []
            },
            {
                id: 3,
                name: "뉴스 분석",
                path: "/channel/news",
                subdropdownMenu: []
            },
            {
                id: 4,
                name: "유튜브 분석",
                path: "/channel/youtube",
                subdropdownMenu: []
            },
            
        ]
    },
    {
        id: 3,
        name: "마케팅 인사이트",
        path: "/marketing-insights",
        icon: 'feather-trending-up',
        dropdownMenu: []
    },
    {
        id: 4,
        name: "운영 리포트",
        path: "#",
        icon: 'feather-file-text',
        dropdownMenu: [
            {
                id: 1,
                name: "병원 블로그 포스팅",
                path: "/reports/hospital-blog",
                subdropdownMenu: []
            },
            {
                id: 2,
                name: "체험단 포스팅",
                path: "/reports/experience-posts",
                subdropdownMenu: []
            },
            {
                id: 3,
                name: "카페 상위노출",
                path: "/reports/cafe-seo",
                subdropdownMenu: []
            },
            {
                id: 4,
                name: "카페 게시글",
                path: "/reports/cafe-posts",
                subdropdownMenu: []
            },
            {
                id: 5,
                name: "카페 댓글",
                path: "/reports/cafe-comments",
                subdropdownMenu: []
            },
            {
                id: 6,
                name: "유튜브 댓글작업",
                path: "/reports/youtube-comments",
                subdropdownMenu: []
            },
            {
                id: 7,
                name: "유튜브 광고",
                path: "/reports/youtube-ads",
                subdropdownMenu: []
            },
            {
                id: 8,
                name: "타게팅 광고",
                path: "/reports/targeting-ads",
                subdropdownMenu: []
            },
            {
                id: 9,
                name: "옥외 광고",
                path: "/reports/outdoor-ads",
                subdropdownMenu: []
            }
            // HIDDEN: 자동완성 작업 메뉴 - 필요시 주석 해제하여 복원
            // {
            //     id: 10,
            //     name: "자동완성 작업",
            //     path: "/reports/auto-complete",
            //     subdropdownMenu: []
            // }
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
                path: "#disabled",
                subdropdownMenu: []
            },
            {
                id: 2,
                name: "상세 분석 리포트",
                path: "#disabled",
                subdropdownMenu: []
            },
            {
                id: 3,
                name: "원본 데이터 (CSV)",
                path: "#disabled",
                subdropdownMenu: []
            }
        ]
    }
]
