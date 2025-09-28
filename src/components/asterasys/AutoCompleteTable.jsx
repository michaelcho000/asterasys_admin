'use client'
import React, { useState, useEffect } from 'react'
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const AutoCompleteTable = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()
    const [autoCompleteData, setAutoCompleteData] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState('ALL')
    const [sortBy, setSortBy] = useState('product')
    const [sortOrder, setSortOrder] = useState('asc')
    const month = useSelectedMonthStore((state) => state.selectedMonth)

    useEffect(() => {
        if (!month) return
        const loadAutoCompleteData = async () => {
            try {
                setLoading(true)
                
                const response = await fetch(withMonthParam('/api/data/auto-complete', month))
                
                if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.autoCompleteData) {
                        console.log('Loaded auto complete data:', data.autoCompleteData.length, data.autoCompleteData)
                        setAutoCompleteData(data.autoCompleteData)
                    }
                } else {
                    console.error('API 응답 실패:', response.status)
                }
                
            } catch (error) {
                console.error('자동완성 작업 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadAutoCompleteData()
    }, [month, refreshKey])

    const getFilteredData = () => {
        let filtered = activeFilter === 'ALL' ? [...autoCompleteData] : 
                      autoCompleteData.filter(item => item.product === activeFilter)
        
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

    const uniqueProducts = [...new Set(autoCompleteData.map(item => item.product))].sort()

    if (isRemoved) {
        return null
    }

    return (
        <div className="col-xxl-12">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <div className="card-header d-flex align-items-center justify-content-between">
                    <h5 className="card-title">자동완성 작업 현황</h5>
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
                                            onClick={() => handleSort('keyword')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            자동완성 작업키워드 {getSortIcon('keyword')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredData().map((item, index) => {
                                        return (
                                            <tr key={`${item.product}-${item.keyword}-${index}`} className="chat-single-item">
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
                                                    <div className="text-dark fw-medium" style={{ 
                                                        maxWidth: '600px',
                                                        wordWrap: 'break-word',
                                                        wordBreak: 'break-word',
                                                        whiteSpace: 'pre-wrap',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {item.keyword}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {getFilteredData().length === 0 && !loading && (
                                <div className="text-center py-4">
                                    <p className="text-muted">표시할 데이터가 없습니다.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AutoCompleteTable
