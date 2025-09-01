'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiMoreVertical } from 'react-icons/fi'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'

const LatestLeads = ({title}) => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const [competitorData, setCompetitorData] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('ALL')

    useEffect(() => {
        const loadCompetitorData = async () => {
            try {
                setLoading(true)
                
                // 4개 CSV 파일 동시 로드
                const [cafeResponse, youtubeResponse, blogResponse, newsResponse] = await Promise.all([
                    fetch('/api/data/files/cafe_rank'),
                    fetch('/api/data/files/youtube_rank'),
                    fetch('/api/data/files/blog_rank'),
                    fetch('/api/data/files/news_rank')
                ])
                
                const [cafeData, youtubeData, blogData, newsData] = await Promise.all([
                    cafeResponse.json(),
                    youtubeResponse.json(),
                    blogResponse.json(),
                    newsResponse.json()
                ])
                
                // 데이터 통합 처리
                const processedData = processCompetitorData(cafeData, youtubeData, blogData, newsData)
                setCompetitorData(processedData)
                
            } catch (error) {
                console.error('경쟁사 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadCompetitorData()
    }, [])

    const processCompetitorData = (cafeData, youtubeData, blogData, newsData) => {
        const cafe = cafeData.marketData || []
        const youtube = youtubeData.marketData || []
        const blog = blogData.marketData || []
        const news = newsData.marketData || []
        
        // 키워드별 데이터 통합
        const integrated = cafe.map(cafeItem => {
            const youtubeItem = youtube.find(y => y.키워드 === cafeItem.키워드) || {}
            const blogItem = blog.find(b => b.키워드 === cafeItem.키워드) || {}
            const newsItem = news.find(n => n.키워드 === cafeItem.키워드) || {}
            
            // 각 채널별 점수 추출 (컬럼명 정확히 맞춤)
            const cafeScore = parseInt(cafeItem['총 발행량']) || 0
            const youtubeScore = parseInt(youtubeItem['총 발행량']) || 0
            const blogScore = parseInt(blogItem['발행량합']) || 0  // blog_rank는 '발행량합' 컬럼 사용
            const newsScore = parseInt(newsItem['총 발행량']) || 0
            
            // 종합 점수 계산 (4개 채널 합산)
            const totalScore = cafeScore + youtubeScore + blogScore + newsScore
            
            // 트렌드 분석 (4개 채널 기준으로 재조정)
            let status = '성장필요'
            if (totalScore >= 2000) status = '시장지배'      // 최상위 (써마지, 울쎄라급)
            else if (totalScore >= 1200) status = '경쟁우위'  // 상위권 (인모드급)
            else if (totalScore >= 800) status = '안정적'   // 중위권 (Asterasys급)
            else if (totalScore >= 400) status = '성장세'      // 하위권
            
            const isAsterasys = ['쿨페이즈', '리프테라', '쿨소닉'].includes(cafeItem.키워드)
            
            return {
                keyword: cafeItem.키워드,
                category: cafeItem.그룹,
                cafeScore,
                youtubeScore,
                blogScore,
                newsScore,
                totalScore,
                cafeRank: parseInt(cafeItem['발행량 순위']) || 0,
                status,
                isAsterasys,
                comments: parseInt(cafeItem['총 댓글수']?.replace(/,/g, '') || 0),
                views: parseInt(cafeItem['총 조회수']?.replace(/,/g, '') || 0)
            }
        })
        
        // 종합 점수 기준 정렬 후 순위 재계산
        const sorted = integrated.sort((a, b) => b.totalScore - a.totalScore)
        
        // 전체 순위 추가
        return sorted.map((item, index) => ({
            ...item,
            overallRank: index + 1
        }))
    }

    const getFilteredData = () => {
        if (activeTab === 'ALL') return competitorData
        return competitorData.filter(item => item.category === activeTab)
    }

    const getStatusColor = (status) => {
        switch(status) {
            case '시장지배': return 'success'
            case '경쟁우위': return 'primary' 
            case '안정적': return 'info'
            case '성장세': return 'warning'
            case '성장필요': return 'secondary'
            default: return 'secondary'
        }
    }

    if (isRemoved) {
        return null;
    }

    return (
        <div className="col-xxl-8">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <div className="card-header d-flex align-items-center justify-content-between">
                    <h5 className="card-title">{title}</h5>
                    <div className="d-flex gap-2">
                        <button 
                            className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('ALL')}
                        >
                            전체
                        </button>
                        <button 
                            className={`btn btn-sm ${activeTab === '고주파' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('고주파')}
                        >
                            RF
                        </button>
                        <button 
                            className={`btn btn-sm ${activeTab === '초음파' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('초음파')}
                        >
                            HIFU
                        </button>
                    </div>
                </div>

                <div className="card-body custom-card-action p-0">
                    {loading ? (
                        <CardLoader />
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr className="border-b">
                                        <th scope="row">순위</th>
                                        <th>브랜드</th>
                                        <th>분야</th>
                                        <th>카페점수</th>
                                        <th>유튜브점수</th>
                                        <th>블로그점수</th>
                                        <th>뉴스점수</th>
                                        <th>종합점수</th>
                                        <th>상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        getFilteredData().map((item, index) => (
                                            <tr key={item.keyword} className={`chat-single-item ${item.isAsterasys ? 'table-primary' : ''}`}>
                                                <td>
                                                    <div className="fw-bold text-dark">
                                                        {item.overallRank}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark">
                                                        {item.keyword}
                                                        {item.isAsterasys && <span className="badge bg-primary ms-2">Asterasys</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${item.category === '고주파' ? 'bg-warning' : 'bg-info'}`}>
                                                        {item.category === '고주파' ? 'RF' : 'HIFU'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-semibold">{item.cafeScore.toLocaleString()}</div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-semibold">{item.youtubeScore.toLocaleString()}</div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-semibold">{item.blogScore.toLocaleString()}</div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-semibold">{item.newsScore.toLocaleString()}</div>
                                                </td>
                                                <td>
                                                    <div className="fw-bold text-primary fs-6">{item.totalScore.toLocaleString()}</div>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${getStatusColor(item.status)} text-white`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LatestLeads