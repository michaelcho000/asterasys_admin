import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import AutoCompleteTable from '@/components/asterasys/AutoCompleteTable'

const AutoCompletePage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <AutoCompleteTable />
        </div>
      </div>
    </>
  )
}

export default AutoCompletePage