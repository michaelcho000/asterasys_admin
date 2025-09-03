import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import OutdoorAdsTable from '@/components/asterasys/OutdoorAdsTable'

const OutdoorAdsPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <OutdoorAdsTable />
        </div>
      </div>
    </>
  )
}

export default OutdoorAdsPage