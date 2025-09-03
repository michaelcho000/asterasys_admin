'use client'
import React, { useState, useEffect } from 'react'
import { FiExternalLink, FiChevronUp, FiChevronDown } from 'react-icons/fi'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'

const CafePostsTable = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()
    const [cafePostsData, setCafePostsData] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState('ALL')
    const [sortBy, setSortBy] = useState('workDate')
    const [sortOrder, setSortOrder] = useState('desc')

    useEffect(() => {
        const loadCafePostsData = async () => {
            try {
                setLoading(true)
                
                const response = await fetch('/api/data/cafe-posts')
                
                if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.cafePostsData) {
                        console.log('Loaded cafe posts data:', data.cafePostsData.length, data.cafePostsData)
                        setCafePostsData(data.cafePostsData)
                    }
                } else {
                    console.error('API 응답 실패:', response.status)
                }
                
            } catch (error) {
                console.error('카페 게시글 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadCafePostsData()
    }, [])

    const getFilteredData = () => {
        let filtered = activeFilter === 'ALL' ? [...cafePostsData] : 
                      cafePostsData.filter(item => item.product === activeFilter)
        
        // 정렬 적용
        filtered.sort((a, b) => {
            let aValue = a[sortBy]
            let bValue = b[sortBy]
            
            if (sortBy === 'workDate') {
                // 날짜 정렬을 위한 변환 (2025.08.01 또는 2025-08-01 형식 모두 처리)
                const parseDate = (dateStr) => {
                    if (!dateStr) return new Date(0)
                    // 점이나 하이픈으로 구분된 날짜 처리
                    const normalizedDate = dateStr.replace(/\./g, '-')
                    return new Date(normalizedDate)
                }
                aValue = parseDate(aValue)
                bValue = parseDate(bValue)
            }
            
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

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        // 점이나 하이픈으로 구분된 날짜를 처리
        const normalizedDate = dateStr.replace(/\./g, '-')
        const [year, month, day] = normalizedDate.split('-')
        return `${year}년 ${month}월 ${day}일`
    }

    const uniqueProducts = [...new Set(cafePostsData.map(item => item.product))].sort()

    if (isRemoved) {
        return null
    }

    return (
        <div className="col-xxl-12">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <div className="card-header d-flex align-items-center justify-content-between">
                    <h5 className="card-title">카페 게시글 현황</h5>
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
                                            onClick={() => handleSort('workDate')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            작업일 {getSortIcon('workDate')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('cafe')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            진행카페 {getSortIcon('cafe')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('nickname')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            닉네임 {getSortIcon('nickname')}
                                        </th>
                                        <th>작업</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredData().map((item, index) => {
                                        return (
                                            <tr key={`${item.product}-${item.workURL}-${index}`} className="chat-single-item">
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
                                                        {formatDate(item.workDate)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium">
                                                        {item.cafe}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium">
                                                        {item.nickname}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <a 
                                                            href={item.workURL} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="btn btn-icon btn-sm btn-outline-primary"
                                                            title="카페 포스트 확인"
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

export default CafePostsTable