import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import CafeCommentsTable from '@/components/asterasys/CafeCommentsTable'

const CafeCommentsPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <CafeCommentsTable />
        </div>
      </div>
    </>
  )
}

export default CafeCommentsPage