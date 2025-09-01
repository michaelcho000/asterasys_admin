'use client';

import React, { useState } from 'react';
import { getIcon } from '@/utils/getIcon';

/**
 * Asterasys Focus Panel - Dedicated analysis for Asterasys products
 * Premium focus on company performance with competitive context
 */

export default function AsterasysFocusPanel({ data, filters }) {
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [focusMetric, setFocusMetric] = useState('performance'); // performance, growth, competitive

  if (!data) return null;

  const { topProducts, brand, categories } = data;
  const asterasysProducts = topProducts.asterasysOnly || [];

  // Enhanced product data with competitive context
  const getProductInsights = (product) => {
    const category = product.category;
    const categoryData = categories[category.toLowerCase()];
    const categoryLeader = topProducts.byPosts?.find(p => p.category === category) || {};
    
    return {
      ...product,
      categoryShare: categoryData ? (product.posts / categoryData.totalPosts * 100) : 0,
      leaderGap: categoryLeader.posts ? ((categoryLeader.posts - product.posts) / product.posts * 100) : 0,
      leaderName: categoryLeader.name || '',
      engagementRank: topProducts.engagement?.findIndex(p => p.keyword === product.keyword) + 1 || 'N/A',
      salesEfficiency: product.sales > 0 && product.posts > 0 ? (product.sales / product.posts) : 0
    };
  };

  const enhancedProducts = asterasysProducts.map(getProductInsights);

  // Portfolio performance summary
  const portfolioSummary = {
    totalPosts: brand.asterasys.totalPosts,
    totalSales: brand.asterasys.totalSales,
    avgEngagement: brand.asterasys.engagement,
    marketPosition: brand.asterasys.marketShare,
    strongestProduct: enhancedProducts.reduce((max, p) => p.sov > max.sov ? p : max, enhancedProducts[0] || {}),
    growthProduct: enhancedProducts.find(p => p.category === 'HIFU') || enhancedProducts[0], // HIFU growing faster
    challengeProduct: enhancedProducts.reduce((min, p) => p.posts < min.posts ? p : min, enhancedProducts[0] || {})
  };

  const getPerformanceStatus = (value, type) => {
    switch (type) {
      case 'sov':
        if (value >= 1) return { status: 'excellent', color: 'success' };
        if (value >= 0.5) return { status: 'good', color: 'primary' };
        return { status: 'needs-attention', color: 'warning' };
      case 'engagement':
        if (value >= 4) return { status: 'excellent', color: 'success' };
        if (value >= 2) return { status: 'good', color: 'primary' };
        return { status: 'needs-attention', color: 'warning' };
      case 'sales':
        if (value >= 400) return { status: 'excellent', color: 'success' };
        if (value >= 100) return { status: 'good', color: 'primary' };
        return { status: 'needs-attention', color: 'warning' };
      default:
        return { status: 'neutral', color: 'secondary' };
    }
  };

  return (
    <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(102, 126, 234, 0.02) 100%)' }}>
      <div className="card-header bg-transparent border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="card-title mb-1 fw-bold text-primary">
              {getIcon('target', { className: 'me-2' })}
              Asterasys Focus
            </h4>
            <p className="text-muted small mb-0">자사 제품 집중 분석</p>
          </div>
          <div className="dropdown">
            <button className="btn btn-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
              {getIcon('more-vertical', { size: 14 })}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" href="#">제품별 상세 리포트</a></li>
              <li><a className="dropdown-item" href="#">경쟁 포지셔닝 분석</a></li>
              <li><a className="dropdown-item" href="#">성장 기회 분석</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Portfolio Overview */}
        <div className="mb-4 p-3 rounded-3 bg-white border">
          <div className="row text-center">
            <div className="col-4">
              <div className="fw-bold h4 text-primary mb-1">{portfolioSummary.totalPosts?.toLocaleString()}</div>
              <small className="text-muted">총 발행량</small>
              <div className="mt-1">
                <span className="badge bg-primary opacity-75">
                  {portfolioSummary.marketPosition?.toFixed(1)}% 점유
                </span>
              </div>
            </div>
            <div className="col-4">
              <div className="fw-bold h4 text-success mb-1">{portfolioSummary.avgEngagement?.toFixed(1)}</div>
              <small className="text-muted">평균 참여도</small>
              <div className="mt-1">
                <span className="badge bg-success opacity-75">업계 1위</span>
              </div>
            </div>
            <div className="col-4">
              <div className="fw-bold h4 text-warning mb-1">{portfolioSummary.totalSales?.toLocaleString()}</div>
              <small className="text-muted">총 판매량</small>
              <div className="mt-1">
                <span className="badge bg-warning opacity-75">성장 가능</span>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Product Analysis */}
        <div className="mb-4">
          <h6 className="fw-semibold mb-3">제품별 성과</h6>
          
          {enhancedProducts.map(product => {
            const sovStatus = getPerformanceStatus(product.sov, 'sov');
            const engagementStatus = getPerformanceStatus(product.engagement || 0, 'engagement');
            const salesStatus = getPerformanceStatus(product.sales, 'sales');

            return (
              <div 
                key={product.keyword} 
                className="mb-3 p-3 rounded-3 border"
                style={{ background: `${product.color}10` }}
              >
                <div className="row align-items-center">
                  <div className="col-md-4">
                    <div className="d-flex align-items-center">
                      <div 
                        className="rounded-circle me-3 d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ 
                          backgroundColor: product.color,
                          width: '32px',
                          height: '32px',
                          fontSize: '12px'
                        }}
                      >
                        {product.name[0]}
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1" style={{ color: product.color }}>
                          {product.name}
                        </h6>
                        <small className="text-muted">{product.category_en}</small>
                        <div className="mt-1">
                          <span className={`badge bg-${sovStatus.color} opacity-75`}>
                            {product.sov?.toFixed(2)}% SOV
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-8">
                    <div className="row text-center">
                      <div className="col-3">
                        <div className="fw-semibold text-dark">{product.posts?.toLocaleString()}</div>
                        <small className="text-muted">발행량</small>
                        <div className={`text-${sovStatus.color} small`}>
                          #{topProducts.byPosts?.findIndex(p => p.keyword === product.keyword) + 1 || 'N/A'}위
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="fw-semibold text-dark">{product.sales?.toLocaleString()}</div>
                        <small className="text-muted">판매량</small>
                        <div className={`text-${salesStatus.color} small`}>
                          효율 {product.salesEfficiency?.toFixed(1) || '0.0'}
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="fw-semibold text-dark">{product.searchVolume?.toLocaleString()}</div>
                        <small className="text-muted">검색량</small>
                        <div className="text-info small">
                          #{topProducts.bySearch?.findIndex(p => p.keyword === product.keyword) + 1 || 'N/A'}위
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="fw-semibold text-dark">#{product.engagementRank}</div>
                        <small className="text-muted">참여도 순위</small>
                        <div className={`text-${engagementStatus.color} small`}>
                          {product.engagement?.toFixed(1) || '0.0'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product-specific insights */}
                <div className="mt-3 pt-2 border-top border-light">
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted">
                        <strong>카테고리 내 위치:</strong> {product.categoryShare?.toFixed(1)}% 
                        ({product.category} 시장 내)
                      </small>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">
                        <strong>선두 격차:</strong> {product.leaderName} 대비 
                        <span className="text-danger">{product.leaderGap?.toFixed(0)}%</span> 차이
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Strategic Focus Areas */}
        <div className="bg-light rounded-3 p-3">
          <h6 className="fw-semibold mb-3">전략적 포커스</h6>
          
          <div className="row g-2">
            <div className="col-12">
              <div className="d-flex align-items-start">
                <div className="me-2 text-success">
                  {getIcon('trending-up', { size: 16 })}
                </div>
                <div>
                  <strong className="text-success small">성장 동력: {portfolioSummary.growthProduct?.name}</strong><br/>
                  <small className="text-muted">
                    HIFU 시장 확대 트렌드 활용, 리프테라 마케팅 투자 확대 권장
                  </small>
                </div>
              </div>
            </div>
            
            <div className="col-12 mt-2">
              <div className="d-flex align-items-start">
                <div className="me-2 text-primary">
                  {getIcon('star', { size: 16 })}
                </div>
                <div>
                  <strong className="text-primary small">우수 성과: {portfolioSummary.strongestProduct?.name}</strong><br/>
                  <small className="text-muted">
                    높은 참여도 유지, 브랜드 인지도 확산 효과 극대화
                  </small>
                </div>
              </div>
            </div>
            
            <div className="col-12 mt-2">
              <div className="d-flex align-items-start">
                <div className="me-2 text-warning">
                  {getIcon('alert-circle', { size: 16 })}
                </div>
                <div>
                  <strong className="text-warning small">개선 필요: {portfolioSummary.challengeProduct?.name}</strong><br/>
                  <small className="text-muted">
                    마케팅 전략 재검토, 타겟 채널 다양화 필요
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="mt-4">
          <h6 className="fw-semibold mb-3">성과 지표</h6>
          <div className="row g-2">
            <div className="col-6">
              <div className="text-center p-2 rounded bg-white">
                <div className="text-success fw-bold">{enhancedProducts.length}</div>
                <small className="text-muted">활성 제품</small>
              </div>
            </div>
            <div className="col-6">
              <div className="text-center p-2 rounded bg-white">
                <div className="text-primary fw-bold">
                  {enhancedProducts.filter(p => p.sov >= 0.5).length}
                </div>
                <small className="text-muted">주요 제품</small>
              </div>
            </div>
            <div className="col-6">
              <div className="text-center p-2 rounded bg-white">
                <div className="text-info fw-bold">
                  {enhancedProducts.filter(p => p.category === 'HIFU').length}
                </div>
                <small className="text-muted">HIFU 제품</small>
              </div>
            </div>
            <div className="col-6">
              <div className="text-center p-2 rounded bg-white">
                <div className="text-warning fw-bold">
                  {enhancedProducts.filter(p => p.category === 'RF').length}
                </div>
                <small className="text-muted">RF 제품</small>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 d-grid gap-2">
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onFilterChange?.({ brands: 'asterasys', view: 'competitive' })}
          >
            {getIcon('users', { size: 14, className: 'me-1' })}
            경쟁사 비교 분석
          </button>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={() => onFilterChange?.({ view: 'trends' })}
          >
            {getIcon('trending-up', { size: 14, className: 'me-1' })}
            성장 트렌드 분석
          </button>
        </div>
      </div>

      {/* Asterasys Brand Footer */}
      <div className="card-footer bg-primary text-white text-center py-2">
        <div className="d-flex justify-content-between align-items-center">
          <small className="opacity-75">Powered by Asterasys Intelligence</small>
          <div className="d-flex gap-2">
            <span className="badge bg-white text-primary">Premium</span>
            <span className="badge bg-warning text-dark">Real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
}