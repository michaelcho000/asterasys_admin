'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import { rfMarketChartOptions } from '@/utils/chartsLogic/asterasysMarketChartOptions'
import CardHeader from '@/components/shared/CardHeader'
import useCardTitleActions from '@/hooks/useCardTitleActions'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

/**
 * RF 시장 순위 차트 (PaymentRecordChart 기반)
 * 실제 cafe_rank.csv 데이터로 9개 RF 브랜드 순위 시각화
 */

const AsterasysMarketChart = () => {
    const chartOptions = rfMarketChartOptions()
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()

    if (isRemoved) {
        return null
    }

    return (
        <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
            <CardHeader 
                title={"RF (고주파) 시장 순위"} 
                refresh={handleRefresh} 
                remove={handleDelete} 
                expanded={handleExpand} 
            />
            <div className="card-body custom-card-action p-4">
                <ReactApexChart
                    options={chartOptions}
                    series={chartOptions.series}
                    type="bar"
                    height={350}
                />
                
                {/* Asterasys 성과 하이라이트 */}
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="alert alert-warning border-0">
                            <div className="d-flex align-items-center">
                                <span className="badge bg-warning text-dark me-3">⭐</span>
                                <div>
                                    <strong>쿨페이즈 (Asterasys)</strong>: 9위 포지션 • 220건 발행량
                                    <br />
                                    <small className="text-muted">RF 시장에서 개선 기회 식별 • 상위권 진입 전략 필요</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-footer bg-light">
                <div className="row text-center">
                    <div className="col-4">
                        <div className="small text-muted">RF 총 브랜드</div>
                        <div className="fw-bold">9개</div>
                    </div>
                    <div className="col-4">
                        <div className="small text-muted">총 발행량</div>
                        <div className="fw-bold">1,585건</div>
                    </div>
                    <div className="col-4">
                        <div className="small text-muted">Asterasys 점유율</div>
                        <div className="fw-bold text-warning">13.9%</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AsterasysMarketChart