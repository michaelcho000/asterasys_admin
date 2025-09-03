import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import HospitalBlogTable from '@/components/asterasys/HospitalBlogTable'

const HospitalBlogPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <HospitalBlogTable />
        </div>
      </div>
    </>
  )
}

export default HospitalBlogPage