import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import CafeInsightsCards from '@/components/asterasys/CafeInsightsCards'
import CafeEngagementCorrelationChart from '@/components/asterasys/CafeEngagementCorrelationChart'
import CafeMarketLeaderboard from '@/components/asterasys/CafeMarketLeaderboard'
import CafeProductFocusCard from '@/components/asterasys/CafeProductFocusCard'

const CafeAnalysisPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <CafeInsightsCards />
        </div>
        <div className='row g-4 mt-0'>
          <CafeEngagementCorrelationChart />
        </div>
        <div className='row g-4 mt-0'>
          <CafeMarketLeaderboard />
        </div>
        <div className='row g-4 mt-0'>
          <CafeProductFocusCard />
        </div>
      </div>
    </>
  )
}

export default CafeAnalysisPage
