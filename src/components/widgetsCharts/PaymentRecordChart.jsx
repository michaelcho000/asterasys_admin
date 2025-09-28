'use client'
import React, { useState, useEffect } from 'react'
import CardHeader from '@/components/shared/CardHeader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import CardLoader from '@/components/shared/CardLoader';
import dynamic from 'next/dynamic'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore';
import { withMonthParam } from '@/utils/withMonthParam';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const PaymentRecordChart = () => {
    const [activeCategory, setActiveCategory] = useState('RF');
    const [chartData, setChartData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [excludeTop2, setExcludeTop2] = useState(false) // TOP 2 제외 토글 상태
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const month = useSelectedMonthStore((state) => state.selectedMonth);

    useEffect(() => {
        if (!month) return
        const loadChartData = async () => {
            try {
                setLoading(true)
                
                // 차트에 필요한 CSV 파일들 로드 (traffic.csv 추가)
                const [blogResponse, cafeResponse, trafficResponse] = await Promise.all([
                    fetch(withMonthParam('/api/data/files/blog_rank', month)),
                    fetch(withMonthParam('/api/data/files/cafe_rank', month)),
                    fetch(withMonthParam('/api/data/files/traffic', month))
                ])
                
                const [blogData, cafeData, trafficData] = await Promise.all([
                    blogResponse.json(),
                    cafeResponse.json(),
                    trafficResponse.json()
                ])
                
                // 실시간 차트 데이터 생성
                const dynamicChartData = generateChartFromCSV(blogData, cafeData, trafficData)
                setChartData(dynamicChartData)
                
            } catch (error) {
                console.error('차트 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadChartData()
    }, [month])

    const generateChartFromCSV = (blogData, cafeData, trafficData) => {
        const blog = blogData.marketData || []
        const cafe = cafeData.marketData || []
        const traffic = trafficData.marketData || []
        
        // RF와 HIFU 제품별 데이터 통합
        const productData = {
            RF: {
                rawProducts: [],
                categories: [],
                barSeries: [],
                lineSeries: [],
                maxBarValue: 0,
                maxSearchValue: 0
            },
            HIFU: {
                rawProducts: [],
                categories: [],
                barSeries: [],
                lineSeries: [],
                maxBarValue: 0,
                maxSearchValue: 0
            }
        }
        
        // 각 제품별 데이터 처리
        cafe.forEach(cafeItem => {
            const blogItem = blog.find(b => b.키워드 === cafeItem.키워드) || {}
            const trafficItem = traffic.find(t => t.키워드 === cafeItem.키워드) || {}
            
            // blog_rank의 모든 블로그 유형 데이터 합산
            const blogRows = blog.filter(b => b.키워드 === cafeItem.키워드)
            let blogCommentTotal = 0
            let blogReplyTotal = 0
            
            blogRows.forEach(row => {
                blogCommentTotal += parseInt(row['댓글 총 개수']?.replace(/,/g, '') || 0)
                blogReplyTotal += parseInt(row['대댓글 총 개수']?.replace(/,/g, '') || 0)
            })
            
            // 발행량 = blog_rank의 발행량합 + cafe_rank의 총 발행량
            const blogPublishData = parseInt(blogItem['발행량합']?.replace(/,/g, '') || 0)
            const cafePublishData = parseInt(cafeItem['총 발행량']?.replace(/,/g, '') || 0)
            const publishData = blogPublishData + cafePublishData
            
            // 댓글수 = blog_rank의 (댓글 총 개수 + 대댓글 총 개수) + cafe_rank의 (총 댓글수 + 총 대댓글수)
            const cafeCommentData = parseInt(cafeItem['총 댓글수']?.replace(/,/g, '') || 0)
            const cafeReplyData = parseInt(cafeItem['총 대댓글수']?.replace(/,/g, '') || 0)
            const commentData = blogCommentTotal + blogReplyTotal + cafeCommentData + cafeReplyData
            
            // traffic.csv에서 월감 검색량 가져오기
            const searchVolume = parseInt(trafficItem['월감 검색량']?.replace(/,/g, '') || 0)
            const isAsterasys = ['쿨페이즈', '리프테라', '쿨소닉'].includes(cafeItem.키워드)
            
            const category = cafeItem.그룹 === '고주파' ? 'RF' : 'HIFU'
            
            productData[category].rawProducts.push({
                name: cafeItem.키워드,
                publishData,
                commentData,
                searchVolume,
                isAsterasys
            })
        })
        
        // RF/HIFU별 차트 시리즈 생성
        Object.keys(productData).forEach(category => {
            // 발행량 + 댓글수 기준으로 정렬 (검색량 제외)
            const products = productData[category].rawProducts
                .map(p => ({
                    ...p,
                    totalScore: p.publishData + p.commentData // 발행량 + 댓글수만 합산
                }))
                .sort((a, b) => b.totalScore - a.totalScore) // 내림차순 정렬
            
            productData[category].rawProducts = products
            productData[category].categories = products.map(p => p.name)
            
            // 디버깅: 쿨소닉 데이터 확인
            const coolsonicData = products.find(p => p.name === '쿨소닉')
            if (coolsonicData) {
                console.log('쿨소닉 데이터:', {
                    발행량: coolsonicData.publishData,
                    댓글수: coolsonicData.commentData,
                    검색량: coolsonicData.searchVolume
                })
            }
            
            // 바 차트와 검색량의 최대값 계산
            const maxBarValue = Math.max(
                ...products.map(p => Math.max(p.publishData, p.commentData))
            )
            const maxSearchValue = Math.max(...products.map(p => p.searchVolume))
            
            productData[category].barSeries = [
                {
                    name: '콘텐츠 발행량',
                    type: 'column',
                    data: products.map(p => p.publishData)
                },
                {
                    name: '댓글/반응 수', 
                    type: 'column',
                    data: products.map(p => p.commentData)
                }
            ]
            
            // 차트 옵션에서 사용할 최대값 저장
            productData[category].maxBarValue = maxBarValue
            productData[category].maxSearchValue = maxSearchValue
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

    // 발행량과 댓글수만으로 구성된 바 차트 옵션
    const getDynamicChartOptions = () => {
        if (!chartData) return {}
        
        const currentData = chartData[activeCategory]
        
        // TOP 2 제외 처리
        const displayData = excludeTop2 ? {
            categories: currentData.categories.slice(2),
            barSeries: currentData.barSeries.map(series => ({
                ...series,
                data: series.data.slice(2)
            })),
            maxBarValue: Math.max(...currentData.barSeries.flatMap(s => s.data.slice(2)))
        } : {
            ...currentData
        }
        
        return {
            chart: {
                height: 340,
                type: 'bar',
                stacked: false,
                toolbar: { show: false },
                background: 'transparent'
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
                categories: displayData?.categories || [],
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
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
            fill: { 
                opacity: [0.9, 0.9]
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val.toLocaleString() + " 건"
                    }
                },
                shared: true,
                intersect: false
            },
            colors: ['#3b82f6', '#10b981'],
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
                    <div className="d-flex gap-2 align-items-center">
                        <div className="form-check form-switch me-3">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                id="excludeTop2Switch"
                                checked={excludeTop2}
                                onChange={(e) => setExcludeTop2(e.target.checked)}
                            />
                            <label className="form-check-label small" htmlFor="excludeTop2Switch">
                                TOP 2 제외
                            </label>
                        </div>
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
                            <h6 className="fs-13 fw-semibold text-truncate-1-line mb-1">콘텐츠 마케팅 성과 분석</h6>
                            <p className="fs-12 text-muted mb-0">발행량 • 댓글/반응 수 비교</p>
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
                        </div>
                    </div>
                    {loading || !chartData ? (
                        <CardLoader />
                    ) : (
                        <ReactApexChart
                            options={getDynamicChartOptions()}
                            series={
                                excludeTop2 ? 
                                    chartData[activeCategory].barSeries.map(series => ({
                                        ...series,
                                        data: series.data.slice(2)
                                    })) : chartData[activeCategory].barSeries
                            }
                            type="bar"
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
