import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import NewsProductCategoryRadar from '@/components/asterasys/NewsProductCategoryRadar'

const NewsAnalysisPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <NewsProductCategoryRadar />
      </div>
    </>
  )
}

export default NewsAnalysisPage