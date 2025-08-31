'use client'
import React, { useState, useEffect } from 'react'
import { FiMoreVertical } from 'react-icons/fi'
import getIcon from '@/utils/getIcon'
import Link from 'next/link'
import CardLoader from '@/components/shared/CardLoader'

/**
 * Asterasys Marketing KPI Statistics Component
 * Duralux 템플릿 기반 + 실제 CSV 데이터 통합
 * 데이터 출처: 2025년 8월 실제 CSV 파일
 */

const AsteraysKPIStatistics = () => {
    const [activeDropdown, setActiveDropdown] = useState(null)
    const [kpiData, setKpiData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadKPIData = async () => {
            try {
                setLoading(true)
                
                // 5개 CSV 파일 동시 로드
                const [blogResponse, cafeResponse, newsResponse, trafficResponse, saleResponse] = await Promise.all([
                    fetch('/api/data/files/blog_rank'),
                    fetch('/api/data/files/cafe_rank'),
                    fetch('/api/data/files/news_rank'),
                    fetch('/api/data/files/traffic'),
                    fetch('/api/data/files/sale')
                ])
                
                const [blogData, cafeData, newsData, trafficData, saleData] = await Promise.all([
                    blogResponse.json(),
                    cafeResponse.json(), 
                    newsResponse.json(),
                    trafficResponse.json(),
                    saleResponse.json()
                ])
                
                // KPI 데이터 실시간 계산
                const calculatedKPI = calculateKPIFromCSV(blogData, cafeData, newsData, trafficData, saleData)
                setKpiData(calculatedKPI)
                
            } catch (error) {
                console.error('KPI 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadKPIData()
    }, [])

    const calculateKPIFromCSV = (blogData, cafeData, newsData, trafficData, saleData) => {
        // Asterasys 제품 식별
        const asterasysProducts = ['쿨페이즈', '리프테라', '쿨소닉']
        
        // 각 채널별 Asterasys 합계 계산
        const blogTotal = blogData.asterasysData?.reduce((sum, item) => 
            sum + (parseInt(item['발행량합']) || 0), 0) || 0
        const cafeTotal = cafeData.asterasysData?.reduce((sum, item) => 
            sum + (parseInt(item['총 발행량']) || 0), 0) || 0
        const newsTotal = newsData.asterasysData?.reduce((sum, item) => 
            sum + (parseInt(item['총 발행량']) || 0), 0) || 0
        const trafficTotal = trafficData.asterasysData?.reduce((sum, item) => 
            sum + (parseInt(item['월감 검색량']) || 0), 0) || 0
        const saleTotal = saleData.asterasysData?.reduce((sum, item) => 
            sum + (parseInt(item['판매량']) || 0), 0) || 0
            
        // 전체 시장 합계 계산
        const blogMarketTotal = blogData.marketData?.reduce((sum, item) => 
            sum + (parseInt(item['발행량합']) || 0), 0) || 1
        const cafeMarketTotal = cafeData.marketData?.reduce((sum, item) => 
            sum + (parseInt(item['총 발행량']) || 0), 0) || 1
        const newsMarketTotal = newsData.marketData?.reduce((sum, item) => 
            sum + (parseInt(item['총 발행량']) || 0), 0) || 1
        const trafficMarketTotal = trafficData.marketData?.reduce((sum, item) => 
            sum + (parseInt(item['월감 검색량']) || 0), 0) || 1
        const saleMarketTotal = saleData.marketData?.reduce((sum, item) => 
            sum + (parseInt(item['판매량']) || 0), 0) || 1

        return [
            {
                id: 1,
                title: "블로그 발행량",
                total_number: blogTotal.toString(),
                progress: ((blogTotal / blogMarketTotal) * 100).toFixed(1) + "%",
                progress_info: "실시간 CSV 데이터 기반",
                context: `전체 블로그 대비 ${((blogTotal / blogMarketTotal) * 100).toFixed(1)}% (${blogTotal}/${blogMarketTotal}건)`,
                icon: "feather-edit-3",
                color: "primary"
            },
            {
                id: 2,
                title: "카페 발행량", 
                total_number: cafeTotal.toString(),
                progress: ((cafeTotal / cafeMarketTotal) * 100).toFixed(1) + "%",
                progress_info: "실시간 CSV 데이터 기반",
                context: `전체 카페 대비 ${((cafeTotal / cafeMarketTotal) * 100).toFixed(1)}% (${cafeTotal}/${cafeMarketTotal}건)`,
                icon: "feather-message-circle",
                color: "success"
            },
            {
                id: 3,
                title: "뉴스 발행량",
                total_number: newsTotal.toString(),
                progress: ((newsTotal / newsMarketTotal) * 100).toFixed(1) + "%", 
                progress_info: "실시간 CSV 데이터 기반",
                context: `전체 뉴스 대비 ${((newsTotal / newsMarketTotal) * 100).toFixed(1)}% (${newsTotal}/${newsMarketTotal}건)`,
                icon: "feather-file-text",
                color: "info"
            },
            {
                id: 4,
                title: "검색량",
                total_number: trafficTotal.toString(),
                progress: ((trafficTotal / trafficMarketTotal) * 100).toFixed(1) + "%",
                progress_info: "실시간 CSV 데이터 기반", 
                context: `전체 검색 대비 ${((trafficTotal / trafficMarketTotal) * 100).toFixed(1)}% (${trafficTotal}/${trafficMarketTotal}회)`,
                icon: "feather-search",
                color: "warning"
            },
            {
                id: 5,
                title: "판매량",
                total_number: saleTotal.toString(),
                progress: ((saleTotal / saleMarketTotal) * 100).toFixed(1) + "%",
                progress_info: "실시간 CSV 데이터 기반",
                context: `전체 시장 대비 ${((saleTotal / saleMarketTotal) * 100).toFixed(1)}% (${saleTotal}/${saleMarketTotal}대)`,
                icon: "feather-shopping-cart", 
                color: "danger"
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
                kpiData.map(({ id, total_number, progress, progress_info, title, context, icon, color }) => (
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