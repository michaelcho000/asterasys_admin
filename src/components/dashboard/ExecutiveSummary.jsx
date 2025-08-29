'use client';

import React from 'react';
import { getIcon } from '@/utils/getIcon';

/**
 * Executive Summary - Critical metrics at a glance
 * High-level overview for C-level executives and stakeholders
 */

export default function ExecutiveSummary({ data, channels, filters }) {
  if (!data) return null;

  const { overview, brand } = data;

  // Calculate key insights
  const marketPosition = {
    rank: brand.asterasys.marketShare > 15 ? '상위' : brand.asterasys.marketShare > 10 ? '중위' : '하위',
    growth: '+2.3%', // Mock data - would be calculated from historical data
    threat: '써마지, 울쎄라', // Top competitors
    opportunity: 'HIFU 시장 확대'
  };

  const getStatusColor = (value, threshold) => {
    if (value >= threshold.good) return 'success';
    if (value >= threshold.warning) return 'warning'; 
    return 'danger';
  };

  const marketShareStatus = getStatusColor(overview.asterasysMarketShare, { good: 15, warning: 10 });
  const salesShareStatus = getStatusColor(overview.asterasysSalesShare, { good: 12, warning: 8 });
  const engagementStatus = getStatusColor(overview.avgEngagement, { good: 3.5, warning: 2.5 });

  return (
    <div className="card border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
      <div className="card-header bg-transparent border-bottom-0 pb-2">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="card-title mb-1 fw-bold text-primary">
              {getIcon('target', { className: 'me-2' })}
              Executive Summary
            </h4>
            <p className="text-muted small mb-0">2025년 8월 마케팅 성과 종합 분석</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className={`badge bg-${marketShareStatus} px-3 py-2`}>
              시장점유율 {overview.asterasysMarketShare.toFixed(1)}%
            </span>
            <div className="dropdown">
              <button className="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                {getIcon('more-horizontal', { size: 16 })}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><a className="dropdown-item" href="#" onclick="window.print()">리포트 인쇄</a></li>
                <li><a className="dropdown-item" href="#">PDF 다운로드</a></li>
                <li><a className="dropdown-item" href="#">Excel 내보내기</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-body pt-2">
        <div className="row g-3">
          {/* Critical KPIs Row */}
          <div className="col-lg-3 col-md-6">
            <div className="p-3 rounded-3 h-100" style={{ background: 'rgba(102, 126, 234, 0.08)' }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="p-2 rounded-circle bg-primary bg-opacity-10">
                  {getIcon('trending-up', { className: 'text-primary', size: 20 })}
                </div>
                <span className="badge bg-success">+2.3%</span>
              </div>
              <h3 className="fw-bold text-primary mb-1">#{marketPosition.rank}</h3>
              <p className="text-muted small mb-0">시장 포지션</p>
              <div className="mt-2">
                <div className="progress" style={{ height: '4px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${overview.asterasysMarketShare}%` }}
                  ></div>
                </div>
                <small className="text-muted">전체 18개 브랜드 중</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="p-3 rounded-3 h-100" style={{ background: 'rgba(40, 167, 69, 0.08)' }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="p-2 rounded-circle bg-success bg-opacity-10">
                  {getIcon('activity', { className: 'text-success', size: 20 })}
                </div>
                <span className="badge bg-info">실시간</span>
              </div>
              <h3 className="fw-bold text-success mb-1">{overview.totalMarketPosts.toLocaleString()}</h3>
              <p className="text-muted small mb-0">총 시장 발행량</p>
              <div className="mt-2">
                <small className="text-success">
                  {getIcon('arrow-up', { size: 12 })} 
                  Asterasys {brand.asterasys.totalPosts.toLocaleString()}건 ({overview.asterasysMarketShare.toFixed(1)}%)
                </small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="p-3 rounded-3 h-100" style={{ background: 'rgba(255, 193, 7, 0.08)' }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="p-2 rounded-circle bg-warning bg-opacity-10">
                  {getIcon('message-circle', { className: 'text-warning', size: 20 })}
                </div>
                <span className={`badge bg-${engagementStatus}`}>
                  {overview.avgEngagement.toFixed(1)}
                </span>
              </div>
              <h3 className="fw-bold text-warning mb-1">{brand.asterasys.engagement.toFixed(1)}</h3>
              <p className="text-muted small mb-0">Asterasys 참여도</p>
              <div className="mt-2">
                <small className="text-warning">
                  업계 평균 {overview.avgEngagement.toFixed(1)} 대비 
                  <strong className="ms-1">
                    {brand.asterasys.engagement > overview.avgEngagement ? '우수' : '개선필요'}
                  </strong>
                </small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="p-3 rounded-3 h-100" style={{ background: 'rgba(220, 53, 69, 0.08)' }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="p-2 rounded-circle bg-danger bg-opacity-10">
                  {getIcon('shopping-cart', { className: 'text-danger', size: 20 })}
                </div>
                <span className={`badge bg-${salesShareStatus}`}>
                  {overview.asterasysSalesShare.toFixed(1)}%
                </span>
              </div>
              <h3 className="fw-bold text-danger mb-1">{brand.asterasys.totalSales.toLocaleString()}</h3>
              <p className="text-muted small mb-0">Asterasys 판매량</p>
              <div className="mt-2">
                <small className="text-danger">
                  전체 {overview.totalMarketSales.toLocaleString()}대 중 
                  <strong className="ms-1">{overview.asterasysSalesShare.toFixed(1)}% 점유</strong>
                </small>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-4" />

        {/* Strategic Insights Row */}
        <div className="row g-3">
          <div className="col-lg-3 col-md-6">
            <div className="text-center">
              <div className="mb-2">
                <span className="badge bg-primary fs-6 px-3 py-2">주요 위협</span>
              </div>
              <h6 className="fw-semibold mb-1">{marketPosition.threat}</h6>
              <small className="text-muted">1-2위 경쟁 브랜드</small>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="text-center">
              <div className="mb-2">
                <span className="badge bg-success fs-6 px-3 py-2">기회 영역</span>
              </div>
              <h6 className="fw-semibold mb-1">{marketPosition.opportunity}</h6>
              <small className="text-muted">성장 잠재력 분야</small>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="text-center">
              <div className="mb-2">
                <span className="badge bg-info fs-6 px-3 py-2">강점 채널</span>
              </div>
              <h6 className="fw-semibold mb-1">병원 블로그</h6>
              <small className="text-muted">높은 참여도</small>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="text-center">
              <div className="mb-2">
                <span className="badge bg-warning fs-6 px-3 py-2">개선 필요</span>
              </div>
              <h6 className="fw-semibold mb-1">판매 전환율</h6>
              <small className="text-muted">마케팅 → 매출</small>
            </div>
          </div>
        </div>

        {/* Key Recommendations */}
        <div className="mt-4 p-3 bg-light rounded-3">
          <div className="row align-items-center">
            <div className="col-md-1 text-center">
              <div className="p-2 rounded-circle bg-primary bg-opacity-10">
                {getIcon('lightbulb', { className: 'text-primary', size: 24 })}
              </div>
            </div>
            <div className="col-md-11">
              <h6 className="fw-semibold mb-1">핵심 권장사항</h6>
              <div className="row">
                <div className="col-md-4">
                  <small className="text-primary fw-semibold">• HIFU 시장 집중</small><br />
                  <small className="text-muted">리프테라, 쿨소닉 마케팅 강화</small>
                </div>
                <div className="col-md-4">
                  <small className="text-success fw-semibold">• 병원 채널 확대</small><br />
                  <small className="text-muted">의료진 대상 콘텐츠 증가</small>
                </div>
                <div className="col-md-4">
                  <small className="text-warning fw-semibold">• 판매 연계 강화</small><br />
                  <small className="text-muted">마케팅-영업 시너지 창출</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}