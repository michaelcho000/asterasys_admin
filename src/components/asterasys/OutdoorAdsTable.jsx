'use client'
import React, { useState, useEffect } from 'react'
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const OutdoorAdsTable = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()
    const [outdoorAdsData, setOutdoorAdsData] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState('ALL')
    const [sortBy, setSortBy] = useState('region')
    const [sortOrder, setSortOrder] = useState('asc')
    const month = useSelectedMonthStore((state) => state.selectedMonth)

    useEffect(() => {
        if (!month) return
        const loadOutdoorAdsData = async () => {
            try {
                setLoading(true)
                
                const response = await fetch(withMonthParam('/api/data/outdoor-ads', month))
                
                if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.outdoorAdsData) {
                        console.log('Loaded outdoor ads data:', data.outdoorAdsData.length, data.outdoorAdsData)
                        setOutdoorAdsData(data.outdoorAdsData)
                    }
                } else {
                    console.error('API 응답 실패:', response.status)
                }
                
            } catch (error) {
                console.error('옥외 광고 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadOutdoorAdsData()
    }, [month, refreshKey])

    const getFilteredData = () => {
        let filtered = activeFilter === 'ALL' ? [...outdoorAdsData] : 
                      outdoorAdsData.filter(item => item.product === activeFilter)
        
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
            setSortOrder('asc')
        }
    }

    const getSortIcon = (field) => {
        if (sortBy !== field) return null
        return sortOrder === 'desc' ? 
            <FiChevronDown className="text-primary ms-1" size={14} /> : 
            <FiChevronUp className="text-primary ms-1" size={14} />
    }

    const uniqueProducts = [...new Set(outdoorAdsData.map(item => item.product))].sort()

    if (isRemoved) {
        return null
    }

    return (
        <div className="col-xxl-12">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <div className="card-header d-flex align-items-center justify-content-between">
                    <h5 className="card-title">옥외 광고 현황</h5>
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
                                            onClick={() => handleSort('region')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            지역 {getSortIcon('region')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('mediaName')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            매체명 {getSortIcon('mediaName')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('mediaLocation')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            매체 위치 {getSortIcon('mediaLocation')}
                                        </th>
                                        <th
                                            className="sortable"
                                            onClick={() => handleSort('mediaType')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            매체 유형 {getSortIcon('mediaType')}
                                        </th>
                                        <th
                                            className="sortable"
                                            onClick={() => handleSort('quantity')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            수량 {getSortIcon('quantity')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('dailyBroadcast')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            1일 송출횟수 {getSortIcon('dailyBroadcast')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('period')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            기간 {getSortIcon('period')}
                                        </th>
                                        <th 
                                            className="sortable" 
                                            onClick={() => handleSort('adPeriod')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            광고기간 {getSortIcon('adPeriod')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredData().map((item, index) => {
                                        return (
                                            <tr key={`${item.product}-${item.region}-${item.mediaName}-${index}`} className="chat-single-item">
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
                                                        {item.region}
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
                                                        {item.mediaName}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium" style={{ 
                                                        maxWidth: '250px',
                                                        wordWrap: 'break-word',
                                                        wordBreak: 'break-word',
                                                        whiteSpace: 'pre-wrap',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {item.mediaLocation}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium">
                                                        {item.mediaType}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium" style={{
                                                        maxWidth: '100px',
                                                        wordWrap: 'break-word',
                                                        wordBreak: 'break-word',
                                                        whiteSpace: 'pre-wrap',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {item.quantity}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium" style={{ 
                                                        maxWidth: '120px',
                                                        wordWrap: 'break-word',
                                                        wordBreak: 'break-word',
                                                        whiteSpace: 'pre-wrap',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {item.dailyBroadcast}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium">
                                                        {item.period}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-dark fw-medium">
                                                        {item.adPeriod}
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

export default OutdoorAdsTable
