'use client';

import React from 'react';
import { getIcon } from '@/utils/getIcon';

/**
 * KPI Card Component for displaying key metrics
 * Supports trends, colors, icons, and highlighting
 */

export default function KPICard({
  title,
  value,
  unit = '',
  trend = null,
  trendType = 'neutral', // 'positive', 'negative', 'neutral'
  icon = 'bar-chart',
  color = 'primary', // 'primary', 'success', 'info', 'warning', 'danger', 'purple'
  highlight = false,
  precision = 0,
  className = ''
}) {
  // Format the value based on type and precision
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (precision > 0) {
        return val.toFixed(precision);
      }
      return val.toLocaleString();
    }
    return val;
  };

  // Get trend color and icon
  const getTrendClass = (type) => {
    switch (type) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  };

  const getTrendIcon = (type) => {
    switch (type) {
      case 'positive':
        return 'trending-up';
      case 'negative':
        return 'trending-down';
      default:
        return 'minus';
    }
  };

  // Get card border class for highlight
  const cardClass = highlight 
    ? `card h-100 border-${color} shadow-sm ${className}`
    : `card h-100 ${className}`;

  return (
    <div className={cardClass}>
      <div className="card-body p-3">
        {/* Header with icon */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className={`rounded-circle p-2 bg-${color} bg-opacity-10`}>
            {getIcon(icon, { className: `text-${color}`, size: 20 })}
          </div>
          {trend && (
            <div className={`d-flex align-items-center ${getTrendClass(trendType)}`}>
              {getIcon(getTrendIcon(trendType), { size: 14 })}
              <small className="ms-1 fw-semibold">{trend}</small>
            </div>
          )}
        </div>

        {/* Title */}
        <h6 className="card-title text-muted mb-2 small">{title}</h6>

        {/* Value */}
        <div className="d-flex align-items-baseline">
          <h3 className={`mb-0 fw-bold ${highlight ? `text-${color}` : ''}`}>
            {formatValue(value)}
          </h3>
          {unit && (
            <span className={`ms-1 text-muted small ${highlight ? `text-${color} opacity-75` : ''}`}>
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Optional highlight bar at bottom */}
      {highlight && (
        <div className={`bg-${color} opacity-75`} style={{ height: '3px' }}></div>
      )}
    </div>
  );
}