'use client';

import React, { useState } from 'react';
import { getIcon } from '@/utils/getIcon';

/**
 * Ranking Table Component
 * Shows product rankings with highlighting for Asterasys products
 */

export default function RankingTable({ title, data, type = 'products' }) {
  const [sortBy, setSortBy] = useState('posts');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filter, setFilter] = useState('all'); // 'all', 'asterasys', 'competitors'

  // Filter and sort data
  const getProcessedData = () => {
    if (!data || !Array.isArray(data)) return [];
    
    let filteredData = [...data];

    // Apply filter
    switch (filter) {
      case 'asterasys':
        filteredData = filteredData.filter(item => item.brand === 'asterasys');
        break;
      case 'competitors':
        filteredData = filteredData.filter(item => item.brand === 'competitor');
        break;
      case 'rf':
        filteredData = filteredData.filter(item => item.category === 'RF');
        break;
      case 'hifu':
        filteredData = filteredData.filter(item => item.category === 'HIFU');
        break;
      default:
        // Show all
        break;
    }

    // Sort data
    filteredData.sort((a, b) => {
      let aValue = a[sortBy] || 0;
      let bValue = b[sortBy] || 0;

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredData;
  };

  const processedData = getProcessedData();

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return getIcon('chevrons-up-down', { size: 16, className: 'text-muted' });
    }
    return sortOrder === 'asc' 
      ? getIcon('chevron-up', { size: 16, className: 'text-primary' })
      : getIcon('chevron-down', { size: 16, className: 'text-primary' });
  };

  // Format value based on field type
  const formatValue = (value, field) => {
    if (typeof value !== 'number') return value;
    
    switch (field) {
      case 'sov':
        return value.toFixed(1) + '%';
      case 'engagement':
        return value.toFixed(2);
      case 'posts':
      case 'sales':
      case 'searchVolume':
      case 'totalViews':
      case 'totalComments':
        return value.toLocaleString();
      default:
        return value;
    }
  };

  // Get row class based on brand
  const getRowClass = (item) => {
    if (item.brand === 'asterasys') {
      return 'table-success';
    }
    return '';
  };

  // Get brand badge
  const getBrandBadge = (item) => {
    if (item.brand === 'asterasys') {
      return <span className="badge bg-success ms-1">Asterasys</span>;
    }
    return null;
  };

  // Get category badge
  const getCategoryBadge = (category) => {
    const badgeClass = category === 'RF' ? 'bg-danger' : 'bg-info';
    const categoryText = category === 'RF' ? '고주파' : '초음파';
    return <span className={`badge ${badgeClass} opacity-75`}>{categoryText}</span>;
  };

  return (
    <div className="card h-100">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-0">{title}</h5>
            <small className="text-muted">
              {processedData.length}개 제품 표시 
              {filter !== 'all' && ` (${filter === 'asterasys' ? 'Asterasys 제품만' : 
                                      filter === 'competitors' ? '경쟁사 제품만' :
                                      filter === 'rf' ? 'RF 제품만' : 'HIFU 제품만'})`}
            </small>
          </div>
          <div className="d-flex gap-2">
            {/* Filter dropdown */}
            <select 
              className="form-select form-select-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: '140px' }}
            >
              <option value="all">전체</option>
              <option value="asterasys">Asterasys</option>
              <option value="competitors">경쟁사</option>
              <option value="rf">RF 제품</option>
              <option value="hifu">HIFU 제품</option>
            </select>
          </div>
        </div>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th 
                  className="sortable" 
                  onClick={() => handleSort('keyword')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    제품명
                    {getSortIcon('keyword')}
                  </div>
                </th>
                <th style={{ width: '100px' }}>카테고리</th>
                <th 
                  className="sortable text-end" 
                  onClick={() => handleSort('posts')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center justify-content-end">
                    발행량
                    {getSortIcon('posts')}
                  </div>
                </th>
                <th 
                  className="sortable text-end" 
                  onClick={() => handleSort('sov')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center justify-content-end">
                    점유율
                    {getSortIcon('sov')}
                  </div>
                </th>
                <th 
                  className="sortable text-end" 
                  onClick={() => handleSort('sales')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center justify-content-end">
                    판매량
                    {getSortIcon('sales')}
                  </div>
                </th>
                <th 
                  className="sortable text-end" 
                  onClick={() => handleSort('searchVolume')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center justify-content-end">
                    검색량
                    {getSortIcon('searchVolume')}
                  </div>
                </th>
                <th style={{ width: '80px' }}>순위변화</th>
              </tr>
            </thead>
            <tbody>
              {processedData.length > 0 ? (
                processedData.map((item, index) => (
                  <tr key={item.keyword || index} className={getRowClass(item)}>
                    <td className="text-center">
                      <span className="badge bg-secondary">{index + 1}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle me-2" style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: item.color || '#ccc'
                        }}></div>
                        <span className="fw-semibold">{item.keyword || item.name}</span>
                        {getBrandBadge(item)}
                      </div>
                    </td>
                    <td>
                      {getCategoryBadge(item.category)}
                    </td>
                    <td className="text-end fw-semibold">
                      {formatValue(item.posts, 'posts')}
                    </td>
                    <td className="text-end">
                      <span className={item.brand === 'asterasys' ? 'text-success fw-bold' : ''}>
                        {formatValue(item.sov, 'sov')}
                      </span>
                    </td>
                    <td className="text-end">
                      {formatValue(item.sales, 'sales')}
                    </td>
                    <td className="text-end">
                      {formatValue(item.searchVolume, 'searchVolume')}
                    </td>
                    <td className="text-center">
                      {/* Placeholder for trend - can be enhanced with historical data */}
                      <span className="text-success">
                        {getIcon('trending-up', { size: 16 })}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    표시할 데이터가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer with summary */}
      {processedData.length > 0 && (
        <div className="card-footer bg-light">
          <div className="row text-center">
            <div className="col-md-3">
              <div className="fw-bold text-primary">
                {processedData.reduce((sum, item) => sum + (item.posts || 0), 0).toLocaleString()}
              </div>
              <small className="text-muted">총 발행량</small>
            </div>
            <div className="col-md-3">
              <div className="fw-bold text-success">
                {processedData.filter(item => item.brand === 'asterasys').length}개
              </div>
              <small className="text-muted">Asterasys 제품</small>
            </div>
            <div className="col-md-3">
              <div className="fw-bold text-info">
                {processedData.reduce((sum, item) => sum + (item.sales || 0), 0).toLocaleString()}
              </div>
              <small className="text-muted">총 판매량</small>
            </div>
            <div className="col-md-3">
              <div className="fw-bold text-warning">
                {(processedData.filter(item => item.brand === 'asterasys')
                  .reduce((sum, item) => sum + (item.sov || 0), 0)).toFixed(1)}%
              </div>
              <small className="text-muted">Asterasys 총 점유율</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}