'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Market Share Chart - RF vs HIFU category performance
 * Using Duralux template chart component pattern
 */

const MarketShareChart = ({ data }) => {
  const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

  if (isRemoved || !data) return null;

  const { categories, brand } = data;

  // Chart data
  const chartData = {
    series: [categories.rf.marketShare, categories.hifu.marketShare],
    options: {
      chart: {
        type: 'donut',
        height: 300
      },
      labels: ['RF (고주파)', 'HIFU (초음파)'],
      colors: ['#dc3545', '#17a2b8'], 
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              total: {
                show: true,
                fontSize: '18px',
                fontWeight: 600,
                color: '#333',
                formatter: () => '100%'
              }
            }
          }
        }
      },
      legend: {
        position: 'bottom',
        fontSize: '14px'
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => val.toFixed(1) + '%',
        style: {
          fontSize: '12px',
          fontWeight: 600,
          colors: ['#fff']
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { height: 250 },
          legend: { position: 'bottom' }
        }
      }]
    }
  };

  return (
    <div className="col-xxl-4 col-md-6">
      <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
        <CardHeader 
          title="시장 카테고리 점유율" 
          refresh={handleRefresh} 
          remove={handleDelete} 
          expanded={handleExpand}
        />
        <div className="card-body custom-card-action">
          <ReactApexChart
            options={chartData.options}
            series={chartData.series}
            type="donut"
            height={300}
          />
        </div>
        <div className="card-footer">
          <div className="row g-4">
            <StatCard 
              bg_color="bg-danger" 
              price={categories.rf.totalPosts.toLocaleString()} 
              progress={`${categories.rf.marketShare.toFixed(1)}%`}
              title="RF 발행량" 
            />
            <StatCard 
              bg_color="bg-info" 
              price={categories.hifu.totalPosts.toLocaleString()} 
              progress={`${categories.hifu.marketShare.toFixed(1)}%`}
              title="HIFU 발행량" 
            />
            <StatCard 
              bg_color="bg-success" 
              price={brand.asterasys.totalPosts.toLocaleString()} 
              progress={`${brand.asterasys.marketShare.toFixed(1)}%`}
              title="Asterasys 발행량" 
            />
            <StatCard 
              bg_color="bg-primary" 
              price={brand.asterasys.totalSales.toLocaleString()} 
              progress={`${brand.asterasys.salesShare.toFixed(1)}%`}
              title="Asterasys 판매량" 
            />
          </div>
        </div>
        <CardLoader refreshKey={refreshKey} />
      </div>
    </div>
  );
};

// Footer stat card component following template pattern
const StatCard = ({ title, price, progress, bg_color }) => {
  return (
    <div className="col-lg-3 col-6">
      <div className="p-3 border border-dashed rounded">
        <div className="fs-12 text-muted mb-1">{title}</div>
        <h6 className="fw-bold text-dark">{price}건</h6>
        <div className="progress mt-2 ht-3">
          <div className={`progress-bar ${bg_color}`} role="progressbar" style={{ width: progress }}></div>
        </div>
      </div>
    </div>
  );
};

export default MarketShareChart;