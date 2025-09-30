import { useState, useEffect } from 'react'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const parseNumber = (value) => {
    if (value === null || value === undefined) return 0
    if (typeof value === 'number') return value
    const sanitized = String(value).replace(/[^\d.-]/g, '')
    if (!sanitized) return 0
    const num = Number(sanitized)
    return Number.isNaN(num) ? 0 : num
}

const useCompetitorAnalysis = () => {
    const [competitorData, setCompetitorData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const month = useSelectedMonthStore((state) => state.selectedMonth)

    useEffect(() => {
        if (!month) return
        const loadCompetitorData = async () => {
            try {
                setLoading(true)
                
                // 모든 필요한 CSV 데이터 로드
                const [cafeResponse, blogResponse, trafficResponse, youtubeResponse, newsResponse, saleResponse] = await Promise.all([
                    fetch(withMonthParam('/api/data/files/cafe_rank', month)),
                    fetch(withMonthParam('/api/data/files/blog_rank', month)),
                    fetch(withMonthParam('/api/data/files/traffic', month)),
                    fetch(withMonthParam('/api/data/files/youtube_rank', month)),
                    fetch(withMonthParam('/api/data/files/news_rank', month)),
                    fetch(withMonthParam('/api/data/files/sale', month))
                ])
                
                const [cafeData, blogData, trafficData, youtubeData, newsData, saleData] = await Promise.all([
                    cafeResponse.json(),
                    blogResponse.json(), 
                    trafficResponse.json(),
                    youtubeResponse.json(),
                    newsResponse.json(),
                    saleResponse.json()
                ])
                
                // 종합 점수 계산
                const processedData = calculateComprehensiveScores(
                    cafeData.marketData || [],
                    blogData.marketData || [],
                    trafficData.marketData || [],
                    youtubeData.marketData || [],
                    newsData.marketData || [],
                    saleData.marketData || []
                )
                
                setCompetitorData(processedData)
                
            } catch (error) {
                console.error('경쟁사 분석 데이터 로드 실패:', error)
                setError(error)
            } finally {
                setLoading(false)
            }
        }

        loadCompetitorData()
    }, [month])

    const calculateComprehensiveScores = (cafeData, blogData, trafficData, youtubeData, newsData, saleData) => {
        const competitors = new Map()
        const asterasysProducts = ['쿨페이즈', '리프테라', '쿨소닉']

        // 1. 카페 점수 계산 (총 발행량 + 총 댓글수 + 총 대댓글수 + 총 조회수)
        cafeData.forEach(item => {
            const cafeScore = 
                parseInt(item['총 발행량']?.replace(/,/g, '') || 0) +
                parseInt(item['총 댓글수']?.replace(/,/g, '') || 0) +
                parseInt(item['총 대댓글수']?.replace(/,/g, '') || 0) +
                (parseInt(item['총 조회수']?.replace(/,/g, '') || 0) / 100) // 조회수는 100으로 나누어 가중치 조정
            
            competitors.set(item.키워드, {
                name: item.키워드,
                group: item.그룹,
                cafeScore: Math.round(cafeScore),
                isAsterasys: asterasysProducts.includes(item.키워드),
                rawData: {
                    cafe: {
                        발행량: parseInt(item['총 발행량']?.replace(/,/g, '') || 0),
                        댓글수: parseInt(item['총 댓글수']?.replace(/,/g, '') || 0),
                        대댓글수: parseInt(item['총 대댓글수']?.replace(/,/g, '') || 0),
                        조회수: parseInt(item['총 조회수']?.replace(/,/g, '') || 0)
                    }
                }
            })
        })

        // 2. 블로그 점수 계산 (발행량합 + 댓글 총 개수 + 대댓글 총 개수)
        const blogAggregated = new Map()
        
        blogData.forEach(item => {
            if (!item.키워드 || item.키워드.trim() === '') return
            
            const keyword = item.키워드
            if (!blogAggregated.has(keyword)) {
                blogAggregated.set(keyword, {
                    발행량합: 0,
                    댓글총개수: 0,
                    대댓글총개수: 0
                })
            }
            
            const current = blogAggregated.get(keyword)
            current.발행량합 += parseInt(item['발행량합']?.replace(/,/g, '') || 0)
            current.댓글총개수 += parseInt(item['댓글 총 개수']?.replace(/,/g, '') || 0)
            current.대댓글총개수 += parseInt(item['대댓글 총 개수']?.replace(/,/g, '') || 0)
        })

        // 블로그 점수를 기존 데이터에 추가
        blogAggregated.forEach((blogStats, keyword) => {
            if (competitors.has(keyword)) {
                const blogScore = blogStats.발행량합 + blogStats.댓글총개수 + blogStats.대댓글총개수
                const competitor = competitors.get(keyword)
                competitor.blogScore = blogScore
                competitor.rawData.blog = blogStats
            }
        })

        // 3. 검색량 점수 추가
        trafficData.forEach(item => {
            if (competitors.has(item.키워드)) {
                const searchVolume = parseInt(item['월간 검색량']?.replace(/,/g, '') || 0)
                const competitor = competitors.get(item.키워드)
                competitor.searchScore = searchVolume
                competitor.rawData.search = { 검색량: searchVolume }
            }
        })

        // 4. 유튜브 점수 (총 발행량 사용)
        youtubeData.forEach(item => {
            if (competitors.has(item.키워드)) {
                const youtubeScore = parseInt(item['총 발행량']?.replace(/,/g, '') || 0)
                const competitor = competitors.get(item.키워드)
                competitor.youtubeScore = youtubeScore
                competitor.rawData.youtube = item
            }
        })

        // 5. 뉴스 점수 (총 발행량 사용)
        newsData.forEach(item => {
            if (competitors.has(item.키워드)) {
                const newsScore = parseInt(item['총 발행량']?.replace(/,/g, '') || 0)
                const competitor = competitors.get(item.키워드)
                competitor.newsScore = newsScore
                competitor.rawData.news = item
            }
        })

        // 6. 판매 데이터 추가
        saleData.forEach(item => {
            const keyword = (item.키워드 || '').trim()
            if (Competitors.has(keyword)) {
                const competitor = competitors.get(keyword)
                competitor.sales = {
                    total: parseNumber(item['총 판매량']),
                    monthly: parseNumber(item['8월 판매량'])
                }
            }
        })

        // 7. 종합 점수 계산 및 순위 매기기
        const competitorArray = Array.from(competitors.values()).map(competitor => {
            const totalScore = 
                (competitor.cafeScore || 0) +
                (competitor.blogScore || 0) +
                (competitor.searchScore || 0) +
                (competitor.youtubeScore || 0) +
                (competitor.newsScore || 0)
            
            return {
                ...competitor,
                totalScore: totalScore
            }
        })

        // 전체 순위 계산
        const sortedAll = competitorArray
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((competitor, index) => ({
                ...competitor,
                overallRank: index + 1
            }))

        // RF/HIFU별 순위 계산
        const rfCompetitors = sortedAll
            .filter(c => c.group === '고주파')
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((competitor, index) => ({
                ...competitor,
                categoryRank: index + 1
            }))

        const hifuCompetitors = sortedAll
            .filter(c => c.group === '초음파')
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((competitor, index) => ({
                ...competitor,
                categoryRank: index + 1
            }))

        // 최종 결과 합치기
        const finalResults = [...rfCompetitors, ...hifuCompetitors]

        const asterasysOnly = finalResults.filter((item) => item.isAsterasys)
        const othersOnly = finalResults.filter((item) => !item.isAsterasys)

        const engagementTotals = (items) => items.reduce((acc, item) => {
            const cafeEngagement = (item.rawData.cafe?.댓글수 || 0) + (item.rawData.cafe?.대댓글수 || 0)
            const blogEngagement = (item.rawData.blog?.댓글총개수 || 0) + (item.rawData.blog?.대댓글총개수 || 0)
            return acc + cafeEngagement + blogEngagement
        }, 0)

        const asterasysEngagement = engagementTotals(asterasysOnly)
        const othersEngagement = engagementTotals(othersOnly)

        const competitorAverageEngagement = othersOnly.length ? (othersEngagement / othersOnly.length) : 0
        const asterasysAverageEngagement = asterasysOnly.length ? (asterasysEngagement / asterasysOnly.length) : 0

        const salesSummary = {
            total: asterasysOnly.reduce((sum, item) => sum + (item.sales?.total || 0), 0),
            perProduct: asterasysOnly.reduce((acc, item) => {
                acc[item.name] = {
                    total: item.sales?.total || 0,
                    monthly: item.sales?.monthly || 0
                }
                return acc
            }, {})
        }

        return {
            all: sortedAll,
            rf: rfCompetitors,
            hifu: hifuCompetitors,
            summary: {
                totalCompetitors: sortedAll.length,
                asterasysProducts: sortedAll.filter(c => c.isAsterasys),
                topRfCompetitor: rfCompetitors[0],
                topHifuCompetitor: hifuCompetitors[0],
                sales: salesSummary,
                engagement: {
                    asterasysAverage: asterasysAverageEngagement,
                    competitorsAverage: competitorAverageEngagement
                }
            }
        }
    }

    return { competitorData, loading, error }
}

export default useCompetitorAnalysis
