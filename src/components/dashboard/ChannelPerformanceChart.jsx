'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Channel Performance Chart - Multi-channel analysis
 * Using Duralux template design with clean visualization
 */

const ChannelPerformanceChart = ({ data }) => {
  const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

  if (isRemoved || !data) return null;

  // Channel performance data
  const channelData = [
    {
      name: '블로그',
      posts: data.blog?.overview?.totalPosts || 0,
      engagement: data.blog?.overview?.avgEngagement || 0,
      color: '#28a745'
    },
    {
      name: '카페', 
      posts: data.cafe?.overview?.totalPosts || 0,
      engagement: (data.cafe?.overview?.totalComments || 0) / Math.max(data.cafe?.overview?.totalPosts || 1, 1),
      color: '#ffc107'
    },
    {
      name: '뉴스',
      posts: data.news?.overview?.totalArticles || 0,
      engagement: 0, // News doesn't have engagement metric
      color: '#6610f2'
    },
    {
      name: '유튜브',
      posts: data.youtube?.contents?.totalVideos || 0,
      engagement: data.youtube?.engagement?.totalComments || 0,
      color: '#dc3545'
    },
    {
      name: '검색',
      posts: data.search?.overview?.totalSearchVolume || 0,
      engagement: 0, // Search volume metric
      color: '#6f42c1'
    },
    {
      name: '판매',
      posts: data.sales?.overview?.totalSales || 0,
      engagement: 0, // Sales metric
      color: '#fd7e14'
    }
  ];

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: true,
        dataLabels: { position: 'center' }
      }
    },
    colors: channelData.map(ch => ch.color),
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toLocaleString(),
      style: {
        fontSize: '11px',
        fontWeight: 'bold',
        colors: ['#fff']
      }
    },
    xaxis: {
      title: { text: '성과 지표', style: { fontSize: '12px' } },
      labels: {
        formatter: (val) => val.toLocaleString(),
        style: { fontSize: '11px' }
      }
    },
    yaxis: {
      labels: { style: { fontSize: '11px' } }
    },
    title: {
      text: '채널별 성과 현황',
      align: 'left',
      style: { fontSize: '14px', fontWeight: 'bold' }
    },
    grid: {
      borderColor: '#f1f1f1'
    }
  };

  const chartSeries = [{
    name: '성과',
    data: channelData.map(channel => ({
      x: channel.name,
      y: channel.posts
    }))
  }];

  // Calculate totals for footer
  const totalPosts = channelData.reduce((sum, ch) => sum + ch.posts, 0);
  const activeChannels = channelData.filter(ch => ch.posts > 0).length;

  return (
    <div className="col-xxl-8">
      <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
        <CardHeader 
          title="채널별 성과 분석" 
          refresh={handleRefresh} 
          remove={handleDelete} 
          expanded={handleExpand}
        />
        <div className="card-body custom-card-action p-0">
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="bar"
            height={300}
          />
        </div>
        <div className="card-footer">
          <div className="row g-4">
            <StatCard 
              bg_color="bg-primary" 
              price={totalPosts.toLocaleString()} 
              progress="100%"
              title="총 채널 성과" 
            />
            <StatCard 
              bg_color="bg-success" 
              price={activeChannels.toString()} 
              progress={`${(activeChannels / 6 * 100).toFixed(0)}%`}
              title="활성 채널 수" 
            />
            <StatCard 
              bg_color="bg-info" 
              price={channelData.find(ch => ch.name === '블로그')?.posts.toLocaleString() || '0'} 
              progress={`${((channelData.find(ch => ch.name === '블로그')?.posts || 0) / totalPosts * 100).toFixed(0)}%`}
              title="블로그 성과" 
            />
            <StatCard 
              bg_color="bg-warning" 
              price={channelData.find(ch => ch.name === '카페')?.posts.toLocaleString() || '0'} 
              progress={`${((channelData.find(ch => ch.name === '카페')?.posts || 0) / totalPosts * 100).toFixed(0)}%`}
              title="카페 성과" 
            />
          </div>
        </div>
        <CardLoader refreshKey={refreshKey} />
      </div>
    </div>
  );
};

// Reusable stat card component
const StatCard = ({ title, price, progress, bg_color }) => {
  return (
    <div className="col-lg-3 col-6">
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

export default ChannelPerformanceChart;