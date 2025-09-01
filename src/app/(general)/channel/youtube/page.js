import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import YouTubeInsightsCards from '@/components/asterasys/YouTubeInsightsCards'
import YouTubeSponsorAdCard from '@/components/asterasys/YouTubeSponsorAdCard'
import YouTubeComprehensiveTable from '@/components/asterasys/YouTubeComprehensiveTable'

const YouTubeAnalysisPage = () => {
  return (
    <>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <YouTubeInsightsCards />
          <YouTubeSponsorAdCard />
          {/* TODO: 새로운 카드 - 제품 YouTube 성과 vs 판매량 상관관계 */}
          <div className="col-xxl-8">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">YouTube 성과 vs 판매량 상관관계</h5>
              </div>
              <div className="card-body">
                <div className="text-center text-muted py-5">
                  구현 예정 - YouTube 조회수 대비 판매량 분석
                </div>
              </div>
            </div>
          </div>
          <YouTubeComprehensiveTable />
        </div>
      </div>
    </>
  )
}

export default YouTubeAnalysisPage