import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import YouTubeCommentsTable from '@/components/asterasys/YouTubeCommentsTable'

const YouTubeCommentsPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <YouTubeCommentsTable />
        </div>
      </div>
    </>
  )
}

export default YouTubeCommentsPage