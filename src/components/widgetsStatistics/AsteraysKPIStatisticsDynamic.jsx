'use client'
import React, { useEffect, useState } from 'react'
import { FiMoreVertical } from 'react-icons/fi'
import getIcon from '@/utils/getIcon'
import Link from 'next/link'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

/**
 * Asterasys KPI Statistics - 동적 데이터 로딩
 * API 기반으로 처리된 데이터를 불러와서 표시
 * 토큰 효율적이고 실시간 데이터 반영 가능
 */

const AsteraysKPIStatisticsDynamic = () => {
    const [kpiData, setKpiData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const month = useSelectedMonthStore((state) => state.selectedMonth)

    useEffect(() => {
        if (!month) return
        const fetchKPIData = async () => {
            try {
                setLoading(true)
                const response = await fetch(withMonthParam('/api/data/kpis', month))
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`)
                }
                
                const result = await response.json()
                
                // API 데이터를 컴포넌트 형식으로 변환
                const formattedData = [
                    {
                        id: 1,
                        title: "전체 시장 규모",
                        total_number: result.overview.totalMarketPosts.toLocaleString(),
                        progress: "100%",
                        progress_info: `RF: ${result.categories.rf.totalPosts}건 | HIFU: ${result.categories.hifu.totalPosts}건`,
                        icon: "feather-bar-chart-2"
                    },
                    {
                        id: 2,
                        title: "Asterasys 시장 점유율",
                        total_number: result.overview.asterasysMarketShare.toFixed(1) + "%",
                        progress: result.overview.asterasysMarketShare.toFixed(0) + "%",
                        progress_info: `총 ${Math.round(result.overview.totalMarketPosts * result.overview.asterasysMarketShare / 100)}건`,
                        icon: "feather-target"
                    },
                    {
                        id: 3,
                        title: "평균 참여도",
                        total_number: result.overview.avgEngagement.toFixed(1),
                        progress: Math.min(result.overview.avgEngagement * 10, 100).toFixed(0) + "%",
                        progress_info: "댓글/게시물 비율",
                        icon: "feather-message-circle"
                    },
                    {
                        id: 4,
                        title: "판매 점유율",
                        total_number: result.overview.asterasysSalesShare.toFixed(1) + "%",
                        progress: result.overview.asterasysSalesShare.toFixed(0) + "%",
                        progress_info: `총 ${Math.round(result.overview.totalMarketSales * result.overview.asterasysSalesShare / 100)}대`,
                        icon: "feather-shopping-cart"
                    }
                ]
                
                setKpiData(formattedData)
                setError(null)
            } catch (err) {
                console.error('Failed to fetch KPI data:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchKPIData()
    }, [month])

    if (loading) {
        return (
            <div className="col-12">
                <div className="card stretch stretch-full">
                    <div className="card-body text-center p-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">실제 CSV 데이터 로딩 중...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="col-12">
                <div className="alert alert-danger">
                    <h6 className="alert-heading">데이터 로드 실패</h6>
                    <p className="mb-0">{error}</p>
                    <hr />
                    <p className="mb-0 small">npm run process-data를 실행하여 데이터를 처리해주세요.</p>
                </div>
            </div>
        )
    }

    return (
        <>
            {kpiData.map(({ id, total_number, progress, progress_info, title, icon }) => (
                <div key={id} className="col-xxl col-md-6">
                    <div className="card stretch stretch-full short-info-card">
                        <div className="card-body">
                            <div className="d-flex align-items-start justify-content-between mb-4">
                                <div className="d-flex gap-4 align-items-center">
                                    <div className="avatar-text avatar-lg bg-primary-subtle text-primary icon">
                                        {React.cloneElement(getIcon(icon), { size: "16" })}
                                    </div>
                                    <div>
                                        <div className="fs-4 fw-bold text-dark">
                                            <span className="counter">{total_number}</span>
                                        </div>
                                        <h3 className="fs-13 fw-semibold text-truncate-1-line">{title}</h3>
                                    </div>
                                </div>
                                <Link href="#" className="lh-1">
                                    <FiMoreVertical className='fs-16' />
                                </Link>
                            </div>
                            <div className="pt-4">
                                <div className="d-flex align-items-center justify-content-between">
                                    <Link href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">
                                        {month ? `${month} 기준 데이터` : '데이터 준비 중'}
                                    </Link>
                                    <div className="w-100 text-end">
                                        <span className="fs-12 text-dark">{progress_info}</span>
                                    </div>
                                </div>
                                <div className="progress mt-2 ht-3">
                                    <div className={`progress-bar bg-primary`} role="progressbar" style={{ width: progress }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

export default AsteraysKPIStatisticsDynamic
