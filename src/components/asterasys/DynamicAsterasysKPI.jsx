'use client'
import React from 'react'
import { FiMoreVertical } from 'react-icons/fi'
import { useMultipleAsterasysData } from '@/hooks/useAsterasysData'
import getIcon from '@/utils/getIcon'
import Link from 'next/link'

/**
 * 완전 동적 Asterasys KPI 컴포넌트
 * 실제 CSV 파일에서 실시간으로 데이터 로드
 * 파일명 기반 데이터 호출 시스템
 */

const DynamicAsterasysKPI = () => {
    // 핵심 CSV 파일들 동적 로드
    const { data: csvData, loading, error } = useMultipleAsterasysData([
        'blog_rank', 'cafe_rank', 'sale', 'blog_post', 'traffic'
    ])

    if (loading) {
        return (
            <div className="col-12">
                <div className="card stretch stretch-full">
                    <div className="card-body text-center p-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">실제 CSV 데이터 로딩 중...</p>
                        <small className="text-muted">파일명 기반 동적 데이터 로드</small>
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
                    <p className="mb-0 small">
                        호출 가능한 파일: blog_rank, cafe_rank, sale, blog_post, traffic
                    </p>
                </div>
            </div>
        )
    }

    // 실제 CSV 데이터에서 KPI 계산
    const calculateKPIs = () => {
        const blog = csvData?.blog_rank?.asterasysData || []
        const cafe = csvData?.cafe_rank?.asterasysData || []
        const sale = csvData?.sale?.asterasysData || []
        const blogPost = csvData?.blog_post?.asterasysData || []
        const traffic = csvData?.traffic?.asterasysData || []

        return [
            {
                id: 1,
                title: "블로그 콘텐츠 발행",
                total_number: blog.reduce((sum, item) => sum + (parseInt(item.발행량합) || 0), 0).toString(),
                progress: "100%",
                progress_info: blog.map(item => `${item.키워드}: ${item.발행량합}건`).join(' | '),
                context: `파일: blog_rank.csv • ${blog.length}개 제품`,
                icon: "feather-edit-3",
                color: "primary"
            },
            {
                id: 2,
                title: "카페 발행량",
                total_number: cafe.reduce((sum, item) => sum + (parseInt(item.총발행량) || 0), 0).toString(),
                progress: "100%",
                progress_info: cafe.map(item => `${item.키워드}: ${item.총발행량}건`).join(' | '),
                context: `파일: cafe_rank.csv • ${cafe.length}개 제품`,
                icon: "feather-message-circle",
                color: "success"
            },
            {
                id: 3,
                title: "월간 판매량",
                total_number: sale.reduce((sum, item) => sum + (parseInt(item['월간 판매량']?.toString().replace(/,/g, '')) || 0), 0).toString(),
                progress: "100%",
                progress_info: sale.map(item => `${item.키워드}: ${item['월간 판매량']}대`).join(' | '),
                context: `파일: sale.csv • ${sale.length}개 제품`,
                icon: "feather-shopping-cart",
                color: "warning"
            },
            {
                id: 4,
                title: "운영 블로그",
                total_number: blogPost.length.toString(),
                progress: "100%",
                progress_info: `8개 병원 운영`,
                context: `파일: blog_post.csv • ${blogPost.length}건`,
                icon: "feather-edit",
                color: "info"
            },
            {
                id: 5,
                title: "검색량",
                total_number: traffic.reduce((sum, item) => sum + (parseInt(item['월감 검색량']) || 0), 0).toString(),
                progress: "100%",
                progress_info: traffic.map(item => `${item.키워드}: ${item['월감 검색량']}`).join(' | '),
                context: `파일: traffic.csv • ${traffic.length}개 제품`,
                icon: "feather-search",
                color: "danger"
            }
        ]
    }

    const kpiData = calculateKPIs()

    return (
        <>
            {/* 동적 데이터 상태 표시 */}
            <div className="col-12 mb-3">
                <div className="alert alert-success border-0">
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <div className="spinner-grow spinner-grow-sm text-success" role="status">
                                <span className="visually-hidden">Live</span>
                            </div>
                        </div>
                        <div>
                            <strong>실시간 CSV 데이터 연동</strong> • 
                            파일명 호출: {Object.keys(csvData || {}).join(', ')}
                            <br />
                            <small className="text-muted">
                                마지막 업데이트: {new Date().toLocaleString('ko-KR')}
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* 동적 KPI 카드들 */}
            {kpiData.map(({ id, total_number, progress, progress_info, title, context, icon, color }) => (
                <div key={id} className="col-xxl col-md-6">
                    <div className="card stretch stretch-full short-info-card">
                        <div className="card-body">
                            <div className="d-flex align-items-start justify-content-between mb-4">
                                <div className="d-flex gap-4 align-items-center">
                                    <div className={`avatar-text avatar-lg bg-${color}-subtle text-${color} icon`}>
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
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <Link href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">
                                        {context}
                                    </Link>
                                </div>
                                <div className="small text-muted mb-2">
                                    {progress_info}
                                </div>
                                <div className="progress mt-2 ht-3">
                                    <div className={`progress-bar bg-${color}`} role="progressbar" style={{ width: progress }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

export default DynamicAsterasysKPI