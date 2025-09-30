'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const ViralTypeAnalysis = () => {
  // Data based on MARKETING_INSIGHTS_ADVANCED.md analysis
  const currentData = {
    organic: 15,
    managed: 85
  }

  const competitorAvg = {
    organic: 60,
    managed: 40
  }

  const targetData = {
    organic: 50,
    managed: 50
  }

  const roadmapData = [
    {
      quarter: 'Q4 2025',
      target: { organic: 25, managed: 75 },
      actions: [
        '실제 고객 후기 수집 캠페인',
        '병원 협업 후기 이벤트'
      ]
    },
    {
      quarter: 'Q1 2026',
      target: { organic: 35, managed: 65 },
      actions: [
        '의사 네트워크 구축',
        'KOL 프로그램 시작'
      ]
    },
    {
      quarter: 'Q2 2026',
      target: { organic: 50, managed: 50 },
      actions: [
        '브랜드 커뮤니티 활성화',
        '자연 바이럴 정착'
      ]
    }
  ]

  const createDonutOptions = (title, color) => ({
    chart: {
      type: 'donut',
      toolbar: {
        show: false
      }
    },
    labels: ['자연 바이럴', '인위 바이럴'],
    colors: [color === 'danger' ? '#dc3545' : color === 'warning' ? '#ffc107' : '#10b981', '#94a3b8'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              formatter: (val) => val + '%'
            },
            total: {
              show: true,
              label: title,
              fontSize: '12px',
              fontWeight: 600,
              formatter: () => ''
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toFixed(0) + '%',
      style: {
        fontSize: '13px',
        fontWeight: 600
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '12px'
    }
  })

  return (
    <div className="card stretch stretch-full">
      <div className="card-header">
        <h5 className="card-title mb-1">바이럴 전략 개선 로드맵</h5>
        <p className="text-muted fs-12 mb-0">자연 vs 인위 바이럴 비중 분석 및 개선 계획</p>
      </div>
      <div className="card-body">
        {/* Donut Charts Row */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="text-center mb-3">
              <h6 className="fs-13 fw-bold text-dark mb-3">현재 (아스테라시스)</h6>
              <Chart
                options={createDonutOptions('현재', 'danger')}
                series={[currentData.organic, currentData.managed]}
                type="donut"
                height={280}
              />
              <div className="mt-3">
                <span className="badge bg-soft-danger text-danger">개선 필요</span>
                <p className="fs-11 text-muted mt-2 mb-0">인위 바이럴 의존도 높음</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="text-center mb-3">
              <h6 className="fs-13 fw-bold text-dark mb-3">경쟁사 평균</h6>
              <Chart
                options={createDonutOptions('경쟁사', 'warning')}
                series={[competitorAvg.organic, competitorAvg.managed]}
                type="donut"
                height={280}
              />
              <div className="mt-3">
                <span className="badge bg-soft-warning text-warning">업계 표준</span>
                <p className="fs-11 text-muted mt-2 mb-0">써마지/인모드 수준</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="text-center mb-3">
              <h6 className="fs-13 fw-bold text-dark mb-3">목표 (6개월 후)</h6>
              <Chart
                options={createDonutOptions('목표', 'success')}
                series={[targetData.organic, targetData.managed]}
                type="donut"
                height={280}
              />
              <div className="mt-3">
                <span className="badge bg-soft-success text-success">달성 목표</span>
                <p className="fs-11 text-muted mt-2 mb-0">균형잡힌 바이럴 전략</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-4 pt-4 border-top">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <div className="flex-shrink-0">
                  <span className="badge bg-soft-danger text-danger" style={{ minWidth: '80px' }}>핵심 문제점</span>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="fs-12 text-dark mb-0">
                    현재 아스테라시스는 인위 바이럴 85%로 경쟁사 평균(40%) 대비 2배 이상 높은 수준입니다.
                    이는 브랜드 신뢰도 저하 및 장기적 성장에 부정적 영향을 미칠 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <div className="flex-shrink-0">
                  <span className="badge bg-soft-success text-success" style={{ minWidth: '80px' }}>개선 방향</span>
                </div>
                <div className="flex-grow-1 ms-3">
                  <ul className="fs-12 text-dark mb-0 ps-3">
                    <li>실제 고객 후기 수집 시스템 구축</li>
                    <li>병원 네트워크를 통한 자연스러운 콘텐츠 확산</li>
                    <li>의사 KOL 육성 프로그램 운영</li>
                    <li>고객 커뮤니티 활성화 (공식 플랫폼)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViralTypeAnalysis