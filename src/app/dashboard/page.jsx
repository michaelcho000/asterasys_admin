'use client';

import React, { useEffect, useState } from 'react';
import DuplicateLayout from '../duplicateLayout';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import PageHeaderDate from '@/components/shared/pageHeader/PageHeaderDate';
import AsteraysKPIStatistics from '@/components/dashboard/AsteraysKPIStatistics';
import MarketShareChart from '@/components/dashboard/MarketShareChart';
import CompetitiveAnalysisChart from '@/components/dashboard/CompetitiveAnalysisChart';
import ChannelPerformanceChart from '@/components/dashboard/ChannelPerformanceChart';
import ProductRankingTable from '@/components/dashboard/ProductRankingTable';
import TopInfluencersTable from '@/components/dashboard/TopInfluencersTable';
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore';
import { withMonthParam } from '@/utils/withMonthParam';

/**
 * Asterasys Marketing Intelligence Dashboard
 * Professional enterprise dashboard using Duralux template design system
 */

export default function AsteraysMarketingDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [channelsData, setChannelsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const month = useSelectedMonthStore((state) => state.selectedMonth);

  useEffect(() => {
    if (!month) return;
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [kpiResponse, channelsResponse] = await Promise.all([
          fetch(withMonthParam('/api/data/kpis', month)),
          fetch(withMonthParam('/api/data/channels', month))
        ]);

        if (!kpiResponse.ok || !channelsResponse.ok) {
          throw new Error('Failed to load dashboard data');
        }

        const [kpiData, channelsData] = await Promise.all([
          kpiResponse.json(),
          channelsResponse.json()
        ]);

        setDashboardData(kpiData);
        setChannelsData(channelsData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [month]);

  if (loading) {
    return (
      <DuplicateLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="text-primary">Asterasys Marketing Intelligence</h4>
            <p className="text-muted">데이터 로딩 중...</p>
          </div>
        </div>
      </DuplicateLayout>
    );
  }

  if (error) {
    return (
      <DuplicateLayout>
        <div className="alert alert-danger mx-4 mt-4">
          <h4 className="alert-heading">데이터 로딩 오류</h4>
          <p>{error}</p>
          <p className="mb-0">
            <code>npm run process-data</code>를 실행하여 데이터를 처리해주세요.
          </p>
        </div>
      </DuplicateLayout>
    );
  }

  return (
    <DuplicateLayout>
      <PageHeader>
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            <h2 className="fs-18 fw-bold text-dark mb-1">Asterasys Marketing Intelligence</h2>
            <p className="fs-12 text-muted mb-0">RF/HIFU 시장 분석 및 경쟁사 대비 성과 모니터링</p>
          </div>
          <PageHeaderDate />
        </div>
      </PageHeader>

      <div className="main-content">
        <div className="row">
          {/* KPI Statistics Cards */}
          <AsteraysKPIStatistics data={dashboardData} />
          
          {/* Market Share Chart */}
          <MarketShareChart data={dashboardData} />
          
          {/* Channel Performance Chart */}
          <ChannelPerformanceChart data={channelsData} />
          
          {/* Competitive Analysis Chart */}
          <CompetitiveAnalysisChart data={dashboardData} />
          
          {/* Product Ranking Table */}
          <ProductRankingTable data={dashboardData} />
          
          {/* Top Influencers Table */}
          <TopInfluencersTable data={channelsData} />
        </div>
      </div>
    </DuplicateLayout>
  );
}
