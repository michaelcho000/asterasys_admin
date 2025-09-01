'use client';

import React, { useState } from 'react';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import { FiExternalLink } from 'react-icons/fi';

/**
 * Top Influencers Table - Blog and content creators analysis
 * Clean table design following Duralux template patterns
 */

const TopInfluencersTable = ({ data }) => {
  const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
  const [activeTab, setActiveTab] = useState('blog'); // blog, youtube

  if (isRemoved || !data) return null;

  // Get influencer data based on active tab
  const getInfluencerData = () => {
    switch (activeTab) {
      case 'blog':
        return data.blog?.topInfluencers?.slice(0, 8) || [];
      case 'youtube':
        return data.youtube?.engagement?.topChannels?.slice(0, 8) || [];
      default:
        return [];
    }
  };

  const influencers = getInfluencerData();

  const getTypeIcon = (type) => {
    if (type.includes('병원') || type.includes('의원')) return '🏥';
    if (type.includes('클리닉')) return '🏥';
    return '📝';
  };

  const shortenUrl = (url) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url.substring(0, 30) + '...';
    }
  };

  return (
    <div className="col-xxl-4">
      <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
        <CardHeader title="주요 인플루언서">
          <div className="d-flex gap-1">
            <button 
              className={`btn btn-sm ${activeTab === 'blog' ? 'btn-primary' : 'btn-light'}`}
              onClick={() => setActiveTab('blog')}
            >
              블로그
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'youtube' ? 'btn-primary' : 'btn-light'}`}
              onClick={() => setActiveTab('youtube')}
            >
              유튜브
            </button>
            <button className="btn btn-sm btn-light" onClick={handleRefresh}>
              새로고침
            </button>
          </div>
        </CardHeader>
        
        <div className="card-body custom-card-action">
          {influencers.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="fw-semibold" style={{ width: '40px' }}>순위</th>
                    <th className="fw-semibold">이름</th>
                    <th className="fw-semibold">키워드</th>
                    <th className="fw-semibold text-end">
                      {activeTab === 'blog' ? '발행량' : '댓글수'}
                    </th>
                    <th className="fw-semibold text-center" style={{ width: '60px' }}>링크</th>
                  </tr>
                </thead>
                <tbody>
                  {influencers.map((influencer, index) => (
                    <tr key={index}>
                      <td className="text-center">
                        <span className={`badge ${
                          index < 3 ? 'bg-warning text-dark' : 'bg-light text-dark'
                        } fw-bold`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="me-2">{getTypeIcon(influencer.name || '')}</span>
                          <div>
                            <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '150px' }}>
                              {influencer.name || influencer.channel}
                            </div>
                            <div className="fs-11 text-muted">
                              {influencer.name && influencer.name.includes('의원') ? '의료기관' : 
                               influencer.name && influencer.name.includes('병원') ? '의료기관' : '블로거'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary">
                          {influencer.keyword}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="fw-semibold text-dark">
                          {(influencer.posts || influencer.commentCount || 0).toLocaleString()}
                        </div>
                        <div className="fs-11 text-muted">
                          {activeTab === 'blog' ? '건' : '개'}
                        </div>
                      </td>
                      <td className="text-center">
                        {influencer.url && (
                          <a 
                            href={influencer.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-light btn-sm p-1"
                            title={shortenUrl(influencer.url)}
                          >
                            <FiExternalLink size={12} />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-muted">
                <div className="fs-24 mb-2">📊</div>
                <p>데이터를 불러올 수 없습니다</p>
                <small>다른 탭을 선택해보세요</small>
              </div>
            </div>
          )}
        </div>
        
        <div className="card-footer">
          <div className="row g-4">
            <StatCard 
              bg_color="bg-primary" 
              price={influencers.length.toString()} 
              progress="100%"
              title="총 인플루언서" 
            />
            <StatCard 
              bg_color="bg-success" 
              price={influencers.filter(i => i.name && (i.name.includes('의원') || i.name.includes('병원'))).length.toString()} 
              progress={`${(influencers.filter(i => i.name && (i.name.includes('의원') || i.name.includes('병원'))).length / influencers.length * 100 || 0).toFixed(0)}%`}
              title="의료기관" 
            />
            <StatCard 
              bg_color="bg-info" 
              price={influencers.reduce((sum, i) => sum + (i.posts || i.commentCount || 0), 0).toLocaleString()} 
              progress={influencers.length > 0 ? `${((influencers.reduce((sum, i) => sum + (i.posts || i.commentCount || 0), 0) / influencers.length / Math.max(...influencers.map(i => i.posts || i.commentCount || 0))) * 100).toFixed(0)}%` : '0%'}
              title={`총 ${activeTab === 'blog' ? '발행량' : '댓글수'}`} 
            />
            <StatCard 
              bg_color="bg-warning" 
              price={Math.max(...influencers.map(i => i.posts || i.commentCount || 0)).toLocaleString()} 
              progress="100%"
              title="최고 성과" 
            />
          </div>
        </div>
        <CardLoader refreshKey={refreshKey} />
      </div>
    </div>
  );
};

// Helper function to shorten URLs
const shortenUrl = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url.substring(0, 30) + '...';
  }
};

// Footer stat card component
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

export default TopInfluencersTable;