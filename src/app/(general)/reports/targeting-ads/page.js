import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import TargetingAdsTable from '@/components/asterasys/TargetingAdsTable'

const TargetingAdsPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <TargetingAdsTable />
        </div>
      </div>
    </>
  )
}

export default TargetingAdsPage