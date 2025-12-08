'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { FiMoreVertical } from 'react-icons/fi'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const LatestLeads = ({title}) => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const [competitorData, setCompetitorData] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('ALL')
    const [sortConfig, setSortConfig] = useState({ key: 'totalScore', direction: 'desc' })
    const month = useSelectedMonthStore((state) => state.selectedMonth)
    const monthNumber = useMemo(() => {
        if (!month) return null
        const [, monthPart] = month.split('-')
        return parseInt(monthPart, 10)
    }, [month])
    const monthlySalesColumn = useMemo(() => {
        if (!monthNumber) return '8월 판매량'
        return `${monthNumber}월 판매량`
    }, [monthNumber])
    const monthlySalesLabel = useMemo(() => {
        if (!monthNumber) return '8월'
        return `${monthNumber}월`
    }, [monthNumber])

    useEffect(() => {
        if (!month) return
        const loadCompetitorData = async () => {
            try {
                setLoading(true)
                
                // 6개 CSV 파일 동시 로드 (sale 추가)
                const [cafeResponse, youtubeResponse, blogResponse, newsResponse, trafficResponse, salesResponse] = await Promise.all([
                    fetch(withMonthParam('/api/data/files/cafe_rank', month)),
                    fetch(withMonthParam('/api/data/files/youtube_rank', month)),
                    fetch(withMonthParam('/api/data/files/blog_rank', month)),
                    fetch(withMonthParam('/api/data/files/news_rank', month)),
                    fetch(withMonthParam('/api/data/files/traffic', month)),
                    fetch(withMonthParam('/api/data/files/sale', month))
                ])
                
                const [cafeData, youtubeData, blogData, newsData, trafficData, salesData] = await Promise.all([
                    cafeResponse.json(),
                    youtubeResponse.json(),
                    blogResponse.json(),
                    newsResponse.json(),
                    trafficResponse.json(),
                    salesResponse.json()
                ])
                
                // 데이터 통합 처리 (sale 추가)
                const processedData = processCompetitorData(cafeData, youtubeData, blogData, newsData, trafficData, salesData)
                setCompetitorData(processedData)
                
            } catch (error) {
                console.error('경쟁사 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadCompetitorData()
    }, [month])

    const processCompetitorData = (cafeData, youtubeData, blogData, newsData, trafficData, salesData) => {
        const cafe = cafeData.marketData || []
        const youtube = youtubeData.marketData || []
        const blog = blogData.marketData || []
        const news = newsData.marketData || []
        const traffic = trafficData.marketData || []
        const sales = salesData.marketData || []
        
        // 키워드별 데이터 통합
        const integrated = cafe.map(cafeItem => {
            const youtubeItem = youtube.find(y => y.키워드 === cafeItem.키워드) || {}
            const blogItem = blog.find(b => b.키워드 === cafeItem.키워드) || {}
            const newsItem = news.find(n => n.키워드 === cafeItem.키워드) || {}
            const trafficItem = traffic.find(t => t.키워드 === cafeItem.키워드) || {}
            const salesItem = sales.find(s => s.키워드 === cafeItem.키워드) || {}
            
            // 각 채널별 점수 추출 (컬럼명 정확히 맞춤)
            const cafeScore = parseInt(cafeItem['총 발행량']) || 0
            const youtubeScore = parseInt(youtubeItem['총 발행량']) || 0
            const blogScore = parseInt(blogItem['발행량합']) || 0  // blog_rank는 '발행량합' 컬럼 사용
            const newsScore = parseInt(newsItem['총 발행량']) || 0
            const searchScore = parseInt(trafficItem['월간 검색량']?.replace(/,/g, '') || 0)
            
            // 판매량 처리: "월간 판매량" 컬럼 우선, 없으면 "X월 판매량" 형식 체크
            const monthlyRawValue = salesItem ? (salesItem['월간 판매량'] ?? salesItem[monthlySalesColumn] ?? salesItem['8월 판매량']) : null
            const hasSalesData = salesItem && (salesItem['총 판매량'] || monthlyRawValue)
            const totalSales = hasSalesData ? (parseInt(String(salesItem['총 판매량'] || 0).replace(/,/g, '')) || 0) : null
            const monthlySales = hasSalesData ? (parseInt(String(monthlyRawValue || 0).replace(/,/g, '')) || 0) : null

            // 종합 점수 계산 (판매량 있는 경우만 포함)
            const salesScoreForTotal = (totalSales || 0) + (monthlySales || 0)
            const totalScore = cafeScore + youtubeScore + blogScore + newsScore + searchScore + salesScoreForTotal
            
            // 트렌드 분석 (5개 채널 기준으로 재조정 - 검색량 포함)
            let status = '성장필요'
            if (totalScore >= 60000) status = '시장지배'      // 최상위 (써마지, 울쎄라급)
            else if (totalScore >= 20000) status = '경쟁우위'  // 상위권 (인모드급)
            else if (totalScore >= 10000) status = '안정적'   // 중위권 (Asterasys급)
            else if (totalScore >= 5000) status = '성장세'      // 하위권
            
            const isAsterasys = ['쿨페이즈', '리프테라', '쿨소닉'].includes(cafeItem.키워드)
            
            return {
                keyword: cafeItem.키워드,
                category: cafeItem.그룹,
                cafeScore,
                youtubeScore,
                blogScore,
                newsScore,
                searchScore,
                totalSales,
                monthlySales,
                hasSalesData,
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

    const handleSort = (key) => {
        setSortConfig(prevConfig => {
            // 같은 칼럼을 다시 클릭하면 기본 정렬(종합점수)로 복귀
            if (prevConfig.key === key) {
                return { key: 'totalScore', direction: 'desc' }
            }
            // 새로운 칼럼 클릭 시 내림차순만 적용
            return { key, direction: 'desc' }
        })
    }

    const getSortedData = (data) => {
        if (!sortConfig.key) return data

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key] || 0
            const bValue = b[sortConfig.key] || 0

            // 항상 내림차순 정렬 (높은 값 → 낮은 값)
            if (sortConfig.key === 'keyword') {
                return bValue.localeCompare(aValue)
            } else {
                return bValue - aValue
            }
        })
    }

    const getFilteredData = () => {
        let filteredData
        if (activeTab === 'ALL') {
            filteredData = competitorData
        } else {
            // 카테고리별 필터링 후 해당 카테고리 내에서 1~9위 순위 재계산
            const filtered = competitorData.filter(item => item.category === activeTab)
            filteredData = filtered
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((item, index) => ({
                    ...item,
                    categoryRank: index + 1  // 카테고리별 순위 (1~9위)
                }))
        }

        const sorted = getSortedData(filteredData)

        // Re-assign sequential rank numbers after sorting (always 1, 2, 3...)
        return sorted.map((item, index) => ({
            ...item,
            displayRank: index + 1  // Display rank always starts from 1
        }))
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
                                        <th style={{cursor: 'pointer'}} onClick={() => handleSort('keyword')}>
                                            브랜드 {sortConfig.key === 'keyword' && '↓'}
                                        </th>
                                        <th>분야</th>
                                        <th style={{cursor: 'pointer'}} onClick={() => handleSort('cafeScore')}>
                                            카페점수 {sortConfig.key === 'cafeScore' && '↓'}
                                        </th>
                                        <th style={{cursor: 'pointer'}} onClick={() => handleSort('youtubeScore')}>
                                            유튜브점수 {sortConfig.key === 'youtubeScore' && '↓'}
                                        </th>
                                        <th style={{cursor: 'pointer'}} onClick={() => handleSort('blogScore')}>
                                            블로그점수 {sortConfig.key === 'blogScore' && '↓'}
                                        </th>
                                        <th style={{cursor: 'pointer'}} onClick={() => handleSort('newsScore')}>
                                            뉴스점수 {sortConfig.key === 'newsScore' && '↓'}
                                        </th>
                                        <th style={{cursor: 'pointer'}} onClick={() => handleSort('searchScore')}>
                                            검색량 {sortConfig.key === 'searchScore' && '↓'}
                                        </th>
                                        <th style={{cursor: 'pointer'}} onClick={() => handleSort('totalSales')}>
                                            총판매량 {sortConfig.key === 'totalSales' && '↓'}
                                        </th>
                                        <th style={{cursor: 'pointer'}} onClick={() => handleSort('monthlySales')}>
                                            {monthlySalesLabel} 판매 {sortConfig.key === 'monthlySales' && '↓'}
                                        </th>
                                        <th style={{cursor: 'pointer'}} onClick={() => handleSort('totalScore')}>
                                            종합점수 {sortConfig.key === 'totalScore' && '↓'}
                                        </th>
                                        <th>상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        getFilteredData().map((item, index) => (
                                            <tr key={item.keyword} className={`chat-single-item ${item.isAsterasys ? 'table-primary' : ''}`}>
                                                <td>
                                                    <div className="fw-bold text-dark">
                                                        {item.displayRank}
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
                                                    <div className="text-dark fw-semibold">{item.searchScore.toLocaleString()}</div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-semibold">
                                                        {item.hasSalesData ? item.totalSales.toLocaleString() : '자료 없음'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-semibold">
                                                        {item.hasSalesData && item.monthlySales !== null ? item.monthlySales.toLocaleString() : '자료 없음'}
                                                    </div>
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
