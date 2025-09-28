'use client'
import React, { useState, useEffect } from 'react'
import { FiDownload, FiChevronUp, FiChevronDown } from 'react-icons/fi'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const YouTubeComprehensiveTable = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const [allData, setAllData] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('ALL')
    const [sortBy, setSortBy] = useState('views')
    const [sortOrder, setSortOrder] = useState('desc')
    const month = useSelectedMonthStore((state) => state.selectedMonth)

    useEffect(() => {
        if (!month) return
        const loadAllData = async () => {
            try {
                setLoading(true)
                
                // YouTube 제품 데이터 API 사용 (메인 대시보드 방식)
                const response = await fetch(withMonthParam('/api/data/youtube-products', month))
                
                if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.products) {
                        setAllData(data.products)
                    }
                } else {
                    console.error('API 응답 실패:', response.status)
                }
                
            } catch (error) {
                console.error('전체 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadAllData()
    }, [month, refreshKey])

    const calculateMarketShare = (videos, views, likes, comments, totalVideos, totalViews, totalLikes, totalComments) => {
        // YouTube 시장 점유율 계산: 여러 지표 종합
        if (totalVideos === 0 || totalViews === 0) return 0
        
        // 1. 비디오 점유율 (40% 가중치)
        const videoShare = (videos / totalVideos) * 100 * 0.4
        
        // 2. 조회수 점유율 (40% 가중치)  
        const viewShare = (views / totalViews) * 100 * 0.4
        
        // 3. 참여 점유율 (20% 가중치)
        const totalEngagement = totalLikes + totalComments
        const engagementShare = totalEngagement > 0 ? ((likes + comments) / totalEngagement) * 100 * 0.2 : 0
        
        // 최종 종합 점유율
        const finalShare = videoShare + viewShare + engagementShare
        
        return finalShare
    }

    const getFilteredData = () => {
        let filtered = activeTab === 'ALL' ? [...allData] : allData.filter(item => item.category === activeTab)
        
        // 전체 시장 총계 계산
        const totalVideos = filtered.reduce((sum, item) => sum + (item.videos || 0), 0)
        const totalViews = filtered.reduce((sum, item) => sum + (item.views || 0), 0)
        const totalLikes = filtered.reduce((sum, item) => sum + (item.likes || 0), 0)
        const totalComments = filtered.reduce((sum, item) => sum + (item.comments || 0), 0)
        
        // 시장 점유율 계산 추가
        const withMarketShare = filtered.map(item => ({
            ...item,
            market_share_calculated: calculateMarketShare(
                item.videos, item.views, item.likes, item.comments,
                totalVideos, totalViews, totalLikes, totalComments
            )
        }))
        
        // 점유율 최대값 계산 (상대적 비교용)
        const maxMarketShare = Math.max(...withMarketShare.map(item => item.market_share_calculated))
        
        // 상대적 점유율 비율 계산 (0-100%)
        const finalData = withMarketShare.map(item => ({
            ...item,
            market_share_relative: maxMarketShare > 0 ? (item.market_share_calculated / maxMarketShare * 100) : 0
        }))
        
        // 정렬 적용
        finalData.sort((a, b) => {
            let aValue = a[sortBy]
            let bValue = b[sortBy]
            
            // 문자열인 경우 처리
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase()
                bValue = bValue.toLowerCase()
            }
            
            if (sortOrder === 'desc') {
                return bValue > aValue ? 1 : -1
            } else {
                return aValue > bValue ? 1 : -1
            }
        })
        
        return finalData
    }

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
        } else {
            setSortBy(field)
            setSortOrder('desc')
        }
    }

    const getSortIcon = (field) => {
        if (sortBy !== field) return null
        return sortOrder === 'desc' ? 
            <FiChevronDown className="text-primary ms-1" size={14} /> : 
            <FiChevronUp className="text-primary ms-1" size={14} />
    }

    const getStatus = (views) => {
        if (views >= 500000) return { status: '시장지배', color: 'success' }
        if (views >= 100000) return { status: '경쟁우위', color: 'primary' }
        if (views >= 50000) return { status: '안정적', color: 'info' }
        if (views >= 10000) return { status: '성장세', color: 'warning' }
        return { status: '성장필요', color: 'secondary' }
    }

    if (isRemoved) {
        return null;
    }

    return (
        <div className="col-xxl-12">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <div className="card-header d-flex align-items-center justify-content-between">
                    <h5 className="card-title">YouTube 성과 순위 현황</h5>
                    <div className="d-flex gap-2">
                        <button 
                            className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('ALL')}
                        >
                            전체
                        </button>
                        <button 
                            className={`btn btn-sm ${activeTab === 'RF' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('RF')}
                        >
                            RF
                        </button>
                        <button 
                            className={`btn btn-sm ${activeTab === 'HIFU' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('HIFU')}
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
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('product')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            브랜드 {getSortIcon('product')}
                                        </th>
                                        <th>분야</th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('videos')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            비디오수 {getSortIcon('videos')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('views')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            총조회수 {getSortIcon('views')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('likes')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            좋아요수 {getSortIcon('likes')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('comments')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            댓글수 {getSortIcon('comments')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('market_share_calculated')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            점유율 {getSortIcon('market_share_calculated')}
                                        </th>
                                        <th>상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredData().map((item, index) => {
                                        const statusInfo = getStatus(item.views)
                                        
                                        return (
                                            <tr key={item.product} className={`chat-single-item ${item.isAsterasys ? 'table-primary' : ''}`}>
                                                <td>
                                                    <div className="fw-bold text-dark">
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark">
                                                        {item.product}
                                                        {item.isAsterasys && <span className="badge bg-primary ms-2">Asterasys</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${item.category === 'RF' ? 'bg-warning' : 'bg-info'}`}>
                                                        {item.category === 'RF' ? 'RF' : 'HIFU'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-semibold">{(item.videos || 0).toLocaleString()}</div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-semibold">{(item.views || 0).toLocaleString()}</div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-semibold">{(item.likes || 0).toLocaleString()}</div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-semibold">{(item.comments || 0).toLocaleString()}</div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="flex-grow-1 me-2">
                                                            <div className="progress ht-4" style={{ minWidth: '60px' }}>
                                                                <div 
                                                                    className={`progress-bar ${item.market_share_calculated > 10 ? 'bg-success' : item.market_share_calculated > 5 ? 'bg-warning' : 'bg-secondary'}`}
                                                                    style={{ width: `${Math.min(item.market_share_relative, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                        <div className="text-end" style={{ minWidth: '45px' }}>
                                                            <span className={`fs-6 fw-bold ${item.market_share_calculated > 10 ? 'text-success' : item.market_share_calculated > 5 ? 'text-warning' : 'text-muted'}`}>
                                                                {item.market_share_calculated.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${statusInfo.color} text-white`}>
                                                        {statusInfo.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default YouTubeComprehensiveTable
