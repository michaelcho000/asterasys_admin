'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Competitive Analysis Chart - Asterasys vs Top Competitors
 * Using Duralux template chart component pattern with clean design
 */

const CompetitiveAnalysisChart = ({ data }) => {
  const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

  if (isRemoved || !data) return null;

  const { topProducts, brand } = data;

  // Prepare top 8 products for competitive analysis
  const topCompetitors = topProducts.byPosts.slice(0, 8);
  
  // Chart configuration
  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        dataLabels: { position: 'top' }
      }
    },
    colors: topCompetitors.map(product => 
      product.brand === 'asterasys' ? '#28a745' : product.color || '#6c757d'
    ),
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toLocaleString(),
      offsetY: -20,
      style: {
        fontSize: '10px',
        fontWeight: 'bold',
        colors: ['#333']
      }
    },
    xaxis: {
      categories: topCompetitors.map(product => product.name),
      labels: {
        style: { fontSize: '11px' },
        rotate: -45
      }
    },
    yaxis: {
      title: { text: '발행량 (건)', style: { fontSize: '12px' } },
      labels: {
        formatter: (val) => val.toLocaleString(),
        style: { fontSize: '11px' }
      }
    },
    title: {
      text: '브랜드별 발행량 비교 (Top 8)',
      align: 'left',
      style: { fontSize: '14px', fontWeight: 'bold', color: '#333' }
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 3
    },
    tooltip: {
      y: {
        formatter: (val, { dataPointIndex }) => {
          const product = topCompetitors[dataPointIndex];
          return `${val.toLocaleString()}건 (점유율: ${product.sov.toFixed(1)}%)`;
        }
      }
    }
  };

  const chartSeries = [{
    name: '발행량',
    data: topCompetitors.map(product => product.posts || 0)
  }];

  return (
    <div className="col-xxl-8">
      <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
        <CardHeader 
          title="경쟁사 분석" 
          refresh={handleRefresh} 
          remove={handleDelete} 
          expanded={handleExpand}
        />
        <div className="card-body custom-card-action p-0">
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="bar"
            height={350}
          />
        </div>
        <div className="card-footer">
          <div className="row g-4">
            <StatCard 
              bg_color="bg-success" 
              price={brand.asterasys.totalPosts.toLocaleString()} 
              progress={`${brand.asterasys.marketShare.toFixed(1)}%`}
              title="Asterasys 발행량" 
            />
            <StatCard 
              bg_color="bg-danger" 
              price={brand.competitors.totalPosts.toLocaleString()} 
              progress={`${brand.competitors.marketShare.toFixed(1)}%`}
              title="경쟁사 발행량" 
            />
            <StatCard 
              bg_color="bg-primary" 
              price={brand.asterasys.engagement.toFixed(1)} 
              progress={`${((brand.asterasys.engagement / 5) * 100).toFixed(0)}%`}
              title="Asterasys 참여도" 
            />
            <StatCard 
              bg_color="bg-warning" 
              price={(topCompetitors[0]?.posts / brand.asterasys.totalPosts * 100 || 0).toFixed(0)}
              progress="100%"
              title="1위 대비 격차 (%)" 
            />
          </div>
        </div>
        <CardLoader refreshKey={refreshKey} />
      </div>
    </div>
  );
};

// Footer stat card component
const StatCard = ({ title, price, progress, bg_color }) => {
  return (
    <div className="col-lg-3">
      <div className="p-3 border border-dashed rounded">
        <div className="fs-12 text-muted mb-1">{title}</div>
        <h6 className="fw-bold text-dark">{price}</h6>
        <div className="progress mt-2 ht-3">
          <div className={`progress-bar ${bg_color}`} role="progressbar" style={{ width: progress }}></div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveAnalysisChart;