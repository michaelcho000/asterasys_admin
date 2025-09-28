'use client'
import React, { useState, useEffect } from 'react'
import { FiExternalLink, FiChevronUp, FiChevronDown } from 'react-icons/fi'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const ExperiencePostTable = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()
    const [experienceData, setExperienceData] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState('ALL')
    const [sortBy, setSortBy] = useState('postDate')
    const [sortOrder, setSortOrder] = useState('desc')
    const month = useSelectedMonthStore((state) => state.selectedMonth)

    useEffect(() => {
        if (!month) return
        const loadExperienceData = async () => {
            try {
                setLoading(true)
                
                const response = await fetch(withMonthParam('/api/data/experience-posts', month))
                
                if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.experiencePosts) {
                        setExperienceData(data.experiencePosts)
                    }
                } else {
                    console.error('API 응답 실패:', response.status)
                }
                
            } catch (error) {
                console.error('체험단 포스트 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadExperienceData()
    }, [month, refreshKey])

    const getFilteredData = () => {
        let filtered = activeFilter === 'ALL' ? [...experienceData] : 
                      experienceData.filter(item => item.product === activeFilter)
        
        // 정렬 적용
        filtered.sort((a, b) => {
            let aValue = a[sortBy]
            let bValue = b[sortBy]
            
            if (sortBy === 'postDate') {
                // 날짜 정렬을 위한 변환 (8/14 -> 2025-08-14 형식)
                const parseDate = (dateStr) => {
                    const [month, day] = dateStr.split('/')
                    return new Date(2025, parseInt(month) - 1, parseInt(day))
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

    const getProductBadge = (product) => {
        if (product === '쿨페이즈') return { color: 'primary', text: 'RF' }
        if (product === '쿨소닉' || product === '리프테라') return { color: 'info', text: 'HIFU' }
        
        // 경쟁사 제품
        const rfProducts = ['써마지', '인모드', '덴서티', '올리지오', '튠페이스', '세르프', '텐써마', '볼뉴머']
        if (rfProducts.includes(product)) return { color: 'warning', text: 'RF' }
        return { color: 'secondary', text: 'HIFU' }
    }

    const formatDate = (dateStr) => {
        const [month, day] = dateStr.split('/')
        return `2025년 ${month}월 ${day}일`
    }

    const uniqueProducts = [...new Set(experienceData.map(item => item.product))].sort()

    if (isRemoved) {
        return null
    }

    return (
        <div className="col-xxl-12">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <div className="card-header d-flex align-items-center justify-content-between">
                    <h5 className="card-title">체험단 포스팅 현황</h5>
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
                                            onClick={() => handleSort('hospital')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            체험단 명 {getSortIcon('hospital')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('postDate')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            포스팅 날짜 {getSortIcon('postDate')}
                                        </th>
                                        <th>분야</th>
                                        <th>작업</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredData().map((item, index) => {
                                        const productBadge = getProductBadge(item.product)
                                        
                                        return (
                                            <tr key={`${item.product}-${item.hospital}-${item.postDate}`} className="chat-single-item">
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
                                                        {item.hospital}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium">
                                                        {formatDate(item.postDate)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${productBadge.color}`}>
                                                        {productBadge.text}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <a 
                                                            href={item.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="btn btn-icon btn-sm btn-outline-primary"
                                                            title="포스트 확인"
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

export default ExperiencePostTable
