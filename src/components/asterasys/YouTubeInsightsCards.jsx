'use client'
import React, { useState, useEffect } from 'react'
import { FiMoreVertical, FiExternalLink } from 'react-icons/fi'
import getIcon from '@/utils/getIcon'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const YouTubeInsightsCards = () => {
    const [insights, setInsights] = useState({})
    const [asterasysData, setAsterasysData] = useState({})
    const [loading, setLoading] = useState(true)
    const month = useSelectedMonthStore((state) => state.selectedMonth)

    useEffect(() => {
        if (!month) return
        const loadYouTubeData = async () => {
            try {
                setLoading(true)
                
                // YouTube 분석 데이터 및 채널 데이터 동시 로드
                const [analysisResponse, channelsResponse] = await Promise.all([
                    fetch(withMonthParam('/api/data/youtube-analysis', month)),
                    fetch(withMonthParam('/api/data/youtube-channels', month))
                ])
                
                const [analysisData, channelsData] = await Promise.all([
                    analysisResponse.json(),
                    channelsResponse.json()
                ])
                
                // 인사이트 데이터 설정
                if (analysisData.success && analysisData.summary) {
                    setInsights({
                        totalVideos: analysisData.summary.totalVideos,
                        totalViews: analysisData.summary.totalViews,
                        asterasysVideos: analysisData.summary.asterasysVideos,
                        asterasysViews: analysisData.summary.asterasysViews,
                        asterasysShare: parseFloat(analysisData.summary.asterasysShare),
                        totalChannels: analysisData.summary.totalChannels || 783,
                        asterasysChannels: 9
                    })
                }
                
                // Asterasys 제품 데이터 설정
                if (channelsData.success && channelsData.data) {
                    setAsterasysData(channelsData.data)
                }
                
            } catch (error) {
                console.error('YouTube 데이터 로드 실패:', error)
                // 폴백 데이터
                setInsights({
                    totalVideos: 1159,
                    totalViews: 6399808,
                    asterasysVideos: 11,
                    asterasysViews: 24160,
                    asterasysShare: 0.95,
                    totalChannels: 783,
                    asterasysChannels: 9
                })
                setAsterasysData(getDefaultAsterasysData())
            } finally {
                setLoading(false)
            }
        }

        loadYouTubeData()
    }, [month])

    const getDefaultAsterasysData = () => {
        return {}
    }

    // 시장 평균 계산 (안전한 계산)
    const marketAvgViews = insights.totalViews && insights.totalVideos ? Math.round(insights.totalViews / insights.totalVideos) : 5524
    const asterasysAvgViews = insights.asterasysViews && insights.asterasysVideos ? Math.round(insights.asterasysViews / insights.asterasysVideos) : 2196
    const viewsRatio = marketAvgViews ? (asterasysAvgViews / marketAvgViews * 100) : 40

    const marketAvgVideosPerBrand = insights.totalVideos ? Math.round(insights.totalVideos / 18) : 64
    const videosRatio = insights.asterasysVideos && marketAvgVideosPerBrand ? (insights.asterasysVideos / marketAvgVideosPerBrand * 100) : 17

    const marketAvgChannelsPerBrand = insights.totalChannels ? Math.round(insights.totalChannels / 18) : 44
    const channelsRatio = insights.asterasysChannels && marketAvgChannelsPerBrand ? (insights.asterasysChannels / marketAvgChannelsPerBrand * 100) : 20

    const kpiData = [
        {
            id: 1,
            title: "YouTube 비디오 수",
            total_number: (insights.asterasysVideos || 11).toString(),
            progress: Math.min(((insights.asterasysVideos || 11) / marketAvgVideosPerBrand) * 100, 100) + "%",
            progress_info: `시장 평균 대비 ${videosRatio.toFixed(0)}% 수준`,
            context: `시장 평균: ${marketAvgVideosPerBrand}개/브랜드 (Asterasys: ${insights.asterasysVideos || 11}개)`,
            icon: "feather-video",
            color: "primary"
        },
        {
            id: 2,
            title: "YouTube 총 조회수", 
            total_number: ((insights.asterasysViews || 24160) / 1000).toFixed(1) + 'K',
            progress: Math.min((asterasysAvgViews / marketAvgViews) * 100, 100) + "%",
            progress_info: `시장 평균 대비 ${viewsRatio.toFixed(0)}% 수준`,
            context: `시장 평균: ${marketAvgViews.toLocaleString()}회/비디오 (Asterasys: ${asterasysAvgViews.toLocaleString()}회)`,
            icon: "feather-eye",
            color: "success"
        },
        {
            id: 3,
            title: "활성 채널 수",
            total_number: (insights.asterasysChannels || 9).toString(),
            progress: Math.min(((insights.asterasysChannels || 9) / marketAvgChannelsPerBrand) * 100, 100) + "%",
            progress_info: `시장 평균 대비 ${channelsRatio.toFixed(0)}% 수준`,
            context: `시장 평균: ${marketAvgChannelsPerBrand}개/브랜드 (Asterasys: ${insights.asterasysChannels || 9}개)`,
            icon: "feather-users",
            color: "info"
        },
        {
            id: 4,
            title: "시장 점유율",
            total_number: (insights.asterasysShare || 0.95).toFixed(2) + '%',
            progress: Math.min((insights.asterasysShare || 0.95) * 20, 100) + "%",
            progress_info: `목표 5% 대비 ${((insights.asterasysShare || 0.95) / 5 * 100).toFixed(0)}% 달성`,
            context: `전체 ${insights.totalVideos || 1159}개 중 ${insights.asterasysVideos || 11}개 (0.95%)`,
            icon: "feather-trending-up",
            color: "warning"
        }
    ]

    const [selectedProduct, setSelectedProduct] = useState('쿨소닉')

    return (
        <>
            {/* KPI 카드들 */}
            {kpiData.map(({ id, total_number, progress, progress_info, title, context, icon, color }) => (
                <div key={id} className="col-xxl-3 col-md-6">
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

            {/* Asterasys YouTube 성과 - Facebook 광고 성과 스타일 */}
            <div className="col-xxl-12">
                <div className="card stretch stretch-full">
                    <div className="card-header">
                        <h5 className="card-title">Asterasys YouTube 성과</h5>
                    </div>

                    <div className="card-body custom-card-action">
                        <div className="row">
                            {Object.entries(asterasysData).map(([productName, productData], index) => (
                                <div key={productName} className="col-xxl-4">
                                    <div className="border border-dashed rounded-3 p-4 h-100 hover-shadow-sm transition-all">
                                        <div className="text-center mb-4">
                                            <h6 className="mb-3">{productName}</h6>
                                            <div className="mb-4">
                                                <ReactApexChart
                                                    options={{
                                                        chart: { type: 'donut', height: 200 },
                                                        series: [productData.totalStats.shortsRatio, 100 - productData.totalStats.shortsRatio],
                                                        labels: ['Shots', 'Long'],
                                                        colors: ['#1e40af', '#93c5fd'], // 진한 파란색 (Shots) + 연한 파란색 (Long)
                                                        legend: { position: 'bottom', fontSize: '12px' },
                                                        dataLabels: {
                                                            enabled: true,
                                                            formatter: function(val) {
                                                                return val.toFixed(1) + '%'
                                                            }
                                                        },
                                                        plotOptions: {
                                                            pie: {
                                                                donut: {
                                                                    size: '60%'
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    series={[productData.totalStats.shortsRatio, 100 - productData.totalStats.shortsRatio]}
                                                    type='donut'
                                                    height={200}
                                                />
                                            </div>
                                        </div>
                                    
                                    <div className="row g-4 mb-4">
                                        <MetricCard 
                                            name={"비디오수"} 
                                            value={productData.totalStats.totalVideos}
                                            target={`Shorts: ${productData.totalStats.shortsCount}개`}
                                            color="primary"
                                        />
                                        <MetricCard 
                                            name={"조회수"} 
                                            value={`${(productData.totalStats.totalViews / 1000).toFixed(1)}K`}
                                            target={`평균: ${Math.round(productData.totalStats.totalViews / productData.totalStats.totalVideos).toLocaleString()}회`}
                                            color="success"
                                        />
                                        <MetricCard 
                                            name={"좋아요"} 
                                            value={productData.totalStats.totalLikes}
                                            target={`참여도: ${((productData.totalStats.totalLikes + productData.totalStats.totalComments) / productData.totalStats.totalViews * 100).toFixed(2)}%`}
                                            color="warning"
                                        />
                                        <MetricCard 
                                            name={"댓글"} 
                                            value={productData.totalStats.totalComments}
                                            target={`참여형 콘텐츠`}
                                            color="info"
                                        />
                                    </div>

                                    <hr className="border-dashed my-3" />
                                    
                                    {/* 상위 채널 리스트 */}
                                    <div>
                                        <h6 className="fs-13 fw-semibold mb-2">상위 성과 채널</h6>
                                        {productData.topChannels.slice(0, 3).map((channel, idx) => (
                                            <div key={idx}>
                                                {idx !== 0 && <hr className="border-dashed my-2" />}
                                                <div className="d-flex align-items-center justify-content-between cursor-pointer py-2 rounded hover-shadow-sm transition-all">
                                                    <div className="hstack gap-2">
                                                        <div>
                                                            <Link href="#" className="d-block fw-semibold fs-12" onClick={(e) => e.preventDefault()}>
                                                                {channel.channelName}
                                                            </Link>
                                                            <span className="fs-11 text-muted text-truncate d-block" style={{maxWidth: '180px'}}>
                                                                {channel.bestVideo.title.substring(0, 40)}...
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <span className="badge bg-primary text-white fs-10">{(channel.totalViews / 1000).toFixed(1)}K</span>
                                                            <Link 
                                                                href={channel.channelUrl} 
                                                                target="_blank"
                                                                className="btn btn-sm btn-outline-primary fs-10 px-2 py-1"
                                                                title="채널 방문"
                                                            >
                                                                채널로 이동
                                                            </Link>
                                                        </div>
                                                        <div className="fs-11 text-muted">{channel.videoCount}개 비디오</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const MetricCard = ({ name, value, target, color }) => {
    return (
        <div className="col-sm-6">
            <div className="px-4 py-3 text-center border border-dashed rounded-3 hover-shadow-sm transition-all">
                <h2 className="fs-13 tx-spacing-1 mb-1">{name}</h2>
                <div className={`fw-bold text-${color} fs-6 mb-1`}>{value}</div>
                <div className="fs-10 text-muted">{target}</div>
            </div>
        </div>
    )
}

export default YouTubeInsightsCards
