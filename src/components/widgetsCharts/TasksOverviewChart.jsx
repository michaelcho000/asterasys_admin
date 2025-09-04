'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic';
import { tasksOverviewChartOption } from '@/utils/chartsLogic/tasksOverviewChatOption'
import getIcon from '@/utils/getIcon'
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// 실제 네이버 검색어 트렌드 API 응답 데이터 (2024년 1-12월)
const overviewInfo = [
    { 
        title: "리프테라 검색 트렌드", 
        icon: "feather-activity", 
        total_number: "492", 
        completed_number: "0.55", 
        progress: "Low", 
        chartColor: "#3454d1", 
        color: "primary",
        trendData: [0.55, 0, 0, 0, 0, 0, 0, 0, 0, 0.55, 0, 0], // 실제 네이버 API: 1월, 10월만 0.55
        naverInsight: "매우 낮은 검색량 (0.55 수준)"
    },
    { 
        title: "쿨페이즈 검색 트렌드", 
        icon: "feather-trending-up", 
        total_number: "159", 
        completed_number: "100", 
        progress: "100", 
        chartColor: "#10b981", 
        color: "success", 
        trendData: [0.55, 2.77, 13.95, 100, 0.89, 0, 0.55, 10.41, 0, 0, 0, 0], // 실제 네이버 API 정확한 데이터
        naverInsight: "4월 최대 피크(100) → 8월 재상승(10.41)"
    },
    { 
        title: "쿨소닉 검색 트렌드", 
        icon: "feather-minus", 
        total_number: "23", 
        completed_number: "0", 
        progress: "None", 
        chartColor: "#ef4444", 
        color: "danger",
        trendData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 실제 네이버 API: 완전히 검색 데이터 없음
        naverInsight: "검색량 전혀 없음 - 인지도 부족"
    },
]

