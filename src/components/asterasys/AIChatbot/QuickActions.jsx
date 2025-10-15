'use client'

import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Target, Lightbulb, Search, Globe } from 'lucide-react'

const allQuickActions = [
  {
    category: '성과 조회',
    icon: BarChart3,
    color: '#3b82f6',
    questions: [
      '이번 달 전체 성과는?',
      '제품별 판매 순위는?',
      '블로그 순위 현황은?',
      '카페 발행량은?',
      'YouTube 조회수는?',
      '뉴스 보도량은?',
      '전체 시장점유율은?',
      '채널별 발행량은?',
      '월간 판매량 요약해줘',
      '참여도 지표는?'
    ]
  },
  {
    category: '트렌드 분석',
    icon: TrendingUp,
    color: '#10b981',
    questions: [
      '최근 3개월 판매 트렌드는?',
      'YouTube 성장률은?',
      '블로그 참여도 변화는?',
      '경쟁사 대비 성장률은?',
      '채널별 효율성은?',
      '광고 효과는 어때?',
      '카페 트렌드 분석해줘',
      '발행량 증감률은?',
      '뉴스 보도 추세는?',
      '월별 성장 패턴은?'
    ]
  },
  {
    category: '제품 분석',
    icon: Target,
    color: '#f59e0b',
    questions: [
      '쿨페이즈 성과 요약',
      '리프테라 vs 경쟁사 비교',
      '쿨소닉 론칭 성과는?',
      '제품별 채널 성과는?',
      '리프테라 판매량은?',
      '쿨페이즈 마케팅 효율은?',
      '쿨소닉 시장 반응은?',
      '리프테라 블로그 순위는?',
      '제품별 광고 효과는?',
      '쿨페이즈 경쟁력은?'
    ]
  },
  {
    category: '인사이트',
    icon: Lightbulb,
    color: '#8b5cf6',
    questions: [
      '가장 효과적인 채널은?',
      '다음 달 전략 추천해줘',
      '개선이 필요한 부분은?',
      'YouTube 효율 개선 방안은?',
      '블로그 활성화 전략은?',
      '경쟁 우위 포인트는?',
      'Organic vs Managed 비율은?',
      '바이럴 마케팅 전략은?',
      '채널별 투자 우선순위는?',
      '마케팅 예산 배분은?'
    ]
  },
  {
    category: '웹 검색',
    icon: Globe,
    color: '#ec4899',
    questions: [
      '울쎄라 최신 가격은?',
      '써마지 신제품 출시 소식',
      'HIFU 시장 최신 트렌드는?',
      '경쟁사 마케팅 이벤트는?',
      'RF 장비 규제 변화는?',
      '의료기기 전시회 일정은?',
      '인모드 최신 프로모션은?',
      'HIFU 기술 발전 동향은?',
      '미용 의료기기 시장 규모는?',
      '슈링크 가격 변동은?'
    ]
  },
  {
    category: '경쟁 분석',
    icon: Search,
    color: '#06b6d4',
    questions: [
      '인모드 최근 마케팅 전략은?',
      '슈링크 가격 정책은?',
      '울쎄라 vs 리프테라 비교',
      '경쟁사 신제품 정보는?',
      '시장 점유율 순위는?',
      '경쟁사 광고 전략은?',
      '써마지 채널 전략은?',
      '경쟁 제품 가격 비교는?',
      'RF vs HIFU 시장 비교는?',
      '경쟁사 YouTube 전략은?'
    ]
  }
]

const QuickActions = ({ onSelectAction }) => {
  const [displayedActions, setDisplayedActions] = useState([])

  useEffect(() => {
    // 6개 카테고리 모두 랜덤 순서로 표시하고, 각 카테고리에서 3개씩 질문 랜덤 선택
    const shuffled = [...allQuickActions].sort(() => 0.5 - Math.random())
    const selected = shuffled.map(category => ({
      ...category,
      questions: [...category.questions]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
    }))
    setDisplayedActions(selected)
  }, [])

  return (
    <div
      className="px-3 py-2 overflow-auto"
      style={{
        maxHeight: '240px',
        background: 'linear-gradient(to bottom, transparent, #f9fafb)'
      }}
    >
      <div className="mb-2">
        <small className="text-muted fw-semibold" style={{ fontSize: '12px' }}>
          💡 빠른 질문
        </small>
      </div>

      <div className="d-flex flex-column gap-2">
        {displayedActions.map((action, index) => (
          <div key={index}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <action.icon size={14} style={{ color: action.color }} />
              <small
                className="fw-semibold"
                style={{ fontSize: '11px', color: '#6b7280' }}
              >
                {action.category}
              </small>
            </div>

            <div className="d-flex flex-wrap gap-1">
              {action.questions.map((question, qIndex) => (
                <button
                  key={qIndex}
                  onClick={() => onSelectAction(question)}
                  className="btn btn-sm btn-light rounded-pill"
                  style={{
                    fontSize: '12px',
                    padding: '4px 12px',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = action.color
                    e.currentTarget.style.color = action.color
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.color = 'inherit'
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuickActions
