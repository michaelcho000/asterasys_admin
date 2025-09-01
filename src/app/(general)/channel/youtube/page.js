import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import YouTubeInsightsCards from '@/components/asterasys/YouTubeInsightsCards'
import YouTubeSponsorAdCard from '@/components/asterasys/YouTubeSponsorAdCard'
import YouTubeSalesCorrelationChart from '@/components/asterasys/YouTubeSalesCorrelationChart'
import YouTubeComprehensiveTable from '@/components/asterasys/YouTubeComprehensiveTable'

const YouTubeAnalysisPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <YouTubeInsightsCards />
          <YouTubeSponsorAdCard />
          <YouTubeSalesCorrelationChart />
          <YouTubeComprehensiveTable />
        </div>
      </div>
    </>
  )
}

export default YouTubeAnalysisPage