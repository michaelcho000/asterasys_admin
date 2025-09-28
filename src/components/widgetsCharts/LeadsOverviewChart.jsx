'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const formatMonthLabel = (month) => {
    if (!month) return '데이터 준비 중'
    const [year, monthPart] = month.split('-')
    return `${year}년 ${parseInt(monthPart, 10)}월`
}

const LeadsOverviewChart = ({ chartHeight, isFooterShow }) => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const [channelData, setChannelData] = useState([])
    const [loading, setLoading] = useState(true)
    const month = useSelectedMonthStore((state) => state.selectedMonth)

    useEffect(() => {
        if (!month) return
        const loadChannelData = async () => {
            try {
                setLoading(true)
                
                // 4개 채널 CSV 파일 동시 로드
                const [cafeResponse, youtubeResponse, newsResponse, blogResponse] = await Promise.all([
                    fetch(withMonthParam('/api/data/files/cafe_rank', month)),
                    fetch(withMonthParam('/api/data/files/youtube_rank', month)),
                    fetch(withMonthParam('/api/data/files/news_rank', month)),
                    fetch(withMonthParam('/api/data/files/blog_rank', month))
                ])
                
                const [cafeData, youtubeData, newsData, blogData] = await Promise.all([
                    cafeResponse.json(),
                    youtubeResponse.json(),
                    newsResponse.json(),
                    blogResponse.json()
                ])
                
                // 채널별 데이터 실시간 계산
                const calculatedChannels = calculateChannelDataFromCSV(cafeData, youtubeData, newsData, blogData)
                setChannelData(calculatedChannels)
                
            } catch (error) {
                console.error('채널 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadChannelData()
    }, [month])

    const calculateChannelDataFromCSV = (cafeData, youtubeData, newsData, blogData) => {
        // 각 채널별 Asterasys 합계 계산
        const cafeTotal = cafeData.asterasysData?.reduce((sum, item) => 
            sum + (parseInt(item['총 발행량']) || 0), 0) || 0
        const youtubeTotal = youtubeData.asterasysData?.reduce((sum, item) => 
            sum + (parseInt(item['총 발행량']) || 0), 0) || 0
        const newsTotal = newsData.asterasysData?.reduce((sum, item) => 
            sum + (parseInt(item['총 발행량']) || 0), 0) || 0
        const blogTotal = blogData.asterasysData?.reduce((sum, item) => 
            sum + (parseInt(item['발행량합']) || 0), 0) || 0
            
        const totalChannelCount = cafeTotal + youtubeTotal + newsTotal + blogTotal
        
        return [
            {
                id: 1,
                channel: "카페",
                count: cafeTotal,
                percentage: totalChannelCount > 0 ? ((cafeTotal / totalChannelCount) * 100).toFixed(1) : 0,
                subtitle: "네이버 카페",
                color: "#3b82f6"
            },
            {
                id: 2,
                channel: "유튜브", 
                count: youtubeTotal,
                percentage: totalChannelCount > 0 ? ((youtubeTotal / totalChannelCount) * 100).toFixed(1) : 0,
                subtitle: "유튜브",
                color: "#10b981"
            },
            {
                id: 3,
                channel: "뉴스",
                count: newsTotal,
                percentage: totalChannelCount > 0 ? ((newsTotal / totalChannelCount) * 100).toFixed(1) : 0,
                subtitle: "뉴스 포털",
                color: "#f59e0b"
            },
            {
                id: 4,
                channel: "블로그",
                count: blogTotal,
                percentage: totalChannelCount > 0 ? ((blogTotal / totalChannelCount) * 100).toFixed(1) : 0,
                subtitle: "개인 블로그",
                color: "#ef4444"
            }
        ]
    }

    const getDynamicChartOptions = () => {
        if (!channelData.length) return {}
        
        return {
            chart: {
                type: 'donut',
                height: chartHeight || 315
            },
            series: channelData.map(item => parseFloat(item.percentage)),
            labels: channelData.map(item => item.channel),
            colors: channelData.map(item => item.color),
            legend: {
                position: 'bottom'
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val.toFixed(1) + '%'
                }
            }
        }
    }

    if (isRemoved) {
        return null;
    }
    return (
        <div className="col-xxl-4">
            <div className={`card stretch stretch-full leads-overview ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <div className="card-header">
                    <h5 className="card-title">채널별 마케팅 성과 분포</h5>
                </div>

                <div className="card-body custom-card-action">
                    {loading ? (
                        <CardLoader />
                    ) : (
                        <>
                            <div className="mb-4">
                                <ReactApexChart
                                    options={getDynamicChartOptions()}
                                    series={channelData.map(item => parseFloat(item.percentage))}
                                    type='donut'
                                    height={chartHeight}
                                />
                            </div>
                            <div className="row g-3 pt-3">
                                {channelData.map(({ id, count, channel, subtitle, percentage, color }) => {
                                    return (
                                        <div key={id} className="col-6">
                                            <Link href="#" className="p-3 hstack gap-2 rounded border border-dashed border-gray-5 h-100">
                                                <span 
                                                    className="wd-8 ht-8 rounded-circle d-inline-block"
                                                    style={{ backgroundColor: color }}
                                                ></span>
                                                <div className="flex-fill">
                                                    <div className="fw-semibold small">{channel}</div>
                                                    <div className="fs-10 text-muted">{count}건 ({percentage}%)</div>
                                                </div>
                                            </Link>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>
                {isFooterShow && (
                    <Link href="#" className="card-footer fs-11 fw-bold text-uppercase text-center">
                        실제 CSV 데이터 기반 • {formatMonthLabel(month)}
                    </Link>
                )}
                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default LeadsOverviewChart
