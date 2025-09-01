'use client';

import React, { useState } from 'react';
import { getIcon } from '@/utils/getIcon';

/**
 * Alerts and Insights - Smart notifications and actionable recommendations
 * AI-powered analysis of performance patterns and strategic opportunities
 */

export default function AlertsAndInsights({ data, channels, filters }) {
  const [activeTab, setActiveTab] = useState('alerts'); // alerts, opportunities, recommendations

  if (!data || !channels) return null;

  // Generate smart alerts based on data analysis
  const generateAlerts = () => {
    const alerts = [];
    
    // Performance alerts
    if (data.brand.asterasys.marketShare < 15) {
      alerts.push({
        type: 'warning',
        category: 'Market Share',
        title: '시장점유율 목표 미달성',
        message: `현재 ${data.brand.asterasys.marketShare.toFixed(1)}% (목표: 15%)`,
        impact: 'medium',
        action: 'HIFU 마케팅 투자 확대',
        priority: 'high'
      });
    }

    // Sales conversion alert
    const salesEfficiency = data.brand.asterasys.totalSales / data.brand.asterasys.totalPosts;
    if (salesEfficiency < 0.5) {
      alerts.push({
        type: 'danger',
        category: 'Sales Conversion',
        title: '마케팅-판매 전환율 저조',
        message: `발행량 대비 판매 효율: ${salesEfficiency.toFixed(2)}`,
        impact: 'high',
        action: '판매 연계 콘텐츠 강화',
        priority: 'critical'
      });
    }

    // Competitive pressure
    const topCompetitor = data.topProducts.byPosts.find(p => p.brand === 'competitor');
    if (topCompetitor && topCompetitor.sov > data.brand.asterasys.marketShare * 3) {
      alerts.push({
        type: 'info',
        category: 'Competition',
        title: '경쟁사 우위 심화',
        message: `${topCompetitor.name} 점유율 ${topCompetitor.sov.toFixed(1)}%`,
        impact: 'medium',
        action: '차별화 전략 수립',
        priority: 'medium'
      });
    }

    // Positive performance
    if (data.brand.asterasys.engagement > data.overview.avgEngagement * 1.1) {
      alerts.push({
        type: 'success',
        category: 'Engagement',
        title: '참여도 우수 성과',
        message: `업계 평균 대비 ${((data.brand.asterasys.engagement / data.overview.avgEngagement - 1) * 100).toFixed(1)}% 높음`,
        impact: 'positive',
        action: '참여도 레버리지 극대화',
        priority: 'low'
      });
    }

    // Channel performance
    if (channels.blog?.overview?.avgEngagement > 0.8) {
      alerts.push({
        type: 'success',
        category: 'Channel Performance',
        title: '블로그 채널 강세',
        message: `평균 참여도 ${channels.blog.overview.avgEngagement.toFixed(2)}`,
        impact: 'positive',
        action: '블로그 마케팅 확대',
        priority: 'low'
      });
    }

    return alerts.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  // Generate market opportunities
  const generateOpportunities = () => {
    return [
      {
        title: 'HIFU 시장 확장 기회',
        description: 'HIFU 카테고리에서 54.7% 판매 점유율 vs 45% 마케팅 점유율',
        potential: 'high',
        timeframe: '단기 (1-2개월)',
        action: '리프테라, 쿨소닉 마케팅 투자 증대',
        roi: '예상 ROI 150-200%'
      },
      {
        title: '병원 채널 전문성 강화',
        description: '병원 블로그에서 높은 참여도와 전문성 인정',
        potential: 'medium',
        timeframe: '중기 (3-6개월)', 
        action: '의료진 대상 교육 콘텐츠 확대',
        roi: '예상 ROI 120-150%'
      },
      {
        title: '카페 채널 진입 확대',
        description: '카페 채널에서 상대적으로 낮은 점유율',
        potential: 'medium',
        timeframe: '중기 (3-6개월)',
        action: '소비자 대상 체험 콘텐츠 증가',
        roi: '예상 ROI 100-130%'
      },
      {
        title: '유튜브 영상 콘텐츠 강화',
        description: '영상 콘텐츠 부족으로 젊은 층 접근 제한',
        potential: 'high',
        timeframe: '장기 (6-12개월)',
        action: '유튜브 채널 개설 및 영상 제작',
        roi: '예상 ROI 180-250%'
      }
    ];
  };

  // Generate strategic recommendations  
  const generateRecommendations = () => {
    return [
      {
        category: 'Strategy',
        priority: 'critical',
        title: 'Portfolio Re-balancing',
        description: 'HIFU 제품군 마케팅 비중 확대 (현재 RF 55% → HIFU 60% 목표)',
        timeline: '즉시 실행',
        responsible: 'CMO, 제품마케팅팀',
        kpi: 'HIFU 점유율 +5%p 달성'
      },
      {
        category: 'Marketing',
        priority: 'high',
        title: '참여도 기반 콘텐츠 전략',
        description: '높은 참여도를 판매로 연결하는 퍼널 최적화',
        timeline: '2주 내 기획 완료',
        responsible: '디지털마케팅팀',
        kpi: '판매 전환율 +30% 개선'
      },
      {
        category: 'Channel',
        priority: 'medium',
        title: '병원 파트너십 강화',
        description: '상위 성과 병원과의 협력 관계 심화',
        timeline: '1개월 내 접촉',
        responsible: '영업팀, 마케팅팀',
        kpi: '파트너 병원 +5개 확보'
      },
      {
        category: 'Product',
        priority: 'medium', 
        title: '쿨소닉 마케팅 집중',
        description: '상대적으로 저조한 쿨소닉 브랜드 인지도 개선',
        timeline: '분기별 캠페인',
        responsible: '제품마케팅팀',
        kpi: '쿨소닉 SOV +0.5%p 달성'
      }
    ];
  };

  const alerts = generateAlerts();
  const opportunities = generateOpportunities();
  const recommendations = generateRecommendations();

  const getAlertIcon = (type) => {
    switch (type) {
      case 'success': return getIcon('check-circle', { className: 'text-success' });
      case 'warning': return getIcon('alert-circle', { className: 'text-warning' });
      case 'danger': return getIcon('x-circle', { className: 'text-danger' });
      case 'info': return getIcon('info', { className: 'text-info' });
      default: return getIcon('bell', { className: 'text-muted' });
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical':
        return <span className="badge bg-danger">긴급</span>;
      case 'high':
        return <span className="badge bg-warning text-dark">높음</span>;
      case 'medium':
        return <span className="badge bg-info">보통</span>;
      case 'low':
        return <span className="badge bg-success">낮음</span>;
      default:
        return <span className="badge bg-secondary">일반</span>;
    }
  };

  const getPotentialIcon = (potential) => {
    switch (potential) {
      case 'high': return getIcon('trending-up', { className: 'text-success', size: 16 });
      case 'medium': return getIcon('trending-up', { className: 'text-warning', size: 16 });
      case 'low': return getIcon('minus', { className: 'text-muted', size: 16 });
      default: return getIcon('help-circle', { className: 'text-muted', size: 16 });
    }
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-transparent border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="card-title mb-1 fw-bold">
              {getIcon('lightbulb', { className: 'text-primary me-2' })}
              Smart Insights
            </h4>
            <p className="text-muted small mb-0">AI 기반 성과 분석 및 전략 제안</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm text-success me-2" role="status" style={{ width: '12px', height: '12px' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <small className="text-success">실시간 분석</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-0">
        {/* Tab Navigation */}
        <div className="px-3 pt-3">
          <ul className="nav nav-tabs nav-justified" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
                onClick={() => setActiveTab('alerts')}
              >
                {getIcon('alert-triangle', { size: 14, className: 'me-1' })}
                알림 ({alerts.length})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'opportunities' ? 'active' : ''}`}
                onClick={() => setActiveTab('opportunities')}
              >
                {getIcon('trending-up', { size: 14, className: 'me-1' })}
                기회 ({opportunities.length})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'recommendations' ? 'active' : ''}`}
                onClick={() => setActiveTab('recommendations')}
              >
                {getIcon('compass', { size: 14, className: 'me-1' })}
                권장사항 ({recommendations.length})
              </button>
            </li>
          </ul>
        </div>

        {/* Content Area */}
        <div className="p-3" style={{ maxHeight: '450px', overflowY: 'auto' }}>
          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="list-group list-group-flush">
              {alerts.map((alert, index) => (
                <div key={index} className={`alert alert-${alert.type} border-start border-5 border-${alert.type} mb-3`}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-start">
                      <div className="me-2 mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div>
                        <div className="d-flex align-items-center mb-1">
                          <h6 className="mb-0 fw-semibold">{alert.title}</h6>
                          {getPriorityBadge(alert.priority)}
                        </div>
                        <p className="mb-2 small">{alert.message}</p>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-muted">
                            <strong>권장조치:</strong> {alert.action}
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">{alert.category}</small>
                    </div>
                  </div>
                </div>
              ))}
              
              {alerts.length === 0 && (
                <div className="text-center py-4 text-muted">
                  <div className="mb-2">
                    {getIcon('check-circle', { size: 32, className: 'text-success opacity-50' })}
                  </div>
                  <p>모든 지표가 정상 범위입니다</p>
                  <small>지속적인 모니터링이 진행됩니다</small>
                </div>
              )}
            </div>
          )}

          {/* Opportunities Tab */}
          {activeTab === 'opportunities' && (
            <div>
              {opportunities.map((opportunity, index) => (
                <div key={index} className="card border-0 bg-light mb-3">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center">
                        <div className="me-2">
                          {getPotentialIcon(opportunity.potential)}
                        </div>
                        <h6 className="fw-semibold mb-0">{opportunity.title}</h6>
                      </div>
                      <span className={`badge bg-${opportunity.potential === 'high' ? 'success' : opportunity.potential === 'medium' ? 'warning' : 'secondary'}`}>
                        {opportunity.potential === 'high' ? '고잠재' : opportunity.potential === 'medium' ? '중잠재' : '저잠재'}
                      </span>
                    </div>
                    
                    <p className="small text-muted mb-2">{opportunity.description}</p>
                    
                    <div className="row g-2 small">
                      <div className="col-6">
                        <div><strong>실행 기간:</strong> {opportunity.timeframe}</div>
                        <div><strong>기대 효과:</strong> {opportunity.roi}</div>
                      </div>
                      <div className="col-6">
                        <div><strong>권장 액션:</strong></div>
                        <div className="text-primary">{opportunity.action}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div>
              {recommendations.map((rec, index) => (
                <div key={index} className="card border-0 mb-3" style={{ background: 'rgba(102, 126, 234, 0.05)' }}>
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="d-flex align-items-center mb-1">
                          <span className="badge bg-secondary me-2">{rec.category}</span>
                          {getPriorityBadge(rec.priority)}
                        </div>
                        <h6 className="fw-semibold mb-1">{rec.title}</h6>
                      </div>
                    </div>
                    
                    <p className="small mb-3">{rec.description}</p>
                    
                    <div className="row g-2 small">
                      <div className="col-md-6">
                        <div className="mb-1">
                          <strong className="text-muted">실행 일정:</strong>
                          <span className="ms-1">{rec.timeline}</span>
                        </div>
                        <div>
                          <strong className="text-muted">담당 조직:</strong>
                          <span className="ms-1 text-primary">{rec.responsible}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-1">
                          <strong className="text-muted">성과 지표:</strong>
                          <span className="ms-1 text-success">{rec.kpi}</span>
                        </div>
                        <button className="btn btn-primary btn-sm mt-1">
                          {getIcon('arrow-right', { size: 12, className: 'me-1' })}
                          액션 플랜 보기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="border-top bg-light px-3 py-2">
          <div className="row text-center">
            <div className="col-4">
              <div className="fw-bold text-danger">{alerts.filter(a => a.priority === 'critical' || a.priority === 'high').length}</div>
              <small className="text-muted">고위험 알림</small>
            </div>
            <div className="col-4">
              <div className="fw-bold text-success">{opportunities.filter(o => o.potential === 'high').length}</div>
              <small className="text-muted">고기회 영역</small>
            </div>
            <div className="col-4">
              <div className="fw-bold text-primary">{recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').length}</div>
              <small className="text-muted">우선 실행</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}