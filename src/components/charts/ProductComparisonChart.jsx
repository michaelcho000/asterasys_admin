'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Product Comparison Chart - Asterasys vs Competitors
 * Multi-metric comparison with bar and line charts
 */

export default function ProductComparisonChart({ asterasysData, competitorData }) {
  const [chartType, setChartType] = useState('column');
  const [showMetrics, setShowMetrics] = useState({
    posts: true,
    sales: true,
    engagement: false,
    searchVolume: false
  });

  // Prepare chart data
  const getChartData = () => {
    const categories = [];
    const series = [];

    if (showMetrics.posts) {
      categories.push('발행량');
      if (!series.find(s => s.name === 'Asterasys')) {
        series.push({
          name: 'Asterasys',
          type: chartType,
          data: []
        });
      }
      if (!series.find(s => s.name === '경쟁사')) {
        series.push({
          name: '경쟁사',
          type: chartType,
          data: []
        });
      }
      series[0].data.push(asterasysData.totalPosts || 0);
      series[1].data.push(competitorData.totalPosts || 0);
    }

    if (showMetrics.sales) {
      categories.push('판매량');
      if (!series.find(s => s.name === 'Asterasys')) {
        series.push({
          name: 'Asterasys',
          type: chartType,
          data: []
        });
      }
      if (!series.find(s => s.name === '경쟁사')) {
        series.push({
          name: '경쟁사',
          type: chartType,
          data: []
        });
      }
      const asterasysIndex = series.findIndex(s => s.name === 'Asterasys');
      const competitorIndex = series.findIndex(s => s.name === '경쟁사');
      
      if (showMetrics.posts) {
        series[asterasysIndex].data.push(asterasysData.totalSales || 0);
        series[competitorIndex].data.push(competitorData.totalSales || 0);
      } else {
        series[asterasysIndex].data = [asterasysData.totalSales || 0];
        series[competitorIndex].data = [competitorData.totalSales || 0];
      }
    }

    if (showMetrics.engagement) {
      categories.push('참여도');
      if (!series.find(s => s.name === 'Asterasys')) {
        series.push({
          name: 'Asterasys',
          type: 'line',
          data: []
        });
      }
      if (!series.find(s => s.name === '경쟁사')) {
        series.push({
          name: '경쟁사',
          type: 'line',
          data: []
        });
      }
      const asterasysIndex = series.findIndex(s => s.name === 'Asterasys');
      const competitorIndex = series.findIndex(s => s.name === '경쟁사');
      
      if (showMetrics.posts || showMetrics.sales) {
        series[asterasysIndex].data.push((asterasysData.engagement || 0) * 1000); // Scale for visibility
        series[competitorIndex].data.push((competitorData.engagement || 0) * 1000);
      } else {
        series[asterasysIndex].data = [(asterasysData.engagement || 0) * 1000];
        series[competitorIndex].data = [(competitorData.engagement || 0) * 1000];
        series[asterasysIndex].type = 'line';
        series[competitorIndex].type = 'line';
      }
    }

    if (showMetrics.searchVolume) {
      categories.push('검색량');
      if (!series.find(s => s.name === 'Asterasys')) {
        series.push({
          name: 'Asterasys',
          type: chartType,
          data: []
        });
      }
      if (!series.find(s => s.name === '경쟁사')) {
        series.push({
          name: '경쟁사',
          type: chartType,
          data: []
        });
      }
      const asterasysIndex = series.findIndex(s => s.name === 'Asterasys');
      const competitorIndex = series.findIndex(s => s.name === '경쟁사');
      
      const dataLength = series[asterasysIndex].data.length;
      if (dataLength > 0) {
        series[asterasysIndex].data.push(asterasysData.totalSearch || 0);
        series[competitorIndex].data.push(competitorData.totalSearch || 0);
      } else {
        series[asterasysIndex].data = [asterasysData.totalSearch || 0];
        series[competitorIndex].data = [competitorData.totalSearch || 0];
      }
    }

    return { categories, series };
  };

  const { categories, series } = getChartData();

  // Chart options
  const chartOptions = {
    chart: {
      height: 350,
      type: 'line',
      stacked: false,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: ['#4ECDC4', '#FF6B6B'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: [0, 0, 3, 3],
      curve: 'smooth'
    },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        borderRadius: 4
      }
    },
    xaxis: {
      categories,
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: [
      {
        seriesName: 'Asterasys',
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: '#4ECDC4'
        },
        labels: {
          style: {
            colors: '#4ECDC4',
          },
          formatter: function(val) {
            return val?.toLocaleString() || '0';
          }
        },
        title: {
          text: "발행량 / 판매량",
          style: {
            color: '#4ECDC4',
          }
        },
        tooltip: {
          enabled: true
        }
      },
      {
        seriesName: '경쟁사',
        show: false
      },
      {
        seriesName: 'Engagement',
        opposite: true,
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: '#FFA500'
        },
        labels: {
          style: {
            colors: '#FFA500',
          },
          formatter: function(val) {
            return (val / 1000)?.toFixed(1) || '0';
          }
        },
        title: {
          text: "참여도 (천 단위 스케일)",
          style: {
            color: '#FFA500',
          }
        }
      }
    ],
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      offsetY: -10,
      markers: {
        width: 12,
        height: 12,
        radius: 6
      }
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 3
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function(val, { seriesIndex, dataPointIndex }) {
          if (series[seriesIndex]?.name.includes('참여도')) {
            return (val / 1000).toFixed(2) + ' (댓글/게시물)';
          } else if (categories[dataPointIndex] === '발행량') {
            return val?.toLocaleString() + ' 건';
          } else if (categories[dataPointIndex] === '판매량') {
            return val?.toLocaleString() + ' 대';
          } else if (categories[dataPointIndex] === '검색량') {
            return val?.toLocaleString() + ' 건';
          }
          return val?.toLocaleString() || '0';
        }
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 280
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  return (
    <div className="card h-100">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-0">Asterasys vs 경쟁사 성과</h5>
            <small className="text-muted">다차원 비교 분석</small>
          </div>
          <div className="d-flex gap-2 align-items-center">
            {/* Metric toggles */}
            <div className="btn-group btn-group-sm" role="group">
              <input
                type="checkbox"
                className="btn-check"
                id="showPosts"
                checked={showMetrics.posts}
                onChange={(e) => setShowMetrics({...showMetrics, posts: e.target.checked})}
              />
              <label className="btn btn-outline-primary" htmlFor="showPosts">발행량</label>
              
              <input
                type="checkbox"
                className="btn-check"
                id="showSales"
                checked={showMetrics.sales}
                onChange={(e) => setShowMetrics({...showMetrics, sales: e.target.checked})}
              />
              <label className="btn btn-outline-primary" htmlFor="showSales">판매량</label>
              
              <input
                type="checkbox"
                className="btn-check"
                id="showEngagement"
                checked={showMetrics.engagement}
                onChange={(e) => setShowMetrics({...showMetrics, engagement: e.target.checked})}
              />
              <label className="btn btn-outline-primary" htmlFor="showEngagement">참여도</label>
            </div>
            
            {/* Chart type selector */}
            <select 
              className="form-select form-select-sm"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              style={{ width: '100px' }}
            >
              <option value="column">막대</option>
              <option value="bar">가로막대</option>
            </select>
          </div>
        </div>
      </div>
      <div className="card-body">
        {series.length > 0 ? (
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="line"
            height={350}
          />
        ) : (
          <div className="text-center py-5">
            <p className="text-muted">표시할 지표를 선택해주세요</p>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="p-3 bg-light rounded">
              <div className="d-flex align-items-center mb-2">
                <div className="rounded-circle me-2" style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#4ECDC4' 
                }}></div>
                <strong className="text-primary">Asterasys</strong>
              </div>
              <div className="row text-center">
                <div className="col-3">
                  <div className="fw-bold text-primary">{asterasysData.marketShare?.toFixed(1)}%</div>
                  <small className="text-muted">시장점유율</small>
                </div>
                <div className="col-3">
                  <div className="fw-bold text-primary">{asterasysData.totalPosts?.toLocaleString()}</div>
                  <small className="text-muted">발행량</small>
                </div>
                <div className="col-3">
                  <div className="fw-bold text-primary">{asterasysData.totalSales?.toLocaleString()}</div>
                  <small className="text-muted">판매량</small>
                </div>
                <div className="col-3">
                  <div className="fw-bold text-primary">{asterasysData.engagement?.toFixed(2)}</div>
                  <small className="text-muted">참여도</small>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="p-3 bg-light rounded">
              <div className="d-flex align-items-center mb-2">
                <div className="rounded-circle me-2" style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#FF6B6B' 
                }}></div>
                <strong className="text-danger">경쟁사 총합</strong>
              </div>
              <div className="row text-center">
                <div className="col-3">
                  <div className="fw-bold text-danger">{competitorData.marketShare?.toFixed(1)}%</div>
                  <small className="text-muted">시장점유율</small>
                </div>
                <div className="col-3">
                  <div className="fw-bold text-danger">{competitorData.totalPosts?.toLocaleString()}</div>
                  <small className="text-muted">발행량</small>
                </div>
                <div className="col-3">
                  <div className="fw-bold text-danger">{competitorData.totalSales?.toLocaleString()}</div>
                  <small className="text-muted">판매량</small>
                </div>
                <div className="col-3">
                  <div className="fw-bold text-danger">{competitorData.engagement?.toFixed(2)}</div>
                  <small className="text-muted">참여도</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}