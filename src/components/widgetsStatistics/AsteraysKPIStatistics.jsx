'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { FiMoreVertical, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import getIcon from '@/utils/getIcon'
import Link from 'next/link'
import CardLoader from '@/components/shared/CardLoader'
import { KPICalculations } from '../../../config/calculations.config.js'
import { formatNumber } from '@/utils/formatNumber'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

/**
 * Asterasys Marketing KPI Statistics Component
 * Duralux 템플릿 기반 + 실제 CSV 데이터 통합
 * 데이터 출처: 2025년 8월 실제 CSV 파일
 */

const formatMonthLabel = (month) => {
    if (!month) return '데이터 준비 중'
    const [year, monthPart] = month.split('-')
    return `${year}년 ${parseInt(monthPart, 10)}월`
}

const AsteraysKPIStatistics = () => {
    const [activeDropdown, setActiveDropdown] = useState(null)
    const [kpiData, setKpiData] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState('')
    const month = useSelectedMonthStore((state) => state.selectedMonth)
    const monthLabel = useMemo(() => formatMonthLabel(month), [month])

    // 이전 월 계산 헬퍼 함수
    const getPreviousMonth = (currentMonth) => {
        if (!currentMonth) return null
        const [year, month] = currentMonth.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1, 1)
        date.setMonth(date.getMonth() - 1)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }

    // 데이터 로드 함수를 별도로 정의하여 재사용 가능하게 만듦
    const loadKPIData = async (selectedMonth) => {
            if (!selectedMonth) {
                setKpiData([])
                setLoading(false)
                return
            }
            try {
                setLoading(true)

                // 5개 CSV 파일 동시 로드
                // 캐시 무효화를 위해 timestamp 추가 및 fetch 옵션 설정
                const timestamp = Date.now()
                const fetchOptions = {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                }

                // 이전 월 계산
                const previousMonth = getPreviousMonth(selectedMonth)

                // 현재 월 데이터 로드
                const [blogResponse, cafeResponse, newsResponse, trafficResponse, saleResponse] = await Promise.all([
                    fetch(withMonthParam(`/api/data/files/blog_rank?t=${timestamp}`, selectedMonth), fetchOptions),
                    fetch(withMonthParam(`/api/data/files/cafe_rank?t=${timestamp}`, selectedMonth), fetchOptions),
                    fetch(withMonthParam(`/api/data/files/news_rank?t=${timestamp}`, selectedMonth), fetchOptions),
                    fetch(withMonthParam(`/api/data/files/traffic?t=${timestamp}`, selectedMonth), fetchOptions),
                    fetch(withMonthParam(`/api/data/files/sale?t=${timestamp}`, selectedMonth), fetchOptions)
                ])

                const [blogData, cafeData, newsData, trafficData, saleData] = await Promise.all([
                    blogResponse.json(),
                    cafeResponse.json(),
                    newsResponse.json(),
                    trafficResponse.json(),
                    saleResponse.json()
                ])

                // 이전 월 데이터 로드 (있는 경우)
                let prevBlogData = null, prevCafeData = null, prevNewsData = null, prevTrafficData = null, prevSaleData = null

                if (previousMonth) {
                    try {
                        const [prevBlogRes, prevCafeRes, prevNewsRes, prevTrafficRes, prevSaleRes] = await Promise.all([
                            fetch(withMonthParam(`/api/data/files/blog_rank?t=${timestamp}`, previousMonth), { ...fetchOptions, signal: AbortSignal.timeout(3000) }),
                            fetch(withMonthParam(`/api/data/files/cafe_rank?t=${timestamp}`, previousMonth), { ...fetchOptions, signal: AbortSignal.timeout(3000) }),
                            fetch(withMonthParam(`/api/data/files/news_rank?t=${timestamp}`, previousMonth), { ...fetchOptions, signal: AbortSignal.timeout(3000) }),
                            fetch(withMonthParam(`/api/data/files/traffic?t=${timestamp}`, previousMonth), { ...fetchOptions, signal: AbortSignal.timeout(3000) }),
                            fetch(withMonthParam(`/api/data/files/sale?t=${timestamp}`, previousMonth), { ...fetchOptions, signal: AbortSignal.timeout(3000) })
                        ])

                        if (prevBlogRes.ok) prevBlogData = await prevBlogRes.json()
                        if (prevCafeRes.ok) prevCafeData = await prevCafeRes.json()
                        if (prevNewsRes.ok) prevNewsData = await prevNewsRes.json()
                        if (prevTrafficRes.ok) prevTrafficData = await prevTrafficRes.json()
                        if (prevSaleRes.ok) prevSaleData = await prevSaleRes.json()
                    } catch (prevError) {
                        console.warn('이전 월 데이터 로드 실패 (정상 동작):', prevError.message)
                    }
                }

                // KPI 데이터 실시간 계산 (이전 월 데이터 포함)
                const calculatedKPI = calculateKPIFromCSV(
                    blogData, cafeData, newsData, trafficData, saleData,
                    prevBlogData, prevCafeData, prevNewsData, prevTrafficData, prevSaleData
                )

                setKpiData(calculatedKPI)
                const labelForUpdate = formatMonthLabel(selectedMonth)
                setLastUpdated(`${labelForUpdate} • ${new Date().toLocaleTimeString()}`)

            } catch (error) {
                console.error('KPI 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
    }
    
    // 컴포넌트 마운트 시 및 새로고침 시 데이터 로드
    useEffect(() => {
        loadKPIData(month)
    }, [month])

    const calculateKPIFromCSV = (blogData, cafeData, newsData, trafficData, saleData, prevBlogData, prevCafeData, prevNewsData, prevTrafficData, prevSaleData) => {
        // Use centralized calculation functions with previous month data
        const blogMetrics = KPICalculations.blogPublish(
            blogData.marketData || [],
            prevBlogData?.marketData || null
        )
        const cafeMetrics = KPICalculations.cafePublish(
            cafeData.marketData || [],
            prevCafeData?.marketData || null
        )
        const newsMetrics = KPICalculations.newsPublish(
            newsData.marketData || [],
            prevNewsData?.marketData || null
        )
        const trafficMetrics = KPICalculations.searchVolume(
            trafficData.marketData || [],
            prevTrafficData?.marketData || null
        )
        const saleMetrics = KPICalculations.salesVolume(
            saleData.marketData || [],
            prevSaleData?.marketData || null
        )

        return [
            {
                id: 1,
                title: "블로그 발행량",
                total_number: formatNumber(blogMetrics.asterasysTotal),
                progress: blogMetrics.percentage + "%",
                progress_info: "실시간 CSV 데이터 기반",
                context: blogMetrics.context,
                icon: "feather-edit-3",
                color: "primary",
                trend: blogMetrics.trend,
                changePercent: blogMetrics.changePercent
            },
            {
                id: 2,
                title: "카페 발행량",
                total_number: formatNumber(cafeMetrics.asterasysTotal),
                progress: cafeMetrics.percentage + "%",
                progress_info: "실시간 CSV 데이터 기반",
                context: cafeMetrics.context,
                icon: "feather-message-circle",
                color: "success",
                trend: cafeMetrics.trend,
                changePercent: cafeMetrics.changePercent
            },
            {
                id: 3,
                title: "뉴스 발행량",
                total_number: formatNumber(newsMetrics.asterasysTotal),
                progress: newsMetrics.percentage + "%",
                progress_info: "실시간 CSV 데이터 기반",
                context: newsMetrics.context,
                icon: "feather-file-text",
                color: "info",
                trend: newsMetrics.trend,
                changePercent: newsMetrics.changePercent
            },
            {
                id: 4,
                title: "검색량",
                total_number: formatNumber(trafficMetrics.asterasysTotal),
                progress: trafficMetrics.percentage + "%",
                progress_info: "실시간 CSV 데이터 기반",
                context: trafficMetrics.context,
                icon: "feather-search",
                color: "warning",
                trend: trafficMetrics.trend,
                changePercent: trafficMetrics.changePercent
            },
            {
                id: 5,
                title: "판매량",
                total_number: formatNumber(saleMetrics.asterasysTotal),
                progress: saleMetrics.percentage + "%",
                progress_info: "실시간 CSV 데이터 기반",
                context: saleMetrics.context,
                icon: "feather-shopping-cart",
                color: "danger",
                trend: saleMetrics.trend,
                changeInUnits: saleMetrics.changeInUnits,
                isSalesCard: true
            }
        ]
    }

    const toggleDropdown = (id) => {
        setActiveDropdown(activeDropdown === id ? null : id)
    }
    return (
        <>
            
            {loading ? (
                <div className="col-12">
                    <CardLoader />
                </div>
            ) : (
                kpiData.map(({ id, total_number, progress, progress_info, title, context, icon, color, trend, changePercent, changeInUnits, isSalesCard }) => (
                    <div key={id} className="col-xxl col-md-6 position-relative">
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
                                    <div className="position-relative">
                                        <button
                                            className="btn btn-sm p-1 lh-1"
                                            onClick={() => toggleDropdown(id)}
                                        >
                                            <FiMoreVertical className='fs-16' />
                                        </button>
                                        {activeDropdown === id && (
                                            <div className="position-absolute top-100 end-0 mt-2 bg-white shadow-lg rounded p-3 border" style={{ minWidth: '200px', zIndex: 1000 }}>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {progress_info.split(' | ').map((info, index) => (
                                                        <span key={index} className="badge bg-light text-dark fs-11 border">
                                                            {info}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <Link href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">{context}</Link>
                                    </div>
                                    <div className="progress mt-2 ht-3">
                                        <div className={`progress-bar bg-${color}`} role="progressbar" style={{ width: progress }}></div>
                                    </div>
                                    {/* Month-over-Month Badge */}
                                    {trend && trend !== 'neutral' && (
                                        <div className="hstack gap-2 mt-3 justify-content-end">
                                            <span className="fs-11 text-muted">전월대비</span>
                                            <span className={`badge ${trend === 'up' ? 'bg-success' : 'bg-danger'} text-white fs-11`}>
                                                <i className="fs-12 me-1">
                                                    {trend === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
                                                </i>
                                                {isSalesCard ? (
                                                    <span>{changeInUnits > 0 ? '+' : ''}{changeInUnits}대</span>
                                                ) : (
                                                    <span>{changePercent > 0 ? '+' : ''}{changePercent}%</span>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </>
    )
}

export default AsteraysKPIStatistics
