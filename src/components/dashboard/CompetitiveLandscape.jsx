'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { getIcon } from '@/utils/getIcon';

// Dynamic import for ApexCharts
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Competitive Landscape - Advanced competitive analysis with multiple visualizations
 * Shows market positioning, brand performance, and competitive gaps
 */

export default function CompetitiveLandscape({ data, filters, expanded = false }) {
  const [activeView, setActiveView] = useState('positioning'); // positioning, performance, gaps, trends
  const [selectedCategory, setSelectedCategory] = useState('all'); // all, RF, HIFU
  const [selectedMetric, setSelectedMetric] = useState('posts'); // posts, sales, search, engagement

  if (!data) return null;

  const { topProducts, brand, categories } = data;

  // Prepare competitive data
  const getCompetitiveData = () => {
    let products = topProducts.byPosts || [];
    
    if (selectedCategory !== 'all') {
      products = products.filter(p => p.category === selectedCategory);
    }
    
    return products.slice(0, expanded ? 15 : 10);
  };

  const competitiveData = getCompetitiveData();

  // Market positioning bubble chart data
  const getBubbleChartData = () => {
    const bubbleData = competitiveData.map(product => ({
      x: product.posts || 0,
      y: product.sales || 0,
      z: product.searchVolume || 0,
      name: product.name,
      brand: product.brand,
      category: product.category,
      color: product.color,
      sov: product.sov || 0
    }));

    return [{
      name: 'Asterasys',
      data: bubbleData.filter(d => d.brand === 'asterasys')
    }, {
      name: 'Competitors',
      data: bubbleData.filter(d => d.brand === 'competitor')
    }];
  };

  // Competitive radar chart data
  const getRadarChartData = () => {
    const asterasysProducts = ['쿨페이즈', '쿨소닉', '리프테라'];
    const topCompetitors = ['써마지', '울쎄라', '인모드', '슈링크'];
    
    const asterasysData = asterasysProducts.map(product => {
      const productData = competitiveData.find(p => p.name === product) || {};
      return {
        posts: (productData.posts || 0) / 100, // Scale for radar
        sales: (productData.sales || 0) / 100,
        search: (productData.searchVolume || 0) / 10,
        engagement: (productData.engagement || 0) * 10
      };
    });

    const competitorData = topCompetitors.map(product => {
      const productData = competitiveData.find(p => p.name === product) || {};
      return {
        posts: (productData.posts || 0) / 100,
        sales: (productData.sales || 0) / 100, 
        search: (productData.searchVolume || 0) / 10,
        engagement: (productData.engagement || 0) * 10
      };
    });

    // Average the data
    const avgAsterasys = {
      posts: asterasysData.reduce((sum, p) => sum + p.posts, 0) / asterasysData.length,
      sales: asterasysData.reduce((sum, p) => sum + p.sales, 0) / asterasysData.length,
      search: asterasysData.reduce((sum, p) => sum + p.search, 0) / asterasysData.length,
      engagement: asterasysData.reduce((sum, p) => sum + p.engagement, 0) / asterasysData.length
    };

    const avgCompetitor = {
      posts: competitorData.reduce((sum, p) => sum + p.posts, 0) / competitorData.length,
      sales: competitorData.reduce((sum, p) => sum + p.sales, 0) / competitorData.length,
      search: competitorData.reduce((sum, p) => sum + p.search, 0) / competitorData.length,
      engagement: competitorData.reduce((sum, p) => sum + p.engagement, 0) / competitorData.length
    };

    return [
      {
        name: 'Asterasys',
        data: [avgAsterasys.posts, avgAsterasys.sales, avgAsterasys.search, avgAsterasys.engagement]
      },
      {
        name: 'Top Competitors',
        data: [avgCompetitor.posts, avgCompetitor.sales, avgCompetitor.search, avgCompetitor.engagement]
      }
    ];
  };

  // Bubble chart options
  const bubbleChartOptions = {
    chart: {
      height: 400,
      type: 'bubble',
      toolbar: { show: true }
    },
    colors: ['#667eea', '#ff6b6b'],
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        return opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].name;
      },
      style: { fontSize: '10px', fontWeight: 'bold' }
    },
    fill: { opacity: 0.7 },
    title: {
      text: 'Market Positioning: Posts vs Sales vs Search Volume',
      style: { fontSize: '16px', fontWeight: 'bold' }
    },
    xaxis: {
      title: { text: 'Posts Volume' },
      tickAmount: 5
    },
    yaxis: {
      title: { text: 'Sales Volume' }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center'
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const data = w.config.series[seriesIndex].data[dataPointIndex];
        return `
          <div class="px-3 py-2">
            <div class="fw-bold">${data.name}</div>
            <div>Posts: ${data.x.toLocaleString()}</div>
            <div>Sales: ${data.y.toLocaleString()}</div>
            <div>Search: ${data.z.toLocaleString()}</div>
            <div>SOV: ${data.sov.toFixed(1)}%</div>
          </div>
        `;
      }
    }
  };

  // Radar chart options
  const radarChartOptions = {
    chart: {
      height: 350,
      type: 'radar'
    },
    colors: ['#667eea', '#ff6b6b'],
    plotOptions: {
      radar: {
        size: 140,
        polygons: {
          strokeColors: '#e9e9e9',
          fill: {
            colors: ['#f8f9fa', '#ffffff']
          }
        }
      }
    },
    title: {
      text: 'Competitive Performance Radar',
      style: { fontSize: '16px', fontWeight: 'bold' }
    },
    labels: ['Posts', 'Sales', 'Search', 'Engagement'],
    xaxis: {
      categories: ['Posts', 'Sales', 'Search', 'Engagement']
    },
    yaxis: {
      tickAmount: 5,
      min: 0,
      max: 100
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center'
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-transparent border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="card-title mb-1 fw-bold">
              {getIcon('users', { className: 'text-primary me-2' })}
              Competitive Landscape
            </h4>
            <p className="text-muted small mb-0">경쟁사 대비 시장 포지셔닝 및 성과 분석</p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            {/* Category Filter */}
            <select 
              className="form-select form-select-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '120px' }}
            >
              <option value="all">전체</option>
              <option value="RF">RF</option>
              <option value="HIFU">HIFU</option>
            </select>
            
            {/* View Mode Buttons */}
            <div className="btn-group btn-group-sm" role="group">
              <button 
                className={`btn ${activeView === 'positioning' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveView('positioning')}
              >
                포지셔닝
              </button>
              <button 
                className={`btn ${activeView === 'performance' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveView('performance')}
              >
                성과분석
              </button>
              <button 
                className={`btn ${activeView === 'gaps' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveView('gaps')}
              >
                경쟁격차
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Market Positioning View */}
        {activeView === 'positioning' && (
          <div className="row">
            <div className="col-lg-8">
              <ReactApexChart
                options={bubbleChartOptions}
                series={getBubbleChartData()}
                type="bubble"
                height={400}
              />
            </div>
            <div className="col-lg-4">
              <div className="h-100 d-flex flex-column">
                <h6 className="fw-semibold mb-3">시장 포지션 인사이트</h6>
                
                {/* Asterasys Position */}
                <div className="mb-3 p-3 rounded-3" style={{ background: 'rgba(102, 126, 234, 0.08)' }}>
                  <div className="d-flex align-items-center mb-2">
                    <div className="rounded-circle bg-primary" style={{ width: '8px', height: '8px' }}></div>
                    <strong className="ms-2 text-primary">Asterasys</strong>
                  </div>
                  <small className="text-muted">
                    • 중소규모 플레이어로 포지셔닝<br/>
                    • 높은 참여도로 효율적 마케팅<br/>
                    • HIFU 시장에서 상대적 우위
                  </small>
                </div>

                {/* Key Competitors */}
                <div className="mb-3 p-3 rounded-3 bg-light">
                  <div className="d-flex align-items-center mb-2">
                    <div className="rounded-circle bg-danger" style={{ width: '8px', height: '8px' }}></div>
                    <strong className="ms-2">주요 경쟁사</strong>
                  </div>
                  <small className="text-muted">
                    • <strong>써마지:</strong> RF 시장 선두<br/>
                    • <strong>울쎄라:</strong> HIFU 시장 1위<br/>
                    • <strong>인모드:</strong> 급성장 브랜드
                  </small>
                </div>

                {/* Market Opportunities */}
                <div className="p-3 rounded-3" style={{ background: 'rgba(40, 167, 69, 0.08)' }}>
                  <div className="d-flex align-items-center mb-2">
                    <div className="rounded-circle bg-success" style={{ width: '8px', height: '8px' }}></div>
                    <strong className="ms-2 text-success">기회 영역</strong>
                  </div>
                  <small className="text-muted">
                    • 병원 채널에서의 전문성 강화<br/>
                    • HIFU 시장 점유율 확대<br/>
                    • 마케팅-판매 연계 최적화
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Analysis View */}
        {activeView === 'performance' && (
          <div className="row">
            <div className="col-lg-6">
              <ReactApexChart
                options={radarChartOptions}
                series={getRadarChartData()}
                type="radar"
                height={350}
              />
            </div>
            <div className="col-lg-6">
              <div className="h-100">
                <h6 className="fw-semibold mb-3">성과 분석</h6>
                
                {/* Performance Metrics */}
                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-center p-3 rounded-3 bg-primary bg-opacity-10">
                      <h4 className="text-primary fw-bold">{brand.asterasys.marketShare.toFixed(1)}%</h4>
                      <small className="text-muted">시장점유율</small>
                      <div className="progress mt-2" style={{ height: '4px' }}>
                        <div className="progress-bar bg-primary" style={{ width: `${brand.asterasys.marketShare}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 rounded-3 bg-success bg-opacity-10">
                      <h4 className="text-success fw-bold">{brand.asterasys.engagement.toFixed(1)}</h4>
                      <small className="text-muted">참여도</small>
                      <div className="progress mt-2" style={{ height: '4px' }}>
                        <div className="progress-bar bg-success" style={{ width: `${(brand.asterasys.engagement / 5) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 rounded-3 bg-info bg-opacity-10">
                      <h4 className="text-info fw-bold">{brand.asterasys.totalSearch.toLocaleString()}</h4>
                      <small className="text-muted">검색량</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 rounded-3 bg-warning bg-opacity-10">
                      <h4 className="text-warning fw-bold">{brand.asterasys.totalSales.toLocaleString()}</h4>
                      <small className="text-muted">판매량</small>
                    </div>
                  </div>
                </div>

                {/* Competitive Ranking */}
                <div className="mt-4">
                  <h6 className="fw-semibold mb-3">브랜드 순위</h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>순위</th>
                          <th>브랜드</th>
                          <th className="text-end">발행량</th>
                          <th className="text-end">점유율</th>
                        </tr>
                      </thead>
                      <tbody>
                        {competitiveData.slice(0, 5).map((product, index) => (
                          <tr key={product.keyword} className={product.brand === 'asterasys' ? 'table-success' : ''}>
                            <td>
                              <span className={`badge ${index < 3 ? 'bg-warning' : 'bg-secondary'}`}>
                                {index + 1}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div 
                                  className="rounded-circle me-2" 
                                  style={{ width: '8px', height: '8px', backgroundColor: product.color }}
                                ></div>
                                <span className={product.brand === 'asterasys' ? 'fw-bold' : ''}>
                                  {product.name}
                                </span>
                                {product.brand === 'asterasys' && (
                                  <span className="badge bg-success ms-1">A</span>
                                )}
                              </div>
                            </td>
                            <td className="text-end">{(product.posts || 0).toLocaleString()}</td>
                            <td className="text-end">{(product.sov || 0).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Competitive Gaps View */}
        {activeView === 'gaps' && (
          <div className="row">
            <div className="col-12">
              <h6 className="fw-semibold mb-3">경쟁 격차 분석</h6>
              
              <div className="row g-3">
                {/* Gap Analysis Cards */}
                <div className="col-lg-3 col-md-6">
                  <div className="card border-0 bg-danger bg-opacity-10">
                    <div className="card-body text-center">
                      <div className="mb-2">
                        {getIcon('trending-down', { className: 'text-danger', size: 24 })}
                      </div>
                      <h4 className="text-danger fw-bold mb-1">584%</h4>
                      <small className="text-muted">발행량 격차</small>
                      <div className="mt-2">
                        <small className="text-danger">vs 써마지 (1위)</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="card border-0 bg-warning bg-opacity-10">
                    <div className="card-body text-center">
                      <div className="mb-2">
                        {getIcon('trending-down', { className: 'text-warning', size: 24 })}
                      </div>
                      <h4 className="text-warning fw-bold mb-1">949%</h4>
                      <small className="text-muted">판매량 격차</small>
                      <div className="mt-2">
                        <small className="text-warning">vs 슈링크 (1위)</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="card border-0 bg-success bg-opacity-10">
                    <div className="card-body text-center">
                      <div className="mb-2">
                        {getIcon('trending-up', { className: 'text-success', size: 24 })}
                      </div>
                      <h4 className="text-success fw-bold mb-1">+13%</h4>
                      <small className="text-muted">참여도 우위</small>
                      <div className="mt-2">
                        <small className="text-success">vs 업계평균</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="card border-0 bg-info bg-opacity-10">
                    <div className="card-body text-center">
                      <div className="mb-2">
                        {getIcon('search', { className: 'text-info', size: 24 })}
                      </div>
                      <h4 className="text-info fw-bold mb-1">22%</h4>
                      <small className="text-muted">검색 점유율</small>
                      <div className="mt-2">
                        <small className="text-info">총 검색량 중</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Recommendations */}
              <div className="mt-4 p-4 rounded-3 bg-light">
                <h6 className="fw-semibold mb-3">전략적 권장사항</h6>
                <div className="row">
                  <div className="col-md-4">
                    <div className="d-flex mb-2">
                      <div className="me-2 text-primary">1.</div>
                      <div>
                        <strong className="text-primary">HIFU 시장 집중</strong><br/>
                        <small className="text-muted">리프테라, 쿨소닉 마케팅 투자 확대</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex mb-2">
                      <div className="me-2 text-success">2.</div>
                      <div>
                        <strong className="text-success">참여도 레버리지</strong><br/>
                        <small className="text-muted">높은 참여도를 판매로 전환</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex mb-2">
                      <div className="me-2 text-info">3.</div>
                      <div>
                        <strong className="text-info">틈새 시장 공략</strong><br/>
                        <small className="text-muted">병원 채널 전문성 강화</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}