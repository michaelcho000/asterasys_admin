'use client';

import React from 'react';

/**
 * Trend Chart Component - Placeholder
 * Will be enhanced with time-series data when weekly data is available
 */

export default function TrendChart({ title = '추세 분석', data = [] }) {
  return (
    <div className="card h-100">
      <div className="card-header">
        <h5 className="card-title mb-0">{title}</h5>
        <small className="text-muted">주간 데이터 제공 시 활성화됩니다</small>
      </div>
      <div className="card-body d-flex align-items-center justify-content-center">
        <div className="text-center text-muted">
          <i className="feather-icon icon-trending-up" style={{ fontSize: '48px', opacity: 0.3 }}></i>
          <p className="mt-2">주간 데이터 수집 후<br/>추세 분석이 제공됩니다</p>
          <small>(2025년 9월부터 제공 예정)</small>
        </div>
      </div>
    </div>
  );
}