const TasksOverviewChart = () => {
    const chartOptions = tasksOverviewChartOption()
    const [naverDataLabTrends, setNaverDataLabTrends] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadNaverDataLabData = async () => {
            try {
                setLoading(true)
                
                // API를 통해 네이버 데이터랩 데이터 가져오기
                const timestamp = Date.now()
                const response = await fetch(`/api/data/files/naver datalab?t=${timestamp}`, {
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
                
                const processedData = data.marketData.filter(row => row.날짜 && row.날짜.includes('2025')) // 2025년 데이터만
                
                // 주간 단위로 그룹화 
                const weeklyData = []
                for (let i = 0; i < processedData.length; i += 7) {
                    const week = processedData.slice(i, i + 7)
                    if (week.length > 0) {
                        const startDate = week[0].날짜
                        const endDate = week[week.length - 1].날짜
                        weeklyData.push({
                            주차: `${new Date(startDate).getMonth() + 1}/${new Date(startDate).getDate()}-${new Date(endDate).getDate()}`,
                            날짜범위: `${startDate} ~ ${endDate}`,
                            리프테라: week.reduce((sum, day) => sum + day.리프테라, 0) / week.length,
                            쿨페이즈: week.reduce((sum, day) => sum + day.쿨페이즈, 0) / week.length,
                            쿨소닉: week.reduce((sum, day) => sum + day.쿨소닉, 0) / week.length
                        })
                    }
                }
                
                if (weeklyData.length > 0) {
                    // 최근 8주 데이터 사용 
                    const recentWeeks = weeklyData.slice(-8)
                    
                    const trends = {
                        리프테라: {
                            data: recentWeeks.map(week => week.리프테라),
                            categories: recentWeeks.map(week => week.주차),
                            dateRanges: recentWeeks.map(week => week.날짜범위),
                            current: recentWeeks[recentWeeks.length - 1]?.리프테라 || 0,
                            previous: recentWeeks[recentWeeks.length - 4]?.리프테라 || recentWeeks[0]?.리프테라 || 0, // 4주 전과 비교
                            avg: recentWeeks.reduce((sum, week) => sum + week.리프테라, 0) / recentWeeks.length,
                            max: Math.max(...recentWeeks.map(week => week.리프테라))
                        },
                        쿨페이즈: {
                            data: recentWeeks.map(week => week.쿨페이즈),
                            categories: recentWeeks.map(week => week.주차),
                            dateRanges: recentWeeks.map(week => week.날짜범위),
                            current: recentWeeks[recentWeeks.length - 1]?.쿨페이즈 || 0,
                            previous: recentWeeks[recentWeeks.length - 4]?.쿨페이즈 || recentWeeks[0]?.쿨페이즈 || 0, // 4주 전과 비교
                            avg: recentWeeks.reduce((sum, week) => sum + week.쿨페이즈, 0) / recentWeeks.length,
                            max: Math.max(...recentWeeks.map(week => week.쿨페이즈))
                        },
                        쿨소닉: {
                            data: recentWeeks.map(week => week.쿨소닉),
                            categories: recentWeeks.map(week => week.주차),
                            dateRanges: recentWeeks.map(week => week.날짜범위),
                            current: recentWeeks[recentWeeks.length - 1]?.쿨소닉 || 0,
                            previous: recentWeeks[recentWeeks.length - 4]?.쿨소닉 || recentWeeks[0]?.쿨소닉 || 0, // 4주 전과 비교
                            avg: recentWeeks.reduce((sum, week) => sum + week.쿨소닉, 0) / recentWeeks.length,
                            max: Math.max(...recentWeeks.map(week => week.쿨소닉))
                        }
                    }
                    
                    setNaverDataLabTrends(trends)
                }
            } catch (error) {
                console.error('네이버 데이터랩 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadNaverDataLabData()
    }, [])

    const getActualTrendData = (productName, defaultData) => {
        if (loading || !naverDataLabTrends[productName]) {
            return defaultData
        }
        return naverDataLabTrends[productName].data
    }

    const getProgressStatus = (productName) => {
        if (loading) return "로딩중"
        if (!naverDataLabTrends[productName]) return "데이터없음"
        
        const current = naverDataLabTrends[productName].current
        const max = naverDataLabTrends[productName].max
        
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
        const changePercent = ((trend.current - trend.previous) / trend.previous * 100).toFixed(1)
        return `최근 4주 대비 ${changePercent > 0 ? '+' : ''}${changePercent}%`
    }

    return (
        <>
            {
                overviewInfo.map(({ completed_number, icon, progress, title, total_number, chartColor, color, trendData }, index) => {
                    const productName = title.includes('리프테라') ? '리프테라' : 
                                       title.includes('쿨페이즈') ? '쿨페이즈' : '쿨소닉';
                    const actualTrendData = getActualTrendData(productName, trendData);
                    const actualProgress = getProgressStatus(productName);
                    
                    return (
                        <div key={index} className="col-lg-4 task-overview-card">
                            <div className="card mb-4 stretch stretch-full">
                                <div className="card-header d-flex align-items-center justify-content-between">
                                    <div className="d-flex gap-3 align-items-center">
                                        <div className="avatar-text">
                                            <i className='fs-16'>{getIcon(icon)}</i>
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark">{title}</div>
                                            <div className="fs-12 text-muted">판매 {total_number}대 • 네이버 실시간</div>
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
                                                categories: naverDataLabTrends[productName]?.categories || chartOptions.xaxis.categories,
                                                axisBorder: { show: false },
                                                axisTicks: { show: false }
                                            },
                                            tooltip: {
                                                x: {
                                                    formatter: function(value, { series, seriesIndex, dataPointIndex, w }) {
                                                        const dateRanges = naverDataLabTrends[productName]?.dateRanges || []
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
                                            {getStatusText(productName)}
                                        </span><br />
                                        <span>네이버 데이터랩</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                )
            }
        </>
    )
}

export default TasksOverviewChart

