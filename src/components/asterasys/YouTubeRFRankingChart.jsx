'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const YouTubeRFRankingChart = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const [rfData, setRfData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadRFData = async () => {
            try {
                setLoading(true)
                
                // RF 제품 데이터 로드 (기본 데이터로 시작)
                const defaultRFData = [
                    { product: '써마지', views: 1954651, videos: 262, engagement: 0.850, sov: 30.54, company: '썸', isAsterasys: false },
                    { product: '인모드', views: 151674, videos: 80, engagement: 1.390, sov: 2.37, company: '인바이오', isAsterasys: false },
                    { product: '덴서티', views: 499215, videos: 36, engagement: 0.657, sov: 7.80, company: '칸델라', isAsterasys: false },
                    { product: '올리지오', views: 58657, videos: 31, engagement: 1.872, sov: 0.92, company: '엘렉타', isAsterasys: false },
                    { product: '볼뉴머', views: 1022450, videos: 25, engagement: 0.031, sov: 15.98, company: '클래시테크', isAsterasys: false },
                    { product: '세르프', views: 109418, videos: 46, engagement: 0.867, sov: 1.71, company: '클레시스', isAsterasys: false },
                    { product: '텐써마', views: 15151, videos: 11, engagement: 0.990, sov: 0.24, company: '휴온스', isAsterasys: false },
                    { product: '튠페이스', views: 7026, videos: 7, engagement: 0.769, sov: 0.11, company: '알마', isAsterasys: false },
                    { product: '쿨페이즈', views: 1675, videos: 2, engagement: 0.179, sov: 0.03, company: 'Asterasys', isAsterasys: true }
                ]
                
                // 조회수 기준 정렬
                const sortedData = defaultRFData.sort((a, b) => b.views - a.views)
                setRfData(sortedData)
                
            } catch (error) {
                console.error('RF 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadRFData()
    }, [])

    const chartOptions = {
        chart: {
            type: 'bar',
            height: 400,
            toolbar: { show: false },
            background: 'transparent'
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function (val, opts) {
                const product = rfData[opts.dataPointIndex]?.product || ''
                const videos = rfData[opts.dataPointIndex]?.videos || 0
                return `${videos}개`
            },
            offsetX: 10,
            style: {
                fontSize: '11px',
                fontWeight: 'bold',
                colors: ['#fff']
            }
        },
        xaxis: {
            categories: rfData.map(item => item.product),
            labels: {
                formatter: function (val) {
                    return (val / 1000).toFixed(0) + 'K'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: '12px',
                    fontWeight: 'semibold'
                }
            }
        },
        colors: rfData.map(item => item.isAsterasys ? '#3b82f6' : '#e5e7eb'),
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 3
        },
        tooltip: {
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                const data = rfData[dataPointIndex]
                return `
                    <div class="custom-tooltip p-3">
                        <div class="fw-bold">${data.product}</div>
                        <div class="text-muted mb-2">${data.company}</div>
                        <div>조회수: ${data.views.toLocaleString()}회</div>
                        <div>비디오: ${data.videos}개</div>
                        <div>참여도: ${data.engagement.toFixed(2)}%</div>
                        <div>점유율: ${data.sov}%</div>
                    </div>
                `
            }
        }
    }

    const chartSeries = [{
        name: '조회수',
        data: rfData.map(item => item.views)
    }]

    if (isRemoved) {
        return null;
    }

    return (
        <div className="col-xxl-6">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader 
                    title="RF (고주파) Top 제품 랭킹"
                    refresh={handleRefresh}
                    remove={handleDelete}
                    expand={handleExpand}
                />

                <div className="card-body">
                    {loading ? (
                        <CardLoader />
                    ) : (
                        <>
                            <div className="mb-3">
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6 className="text-muted mb-1">RF 카테고리 성과 (조회수 기준)</h6>
                                        <p className="small text-muted mb-0">
                                            총 {rfData.reduce((sum, d) => sum + d.videos, 0)}개 비디오 • 
                                            {rfData.reduce((sum, d) => sum + d.views, 0).toLocaleString()}회 조회
                                        </p>
                                    </div>
                                    <div className="col-md-6 text-end">
                                        <div className="d-flex align-items-center justify-content-end gap-2">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary rounded-circle me-1" style={{width: '8px', height: '8px'}}></div>
                                                <small className="text-muted">Asterasys</small>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light border rounded-circle me-1" style={{width: '8px', height: '8px'}}></div>
                                                <small className="text-muted">경쟁사</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ReactApexChart
                                options={chartOptions}
                                series={chartSeries}
                                type="bar"
                                height={400}
                            />

                            {/* 상세 지표 */}
                            <div className="row mt-3 pt-3 border-top">
                                {rfData.slice(0, 3).map((item, index) => (
                                    <div key={item.product} className="col-md-4">
                                        <div className={`p-2 rounded ${item.isAsterasys ? 'bg-primary-subtle' : 'bg-light'}`}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className={`fw-bold ${item.isAsterasys ? 'text-primary' : 'text-dark'}`}>
                                                        {index + 1}위. {item.product}
                                                    </div>
                                                    <small className="text-muted">{item.company}</small>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-semibold">{(item.views / 1000).toFixed(0)}K</div>
                                                    <small className="text-muted">{item.videos}개</small>
                                                </div>
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-6">
                                                    <span className="badge bg-secondary fs-10">ER {item.engagement.toFixed(2)}%</span>
                                                </div>
                                                <div className="col-6">
                                                    <span className="badge bg-info fs-10">SOV {item.sov}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default YouTubeRFRankingChart