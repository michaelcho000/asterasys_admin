'use client'
import React, { useState, useEffect } from 'react'
import CardHeader from '@/components/shared/CardHeader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import CardLoader from '@/components/shared/CardLoader';
import dynamic from 'next/dynamic'
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const PaymentRecordChart = () => {
    const [activeCategory, setActiveCategory] = useState('RF');
    const [chartData, setChartData] = useState(null)
    const [loading, setLoading] = useState(true)
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

    useEffect(() => {
        const loadChartData = async () => {
            try {
                setLoading(true)
                
                // 차트에 필요한 CSV 파일들 로드 
                const [blogResponse, cafeResponse] = await Promise.all([
                    fetch('/api/data/files/blog_rank'),
                    fetch('/api/data/files/cafe_rank')
                ])
                
                const [blogData, cafeData] = await Promise.all([
                    blogResponse.json(),
                    cafeResponse.json()
                ])
                
                // 실시간 차트 데이터 생성
                const dynamicChartData = generateChartFromCSV(blogData, cafeData)
                setChartData(dynamicChartData)
                
            } catch (error) {
                console.error('차트 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadChartData()
    }, [])

    const generateChartFromCSV = (blogData, cafeData) => {
        const blog = blogData.marketData || []
        const cafe = cafeData.marketData || []
        
        // RF와 HIFU 제품별 데이터 통합
        const productData = {
            RF: {
                rawProducts: [],
                categories: [],
                barSeries: [],
                lineSeries: []
            },
            HIFU: {
                rawProducts: [],
                categories: [],
                barSeries: [],
                lineSeries: []
            }
        }
        
        // 각 제품별 데이터 처리
        cafe.forEach(cafeItem => {
            const blogItem = blog.find(b => b.키워드 === cafeItem.키워드) || {}
            
            const publishData = parseInt(blogItem['발행량합']) || 0
            const commentData = parseInt(cafeItem['총 댓글수']?.replace(/,/g, '') || 0)
            const isAsterasys = ['쿨페이즈', '리프테라', '쿨소닉'].includes(cafeItem.키워드)
            
            const category = cafeItem.그룹 === '고주파' ? 'RF' : 'HIFU'
            
            productData[category].rawProducts.push({
                name: cafeItem.키워드,
                publishData,
                commentData,
                isAsterasys
            })
        })
        
        // RF/HIFU별 차트 시리즈 생성
        Object.keys(productData).forEach(category => {
            const products = productData[category].rawProducts
            productData[category].categories = products.map(p => p.name)
            productData[category].barSeries = [
                {
                    name: '발행량',
                    type: 'column',
                    data: products.map(p => p.publishData)
                },
                {
                    name: '댓글수', 
                    type: 'column',
                    data: products.map(p => p.commentData)
                }
            ]
            productData[category].lineSeries = [
                {
                    name: '검색 트렌드',
                    type: 'line',
                    yAxisIndex: 1,
                    data: products.map(p => p.publishData + p.commentData) // 임시 트렌드 데이터
                }
            ]
        })
        
        return productData
    }

    const toggleCategory = (category) => {
        setActiveCategory(category);
    }

    // 실시간 점유율 계산
    const calculateMarketShare = (category) => {
        if (!chartData) return "0.0"
        const data = chartData[category];
        const products = data.rawProducts;
        const asterasysTotal = products
            .filter(product => product.isAsterasys)
            .reduce((sum, product) => sum + product.publishData + product.commentData, 0);
        const marketTotal = products.reduce((sum, product) => 
            sum + product.publishData + product.commentData, 0
        );
        return ((asterasysTotal / marketTotal) * 100).toFixed(1);
    }

    // 실시간 Asterasys 제품 순위 계산
    const getAsterasysRanks = (category) => {
        if (!chartData) return "계산중"
        const data = chartData[category];
        const products = data.rawProducts;
        const sortedProducts = products
            .map(product => ({
                ...product,
                totalScore: product.publishData + product.commentData
            }))
            .sort((a, b) => b.totalScore - a.totalScore);
        
        const asterasysRanks = [];
        sortedProducts.forEach((product, index) => {
            if (product.isAsterasys) {
                asterasysRanks.push(index + 1);
            }
        });
        
        return asterasysRanks.length > 1 ? 
            asterasysRanks.join('위 / ') + '위' : 
            asterasysRanks[0] + '위';
    }

    // 동적 차트 옵션 생성 (바 + 라인 혼합 차트)
    const getDynamicChartOptions = () => {
        if (!chartData) return {}
        
        const currentData = chartData[activeCategory]
        
        return {
            chart: {
                height: 340,
                type: 'line',
                toolbar: { show: false },
                background: 'transparent'
            },
            stroke: {
                width: [0, 0, 3],
                curve: 'smooth'
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded'
                }
            },
            dataLabels: { 
                enabled: false 
            },
            xaxis: {
                categories: currentData?.categories || [],
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            yaxis: [
                {
                    title: {
                        text: '발행량 / 댓글수',
                        style: { fontSize: '12px' }
                    },
                    labels: {
                        formatter: function (val) {
                            return val.toLocaleString()
                        }
                    }
                },
                {
                    opposite: true,
                    title: {
                        text: '검색 트렌드',
                        style: { fontSize: '12px' }
                    }
                }
            ],
            fill: { 
                opacity: [0.9, 0.9, 0.3]
            },
            tooltip: {
                y: {
                    formatter: function (val, { seriesIndex }) {
                        if (seriesIndex === 2) return val.toLocaleString() + " 회"
                        return val.toLocaleString() + " 건"
                    }
                }
            },
            colors: ['#3b82f6', '#10b981', '#ef4444'],
            legend: {
                show: false
            },
            grid: {
                borderColor: '#f1f5f9',
                strokeDashArray: 3
            }
        }
    }

    if (isRemoved) {
        return null;
    }
    
    return (
        <div className="col-xxl-8">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <div className="card-header d-flex align-items-center justify-content-between">
                    <h5 className="card-title">{`${activeCategory} 시장 종합 마케팅 분석`}</h5>
                    <div className="d-flex gap-2">
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
                            <h6 className="fs-13 fw-semibold text-truncate-1-line mb-1">콘텐츠 성과 vs 검색 트렌드 비교</h6>
                            <p className="fs-12 text-muted mb-0">발행량 • 댓글 • 검색량 통합 분석</p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center gap-1">
                                <div className="rounded-circle bg-primary" style={{width: '8px', height: '8px'}}></div>
                                <span className="fs-12 text-muted">콘텐츠 발행량</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <div className="rounded-circle bg-success" style={{width: '8px', height: '8px'}}></div>
                                <span className="fs-12 text-muted">댓글/반응 수</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <div className="rounded-circle bg-danger" style={{width: '8px', height: '8px'}}></div>
                                <span className="fs-12 text-muted">검색량</span>
                            </div>
                        </div>
                    </div>
                    {loading || !chartData ? (
                        <CardLoader />
                    ) : (
                        <ReactApexChart
                            options={getDynamicChartOptions()}
                            series={[
                                ...chartData[activeCategory].barSeries,
                                ...chartData[activeCategory].lineSeries
                            ]}
                            type="line"
                            height={340}
                        />
                    )}
                    <div className="d-none d-md-flex flex-wrap pt-4 border-top">
                        <div className="flex-fill">
                            <p className="fs-11 fw-medium text-uppercase text-muted mb-2">Asterasys 점유율</p>
                            <h2 className="fs-20 fw-bold mb-0">{calculateMarketShare(activeCategory)}%</h2>
                        </div>
                        <div className="vr mx-4 text-gray-600" />
                        <div className="flex-fill">
                            <p className="fs-11 fw-medium text-uppercase text-muted mb-2">총 시장 규모</p>
                            <h2 className="fs-20 fw-bold mb-0">9개 제품</h2>
                        </div>
                        <div className="vr mx-4 text-gray-600" />
                        <div className="flex-fill">
                            <p className="fs-11 fw-medium text-uppercase text-muted mb-2">Asterasys 순위</p>
                            <h2 className="fs-20 fw-bold mb-0">{getAsterasysRanks(activeCategory)}</h2>
                        </div>
                    </div>
                </div>
                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default PaymentRecordChart