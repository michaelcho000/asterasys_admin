'use client';

import React, { useState } from 'react';
import { getIcon } from '@/utils/getIcon';

/**
 * Influencer Insights - Top performers and content analysis
 * Hospital, blogger, and content creator analysis with engagement metrics
 */

export default function InfluencerInsights({ channels, filters }) {
  const [activeTab, setActiveTab] = useState('bloggers'); // bloggers, hospitals, content
  const [sortBy, setSortBy] = useState('posts'); // posts, engagement, rank

  if (!channels) return null;

  // Get top influencers based on active tab and sort
  const getInfluencerData = () => {
    switch (activeTab) {
      case 'bloggers':
        return channels.blog?.topInfluencers || [];
      case 'hospitals':
        // Extract hospital data from various sources
        const hospitalData = [];
        if (channels.blog?.topInfluencers) {
          channels.blog.topInfluencers.forEach(influencer => {
            if (influencer.name.includes('의원') || influencer.name.includes('병원') || influencer.name.includes('클리닉')) {
              hospitalData.push({
                ...influencer,
                type: 'hospital',
                channel: 'blog'
              });
            }
          });
        }
        return hospitalData;
      case 'content':
        // Get YouTube content creators
        return channels.youtube?.topChannels || [];
      default:
        return [];
    }
  };

  const influencerData = getInfluencerData();

  // Calculate engagement metrics
  const getEngagementScore = (item) => {
    if (item.posts && item.comments) {
      return item.comments / item.posts;
    }
    if (item.commentCount) {
      return item.commentCount;
    }
    return 0;
  };

  // Sort data based on selected criteria
  const sortedData = [...influencerData].sort((a, b) => {
    switch (sortBy) {
      case 'engagement':
        return getEngagementScore(b) - getEngagementScore(a);
      case 'rank':
        return (a.rank || 0) - (b.rank || 0);
      case 'posts':
      default:
        return (b.posts || b.commentCount || 0) - (a.posts || a.commentCount || 0);
    }
  });

  const getRankBadge = (rank) => {
    if (rank <= 3) return <span className="badge bg-warning text-dark">Top {rank}</span>;
    if (rank <= 10) return <span className="badge bg-success">Top 10</span>;
    return <span className="badge bg-secondary">#{rank}</span>;
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'blog': return getIcon('edit', { size: 14 });
      case 'cafe': return getIcon('users', { size: 14 });
      case 'youtube': return getIcon('video', { size: 14 });
      default: return getIcon('globe', { size: 14 });
    }
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-transparent border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="card-title mb-1 fw-bold">
              {getIcon('award', { className: 'text-primary me-2' })}
              Influencer Insights
            </h4>
            <p className="text-muted small mb-0">상위 인플루언서 및 콘텐츠 분석</p>
          </div>
          <div className="d-flex gap-2">
            {/* Sort Options */}
            <select 
              className="form-select form-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: '120px' }}
            >
              <option value="posts">발행량순</option>
              <option value="engagement">참여도순</option>
              <option value="rank">순위순</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-body p-0">
        {/* Tab Navigation */}
        <div className="px-3 pt-3">
          <ul className="nav nav-pills nav-fill" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'bloggers' ? 'active' : ''}`}
                onClick={() => setActiveTab('bloggers')}
              >
                {getIcon('edit', { size: 14, className: 'me-1' })}
                블로거 ({channels.blog?.topInfluencers?.length || 0})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'hospitals' ? 'active' : ''}`}
                onClick={() => setActiveTab('hospitals')}
              >
                {getIcon('shield', { size: 14, className: 'me-1' })}
                병원/의원 ({influencerData.filter(i => i.name?.includes('의원') || i.name?.includes('병원')).length})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'content' ? 'active' : ''}`}
                onClick={() => setActiveTab('content')}
              >
                {getIcon('video', { size: 14, className: 'me-1' })}
                콘텐츠 ({channels.youtube?.engagement?.byCategory?.length || 0})
              </button>
            </li>
          </ul>
        </div>

        {/* Influencer List */}
        <div className="px-3 py-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {sortedData.length > 0 ? (
            <div className="list-group list-group-flush">
              {sortedData.slice(0, 10).map((item, index) => (
                <div key={index} className="list-group-item border-0 px-0 py-3">
                  <div className="row align-items-center">
                    <div className="col-1 text-center">
                      <div className="fw-bold text-primary h5 mb-0">#{index + 1}</div>
                    </div>
                    
                    <div className="col-7">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                            {getChannelIcon(item.channel || 'blog')}
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-semibold">
                            {item.name || item.channel}
                            {item.rank && getRankBadge(item.rank)}
                          </h6>
                          <div className="small text-muted">
                            {item.keyword && (
                              <span className="me-2">
                                <strong>키워드:</strong> {item.keyword}
                              </span>
                            )}
                            {item.url && (
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                {getIcon('link', { size: 12, className: 'me-1' })}
                                방문
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-4">
                      <div className="row text-center">
                        <div className="col-6">
                          <div className="fw-bold text-dark">
                            {(item.posts || item.commentCount || 0).toLocaleString()}
                          </div>
                          <small className="text-muted">
                            {activeTab === 'content' ? '댓글' : '발행량'}
                          </small>
                        </div>
                        <div className="col-6">
                          <div className="fw-bold text-success">
                            {getEngagementScore(item).toFixed(1)}
                          </div>
                          <small className="text-muted">참여도</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance indicator bar */}
                  <div className="mt-2">
                    <div className="progress" style={{ height: '2px' }}>
                      <div 
                        className="progress-bar bg-primary"
                        style={{ 
                          width: `${Math.min(((item.posts || item.commentCount || 0) / Math.max(...sortedData.map(d => d.posts || d.commentCount || 0))) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted">
              <div className="mb-2">
                {getIcon('users', { size: 32, className: 'opacity-50' })}
              </div>
              <p>해당 카테고리의 데이터를 찾을 수 없습니다.</p>
              <small>다른 탭을 선택하거나 필터를 조정해보세요.</small>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {sortedData.length > 0 && (
          <div className="border-top bg-light px-3 py-2">
            <div className="row text-center">
              <div className="col-3">
                <div className="fw-bold text-primary">{sortedData.length}</div>
                <small className="text-muted">총 인플루언서</small>
              </div>
              <div className="col-3">
                <div className="fw-bold text-success">
                  {sortedData.reduce((sum, item) => sum + (item.posts || item.commentCount || 0), 0).toLocaleString()}
                </div>
                <small className="text-muted">
                  {activeTab === 'content' ? '총 댓글' : '총 발행량'}
                </small>
              </div>
              <div className="col-3">
                <div className="fw-bold text-info">
                  {(sortedData.reduce((sum, item) => sum + getEngagementScore(item), 0) / sortedData.length).toFixed(1)}
                </div>
                <small className="text-muted">평균 참여도</small>
              </div>
              <div className="col-3">
                <div className="fw-bold text-warning">
                  {Math.max(...sortedData.map(item => item.posts || item.commentCount || 0)).toLocaleString()}
                </div>
                <small className="text-muted">최고 성과</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}