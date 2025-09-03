import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import YouTubeAdsTable from '@/components/asterasys/YouTubeAdsTable'

const YouTubeAdsPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <YouTubeAdsTable />
        </div>
      </div>
    </>
  )
}

export default YouTubeAdsPage