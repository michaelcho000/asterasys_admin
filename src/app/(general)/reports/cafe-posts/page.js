import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import CafePostsTable from '@/components/asterasys/CafePostsTable'

const CafePostsPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <CafePostsTable />
        </div>
      </div>
    </>
  )
}

export default CafePostsPage