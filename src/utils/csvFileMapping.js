// 21개 CSV 파일 완전 매핑 시스템
// 파일명 기반 동적 호출을 위한 전체 파일 목록

export const csvFileMapping = {
    // 핵심 순위 데이터 (5개)
    rankings: [
        'blog_rank',      // 블로그 발행량 순위
        'cafe_rank',      // 카페 발행량 순위  
        'news_rank',      // 뉴스 발행량 순위
        'youtube_rank',   // 유튜브/검색량 순위
        'sale'            // 판매량 데이터
    ],

    // 블로그 관련 데이터 (4개)
    blog: [
        'blog_rank',      // 시장 블로그 순위
        'blog_post',      // 자사 운영 블로그
        'blog_user_rank', // 병원별 블로그 순위
        'bloger_Post'     // 체험단/인플루언서 포스팅
    ],

    // 카페 관련 데이터 (4개)
    cafe: [
        'cafe_rank',      // 카페 발행량 순위
        'cafe_post',      // 카페 게시물 운영
        'cafe_comments',  // 카페 댓글 작업
        'cafe_seo'        // 카페 SEO 성과
    ],

    // 유튜브 관련 데이터 (4개)
    youtube: [
        'youtube_rank',       // 유튜브 검색량 순위
        'youtube_contents',   // 유튜브 콘텐츠 업로드
        'youtube_comments',   // 유튜브 댓글 작업
        'youtube_sponsor ad'  // 유튜브 스폰서 광고
    ],

    // 운영 관련 데이터 (5개)
    operations: [
        'news_release',       // 뉴스 릴리즈
        'facebook_targeting', // 페이스북 타겟팅
        'ott',               // 옥외광고
        'bad writing',       // 악성글 대응
        'autocomplete'       // 자동완성 작업
    ],

    // 기타 데이터 (3개)
    misc: [
        'traffic',           // 검색 트래픽
        'kakao_opentalk'     // 카카오 오픈톡
    ]
}

// 파일명 → 한국어 설명 매핑
export const fileDescriptions = {
    'blog_rank': '블로그 발행량 순위',
    'blog_post': '자사 운영 블로그',
    'blog_user_rank': '병원별 블로그 순위', 
    'bloger_Post': '체험단 포스팅',
    
    'cafe_rank': '카페 발행량 순위',
    'cafe_post': '카페 게시물 운영',
    'cafe_comments': '카페 댓글 작업',
    'cafe_seo': '카페 SEO 성과',
    
    'news_rank': '뉴스 발행량 순위',
    'news_release': '뉴스 릴리즈',
    
    'youtube_rank': '유튜브 검색량 순위',
    'youtube_contents': '유튜브 콘텐츠',
    'youtube_comments': '유튜브 댓글 작업',
    'youtube_sponsor ad': '유튜브 스폰서 광고',
    
    'sale': '판매량 데이터',
    'traffic': '검색 트래픽',
    
    'facebook_targeting': '페이스북 타겟팅',
    'ott': '옥외광고',
    'bad writing': '악성글 대응',
    'autocomplete': '자동완성 작업',
    'kakao_opentalk': '카카오 오픈톡'
}

// 전체 21개 파일 리스트
export const allCSVFiles = [
    'blog_rank', 'blog_post', 'blog_user_rank', 'bloger_Post',
    'cafe_rank', 'cafe_post', 'cafe_comments', 'cafe_seo',
    'news_rank', 'news_release',
    'youtube_rank', 'youtube_contents', 'youtube_comments', 'youtube_sponsor ad',
    'sale', 'traffic',
    'facebook_targeting', 'ott', 'bad writing', 'autocomplete', 'kakao_opentalk'
]

// 파일명 검증 함수
export const validateFileName = (filename) => {
    return allCSVFiles.includes(filename)
}

// Asterasys 제품 키워드 (자동 필터링용)
export const asterasysKeywords = ['쿨페이즈', '리프테라', '쿨소닉']