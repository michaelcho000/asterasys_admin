'use client'
import React, { useState, useEffect } from 'react'
import CardHeader from '@/components/shared/CardHeader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import CardLoader from '@/components/shared/CardLoader';
import dynamic from 'next/dynamic'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const YouTubeSalesCorrelationChart = () => {
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [correlationData, setCorrelationData] = useState(null)
    const [loading, setLoading] = useState(true)
    const month = useSelectedMonthStore((state) => state.selectedMonth)
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

    useEffect(() => {
        if (!month) return
        const loadCorrelationData = async () => {
            try {
                setLoading(true)
                
                // YouTube vs Sales 상관관계 데이터 로드
                const response = await fetch(withMonthParam('/api/data/youtube-sales-correlation', month))
                
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
    }, [month, refreshKey])

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

    // Robust Percentile Normalization 함수들
    const calculatePercentiles = (data) => {
        const sorted = [...data].filter(val => val > 0).sort((a, b) => a - b)
        if (sorted.length === 0) return { q1: 0, q3: 0, iqr: 0 }
        
        const q1Index = Math.floor(sorted.length * 0.25)
        const q3Index = Math.floor(sorted.length * 0.75)
        const q1 = sorted[q1Index]
        const q3 = sorted[q3Index]
        
        return { q1, q3, iqr: q3 - q1 }
    }
    
    const robustNormalize = (value, q1, iqr) => {
        if (iqr === 0) return 50 // 모든 값이 같을 때
        const normalized = ((value - q1) / iqr) * 80 + 10 // 10-90% 범위 사용
        return Math.max(5, Math.min(95, normalized)) // 5-95% 범위로 제한
    }

    const getDynamicChartOptions = () => {
        const currentData = getCurrentData()
        
        // 데이터 추출
        const salesData = currentData.map(product => product.sales || 0)
        const youtubeData = currentData.map(product => product.youtubeScore || 0)
        
        // Robust 정규화를 위한 분위수 계산
        const salesPercentiles = calculatePercentiles(salesData)
        const youtubePercentiles = calculatePercentiles(youtubeData)
        
        // 절대값 사용하되 시각적 균형을 위한 스케일 조정
        const maxSales = Math.max(...salesData)
        const maxYoutube = Math.max(...youtubeData)
        
        // YouTube 점수를 판매량과 비슷한 스케일로 조정
        const scaleRatio = maxSales > 0 ? maxSales / maxYoutube : 1
        const scaledYoutubeData = youtubeData.map(youtube => youtube * scaleRatio)
        
        // 실제 절대값 사용 (스케일 조정된 YouTube 데이터)
        const displaySalesData = salesData
        const displayYoutubeData = scaledYoutubeData
        
        // 디버깅을 위한 로그 출력
        console.log('Chart Debug Info:', {
            salesData,
            youtubeData,
            maxSales,
            maxYoutube,
            scaleRatio,
            displaySalesData,
            displayYoutubeData,
            products: currentData.map(p => p.product)
        })
        
        return {
            chart: {
                type: 'bar',
                height: 377,
                toolbar: { show: false },
                stacked: false,
                zoom: { enabled: false },
                animations: {
                    enabled: false
                },
                redrawOnParentResize: false,
                redrawOnWindowResize: false,
                autoSelected: 'pan',
                selection: {
                    enabled: false
                },
                brush: {
                    enabled: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    borderRadius: 4,
                    borderRadiusApplication: 'end',
                    columnWidth: '70%',
                    distributed: false,
                    rangeBarOverlap: true
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
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: { height: 300 }
                }
            }],
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
                        text: '판매량 (대) / YouTube 성과 (조정 스케일)',
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
                        text: '효율성 지수 (판매량/YouTube성과 비율)',
                        style: { fontSize: '12px' }
                    },
                    labels: {
                        style: {
                            colors: '#ef4444',
                            fontSize: '12px'
                        },
                        formatter: function (val) {
                            return val.toFixed(1);
                        }
                    }
                }
            ],
            series: [
                {
                    name: '판매량 (대)',
                    data: displaySalesData,
                    type: 'bar'
                },
                {
                    name: 'YouTube 성과 (조정된 스케일)', 
                    data: displayYoutubeData,
                    type: 'bar'
                },
                {
                    name: '효율성 지수',
                    data: currentData.map(product => parseFloat(product.efficiency || 0)),
                    type: 'line',
                    yAxisIndex: 1
                }
            ],
            colors: ['#3b82f6', '#10b981', '#ef4444'],
            fill: {
                opacity: [0.9, 0.7, 0.1]
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
                        const dataIndex = opts.dataPointIndex;
                        const product = currentData[dataIndex];
                        
                        if (seriesIndex === 0) {
                            return `판매량: ${val.toLocaleString()}대`;
                        }
                        if (seriesIndex === 1) {
                            const actualYoutubeScore = product?.youtubeScore || 0;
                            return `YouTube 성과: ${val.toFixed(0)} (실제: ${actualYoutubeScore.toLocaleString()}점)`;
                        }
                        if (seriesIndex === 2) {
                            return `${val.toFixed(2)}점`;
                        }
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
            },
            noData: {
                text: '데이터를 불러오는 중...',
                align: 'center',
                verticalAlign: 'middle'
            },
            states: {
                hover: {
                    filter: {
                        type: 'lighten',
                        value: 0.04
                    }
                },
                active: {
                    allowMultipleDataPointsSelection: false,
                    filter: {
                        type: 'darken',
                        value: 0.35
                    }
                }
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
                                판매량 절대값 • YouTube 성과 (스케일 조정) • 상관관계 분석
                            </p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center gap-1">
                                <div className="rounded-circle bg-primary" style={{width: '8px', height: '8px'}}></div>
                                <span className="fs-12 text-muted">판매량 (대)</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <div className="rounded-circle bg-success" style={{width: '8px', height: '8px'}}></div>
                                <span className="fs-12 text-muted">YouTube 성과 (조정됨)</span>
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
                            type="bar"
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
