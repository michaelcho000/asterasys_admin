import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import ExperiencePostTable from '@/components/asterasys/ExperiencePostTable'

const ExperiencePostsPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <ExperiencePostTable />
        </div>
      </div>
    </>
  )
}

export default ExperiencePostsPage