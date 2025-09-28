'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiExternalLink } from 'react-icons/fi'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const YouTubeSponsorAdCard = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const [campaignData, setCampaignData] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('ALL')
    const month = useSelectedMonthStore((state) => state.selectedMonth)

    useEffect(() => {
        if (!month) return
        const loadSponsorData = async () => {
            try {
                setLoading(true)
                
                const response = await fetch(withMonthParam('/api/data/youtube-sponsor', month))
                
                if (response.ok) {
                    const data = await response.json()
                    if (data.success) {
                        setCampaignData(data.campaigns || [])
                    }
                }
                
            } catch (error) {
                console.error('스폰서 광고 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadSponsorData()
    }, [month, refreshKey])

    const getFilteredData = () => {
        if (activeTab === 'ALL') return campaignData
        return campaignData.filter(item => item.product === activeTab)
    }

    if (isRemoved) return null;

    return (
        <div className="col-xxl-4">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <div className="card-header d-flex align-items-center justify-content-between">
                    <h5 className="card-title">YouTube 광고 캠페인</h5>
                    <div className="d-flex gap-2">
                        <button 
                            className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('ALL')}
                        >
                            전체
                        </button>
                        <button 
                            className={`btn btn-sm ${activeTab === '쿨페이즈' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('쿨페이즈')}
                        >
                            쿨페이즈
                        </button>
                        <button 
                            className={`btn btn-sm ${activeTab === '리프테라' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('리프테라')}
                        >
                            리프테라
                        </button>
                        <button 
                            className={`btn btn-sm ${activeTab === '쿨소닉' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('쿨소닉')}
                        >
                            쿨소닉
                        </button>
                    </div>
                </div>

                <div className="card-body custom-card-action p-0" style={{ height: '500px', overflow: 'hidden' }}>
                    {loading ? (
                        <CardLoader />
                    ) : (
                        <div className="table-responsive" style={{ height: '100%', overflow: 'auto' }}>
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr className="border-b">
                                        <th scope="row">순위</th>
                                        <th>제품</th>
                                        <th>캠페인</th>
                                        <th>CPV</th>
                                        <th>조회수</th>
                                        <th>광고</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredData().map((item, index) => (
                                        <tr key={`${item.product}-${item.campaign}-${index}`}>
                                            <td>
                                                <div className="fw-bold text-dark">
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-primary fs-11 px-2 py-1">
                                                    {item.product}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="fw-semibold text-dark fs-12" style={{ 
                                                    maxWidth: '250px',
                                                    wordWrap: 'break-word',
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'pre-wrap',
                                                    lineHeight: '1.3'
                                                }}>
                                                    {item.campaign?.replace(/^2508_/, '')}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-dark fw-semibold fs-12">₩{(item.cpv || 0).toLocaleString()}</div>
                                            </td>
                                            <td>
                                                <div className="text-dark fw-semibold fs-12">
                                                    {(item.views || 0).toLocaleString()}회
                                                </div>
                                            </td>
                                            <td className="align-middle text-center">
                                                <Link 
                                                    href={item.videoUrl || '#'} 
                                                    target="_blank"
                                                    className="fs-12 fw-medium text-primary text-decoration-none"
                                                    title="광고 영상 보기"
                                                >
                                                    보러가기 &gt;
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 요약 통계 */}
                {campaignData.length > 0 && (
                    <div className="card-footer bg-white border-top">
                        <div className="row text-center">
                            <div className="col-md-4">
                                <div className="fw-bold text-primary">
                                    {getFilteredData().length}개
                                </div>
                                <small className="text-muted">캠페인</small>
                            </div>
                            <div className="col-md-4">
                                <div className="fw-bold text-success">
                                    ₩{getFilteredData().reduce((sum, item) => sum + (item.cpv || 0), 0).toLocaleString()}
                                </div>
                                <small className="text-muted">총 CPV</small>
                            </div>
                            <div className="col-md-4">
                                <div className="fw-bold text-info">
                                    {getFilteredData().reduce((sum, item) => sum + (item.views || 0), 0).toLocaleString()}회
                                </div>
                                <small className="text-muted">총 조회</small>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default YouTubeSponsorAdCard
