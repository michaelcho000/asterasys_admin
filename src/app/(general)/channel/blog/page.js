import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import BlogInsightsCards from '@/components/asterasys/BlogInsightsCards'
import BlogProductFocusCard from '@/components/asterasys/BlogProductFocusCard'
import BlogEngagementCorrelationChart from '@/components/asterasys/BlogEngagementCorrelationChart'
import BlogMarketLeaderboard from '@/components/asterasys/BlogMarketLeaderboard'
import BlogAuthorSpotlight from '@/components/asterasys/BlogAuthorSpotlight'

const BlogAnalysisPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <BlogInsightsCards />
        </div>
        <div className='row g-4 mt-0'>
          <BlogEngagementCorrelationChart />
        </div>
        <div className='row g-4 mt-0'>
          <BlogMarketLeaderboard />
        </div>
        <div className='row g-4 mt-0'>
          <BlogAuthorSpotlight />
          <BlogProductFocusCard />
        </div>
      </div>
    </>
  )
}

export default BlogAnalysisPage
