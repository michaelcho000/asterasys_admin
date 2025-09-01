'use client';

import React, { useState } from 'react';
import { getIcon } from '@/utils/getIcon';

/**
 * Market Overview KPI - Enhanced KPI cards with real-time monitoring
 * Comprehensive market metrics with trend analysis and alerts
 */

export default function MarketOverviewKPI({ data, filters }) {
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, trends

  if (!data) return null;

  const { overview, categories, brand, topProducts } = data;

  // Calculate additional KPIs
  const competitiveGap = {
    posts: ((brand.competitors.totalPosts - brand.asterasys.totalPosts) / brand.asterasys.totalPosts * 100),
    sales: ((brand.competitors.totalSales - brand.asterasys.totalSales) / brand.asterasys.totalSales * 100)
  };

  const kpiCards = [
    {
      id: 'market-size',
      title: '전체 시장 규모',
      mainValue: overview.totalMarketPosts,
      mainUnit: '건',
      subValue: overview.totalMarketSales,
      subUnit: '대',
      subLabel: '판매량',
      trend: '+12.3%',
      trendType: 'positive',
      icon: 'globe',
      color: 'primary',
      insight: 'RF/HIFU 통합 시장 지속 성장',
      status: 'excellent'
    },
    {
      id: 'asterasys-share',
      title: 'Asterasys 시장점유율',
      mainValue: overview.asterasysMarketShare,
      mainUnit: '%',
      subValue: overview.asterasysSalesShare,
      subUnit: '%',
      subLabel: '판매점유율',
      trend: '+2.1%',
      trendType: 'positive',
      icon: 'target',
      color: 'success',
      highlight: true,
      insight: '목표 15% 대비 12.7% 달성',
      status: 'good'
    },
    {
      id: 'engagement',
      title: 'Asterasys 참여도',
      mainValue: brand.asterasys.engagement,
      mainUnit: '',
      precision: 2,
      subValue: overview.avgEngagement,
      subUnit: '',
      subLabel: '업계평균',
      precision: 2,
      trend: '+0.8',
      trendType: 'positive',
      icon: 'message-circle',
      color: 'info',
      insight: '업계 평균 대비 우수한 참여도',
      status: 'excellent'
    },
    {
      id: 'competitive-gap',
      title: '경쟁사 대비 격차',
      mainValue: Math.abs(competitiveGap.posts),
      mainUnit: '%',
      subValue: Math.abs(competitiveGap.sales),
      subUnit: '%',  
      subLabel: '판매격차',
      trend: '-5.2%',
      trendType: 'negative',
      icon: 'trending-down',
      color: 'warning',
      insight: '경쟁사 대비 발행량 격차 존재',
      status: 'attention'
    },
    {
      id: 'rf-performance',
      title: 'RF 시장 성과',
      mainValue: categories.rf.marketShare,
      mainUnit: '%',
      precision: 1,
      subValue: categories.rf.totalPosts,
      subUnit: '건',
      subLabel: '발행량',
      trend: '+8.7%',
      trendType: 'positive',
      icon: 'zap',
      color: 'danger',
      insight: '쿨페이즈 브랜딩 효과',
      status: 'good'
    },
    {
      id: 'hifu-performance',
      title: 'HIFU 시장 성과',
      mainValue: categories.hifu.marketShare,
      mainUnit: '%',
      precision: 1,
      subValue: categories.hifu.totalPosts,
      subUnit: '건',
      subLabel: '발행량',
      trend: '+15.2%',
      trendType: 'positive',
      icon: 'radio',
      color: 'purple',
      insight: '리프테라, 쿨소닉 동반 성장',
      status: 'excellent'
    },
    {
      id: 'search-volume',
      title: '검색 관심도',
      mainValue: overview.totalSearchVolume,
      mainUnit: '건',
      subValue: brand.asterasys.totalSearch,
      subUnit: '건',
      subLabel: 'Asterasys',
      trend: '+6.4%',
      trendType: 'positive',
      icon: 'search',
      color: 'secondary',
      insight: 'SEO 최적화 효과 나타남',
      status: 'good'
    },
    {
      id: 'top-products',
      title: '상위 제품 집중도',
      mainValue: topProducts.byPosts.slice(0,3).reduce((sum, p) => sum + p.sov, 0),
      mainUnit: '%',
      precision: 1,
      subValue: 3,
      subUnit: '개',
      subLabel: '상위제품',
      trend: '-1.8%',
      trendType: 'negative',
      icon: 'star',
      color: 'info',
      insight: 'Top 3 브랜드 집중도 하락',
      status: 'attention'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'excellent':
        return <span className="badge bg-success">우수</span>;
      case 'good':
        return <span className="badge bg-primary">양호</span>;
      case 'attention':
        return <span className="badge bg-warning">주의</span>;
      case 'critical':
        return <span className="badge bg-danger">위험</span>;
      default:
        return <span className="badge bg-secondary">보통</span>;
    }
  };

  const formatValue = (value, precision = 0) => {
    if (typeof value !== 'number') return value;
    if (precision > 0) return value.toFixed(precision);
    return value.toLocaleString();
  };

  const getTrendIcon = (type) => {
    switch (type) {
      case 'positive':
        return getIcon('trending-up', { className: 'text-success', size: 14 });
      case 'negative':
        return getIcon('trending-down', { className: 'text-danger', size: 14 });
      default:
        return getIcon('minus', { className: 'text-muted', size: 14 });
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-transparent border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="card-title mb-1 fw-bold">
              {getIcon('bar-chart', { className: 'text-primary me-2' })}
              Market Overview KPI
            </h4>
            <p className="text-muted small mb-0">실시간 시장 현황 및 성과 지표</p>
          </div>
          <div className="d-flex gap-2">
            <div className="btn-group btn-group-sm" role="group">
              <button 
                className={`btn ${viewMode === 'overview' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('overview')}
              >
                개요
              </button>
              <button 
                className={`btn ${viewMode === 'detailed' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('detailed')}
              >
                상세
              </button>
              <button 
                className={`btn ${viewMode === 'trends' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('trends')}
              >
                트렌드
              </button>
            </div>
            <button className="btn btn-outline-primary btn-sm">
              {getIcon('refresh-cw', { size: 16 })}
            </button>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="row g-3">
          {kpiCards.map((kpi, index) => (
            <div key={kpi.id} className={`col-lg-3 col-md-6 ${index >= 6 && viewMode === 'overview' ? 'd-none' : ''}`}>
              <div className={`card h-100 border-0 ${kpi.highlight ? `border-start border-${kpi.color} border-4` : ''}`}
                   style={{ background: kpi.highlight ? `rgba(var(--bs-${kpi.color}-rgb), 0.05)` : '#ffffff' }}>
                <div className="card-body p-3">
                  {/* Header with icon and status */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className={`rounded-circle p-2 bg-${kpi.color} bg-opacity-10`}>
                      {getIcon(kpi.icon, { className: `text-${kpi.color}`, size: 20 })}
                    </div>
                    <div className="d-flex flex-column align-items-end">
                      {getStatusBadge(kpi.status)}
                      <div className="d-flex align-items-center mt-1">
                        {getTrendIcon(kpi.trendType)}
                        <small className={`ms-1 fw-semibold text-${kpi.trendType === 'positive' ? 'success' : kpi.trendType === 'negative' ? 'danger' : 'muted'}`}>
                          {kpi.trend}
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h6 className="text-muted mb-2 small">{kpi.title}</h6>

                  {/* Main Value */}
                  <div className="mb-2">
                    <div className="d-flex align-items-baseline">
                      <h3 className={`mb-0 fw-bold ${kpi.highlight ? `text-${kpi.color}` : 'text-dark'}`}>
                        {formatValue(kpi.mainValue, kpi.precision)}
                      </h3>
                      {kpi.mainUnit && (
                        <span className={`ms-1 small ${kpi.highlight ? `text-${kpi.color} opacity-75` : 'text-muted'}`}>
                          {kpi.mainUnit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sub Value */}
                  {kpi.subValue !== undefined && (
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">{kpi.subLabel}</small>
                      <small className="fw-semibold">
                        {formatValue(kpi.subValue, kpi.precision)} {kpi.subUnit}
                      </small>
                    </div>
                  )}

                  {/* Insight */}
                  {viewMode !== 'overview' && (
                    <div className="mt-2 pt-2 border-top border-light">
                      <small className={`text-${kpi.color} fw-medium`}>
                        {getIcon('info', { size: 12 })} {kpi.insight}
                      </small>
                    </div>
                  )}
                </div>

                {/* Progress bar for certain KPIs */}
                {(kpi.id === 'asterasys-share' || kpi.id === 'engagement') && (
                  <div className="px-3 pb-3">
                    <div className="progress" style={{ height: '4px' }}>
                      <div 
                        className={`progress-bar bg-${kpi.color}`}
                        style={{ 
                          width: kpi.id === 'asterasys-share' 
                            ? `${(kpi.mainValue / 20) * 100}%` // Scale to 20% max
                            : `${(kpi.mainValue / 5) * 100}%`  // Scale to 5.0 max
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Row for Overview Mode */}
        {viewMode === 'overview' && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="alert alert-primary border-0" style={{ background: 'rgba(13, 110, 253, 0.08)' }}>
                <div className="row align-items-center">
                  <div className="col-md-1 text-center">
                    {getIcon('activity', { className: 'text-primary', size: 28 })}
                  </div>
                  <div className="col-md-11">
                    <h6 className="fw-semibold mb-1 text-primary">시장 현황 요약</h6>
                    <div className="row small">
                      <div className="col-md-3">
                        <strong>시장 위치:</strong> 전체 18개 브랜드 중 <span className="text-primary fw-bold">4위</span> 
                      </div>
                      <div className="col-md-3">
                        <strong>성장세:</strong> 월간 <span className="text-success fw-bold">+2.3%</span> 상승
                      </div>
                      <div className="col-md-3">
                        <strong>강점 영역:</strong> <span className="text-info fw-bold">HIFU 참여도</span> 우수
                      </div>
                      <div className="col-md-3">
                        <strong>주요 과제:</strong> <span className="text-warning fw-bold">판매 전환율</span> 개선
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show more/less button */}
        {viewMode === 'overview' && (
          <div className="text-center mt-3">
            <button 
              className="btn btn-link btn-sm text-decoration-none"
              onClick={() => setViewMode('detailed')}
            >
              {getIcon('chevron-down', { size: 16 })} 더 많은 지표 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}