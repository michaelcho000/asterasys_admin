'use client';

import React from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import getIcon from '@/utils/getIcon';
import Link from 'next/link';

/**
 * Asterasys KPI Statistics - Using Duralux template design pattern
 * Clean, professional statistics cards with consistent styling
 */

const AsteraysKPIStatistics = ({ data }) => {
  if (!data) return null;

  const { overview, brand, categories } = data;

  // KPI data following template pattern
  const kpiData = [
    {
      id: 'market-share',
      completed_number: Math.round(overview.asterasysMarketShare * 10),
      total_number: '1000',
      progress: `${overview.asterasysMarketShare.toFixed(1)}%`,
      progress_info: `목표 15% 대비`,
      title: 'Asterasys 시장점유율',
      icon: 'feather-target',
      trend: '+2.1%',
      status: overview.asterasysMarketShare >= 15 ? 'success' : overview.asterasysMarketShare >= 10 ? 'warning' : 'danger'
    },
    {
      id: 'total-posts',
      completed_number: null,
      total_number: overview.totalMarketPosts.toLocaleString(),
      progress: `${(overview.asterasysMarketShare / 20 * 100).toFixed(0)}%`,
      progress_info: `Asterasys ${brand.asterasys.totalPosts.toLocaleString()}건`,
      title: '전체 시장 발행량',
      icon: 'feather-activity',
      trend: '+12.3%',
      status: 'primary'
    },
    {
      id: 'engagement',
      completed_number: Math.round(brand.asterasys.engagement * 10),
      total_number: '50',
      progress: `${(brand.asterasys.engagement / 5 * 100).toFixed(0)}%`,
      progress_info: `업계평균 ${overview.avgEngagement.toFixed(1)}`,
      title: 'Asterasys 참여도',
      icon: 'feather-message-square',
      trend: '+0.8',
      status: brand.asterasys.engagement > overview.avgEngagement ? 'success' : 'warning'
    },
    {
      id: 'sales-share',
      completed_number: Math.round(overview.asterasysSalesShare),
      total_number: '100',
      progress: `${overview.asterasysSalesShare.toFixed(1)}%`,
      progress_info: `총 ${overview.totalMarketSales.toLocaleString()}대`,
      title: 'Asterasys 판매점유율',
      icon: 'feather-shopping-cart',
      trend: '-1.2%',
      status: overview.asterasysSalesShare >= 12 ? 'success' : overview.asterasysSalesShare >= 8 ? 'warning' : 'danger'
    },
    {
      id: 'rf-performance',
      completed_number: Math.round(categories.rf.marketShare),
      total_number: '100',
      progress: `${categories.rf.marketShare.toFixed(1)}%`,
      progress_info: `${categories.rf.totalPosts.toLocaleString()}건 발행`,
      title: 'RF 시장 점유율',
      icon: 'feather-zap',
      trend: '+8.7%',
      status: 'warning'
    },
    {
      id: 'hifu-performance',
      completed_number: Math.round(categories.hifu.marketShare),
      total_number: '100',
      progress: `${categories.hifu.marketShare.toFixed(1)}%`,
      progress_info: `${categories.hifu.totalPosts.toLocaleString()}건 발행`,
      title: 'HIFU 시장 점유율',
      icon: 'feather-radio',
      trend: '+15.2%',
      status: 'success'
    }
  ];

  return (
    <>
      {kpiData.map(({ id, completed_number, progress, progress_info, title, total_number, icon, trend, status }) => (
        <div key={id} className="col-xxl-4 col-md-6">
          <div className="card stretch stretch-full short-info-card">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between mb-4">
                <div className="d-flex gap-4 align-items-center">
                  <div className={`avatar-text avatar-lg ${
                    status === 'success' ? 'bg-success-subtle text-success' :
                    status === 'warning' ? 'bg-warning-subtle text-warning' :
                    status === 'danger' ? 'bg-danger-subtle text-danger' :
                    'bg-primary-subtle text-primary'
                  } icon`}>
                    {React.cloneElement(getIcon(icon), { size: "16" })}
                  </div>
                  <div>
                    <div className="fs-4 fw-bold text-dark">
                      {completed_number && <span className="counter">{completed_number}/</span>}
                      <span className="counter">{total_number}</span>
                    </div>
                    <h3 className="fs-13 fw-semibold text-truncate-1-line">{title}</h3>
                  </div>
                </div>
                <div className="text-end">
                  <div className={`fs-11 fw-medium mb-1 ${
                    trend.startsWith('+') ? 'text-success' : trend.startsWith('-') ? 'text-danger' : 'text-muted'
                  }`}>
                    {trend}
                  </div>
                  <Link href="#" className="lh-1">
                    <FiMoreVertical className='fs-16 text-muted' />
                  </Link>
                </div>
              </div>
              <div className="pt-4">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fs-12 fw-medium text-muted text-truncate-1-line">{progress_info}</span>
                  <div className="w-100 text-end">
                    <span className="fs-12 text-dark fw-semibold">{progress}</span>
                  </div>
                </div>
                <div className="progress mt-2 ht-3">
                  <div 
                    className={`progress-bar ${
                      status === 'success' ? 'bg-success' :
                      status === 'warning' ? 'bg-warning' :
                      status === 'danger' ? 'bg-danger' :
                      'bg-primary'
                    }`} 
                    role="progressbar" 
                    style={{ width: progress.includes('%') ? progress : `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default AsteraysKPIStatistics;