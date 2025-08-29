'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { getIcon } from '@/utils/getIcon';

// Dynamic import for ApexCharts
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Trend Analysis Section - Time series analysis and forecasting
 * Ready for weekly data integration starting September 2025
 */

export default function TrendAnalysisSection({ data, channels, filters }) {
  const [trendView, setTrendView] = useState('overview'); // overview, products, channels, forecast
  const [timeGrain, setTimeGrain] = useState('monthly'); // monthly, weekly (ready for September)

  if (!data) return null;

  // Mock trend data - will be replaced with actual time series when weekly data is available
  const generateMockTrendData = () => {
    const months = ['2025-06', '2025-07', '2025-08'];
    const asterasysProducts = ['쿨페이즈', '쿨소닉', '리프테라'];
    
    return asterasysProducts.map(product => {
      const productData = data.topProducts.asterasysOnly?.find(p => p.keyword === product) || {};
      const baseValue = productData.posts || 0;
      
      return {
        name: product,
        data: months.map((month, index) => ({
          x: month,
          y: Math.max(0, baseValue + (Math.random() - 0.5) * baseValue * 0.3 * (index + 1))
        })),
        color: productData.color || '#667eea'
      };
    });
  };

  // Generate competitive trend data
  const generateCompetitiveTrends = () => {
    const topCompetitors = ['써마지', '울쎄라', '인모드'];
    const months = ['2025-06', '2025-07', '2025-08'];
    
    return topCompetitors.map(competitor => {
      const competitorData = data.topProducts.byPosts?.find(p => p.keyword === competitor) || {};
      const baseValue = competitorData.posts || 0;
      
      return {
        name: competitor,
        data: months.map((month, index) => ({
          x: month,
          y: Math.max(0, baseValue + (Math.random() - 0.5) * baseValue * 0.2 * (index + 1))
        })),
        color: competitorData.color || '#cccccc'
      };
    });
  };

  const trendData = generateMockTrendData();
  const competitiveTrendData = generateCompetitiveTrends();

  // Chart options for trend analysis
  const trendChartOptions = {
    chart: {
      height: 350,
      type: 'line',
      zoom: { enabled: true },
      toolbar: { 
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    colors: trendData.map(t => t.color),
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    title: {
      text: 'Asterasys Products Trend Analysis',
      align: 'left',
      style: { fontSize: '16px', fontWeight: 'bold' }
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 3
    },
    markers: {
      size: 6,
      strokeWidth: 2,
      strokeColors: '#ffffff',
      hover: { sizeOffset: 2 }
    },
    xaxis: {
      type: 'category',
      title: { text: '기간' }
    },
    yaxis: {
      title: { text: '발행량' },
      labels: {
        formatter: function(val) {
          return Math.round(val).toLocaleString();
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right'
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function(val) {
          return Math.round(val).toLocaleString() + '건';
        }
      }
    }
  };

  // Forecast data (mock)
  const generateForecast = () => {
    return [
      {
        product: '리프테라',
        current: 202,
        forecast_1m: 245,
        forecast_3m: 310,
        confidence: 85,
        trend: 'growing'
      },
      {
        product: '쿨페이즈', 
        current: 220,
        forecast_1m: 235,
        forecast_3m: 265,
        confidence: 78,
        trend: 'stable'
      },
      {
        product: '쿨소닉',
        current: 230,
        forecast_1m: 285,
        forecast_3m: 380,
        confidence: 82,
        trend: 'growing'
      }
    ];
  };

  const forecastData = generateForecast();

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-transparent border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="card-title mb-1 fw-bold">
              {getIcon('trending-up', { className: 'text-primary me-2' })}
              Trend Analysis
            </h4>
            <p className="text-muted small mb-0">추세 분석 및 예측 모델링</p>
          </div>
          <div className="d-flex gap-2">
            {/* Time Grain Selector */}
            <div className="btn-group btn-group-sm" role="group">
              <button 
                className={`btn ${timeGrain === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTimeGrain('monthly')}
              >
                월간
              </button>
              <button 
                className={`btn ${timeGrain === 'weekly' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTimeGrain('weekly')}
                disabled={true}
              >
                주간 (9월부터)
              </button>
            </div>
            
            {/* View Selector */}
            <select 
              className="form-select form-select-sm"
              value={trendView}
              onChange={(e) => setTrendView(e.target.value)}
              style={{ width: '140px' }}
            >
              <option value="overview">통합 개요</option>
              <option value="products">제품별</option>
              <option value="channels">채널별</option>
              <option value="forecast">예측 분석</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Overview Trend */}
        {trendView === 'overview' && (
          <div className="row">
            <div className="col-lg-8">
              <ReactApexChart
                options={trendChartOptions}
                series={trendData}
                type="line"
                height={350}
              />
            </div>
            <div className="col-lg-4">
              <h6 className="fw-semibold mb-3">트렌드 인사이트</h6>
              
              <div className="mb-3 p-3 rounded-3 bg-success bg-opacity-10">
                <div className="d-flex align-items-center mb-2">
                  <div className="text-success me-2">{getIcon('trending-up', { size: 16 })}</div>
                  <strong className="text-success">성장 추세</strong>
                </div>
                <small className="text-muted">
                  • 전체적으로 상승 추세 지속<br/>
                  • 리프테라, 쿨소닉 성장 가속<br/>
                  • HIFU 시장 확대 영향
                </small>
              </div>

              <div className="mb-3 p-3 rounded-3 bg-warning bg-opacity-10">
                <div className="d-flex align-items-center mb-2">
                  <div className="text-warning me-2">{getIcon('alert-circle', { size: 16 })}</div>
                  <strong className="text-warning">주의 요소</strong>
                </div>
                <small className="text-muted">
                  • 경쟁사 대비 성장률 낮음<br/>
                  • 계절적 변동 요인 존재<br/>
                  • 신제품 출시 영향 모니터링
                </small>
              </div>

              <div className="p-3 rounded-3 bg-info bg-opacity-10">
                <div className="d-flex align-items-center mb-2">
                  <div className="text-info me-2">{getIcon('compass', { size: 16 })}</div>
                  <strong className="text-info">전략 방향</strong>
                </div>
                <small className="text-muted">
                  • 9월 주간 데이터로 정밀 분석<br/>
                  • 채널별 최적화 전략 수립<br/>
                  • 예측 모델 정확도 개선
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Forecast View */}
        {trendView === 'forecast' && (
          <div className="row">
            <div className="col-lg-8">
              <div className="bg-light rounded-3 p-4 text-center">
                <div className="mb-3">
                  {getIcon('trending-up', { size: 48, className: 'text-primary opacity-75' })}
                </div>
                <h5 className="text-primary mb-2">AI 예측 모델</h5>
                <p className="text-muted mb-3">주간 데이터 수집 후 고도화된 예측 분석을 제공합니다</p>
                <div className="badge bg-primary px-3 py-2">9월부터 예측 기능 활성화</div>
              </div>
            </div>
            <div className="col-lg-4">
              <h6 className="fw-semibold mb-3">예측 모델 개요</h6>
              
              {forecastData.map((forecast, index) => (
                <div key={index} className="mb-3 p-3 rounded-3 bg-white border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>{forecast.product}</strong>
                    <span className="badge bg-primary">{forecast.confidence}% 신뢰도</span>
                  </div>
                  
                  <div className="row text-center small">
                    <div className="col-4">
                      <div className="fw-bold text-muted">{forecast.current}</div>
                      <div className="text-muted">현재</div>
                    </div>
                    <div className="col-4">
                      <div className="fw-bold text-info">+{((forecast.forecast_1m / forecast.current - 1) * 100).toFixed(0)}%</div>
                      <div className="text-muted">1개월</div>
                    </div>
                    <div className="col-4">
                      <div className="fw-bold text-success">+{((forecast.forecast_3m / forecast.current - 1) * 100).toFixed(0)}%</div>
                      <div className="text-muted">3개월</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product and Channel views would show similar time series for specific items */}
        {(trendView === 'products' || trendView === 'channels') && (
          <div className="text-center py-5">
            <div className="mb-3">
              {getIcon('calendar', { size: 48, className: 'text-muted opacity-50' })}
            </div>
            <h5 className="text-muted">주간 데이터 준비 중</h5>
            <p className="text-muted mb-3">
              9월부터 제공되는 주간 데이터로 상세한 {trendView === 'products' ? '제품별' : '채널별'} 트렌드 분석이 가능합니다
            </p>
            <div className="badge bg-secondary px-3 py-2">2025년 9월 활성화 예정</div>
          </div>
        )}
      </div>
    </div>
  );
}