'use client'
import React, { useState, useEffect } from 'react'
import CardHeader from '@/components/shared/CardHeader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import CardLoader from '@/components/shared/CardLoader';
import dynamic from 'next/dynamic'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const YouTubeSalesCorrelationChart = () => {
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [correlationData, setCorrelationData] = useState(null)
    const [loading, setLoading] = useState(true)
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

    useEffect(() => {
        const loadCorrelationData = async () => {
            try {
                setLoading(true)
                
                // YouTube vs Sales 상관관계 데이터 로드
                const response = await fetch('/api/data/youtube-sales-correlation')
                
                if (response.ok) {
                    const data = await response.json()
                    if (data.success) {
                        const processedData = processCorrelationData(data)
                        setCorrelationData(processedData)
                    }
                }
                
            } catch (error) {
                console.error('상관관계 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadCorrelationData()
    }, [])

    const processCorrelationData = (data) => {
        // API에서 받은 카테고리별 데이터 사용
        return {
            ALL: data.categories?.ALL || [],
            RF: data.categories?.RF || [],
            HIFU: data.categories?.HIFU || []
        }
    }

    const toggleCategory = (category) => {
        setActiveCategory(category);
    }

    const getCurrentData = () => {
        return correlationData ? correlationData[activeCategory] || [] : []
    }

    const getDynamicChartOptions = () => {
        const currentData = getCurrentData()
        
        return {
            chart: {
                type: 'line',
                height: 377,
                toolbar: { show: false }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    borderRadius: 4,
                    borderRadiusApplication: 'end',
                    columnWidth: '60%'
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: [0, 0, 3],
                curve: 'smooth',
                colors: ['transparent', 'transparent', '#ef4444']
            },
            xaxis: {
                categories: currentData.map(product => product.product),
                labels: {
                    style: {
                        colors: currentData.map(product => product.isAsterasys ? '#3b82f6' : '#64748b'),
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500
                    }
                },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: [
                {
                    title: {
                        text: '판매량 (대) / YouTube 조회수 (천회)',
                        style: { fontSize: '12px' }
                    },
                    labels: {
                        style: {
                            colors: '#64748b',
                            fontSize: '12px',
                            fontFamily: 'Inter, sans-serif'
                        },
                        formatter: function (val) {
                            return Math.floor(val).toLocaleString();
                        }
                    }
                },
                {
                    opposite: true,
                    title: {
                        text: '효율성 지수 (조회수 1K당 판매량)',
                        style: { fontSize: '12px' }
                    },
                    labels: {
                        formatter: function (val) {
                            return val.toFixed(1);
                        }
                    }
                }
            ],
            series: [
                {
                    name: '누적 판매량',
                    data: currentData.map(product => product.sales),
                    type: 'bar',
                    yAxisIndex: 0
                },
                {
                    name: 'YouTube 종합성과', 
                    data: currentData.map(product => Math.round(product.youtubeScore / 10)), // 10으로 나누어 스케일 조정
                    type: 'bar',
                    yAxisIndex: 0
                },
                {
                    name: '효율성 지수',
                    data: currentData.map(product => parseFloat(product.efficiency)),
                    type: 'line',
                    yAxisIndex: 1
                }
            ],
            colors: ['#3b82f6', '#10b981', '#ef4444'],
            fill: {
                opacity: [0.85, 0.85, 0.1]
            },
            markers: {
                size: [0, 0, 6],
                colors: ['', '', '#ef4444'],
                strokeColors: ['', '', '#ffffff'],
                strokeWidth: [0, 0, 2],
                hover: {
                    size: [0, 0, 8]
                }
            },
            tooltip: {
                theme: 'light',
                style: {
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif'
                },
                y: {
                    formatter: function (val, opts) {
                        const seriesIndex = opts.seriesIndex;
                        if (seriesIndex === 0) return val.toLocaleString() + '대';
                        if (seriesIndex === 1) return (val * 10).toLocaleString() + '점';
                        if (seriesIndex === 2) return val + '점';
                        return val;
                    }
                }
            },
            legend: {
                show: false
            },
            grid: {
                show: true,
                borderColor: '#f1f5f9',
                strokeDashArray: 0,
                position: 'back',
                xaxis: { lines: { show: false } },
                yaxis: { lines: { show: true } },
                padding: { top: 0, right: 0, bottom: 0, left: 20 }
            }
        }
    }

    // Asterasys 통계 계산
    const getAsterasysStats = (category) => {
        const currentData = getCurrentData()
        const asterasysProducts = currentData.filter(p => p.isAsterasys)
        
        if (asterasysProducts.length === 0) return { avgEfficiency: '0.0', totalSales: '0', rank: 'N/A' }
        
        const avgEfficiency = (asterasysProducts.reduce((sum, p) => sum + parseFloat(p.efficiency), 0) / asterasysProducts.length).toFixed(1)
        const totalSales = asterasysProducts.reduce((sum, p) => sum + p.sales, 0)
        
        // 순위 계산 (효율성 기준)
        const sortedByEfficiency = currentData.sort((a, b) => parseFloat(b.efficiency) - parseFloat(a.efficiency))
        const asterasysRanks = asterasysProducts.map(p => {
            return sortedByEfficiency.findIndex(item => item.product === p.product) + 1
        })
        
        return {
            avgEfficiency,
            totalSales: totalSales.toLocaleString(),
            rank: asterasysRanks.join('위/')+'위'
        }
    }

    if (isRemoved) {
        return null;
    }

    const asterasysStats = getAsterasysStats(activeCategory)
    const currentData = getCurrentData()

    return (
        <div className="col-xxl-8">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <div className="card-header d-flex align-items-center justify-content-between">
                    <h5 className="card-title">YouTube 성과 및 판매량 상관관계</h5>
                    <div className="d-flex gap-2">
                        <button 
                            className={`btn btn-sm ${activeCategory === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => toggleCategory('ALL')}
                        >
                            전체
                        </button>
                        <button 
                            className={`btn btn-sm ${activeCategory === 'RF' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => toggleCategory('RF')}
                        >
                            RF
                        </button>
                        <button 
                            className={`btn btn-sm ${activeCategory === 'HIFU' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => toggleCategory('HIFU')}
                        >
                            HIFU
                        </button>
                    </div>
                </div>
                <div className="card-body custom-card-action">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <p className="fs-12 text-muted mb-0">
                                누적 판매량 • 8월 YouTube 조회수 • 마케팅 효율성 비교
                            </p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center gap-1">
                                <div className="rounded-circle bg-primary" style={{width: '8px', height: '8px'}}></div>
                                <span className="fs-12 text-muted">누적 판매량</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <div className="rounded-circle bg-success" style={{width: '8px', height: '8px'}}></div>
                                <span className="fs-12 text-muted">YouTube 종합성과</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <div className="rounded-circle bg-danger" style={{width: '8px', height: '8px'}}></div>
                                <span className="fs-12 text-muted">효율성 지수</span>
                            </div>
                        </div>
                    </div>
                    {loading || !correlationData ? (
                        <CardLoader />
                    ) : (
                        <ReactApexChart
                            options={getDynamicChartOptions()}
                            series={getDynamicChartOptions().series}
                            type="line"
                            height={377}
                        />
                    )}
                    <div className="d-none d-md-flex flex-wrap pt-4 border-top">
                        <div className="flex-fill">
                            <p className="fs-11 fw-medium text-uppercase text-muted mb-2">Asterasys 평균 효율성</p>
                            <h2 className="fs-20 fw-bold mb-0">{asterasysStats.avgEfficiency}회/대</h2>
                        </div>
                        <div className="vr mx-4 text-gray-600" />
                        <div className="flex-fill">
                            <p className="fs-11 fw-medium text-uppercase text-muted mb-2">분석 제품수</p>
                            <h2 className="fs-20 fw-bold mb-0">{currentData.length}개</h2>
                        </div>
                        <div className="vr mx-4 text-gray-600" />
                        <div className="flex-fill">
                            <p className="fs-11 fw-medium text-uppercase text-muted mb-2">Asterasys 순위</p>
                            <h2 className="fs-20 fw-bold mb-0">{asterasysStats.rank}</h2>
                        </div>
                    </div>
                </div>

                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default YouTubeSalesCorrelationChart