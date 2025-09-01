'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const YouTubeHIFURankingChart = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const [hifuData, setHifuData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadHIFUData = async () => {
            try {
                setLoading(true)
                
                // HIFU 제품 데이터 로드 (기본 데이터로 시작)
                const defaultHIFUData = [
                    { product: '울쎄라', views: 910812, videos: 300, engagement: 0.830, sov: 14.23, company: '머츠', isAsterasys: false },
                    { product: '브이로', views: 494736, videos: 283, engagement: 1.544, sov: 7.73, company: '클래시테크', isAsterasys: false },
                    { product: '슈링크', views: 1150119, videos: 62, engagement: 0.895, sov: 17.97, company: '허쉬메드', isAsterasys: false },
                    { product: '쿨소닉', views: 20953, videos: 7, engagement: 1.045, sov: 0.33, company: 'Asterasys', isAsterasys: true },
                    { product: '리니어지', views: 746, videos: 3, engagement: 2.547, sov: 0.01, company: '클래시테크', isAsterasys: false },
                    { product: '리프테라', views: 1532, videos: 2, engagement: 0.653, sov: 0.02, company: 'Asterasys', isAsterasys: true },
                    { product: '텐쎄라', views: 993, videos: 2, engagement: 1.208, sov: 0.02, company: '휴온스', isAsterasys: false },
                    { product: '튠라이너', views: 0, videos: 0, engagement: 0.000, sov: 0.00, company: '알마', isAsterasys: false },
                    { product: '리니어펌', views: 0, videos: 0, engagement: 0.000, sov: 0.00, company: '클래시테크', isAsterasys: false }
                ]
                
                // 조회수 기준 정렬 (0은 제외)
                const sortedData = defaultHIFUData.filter(d => d.views > 0).sort((a, b) => b.views - a.views)
                setHifuData(sortedData)
                
            } catch (error) {
                console.error('HIFU 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadHIFUData()
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
                const product = hifuData[opts.dataPointIndex]?.product || ''
                const videos = hifuData[opts.dataPointIndex]?.videos || 0
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
            categories: hifuData.map(item => item.product),
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
        colors: hifuData.map(item => item.isAsterasys ? '#3b82f6' : '#e5e7eb'),
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 3
        },
        tooltip: {
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                const data = hifuData[dataPointIndex]
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
        data: hifuData.map(item => item.views)
    }]

    if (isRemoved) {
        return null;
    }

    return (
        <div className="col-xxl-6">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader 
                    title="HIFU (초음파) Top 제품 랭킹"
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
                                        <h6 className="text-muted mb-1">HIFU 카테고리 성과 (조회수 기준)</h6>
                                        <p className="small text-muted mb-0">
                                            총 {hifuData.reduce((sum, d) => sum + d.videos, 0)}개 비디오 • 
                                            {hifuData.reduce((sum, d) => sum + d.views, 0).toLocaleString()}회 조회
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
                                {hifuData.slice(0, 3).map((item, index) => (
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

export default YouTubeHIFURankingChart