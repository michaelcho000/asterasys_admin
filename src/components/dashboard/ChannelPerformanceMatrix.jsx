'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { getIcon } from '@/utils/getIcon';

// Dynamic import for ApexCharts
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Channel Performance Matrix - Multi-channel analysis with heatmaps and detailed metrics
 * Shows performance across Blog, Cafe, News, YouTube, Search, Sales channels
 */

export default function ChannelPerformanceMatrix({ channels, kpis, filters, expanded = false }) {
  const [activeChannel, setActiveChannel] = useState('all');
  const [viewType, setViewType] = useState('heatmap'); // heatmap, comparison, detailed
  const [selectedMetric, setSelectedMetric] = useState('posts');

  if (!channels || !kpis) return null;

  // Channel configurations
  const channelConfigs = [
    { 
      key: 'blog', 
      name: '블로그', 
      icon: 'edit', 
      color: '#96CEB4',
      metrics: ['totalPosts', 'totalComments', 'avgEngagement'],
      strength: 'high' // high, medium, low
    },
    { 
      key: 'cafe', 
      name: '카페', 
      icon: 'users', 
      color: '#FFEAA7',
      metrics: ['totalPosts', 'totalComments', 'totalViews'],
      strength: 'high'
    },
    { 
      key: 'news', 
      name: '뉴스', 
      icon: 'file-text', 
      color: '#DDA0DD',
      metrics: ['totalArticles'],
      strength: 'medium'
    },
    { 
      key: 'youtube', 
      name: '유튜브', 
      icon: 'video', 
      color: '#FF7675',
      metrics: ['totalVideos', 'totalComments'],
      strength: 'low'
    },
    { 
      key: 'search', 
      name: '검색', 
      icon: 'search', 
      color: '#A29BFE',
      metrics: ['totalSearchVolume'],
      strength: 'medium'
    },
    { 
      key: 'sales', 
      name: '판매', 
      icon: 'shopping-cart', 
      color: '#6C5CE7',
      metrics: ['totalSales'],
      strength: 'low'
    }
  ];

  // Generate channel performance heatmap data
  const getHeatmapData = () => {
    const asterasysProducts = ['쿨페이즈', '쿨소닉', '리프테라'];
    const heatmapData = [];

    asterasysProducts.forEach(product => {
      channelConfigs.forEach(channel => {
        const channelData = channels[channel.key];
        let value = 0;
        
        // Calculate performance score based on channel
        switch (channel.key) {
          case 'blog':
            value = channelData?.overview?.totalPosts || 0;
            break;
          case 'cafe':
            value = channelData?.overview?.totalPosts || 0;
            break;
          case 'news':
            value = channelData?.overview?.totalArticles || 0;
            break;
          case 'youtube':
            value = channelData?.contents?.totalVideos || 0;
            break;
          case 'search':
            value = channelData?.overview?.totalSearchVolume || 0;
            break;
          case 'sales':
            value = channelData?.overview?.totalSales || 0;
            break;
        }
        
        heatmapData.push({
          x: channel.name,
          y: product,
          value: value
        });
      });
    });

    return heatmapData;
  };

  // Channel comparison chart data
  const getChannelComparisonData = () => {
    const channelValues = channelConfigs.map(channel => {
      const channelData = channels[channel.key];
      let value = 0;
      
      switch (channel.key) {
        case 'blog':
          value = channelData?.overview?.totalPosts || 0;
          break;
        case 'cafe':
          value = channelData?.overview?.totalPosts || 0;
          break;
        case 'news':
          value = channelData?.overview?.totalArticles || 0;
          break;
        case 'youtube':
          value = channelData?.contents?.totalVideos || 0;
          break;
        case 'search':
          value = channelData?.overview?.totalSearchVolume || 0;
          break;
        case 'sales':
          value = channelData?.overview?.totalSales || 0;
          break;
      }
      
      return {
        name: channel.name,
        value: value,
        color: channel.color,
        strength: channel.strength
      };
    });

    return channelValues.sort((a, b) => b.value - a.value);
  };

  // Heatmap chart options
  const heatmapOptions = {
    chart: {
      height: 300,
      type: 'heatmap',
      toolbar: { show: false }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '11px',
        fontWeight: 'bold'
      }
    },
    colors: ["#667eea"],
    title: {
      text: 'Channel × Product Performance Matrix',
      style: { fontSize: '14px', fontWeight: 'bold' }
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        colorScale: {
          ranges: [
            { from: 0, to: 50, name: 'Low', color: '#FFE5E5' },
            { from: 51, to: 200, name: 'Medium', color: '#FFCC99' },
            { from: 201, to: 500, name: 'High', color: '#99CCFF' },
            { from: 501, to: 1000, name: 'Very High', color: '#667eea' }
          ]
        }
      }
    }
  };

  // Bar chart options for channel comparison
  const barChartOptions = {
    chart: {
      height: 300,
      type: 'bar',
      toolbar: { show: true }
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: true,
        dataLabels: {
          position: 'center'
        }
      }
    },
    colors: channelConfigs.map(c => c.color),
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return val.toLocaleString();
      },
      style: {
        fontSize: '11px',
        fontWeight: 'bold',
        colors: ['#fff']
      }
    },
    xaxis: {
      title: { text: '성과 지표' }
    },
    title: {
      text: 'Channel Performance Comparison',
      style: { fontSize: '14px', fontWeight: 'bold' }
    }
  };

  const channelComparisonData = getChannelComparisonData();
  const heatmapData = getHeatmapData();

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-transparent border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="card-title mb-1 fw-bold">
              {getIcon('grid', { className: 'text-primary me-2' })}
              Channel Performance Matrix
            </h4>
            <p className="text-muted small mb-0">채널별 성과 분석 및 최적화 기회</p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            {/* View Type Selector */}
            <div className="btn-group btn-group-sm" role="group">
              <button 
                className={`btn ${viewType === 'heatmap' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewType('heatmap')}
              >
                히트맵
              </button>
              <button 
                className={`btn ${viewType === 'comparison' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewType('comparison')}
              >
                비교분석
              </button>
              <button 
                className={`btn ${viewType === 'detailed' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewType('detailed')}
              >
                상세분석
              </button>
            </div>
            
            {/* Channel Filter */}
            <select 
              className="form-select form-select-sm"
              value={activeChannel}
              onChange={(e) => setActiveChannel(e.target.value)}
              style={{ width: '140px' }}
            >
              <option value="all">전체 채널</option>
              {channelConfigs.map(channel => (
                <option key={channel.key} value={channel.key}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Channel Overview Cards */}
        <div className="row g-3 mb-4">
          {channelConfigs.map(channel => {
            const channelData = channels[channel.key];
            const getChannelValue = () => {
              switch (channel.key) {
                case 'blog':
                  return channelData?.overview?.totalPosts || 0;
                case 'cafe':
                  return channelData?.overview?.totalPosts || 0;
                case 'news':
                  return channelData?.overview?.totalArticles || 0;
                case 'youtube':
                  return channelData?.contents?.totalVideos || 0;
                case 'search':
                  return channelData?.overview?.totalSearchVolume || 0;
                case 'sales':
                  return channelData?.overview?.totalSales || 0;
                default:
                  return 0;
              }
            };

            const getEngagement = () => {
              switch (channel.key) {
                case 'blog':
                  return channelData?.overview?.avgEngagement || 0;
                case 'cafe':
                  return channelData?.overview?.totalComments || 0;
                case 'youtube':
                  return channelData?.engagement?.totalComments || 0;
                default:
                  return 0;
              }
            };

            const channelValue = getChannelValue();
            const engagement = getEngagement();

            return (
              <div key={channel.key} className="col-lg-2 col-md-4 col-6">
                <div 
                  className={`card h-100 border-0 cursor-pointer ${activeChannel === channel.key ? 'border-3 border-primary' : ''}`}
                  style={{ 
                    background: `linear-gradient(135deg, ${channel.color}20 0%, ${channel.color}10 100%)`,
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setActiveChannel(channel.key)}
                >
                  <div className="card-body p-3 text-center">
                    <div className="mb-2">
                      <div className="p-2 rounded-circle mx-auto" style={{ 
                        backgroundColor: channel.color,
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getIcon(channel.icon, { className: 'text-white', size: 18 })}
                      </div>
                    </div>
                    <h6 className="fw-semibold mb-1">{channel.name}</h6>
                    <div className="fw-bold text-dark mb-1">{channelValue.toLocaleString()}</div>
                    <small className="text-muted">
                      {channel.key === 'blog' || channel.key === 'cafe' ? '발행량' :
                       channel.key === 'news' ? '기사수' :
                       channel.key === 'youtube' ? '영상수' :
                       channel.key === 'search' ? '검색량' : '판매량'}
                    </small>
                    
                    {/* Channel strength indicator */}
                    <div className="mt-2">
                      <span className={`badge ${
                        channel.strength === 'high' ? 'bg-success' :
                        channel.strength === 'medium' ? 'bg-warning' : 'bg-secondary'
                      } opacity-75`}>
                        {channel.strength === 'high' ? '강점' :
                         channel.strength === 'medium' ? '보통' : '기회'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Visualization */}
        {viewType === 'heatmap' && (
          <div className="row">
            <div className="col-12">
              <div className="bg-light rounded-3 p-4">
                <h6 className="fw-semibold mb-3">제품 × 채널 성과 히트맵</h6>
                <div style={{ height: '300px' }}>
                  {/* Placeholder for heatmap - would implement with actual chart */}
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="text-center text-muted">
                      {getIcon('grid', { size: 48, className: 'opacity-50' })}
                      <p className="mt-2">채널별 Asterasys 제품 성과 히트맵</p>
                      <small>(차트 라이브러리 최적화 진행 중)</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewType === 'comparison' && (
          <div className="row">
            <div className="col-lg-8">
              <ReactApexChart
                options={barChartOptions}
                series={[{
                  name: '성과',
                  data: channelComparisonData.map(item => ({
                    x: item.name,
                    y: item.value,
                    fillColor: item.color
                  }))
                }]}
                type="bar"
                height={300}
              />
            </div>
            <div className="col-lg-4">
              <h6 className="fw-semibold mb-3">채널별 인사이트</h6>
              {channelConfigs.map(channel => {
                const channelData = channels[channel.key];
                let insight = '';
                
                switch (channel.key) {
                  case 'blog':
                    insight = `병원 블로그 중심 (${channelData?.byType?.[0]?.totalPosts || 0}건)`;
                    break;
                  case 'cafe':
                    insight = `높은 조회수 (${(channelData?.overview?.totalViews || 0).toLocaleString()}회)`;
                    break;
                  case 'news':
                    insight = `브랜드 인지도 (${channelData?.topPerformers?.length || 0}개 기사)`;
                    break;
                  case 'youtube':
                    insight = `영상 콘텐츠 (${channelData?.contents?.totalVideos || 0}개)`;
                    break;
                  case 'search':
                    insight = `월간 검색 (${(channelData?.overview?.totalSearchVolume || 0).toLocaleString()}건)`;
                    break;
                  case 'sales':
                    insight = `실제 판매 (${(channelData?.overview?.totalSales || 0).toLocaleString()}대)`;
                    break;
                }

                return (
                  <div key={channel.key} className="mb-2 p-2 rounded-2" style={{ background: `${channel.color}20` }}>
                    <div className="d-flex align-items-center">
                      <div className="p-1 rounded me-2" style={{ backgroundColor: channel.color }}>
                        {getIcon(channel.icon, { className: 'text-white', size: 12 })}
                      </div>
                      <div>
                        <small className="fw-semibold">{channel.name}</small><br/>
                        <small className="text-muted">{insight}</small>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewType === 'detailed' && activeChannel !== 'all' && (
          <div className="row">
            <div className="col-12">
              {/* Channel-specific detailed view */}
              <div className="bg-light rounded-3 p-4">
                <h6 className="fw-semibold mb-3">
                  {channelConfigs.find(c => c.key === activeChannel)?.name} 채널 상세 분석
                </h6>
                
                {/* Channel specific content would go here */}
                {activeChannel === 'blog' && channels.blog && (
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="small fw-semibold mb-2">블로그 유형별 분석</h6>
                      {channels.blog.byType?.map(type => (
                        <div key={type.type} className="mb-2 p-2 bg-white rounded">
                          <div className="d-flex justify-content-between">
                            <span className="small fw-medium">{type.type}</span>
                            <span className="small text-primary">{type.totalPosts}건</span>
                          </div>
                          <div className="progress mt-1" style={{ height: '3px' }}>
                            <div 
                              className="progress-bar bg-primary"
                              style={{ width: `${(type.totalPosts / Math.max(...channels.blog.byType.map(t => t.totalPosts))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="col-md-6">
                      <h6 className="small fw-semibold mb-2">상위 블로거</h6>
                      {channels.blog.topInfluencers?.slice(0, 5).map((influencer, index) => (
                        <div key={index} className="mb-2 p-2 bg-white rounded">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <div className="small fw-medium">{influencer.name}</div>
                              <div className="text-muted small">{influencer.keyword}</div>
                            </div>
                            <div className="text-end">
                              <div className="small fw-bold text-primary">{influencer.posts}건</div>
                              <div className="text-muted small">#{influencer.rank}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeChannel === 'cafe' && channels.cafe && (
                  <div className="row">
                    <div className="col-md-8">
                      <div className="text-center">
                        <h3 className="text-primary fw-bold">{(channels.cafe.overview?.totalViews || 0).toLocaleString()}</h3>
                        <p className="text-muted">총 조회수</p>
                        <div className="row mt-3">
                          <div className="col-4">
                            <div className="p-3 bg-white rounded">
                              <div className="fw-bold text-info">{(channels.cafe.overview?.totalPosts || 0).toLocaleString()}</div>
                              <small className="text-muted">총 발행량</small>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="p-3 bg-white rounded">
                              <div className="fw-bold text-success">{(channels.cafe.overview?.totalComments || 0).toLocaleString()}</div>
                              <small className="text-muted">총 댓글수</small>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="p-3 bg-white rounded">
                              <div className="fw-bold text-warning">
                                {channels.cafe.overview?.totalPosts > 0 
                                  ? ((channels.cafe.overview?.totalComments || 0) / channels.cafe.overview?.totalPosts).toFixed(1)
                                  : '0.0'}
                              </div>
                              <small className="text-muted">참여도</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <h6 className="small fw-semibold mb-2">상위 성과</h6>
                      {channels.cafe.topPerformers?.slice(0, 5).map((item, index) => (
                        <div key={index} className="mb-2 p-2 bg-white rounded">
                          <div className="d-flex justify-content-between">
                            <span className="small fw-medium">{item.keyword}</span>
                            <span className="small text-primary">{(item.totalViews || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other channel details would be implemented similarly */}
              </div>
            </div>
          </div>
        )}

        {/* Channel Performance Summary */}
        <div className="mt-4 pt-3 border-top">
          <div className="row text-center">
            <div className="col-md-3">
              <div className="fw-bold text-success">{channelConfigs.filter(c => c.strength === 'high').length}</div>
              <small className="text-muted">강점 채널</small>
            </div>
            <div className="col-md-3">
              <div className="fw-bold text-warning">{channelConfigs.filter(c => c.strength === 'medium').length}</div>
              <small className="text-muted">개선 채널</small>
            </div>
            <div className="col-md-3">
              <div className="fw-bold text-info">{channelConfigs.filter(c => c.strength === 'low').length}</div>
              <small className="text-muted">기회 채널</small>
            </div>
            <div className="col-md-3">
              <div className="fw-bold text-primary">6</div>
              <small className="text-muted">총 채널 수</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}