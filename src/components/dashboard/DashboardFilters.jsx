'use client';

import React from 'react';
import { getIcon } from '@/utils/getIcon';

/**
 * Advanced Dashboard Filters - Enterprise filtering system
 * Multi-dimensional filtering with smart presets and quick access
 */

export default function DashboardFilters({ filters, onFilterChange, data }) {
  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const clearAllFilters = () => {
    onFilterChange({
      dateRange: '2025-08',
      channels: 'all',
      brands: 'all', 
      categories: 'all',
      view: 'overview'
    });
  };

  const quickFilters = [
    {
      name: 'Asterasys 집중 분석',
      icon: 'target',
      color: 'primary',
      filters: { brands: 'asterasys', view: 'competitive' }
    },
    {
      name: 'HIFU 시장 현황',
      icon: 'radio',
      color: 'info', 
      filters: { categories: 'HIFU', view: 'channels' }
    },
    {
      name: 'RF 시장 현황',
      icon: 'zap',
      color: 'warning',
      filters: { categories: 'RF', view: 'channels' }
    },
    {
      name: '채널별 상세',
      icon: 'grid',
      color: 'success',
      filters: { view: 'channels' }
    }
  ];

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body py-3">
        <div className="row g-3 align-items-center">
          {/* Quick Access Filters */}
          <div className="col-lg-6">
            <div className="d-flex align-items-center">
              <label className="form-label small fw-semibold me-3 mb-0">빠른 필터:</label>
              <div className="d-flex gap-2 flex-wrap">
                {quickFilters.map((filter, index) => (
                  <button
                    key={index}
                    className={`btn btn-outline-${filter.color} btn-sm`}
                    onClick={() => onFilterChange(filter.filters)}
                  >
                    {getIcon(filter.icon, { size: 14, className: 'me-1' })}
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Filters */}
          <div className="col-lg-6">
            <div className="row g-2 align-items-center">
              {/* Date Range */}
              <div className="col-md-3">
                <select 
                  className="form-select form-select-sm"
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  <option value="2025-08">2025년 8월</option>
                  <option value="2025-09" disabled>2025년 9월 (예정)</option>
                  <option value="2025-Q3">2025년 3분기</option>
                </select>
              </div>

              {/* Channels */}
              <div className="col-md-3">
                <select 
                  className="form-select form-select-sm"
                  value={filters.channels}
                  onChange={(e) => handleFilterChange('channels', e.target.value)}
                >
                  <option value="all">전체 채널</option>
                  <option value="blog">블로그</option>
                  <option value="cafe">카페</option>
                  <option value="news">뉴스</option>
                  <option value="youtube">유튜브</option>
                  <option value="search">검색</option>
                  <option value="sales">판매</option>
                </select>
              </div>

              {/* Brands */}
              <div className="col-md-3">
                <select 
                  className="form-select form-select-sm"
                  value={filters.brands}
                  onChange={(e) => handleFilterChange('brands', e.target.value)}
                >
                  <option value="all">전체 브랜드</option>
                  <option value="asterasys">Asterasys만</option>
                  <option value="competitor">경쟁사만</option>
                </select>
              </div>

              {/* Categories */}  
              <div className="col-md-3">
                <select 
                  className="form-select form-select-sm"
                  value={filters.categories}
                  onChange={(e) => handleFilterChange('categories', e.target.value)}
                >
                  <option value="all">전체 카테고리</option>
                  <option value="RF">RF (고주파)</option>
                  <option value="HIFU">HIFU (초음파)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters Row */}
        <div className="row mt-3 pt-3 border-top">
          <div className="col-lg-8">
            {/* View Mode Selector */}
            <div className="d-flex align-items-center">
              <label className="form-label small fw-semibold me-3 mb-0">분석 뷰:</label>
              <div className="btn-group btn-group-sm" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="viewMode"
                  id="view-overview"
                  checked={filters.view === 'overview'}
                  onChange={() => handleFilterChange('view', 'overview')}
                />
                <label className="btn btn-outline-primary" htmlFor="view-overview">
                  {getIcon('home', { size: 14, className: 'me-1' })}
                  통합 개요
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="viewMode"
                  id="view-competitive"
                  checked={filters.view === 'competitive'}
                  onChange={() => handleFilterChange('view', 'competitive')}
                />
                <label className="btn btn-outline-primary" htmlFor="view-competitive">
                  {getIcon('users', { size: 14, className: 'me-1' })}
                  경쟁분석
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="viewMode"
                  id="view-channels"
                  checked={filters.view === 'channels'}
                  onChange={() => handleFilterChange('view', 'channels')}
                />
                <label className="btn btn-outline-primary" htmlFor="view-channels">
                  {getIcon('grid', { size: 14, className: 'me-1' })}
                  채널분석
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="viewMode"
                  id="view-trends"
                  checked={filters.view === 'trends'}
                  onChange={() => handleFilterChange('view', 'trends')}
                />
                <label className="btn btn-outline-primary" htmlFor="view-trends">
                  {getIcon('trending-up', { size: 14, className: 'me-1' })}
                  추세분석
                </label>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="d-flex justify-content-lg-end align-items-center gap-2">
              {/* Active Filters Indicator */}
              <div className="d-flex align-items-center me-2">
                {(filters.brands !== 'all' || filters.categories !== 'all' || filters.channels !== 'all') && (
                  <>
                    <span className="badge bg-primary me-2">
                      {[
                        filters.brands !== 'all' ? '브랜드' : null,
                        filters.categories !== 'all' ? '카테고리' : null,
                        filters.channels !== 'all' ? '채널' : null
                      ].filter(Boolean).length} 필터 활성
                    </span>
                    <button 
                      className="btn btn-link btn-sm text-decoration-none p-0"
                      onClick={clearAllFilters}
                    >
                      초기화
                    </button>
                  </>
                )}
              </div>

              {/* Export Options */}
              <div className="dropdown">
                <button className="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  {getIcon('download', { size: 14, className: 'me-1' })}
                  내보내기
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <a className="dropdown-item" href="#" onclick="window.print()">
                      {getIcon('printer', { size: 14, className: 'me-2' })}
                      PDF 리포트
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {getIcon('file-text', { size: 14, className: 'me-2' })}
                      Excel 데이터
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {getIcon('image', { size: 14, className: 'me-2' })}
                      차트 이미지
                    </a>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <a className="dropdown-item" href="#">
                      {getIcon('mail', { size: 14, className: 'me-2' })}
                      이메일 발송
                    </a>
                  </li>
                </ul>
              </div>

              {/* Real-time Toggle */}
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="realTimeToggle" defaultChecked />
                <label className="form-check-label small" htmlFor="realTimeToggle">
                  실시간 업데이트
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Status Bar */}
        {Object.values(filters).some(filter => filter !== 'all' && filter !== 'overview' && filter !== '2025-08') && (
          <div className="mt-3 pt-2 border-top">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <small className="text-muted">활성 필터:</small>
              
              {filters.brands !== 'all' && (
                <span className="badge bg-primary">
                  브랜드: {filters.brands === 'asterasys' ? 'Asterasys' : '경쟁사'}
                  <button 
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: '8px' }}
                    onClick={() => handleFilterChange('brands', 'all')}
                  ></button>
                </span>
              )}
              
              {filters.categories !== 'all' && (
                <span className="badge bg-info">
                  카테고리: {filters.categories}
                  <button 
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: '8px' }}
                    onClick={() => handleFilterChange('categories', 'all')}
                  ></button>
                </span>
              )}
              
              {filters.channels !== 'all' && (
                <span className="badge bg-success">
                  채널: {filters.channels}
                  <button 
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: '8px' }}
                    onClick={() => handleFilterChange('channels', 'all')}
                  ></button>
                </span>
              )}

              {filters.view !== 'overview' && (
                <span className="badge bg-secondary">
                  뷰: {
                    filters.view === 'competitive' ? '경쟁분석' :
                    filters.view === 'channels' ? '채널분석' :
                    filters.view === 'trends' ? '추세분석' : filters.view
                  }
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}