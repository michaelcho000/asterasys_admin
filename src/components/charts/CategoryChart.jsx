'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Category Chart - RF vs HIFU Performance Comparison
 * Shows market share, posts, sales, and other metrics
 */

export default function CategoryChart({ rfData, hifuData }) {
  const [activeMetric, setActiveMetric] = useState('marketShare');

  // Chart configuration based on selected metric
  const getChartData = () => {
    let values, labels, colors;
    
    switch (activeMetric) {
      case 'marketShare':
        values = [rfData.marketShare, hifuData.marketShare];
        labels = ['RF (고주파)', 'HIFU (초음파)'];
        colors = ['#FF6B6B', '#4ECDC4'];
        break;
      case 'salesShare':
        values = [rfData.salesShare, hifuData.salesShare];
        labels = ['RF (고주파)', 'HIFU (초음파)'];
        colors = ['#FF6B6B', '#4ECDC4'];
        break;
      case 'posts':
        values = [rfData.totalPosts, hifuData.totalPosts];
        labels = ['RF (고주파)', 'HIFU (초음파)'];
        colors = ['#FF6B6B', '#4ECDC4'];
        break;
      case 'sales':
        values = [rfData.totalSales, hifuData.totalSales];
        labels = ['RF (고주파)', 'HIFU (초음파)'];
        colors = ['#FF6B6B', '#4ECDC4'];
        break;
      case 'engagement':
        values = [rfData.engagement, hifuData.engagement];
        labels = ['RF (고주파)', 'HIFU (초음파)'];
        colors = ['#FF6B6B', '#4ECDC4'];
        break;
      default:
        values = [rfData.marketShare, hifuData.marketShare];
        labels = ['RF (고주파)', 'HIFU (초음파)'];
        colors = ['#FF6B6B', '#4ECDC4'];
    }

    return { values, labels, colors };
  };

  const { values, labels, colors } = getChartData();

  // Chart options
  const chartOptions = {
    chart: {
      type: 'donut',
      height: 300,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    labels,
    colors,
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontWeight: 500,
      markers: {
        width: 12,
        height: 12,
        radius: 6
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: {
              show: true,
              fontSize: '18px',
              fontWeight: 600,
              color: '#333',
              formatter: function(w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                if (activeMetric === 'marketShare' || activeMetric === 'salesShare') {
                  return '100%';
                } else if (activeMetric === 'engagement') {
                  return (total / 2).toFixed(1);
                }
                return total.toLocaleString();
              }
            },
            value: {
              show: true,
              fontSize: '14px',
              color: '#666',
              formatter: function(val) {
                if (activeMetric === 'marketShare' || activeMetric === 'salesShare') {
                  return parseFloat(val).toFixed(1) + '%';
                } else if (activeMetric === 'engagement') {
                  return parseFloat(val).toFixed(2);
                }
                return parseFloat(val).toLocaleString();
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        if (activeMetric === 'marketShare' || activeMetric === 'salesShare') {
          return val.toFixed(1) + '%';
        } else if (activeMetric === 'engagement') {
          return val.toFixed(2);
        }
        return Math.round(val).toLocaleString();
      },
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: ['#fff']
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(val) {
          if (activeMetric === 'marketShare' || activeMetric === 'salesShare') {
            return val.toFixed(2) + '%';
          } else if (activeMetric === 'engagement') {
            return val.toFixed(2) + ' (댓글/게시물)';
          } else if (activeMetric === 'posts') {
            return val.toLocaleString() + ' 건';
          } else if (activeMetric === 'sales') {
            return val.toLocaleString() + ' 대';
          }
          return val.toLocaleString();
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 250
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  // Get metric label and description
  const getMetricInfo = (metric) => {
    switch (metric) {
      case 'marketShare':
        return { label: '시장 점유율', desc: '발행량 기준 점유율' };
      case 'salesShare':
        return { label: '판매 점유율', desc: '판매량 기준 점유율' };
      case 'posts':
        return { label: '총 발행량', desc: '전체 게시물/기사 수' };
      case 'sales':
        return { label: '총 판매량', desc: '제품 판매 대수' };
      case 'engagement':
        return { label: '평균 참여도', desc: '댓글수/게시물수 비율' };
      default:
        return { label: '시장 점유율', desc: '발행량 기준 점유율' };
    }
  };

  const metricInfo = getMetricInfo(activeMetric);

  return (
    <div className="card h-100">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-0">카테고리 성과 비교</h5>
            <small className="text-muted">{metricInfo.desc}</small>
          </div>
          <div className="btn-group btn-group-sm" role="group">
            <input
              type="radio"
              className="btn-check"
              name="categoryMetric"
              id="marketShare"
              checked={activeMetric === 'marketShare'}
              onChange={() => setActiveMetric('marketShare')}
            />
            <label className="btn btn-outline-primary" htmlFor="marketShare">점유율</label>
            
            <input
              type="radio"
              className="btn-check"
              name="categoryMetric"
              id="salesShare"
              checked={activeMetric === 'salesShare'}
              onChange={() => setActiveMetric('salesShare')}
            />
            <label className="btn btn-outline-primary" htmlFor="salesShare">판매</label>
            
            <input
              type="radio"
              className="btn-check"
              name="categoryMetric"
              id="posts"
              checked={activeMetric === 'posts'}
              onChange={() => setActiveMetric('posts')}
            />
            <label className="btn btn-outline-primary" htmlFor="posts">발행량</label>
            
            <input
              type="radio"
              className="btn-check"
              name="categoryMetric"
              id="engagement"
              checked={activeMetric === 'engagement'}
              onChange={() => setActiveMetric('engagement')}
            />
            <label className="btn btn-outline-primary" htmlFor="engagement">참여도</label>
          </div>
        </div>
      </div>
      <div className="card-body">
        <ReactApexChart
          options={chartOptions}
          series={values}
          type="donut"
          height={300}
        />
        
        {/* Category Statistics */}
        <div className="row mt-3">
          <div className="col-6">
            <div className="text-center p-3 border rounded">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="rounded-circle me-2" style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: colors[0] 
                }}></div>
                <strong>RF (고주파)</strong>
              </div>
              <div className="small text-muted mb-1">제품 수: {rfData.productCount}개</div>
              <div className="small text-muted mb-1">총 발행량: {rfData.totalPosts?.toLocaleString()}건</div>
              <div className="small text-muted">총 판매량: {rfData.totalSales?.toLocaleString()}대</div>
            </div>
          </div>
          <div className="col-6">
            <div className="text-center p-3 border rounded">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="rounded-circle me-2" style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: colors[1] 
                }}></div>
                <strong>HIFU (초음파)</strong>
              </div>
              <div className="small text-muted mb-1">제품 수: {hifuData.productCount}개</div>
              <div className="small text-muted mb-1">총 발행량: {hifuData.totalPosts?.toLocaleString()}건</div>
              <div className="small text-muted">총 판매량: {hifuData.totalSales?.toLocaleString()}대</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}