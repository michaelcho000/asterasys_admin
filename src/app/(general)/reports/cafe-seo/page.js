import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import CafeSeoTable from '@/components/asterasys/CafeSeoTable'

const CafeSeoPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <CafeSeoTable />
        </div>
      </div>
    </>
  )
}

export default CafeSeoPage