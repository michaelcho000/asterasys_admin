'use client'
import React, { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic';
import { tasksOverviewChartOption } from '@/utils/chartsLogic/tasksOverviewChatOption'
import getIcon from '@/utils/getIcon'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const PRODUCT_TRENDS = [
    {
        key: '리프테라',
        title: '리프테라 검색 트렌드',
        icon: 'feather-activity',
        chartColor: '#3454d1',
        color: 'primary'
    },
    {
        key: '쿨페이즈',
        title: '쿨페이즈 검색 트렌드',
        icon: 'feather-trending-up',
        chartColor: '#10b981',
        color: 'success'
    },
    {
        key: '쿨소닉',
        title: '쿨소닉 검색 트렌드',
        icon: 'feather-minus',
        chartColor: '#ef4444',
        color: 'danger'
    }
]

const DEFAULT_TREND_DATA = {
    리프테라: [0.55, 0, 0, 0, 0, 0, 0, 0, 0, 0.55, 0, 0],
    쿨페이즈: [0.55, 2.77, 13.95, 100, 0.89, 0, 0.55, 10.41, 0, 0, 0, 0],
    쿨소닉: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

const formatMonthLabel = (month) => {
    if (!month) return '데이터 준비 중'
    const [year, monthPart] = month.split('-')
    return `${year}년 ${parseInt(monthPart, 10)}월`
}

const TasksOverviewChart = () => {
    const chartOptions = tasksOverviewChartOption()
    const [naverDataLabTrends, setNaverDataLabTrends] = useState({})
    const [loading, setLoading] = useState(true)
    const month = useSelectedMonthStore((state) => state.selectedMonth)
    const monthLabel = useMemo(() => formatMonthLabel(month), [month])

    useEffect(() => {
        if (!month) return

        const loadNaverDataLabData = async () => {
            try {
                setLoading(true)

                const timestamp = Date.now()
                const response = await fetch(withMonthParam(`/api/data/files/naver datalab?t=${timestamp}`, month), {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                })

                const data = await response.json()

                if (!data.success || !data.marketData) {
                    console.error('네이버 데이터랩 데이터 로드 실패')
                    return
                }

                const rawRows = data.marketData || []
                const monthlyRows = rawRows.filter((row) => row.날짜?.startsWith(month))
                const processedData = monthlyRows.length > 0 ? monthlyRows : rawRows

                const weeklyData = []
                for (let i = 0; i < processedData.length; i += 7) {
                    const week = processedData.slice(i, i + 7)
                    if (week.length > 0) {
                        const startDate = week[0].날짜
                        const endDate = week[week.length - 1].날짜
                        weeklyData.push({
                            주차: `${new Date(startDate).getMonth() + 1}/${new Date(startDate).getDate()}-${new Date(endDate).getDate()}`,
                            날짜범위: `${startDate} ~ ${endDate}`,
                            리프테라: week.reduce((sum, day) => sum + (day.리프테라 || 0), 0) / week.length,
                            쿨페이즈: week.reduce((sum, day) => sum + (day.쿨페이즈 || 0), 0) / week.length,
                            쿨소닉: week.reduce((sum, day) => sum + (day.쿨소닉 || 0), 0) / week.length
                        })
                    }
                }

                if (weeklyData.length > 0) {
                    const recentWeeks = weeklyData.slice(-8)

                    const trends = {
                        리프테라: {
                            data: recentWeeks.map(week => week.리프테라),
                            categories: recentWeeks.map(week => week.주차),
                            dateRanges: recentWeeks.map(week => week.날짜범위),
                            current: recentWeeks[recentWeeks.length - 1]?.리프테라 || 0,
                            previous: recentWeeks[recentWeeks.length - 4]?.리프테라 || recentWeeks[0]?.리프테라 || 0,
                            avg: recentWeeks.reduce((sum, week) => sum + week.리프테라, 0) / recentWeeks.length,
                            max: Math.max(...recentWeeks.map(week => week.리프테라)) || 0
                        },
                        쿨페이즈: {
                            data: recentWeeks.map(week => week.쿨페이즈),
                            categories: recentWeeks.map(week => week.주차),
                            dateRanges: recentWeeks.map(week => week.날짜범위),
                            current: recentWeeks[recentWeeks.length - 1]?.쿨페이즈 || 0,
                            previous: recentWeeks[recentWeeks.length - 4]?.쿨페이즈 || recentWeeks[0]?.쿨페이즈 || 0,
                            avg: recentWeeks.reduce((sum, week) => sum + week.쿨페이즈, 0) / recentWeeks.length,
                            max: Math.max(...recentWeeks.map(week => week.쿨페이즈)) || 0
                        },
                        쿨소닉: {
                            data: recentWeeks.map(week => week.쿨소닉),
                            categories: recentWeeks.map(week => week.주차),
                            dateRanges: recentWeeks.map(week => week.날짜범위),
                            current: recentWeeks[recentWeeks.length - 1]?.쿨소닉 || 0,
                            previous: recentWeeks[recentWeeks.length - 4]?.쿨소닉 || recentWeeks[0]?.쿨소닉 || 0,
                            avg: recentWeeks.reduce((sum, week) => sum + week.쿨소닉, 0) / recentWeeks.length,
                            max: Math.max(...recentWeeks.map(week => week.쿨소닉)) || 0
                        }
                    }

                    setNaverDataLabTrends(trends)
                } else {
                    setNaverDataLabTrends({})
                }
            } catch (error) {
                console.error('네이버 데이터랩 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadNaverDataLabData()
    }, [month])

    const getActualTrendData = (productName) => {
        if (loading || !naverDataLabTrends[productName]) {
            return DEFAULT_TREND_DATA[productName] || []
        }
        return naverDataLabTrends[productName].data
    }

    const getProgressStatus = (productName) => {
        if (loading) return "로딩중"
        if (!naverDataLabTrends[productName]) return "데이터없음"
        
        const current = naverDataLabTrends[productName].current
        const max = naverDataLabTrends[productName].max
        if (max === 0) return "Very Low"
        
        // 건조하고 깔끔한 표현
        if (current >= max * 0.8) return "Very High"
        if (current >= max * 0.6) return "High"  
        if (current >= max * 0.4) return "Medium"
        if (current >= max * 0.2) return "Low"
        return "Very Low"
    }

    const getStatusText = (productName) => {
        if (loading) return "로딩중"
        if (!naverDataLabTrends[productName]) return "데이터없음"
        
        const trend = naverDataLabTrends[productName]
        const previous = trend.previous
        if (!previous) return '기준 부족'
        const changePercent = ((trend.current - previous) / previous * 100).toFixed(1)
        return `최근 4주 대비 ${changePercent > 0 ? '+' : ''}${changePercent}%`
    }

    const getSummaryText = (productName) => {
        if (loading || !naverDataLabTrends[productName]) {
            return `${monthLabel} 실시간 추세`
        }
        const trend = naverDataLabTrends[productName]
        const avg = Number.isFinite(trend.avg) ? trend.avg.toFixed(1) : '0.0'
        const max = Number.isFinite(trend.max) ? trend.max.toFixed(1) : '0.0'
        return `최근 8주 평균 ${avg} • 최고 ${max}`
    }

    return (
        <>
            {
                PRODUCT_TRENDS.map(({ key, title, icon, chartColor, color }) => {
                    const actualTrendData = getActualTrendData(key)
                    const actualProgress = getProgressStatus(key)

                    return (
                        <div key={key} className="col-lg-4 task-overview-card">
                            <div className="card mb-4 stretch stretch-full">
                                <div className="card-header d-flex align-items-center justify-content-between">
                                    <div className="d-flex gap-3 align-items-center">
                                        <div className="avatar-text">
                                            <i className='fs-16'>{getIcon(icon)}</i>
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark">{title}</div>
                                            <div className="fs-12 text-muted">{getSummaryText(key)} • {monthLabel}</div>
                                        </div>
                                    </div>
                                    <div className="fs-4 fw-bold text-dark">{actualProgress}</div>
                                </div>
                                <div className="card-body d-flex align-items-center justify-content-between gap-4">
                                    <ReactApexChart
                                        options={{ 
                                            ...chartOptions, 
                                            colors: [chartColor],
                                            xaxis: {
                                                categories: naverDataLabTrends[key]?.categories || chartOptions.xaxis.categories,
                                                axisBorder: { show: false },
                                                axisTicks: { show: false }
                                            },
                                            tooltip: {
                                                x: {
                                                    formatter: function(value, { dataPointIndex }) {
                                                        const dateRanges = naverDataLabTrends[key]?.dateRanges || []
                                                        return dateRanges[dataPointIndex] || `주차 ${value}`
                                                    }
                                                },
                                                y: {
                                                    formatter: function (value) {
                                                        return `검색량: ${value.toFixed(1)}점`
                                                    }
                                                },
                                                style: {
                                                    fontSize: "12px",
                                                    colors: "#A0ACBB", 
                                                    fontFamily: "Inter"
                                                }
                                            }
                                        }}
                                        series={[{ name: title, data: actualTrendData }]}
                                        type='area'
                                        height={100}
                                    />
                                    <div className="fs-12 text-muted text-nowrap">
                                        <span className={`fw-semibold text-${color}`}>
                                            {getStatusText(key)}
                                        </span><br />
                                        <span>네이버 데이터랩</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </>
    )
}

export default TasksOverviewChart
