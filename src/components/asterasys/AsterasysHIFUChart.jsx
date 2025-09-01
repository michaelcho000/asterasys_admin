'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import { hifuMarketChartOptions } from '@/utils/chartsLogic/asterasysMarketChartOptions'
import CardHeader from '@/components/shared/CardHeader'
import useCardTitleActions from '@/hooks/useCardTitleActions'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

/**
 * HIFU 시장 분석 도넛차트 (LeadsOverviewChart 기반)
 * 실제 cafe_rank.csv 데이터로 9개 HIFU 브랜드 점유율 시각화
 */

const AsterasysHIFUChart = () => {
    const chartOptions = hifuMarketChartOptions()
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()

    if (isRemoved) {
        return null
    }

    return (
        <div className={`card stretch stretch-full leads-overview ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
            <CardHeader 
                title={"HIFU (초음파) 시장 분포"} 
                refresh={handleRefresh} 
                remove={handleDelete} 
                expanded={handleExpand} 
            />
            
            <div className="card-body custom-card-action">
                <ReactApexChart
                    options={chartOptions}
                    series={chartOptions.series}
                    type='donut'
                    height={315}
                />
                
                {/* Asterasys HIFU 성과 */}
                <div className="row g-2 pt-3 mt-3 border-top">
                    <div className="col-6">
                        <div className="text-center p-3 bg-warning-subtle rounded">
                            <div className="fw-bold text-warning h6 mb-1">⭐ 쿨소닉</div>
                            <div className="small text-muted">3위 • 230건</div>
                            <div className="small text-success">16.4% 점유</div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="text-center p-3 bg-warning-subtle rounded">
                            <div className="fw-bold text-warning h6 mb-1">⭐ 리프테라</div>
                            <div className="small text-muted">4위 • 202건</div>
                            <div className="small text-success">14.4% 점유</div>
                        </div>
                    </div>
                </div>
                
                <div className="row mt-3">
                    <div className="col-12">
                        <div className="alert alert-info border-0 p-3">
                            <div className="text-center">
                                <strong>HIFU 시장 Asterasys 점유율</strong>
                                <div className="h5 text-info fw-bold mt-1">30.8%</div>
                                <small className="text-muted">쿨소닉 + 리프테라 합계 (432건/1,402건)</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="card-footer bg-light">
                <div className="text-center">
                    <small className="text-muted">데이터 출처: cafe_rank.csv • 2025년 8월</small>
                </div>
            </div>
        </div>
    )
}

export default AsterasysHIFUChart