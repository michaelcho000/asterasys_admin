'use client'

import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import MarketingInsightsKPICards from '@/components/asterasys/MarketingInsightsKPICards'
import CompetitorContentHeatmap from '@/components/asterasys/CompetitorContentHeatmap'
import ViralTypeAnalysis from '@/components/asterasys/ViralTypeAnalysis'
import ChannelCompetitivePosition from '@/components/asterasys/ChannelCompetitivePosition'

const MarketingInsightsPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          {/* SECTION 1: 브랜드 노출 현황 KPI */}
          <MarketingInsightsKPICards />

          {/* SECTION 7: 경쟁사 콘텐츠 전략 분석 */}
          <div className="col-12">
            <CompetitorContentHeatmap />
          </div>

          {/* SECTION 8: 바이럴 유형 분석 */}
          <div className="col-12">
            <ViralTypeAnalysis />
          </div>

          {/* SECTION 9: 채널별 경쟁 포지션 */}
          <ChannelCompetitivePosition />
        </div>
      </div>
    </>
  )
}

export default MarketingInsightsPage