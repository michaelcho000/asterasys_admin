'use client';

import React, { useState } from 'react';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

/**
 * Product Ranking Table - Professional ranking display
 * Using Duralux template table design with clean aesthetics
 */

const ProductRankingTable = ({ data }) => {
  const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
  const [filterBrand, setFilterBrand] = useState('all'); // all, asterasys, competitors

  if (isRemoved || !data) return null;

  const { topProducts } = data;
  let products = topProducts.byPosts || [];

  // Apply brand filter
  if (filterBrand === 'asterasys') {
    products = products.filter(p => p.brand === 'asterasys');
  } else if (filterBrand === 'competitors') {
    products = products.filter(p => p.brand === 'competitor');
  }

  // Take top 10 for clean display
  products = products.slice(0, 10);

  const getBrandBadge = (brand) => {
    if (brand === 'asterasys') {
      return <span className="badge bg-success-subtle text-success">Asterasys</span>;
    }
    return null;
  };

  const getCategoryBadge = (category) => {
    const badgeClass = category === 'RF' ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info';
    return <span className={`badge ${badgeClass}`}>{category}</span>;
  };

  const getRankBadge = (index) => {
    if (index < 3) {
      const colors = ['bg-warning text-dark', 'bg-secondary text-white', 'bg-dark text-white'];
      return <span className={`badge ${colors[index]} fw-bold`}>#{index + 1}</span>;
    }
    return <span className="badge bg-light text-dark">#{index + 1}</span>;
  };

  return (
    <div className="col-xxl-8">
      <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
        <CardHeader title="제품 성과 순위">
          <div className="d-flex gap-2 align-items-center">
            <select 
              className="form-select form-select-sm"
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              style={{ width: '120px' }}
            >
              <option value="all">전체</option>
              <option value="asterasys">Asterasys</option>
              <option value="competitors">경쟁사</option>
            </select>
            <button className="btn btn-sm btn-light" onClick={handleRefresh}>
              새로고침
            </button>
          </div>
        </CardHeader>
        
        <div className="card-body custom-card-action">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="fw-semibold">순위</th>
                  <th className="fw-semibold">제품명</th>
                  <th className="fw-semibold">카테고리</th>
                  <th className="fw-semibold text-end">발행량</th>
                  <th className="fw-semibold text-end">점유율</th>
                  <th className="fw-semibold text-end">판매량</th>
                  <th className="fw-semibold text-end">검색량</th>
                  <th className="fw-semibold text-center">추세</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.keyword} className={product.brand === 'asterasys' ? 'table-success' : ''}>
                    <td>{getRankBadge(index)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle me-2" 
                          style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: product.color || '#6c757d'
                          }}
                        ></div>
                        <div>
                          <div className="fw-semibold text-dark">{product.name}</div>
                          {getBrandBadge(product.brand)}
                        </div>
                      </div>
                    </td>
                    <td>{getCategoryBadge(product.category)}</td>
                    <td className="text-end">
                      <span className="fw-semibold text-dark">{(product.posts || 0).toLocaleString()}</span>
                      <div className="fs-11 text-muted">건</div>
                    </td>
                    <td className="text-end">
                      <span className={`fw-semibold ${product.brand === 'asterasys' ? 'text-success' : 'text-dark'}`}>
                        {(product.sov || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-end">
                      <span className="fw-semibold text-dark">{(product.sales || 0).toLocaleString()}</span>
                      <div className="fs-11 text-muted">대</div>
                    </td>
                    <td className="text-end">
                      <span className="fw-semibold text-dark">{(product.searchVolume || 0).toLocaleString()}</span>
                      <div className="fs-11 text-muted">건</div>
                    </td>
                    <td className="text-center">
                      <FiTrendingUp className="text-success" size={16} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card-footer">
          <div className="row g-4">
            <StatCard 
              bg_color="bg-primary" 
              price={products.length.toString()} 
              progress="100%"
              title="표시된 제품 수" 
            />
            <StatCard 
              bg_color="bg-success" 
              price={products.filter(p => p.brand === 'asterasys').length.toString()} 
              progress={`${(products.filter(p => p.brand === 'asterasys').length / products.length * 100).toFixed(0)}%`}
              title="Asterasys 제품" 
            />
            <StatCard 
              bg_color="bg-info" 
              price={products.reduce((sum, p) => sum + (p.posts || 0), 0).toLocaleString()} 
              progress={`${(products.reduce((sum, p) => sum + (p.posts || 0), 0) / data.overview?.totalMarketPosts * 100 || 0).toFixed(0)}%`}
              title="총 발행량" 
            />
            <StatCard 
              bg_color="bg-warning" 
              price={products.reduce((sum, p) => sum + (p.sales || 0), 0).toLocaleString()} 
              progress={`${(products.reduce((sum, p) => sum + (p.sales || 0), 0) / data.overview?.totalMarketSales * 100 || 0).toFixed(0)}%`}
              title="총 판매량" 
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

export default ProductRankingTable;