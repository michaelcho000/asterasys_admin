'use client'
import React, { useState, useEffect } from 'react'
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const TargetingAdsTable = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()
    const [targetingAdsData, setTargetingAdsData] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState('ALL')
    const [sortBy, setSortBy] = useState('results')
    const [sortOrder, setSortOrder] = useState('desc')
    const month = useSelectedMonthStore((state) => state.selectedMonth)

    useEffect(() => {
        if (!month) return
        const loadTargetingAdsData = async () => {
            try {
                setLoading(true)
                
                const response = await fetch(withMonthParam('/api/data/targeting-ads', month))
                
                if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.targetingAdsData) {
                        console.log('Loaded targeting ads data:', data.targetingAdsData.length, data.targetingAdsData)
                        setTargetingAdsData(data.targetingAdsData)
                    }
                } else {
                    console.error('API 응답 실패:', response.status)
                }
                
            } catch (error) {
                console.error('타겟팅 광고 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadTargetingAdsData()
    }, [month, refreshKey])

    const getFilteredData = () => {
        let filtered = activeFilter === 'ALL' ? [...targetingAdsData] : 
                      targetingAdsData.filter(item => item.product === activeFilter)
        
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

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        // YYYY-MM-DD 형식을 YYYY년 MM월 DD일로 변환
        const [year, month, day] = dateStr.split('-')
        return `${year}년 ${month}월 ${day}일`
    }

    const uniqueProducts = [...new Set(targetingAdsData.map(item => item.product))].sort()

    if (isRemoved) {
        return null
    }

    return (
        <div className="col-xxl-12">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <div className="card-header d-flex align-items-center justify-content-between">
                    <h5 className="card-title">타겟팅 광고 현황</h5>
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
                                            병원명 {getSortIcon('hospital')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('campaignName')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            캠페인 이름 {getSortIcon('campaignName')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('results')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            결과 {getSortIcon('results')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('reach')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            도달수 {getSortIcon('reach')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('impressions')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            노출 {getSortIcon('impressions')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('clicks')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            클릭수 {getSortIcon('clicks')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('reportStart')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            보고 시작 {getSortIcon('reportStart')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('reportEnd')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            보고 종료 {getSortIcon('reportEnd')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredData().map((item, index) => {
                                        return (
                                            <tr key={`${item.product}-${item.hospital}-${item.campaignName}`} className="chat-single-item">
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
                                                    <div className="text-dark fw-medium" style={{ 
                                                        maxWidth: '200px',
                                                        wordWrap: 'break-word',
                                                        wordBreak: 'break-word',
                                                        whiteSpace: 'pre-wrap',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {item.campaignName}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium">
                                                        {item.results.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium">
                                                        {item.reach.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium">
                                                        {item.impressions.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium">
                                                        {item.clicks.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium">
                                                        {formatDate(item.reportStart)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium">
                                                        {formatDate(item.reportEnd)}
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

export default TargetingAdsTable
