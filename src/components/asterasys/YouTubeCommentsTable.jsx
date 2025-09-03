'use client'
import React, { useState, useEffect } from 'react'
import { FiExternalLink, FiChevronUp, FiChevronDown } from 'react-icons/fi'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'

const YouTubeCommentsTable = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()
    const [youtubeCommentsData, setYouTubeCommentsData] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState('ALL')
    const [sortBy, setSortBy] = useState('commentCount')
    const [sortOrder, setSortOrder] = useState('desc')

    useEffect(() => {
        const loadYouTubeCommentsData = async () => {
            try {
                setLoading(true)
                
                const response = await fetch('/api/data/youtube-comments')
                
                if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.youtubeCommentsData) {
                        console.log('Loaded YouTube comments data:', data.youtubeCommentsData.length, data.youtubeCommentsData)
                        setYouTubeCommentsData(data.youtubeCommentsData)
                    }
                } else {
                    console.error('API 응답 실패:', response.status)
                }
                
            } catch (error) {
                console.error('유튜브 댓글 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadYouTubeCommentsData()
    }, [])

    const getFilteredData = () => {
        let filtered = activeFilter === 'ALL' ? [...youtubeCommentsData] : 
                      youtubeCommentsData.filter(item => item.product === activeFilter)
        
        // 정렬 적용
        filtered.sort((a, b) => {
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
        
        return filtered
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

    const uniqueProducts = [...new Set(youtubeCommentsData.map(item => item.product))].sort()

    if (isRemoved) {
        return null
    }

    return (
        <div className="col-xxl-12">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <div className="card-header d-flex align-items-center justify-content-between">
                    <h5 className="card-title">유튜브 댓글작업 현황</h5>
                    <div className="d-flex gap-2 flex-wrap">
                        <button 
                            className={`btn btn-sm ${activeFilter === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveFilter('ALL')}
                        >
                            전체
                        </button>
                        {uniqueProducts.slice(0, 6).map(product => (
                            <button 
                                key={product}
                                className={`btn btn-sm ${activeFilter === product ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setActiveFilter(product)}
                            >
                                {product}
                            </button>
                        ))}
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
                                        <th scope="row">No.</th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('product')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            제품명 {getSortIcon('product')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('channel')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            채널명 {getSortIcon('channel')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('commentCount')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            댓글 수 {getSortIcon('commentCount')}
                                        </th>
                                        <th>작업</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredData().map((item, index) => {
                                        return (
                                            <tr key={`${item.product}-${item.channel}-${item.link}`} className="chat-single-item">
                                                <td>
                                                    <div className="fw-bold text-dark">
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark">
                                                        {item.product}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium">
                                                        {item.channel}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium">
                                                        <span className="badge bg-primary">
                                                            {item.commentCount}개
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <a 
                                                            href={item.link} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="btn btn-icon btn-sm btn-outline-primary"
                                                            title="유튜브 영상 확인"
                                                            style={{
                                                                transition: 'all 0.2s ease',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                const icon = e.currentTarget.querySelector('svg')
                                                                if (icon) icon.style.color = '#ffffff'
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                const icon = e.currentTarget.querySelector('svg')
                                                                if (icon) icon.style.color = ''
                                                            }}
                                                        >
                                                            <FiExternalLink size={14} />
                                                        </a>
                                                    </div>
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

export default YouTubeCommentsTable