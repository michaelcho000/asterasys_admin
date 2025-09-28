import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'

// Dashboard Components - Data Source Mapping:
import AsteraysKPIStatistics from '@/components/widgetsStatistics/AsteraysKPIStatistics'
// └── Data: /src/utils/fackData/asterasysKPIData.js (Manual update required)
// └── CSV Sources: blog_rank.csv, cafe_rank.csv, news_rank.csv, traffic.csv, sale.csv

import PaymentRecordChart from '@/components/widgetsCharts/PaymentRecordChart' 
// └── Data: /src/utils/chartsLogic/paymentRecordChartOption.js (Manual update required)
// └── CSV Sources: blog_rank.csv (publishData), cafe_comments.csv (commentData), traffic.csv (searchVolume)

import LeadsOverviewChart from '@/components/widgetsCharts/LeadsOverviewChart'
// └── Data: /src/utils/fackData/asterasysChannelData.js (Manual update required)
// └── CSV Sources: cafe_rank.csv, youtube_rank.csv, news_rank.csv, blog_rank.csv

import TasksOverviewChart from '@/components/widgetsCharts/TasksOverviewChart'
// └── Data: Direct CSV fetch - /asterasys_total_data - naver datalab.csv (Automatic)
// └── CSV Sources: naver datalab.csv (Real-time trend data)

import Project from '@/components/widgetsList/Project'
import FacebookTargetingWidget from '@/components/asterasys/FacebookTargetingWidget'
// └── Data: API /api/data/files/facebook_targeting (Automatic)
// └── CSV Sources: facebook_targeting.csv

import SalesMiscellaneous from '@/components/widgetsMiscellaneous/SalesMiscellaneous'

import LatestLeads from '@/components/widgetsTables/LatestLeads'
// └── Data: Multiple APIs - cafe_rank, youtube_rank, blog_rank, news_rank (Automatic)
// └── CSV Sources: 4 ranking CSV files integrated

import TeamProgress from '@/components/widgetsList/Progress'
import { projectsDataTwo } from '@/utils/fackData/projectsDataTwo'

import AsteraysProductPortfolio from '@/components/asterasys/AsteraysProductPortfolio'
// └── Data: Static asterasysProductsData + API naver datalab (Mixed)
// └── CSV Sources: blog_rank.csv, cafe_rank.csv, traffic.csv, sale.csv, naver datalab.csv

import AsterasysOperationalReports from '@/components/asterasys/AsterasysOperationalReports'
import AsterasysQuantitativeDashboard from '@/components/asterasys/AsterasysQuantitativeDashboard'
import AsterasysCompetitiveDashboard from '@/components/asterasys/AsterasysCompetitiveDashboard'
// import AsterasysComprehensiveDashboard from '@/components/asterasys/AsterasysComprehensiveDashboard'
import DuplicateLayout from './duplicateLayout'

const Home = () => {
  return (
    <DuplicateLayout>
      <PageHeader />
      <div className='main-content'>
        <div className='row'>
          <AsteraysKPIStatistics />
          <PaymentRecordChart />
          <LeadsOverviewChart chartHeight={315} />
          <AsteraysProductPortfolio />
          <TasksOverviewChart />
          <LatestLeads title={"경쟁사 순위 현황"} />
          <FacebookTargetingWidget />
        </div>
      </div>
    </DuplicateLayout>
  )
}

export default Home
