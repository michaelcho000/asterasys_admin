'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'
import CardLoader from '@/components/shared/CardLoader'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const ViralTypeAnalysis = () => {
  const month = useSelectedMonthStore((state) => state.selectedMonth)
  const [loading, setLoading] = useState(true)
  const [brandingData, setBrandingData] = useState({
    current: { organic: 14, managed: 86 },
    competitor: { organic: 43, managed: 57 },
    target: { organic: 35, managed: 65 }
  })

  useEffect(() => {
    if (!month) return

    const fetchBrandingData = async () => {
      try {
        setLoading(true)

        // Load organic viral analysis results (dynamic calculation from CSV)
        const analysisRes = await fetch(withMonthParam('/api/organic-viral-analysis', month))
        const analysisData = await analysisRes.json()

        // Use pre-calculated organic scores
        const asterasysOrganic = analysisData.asterasys?.organic || 14
        const asterasysManaged = analysisData.asterasys?.managed || 86
        const competitorOrganic = analysisData.competitor?.organic || 43
        const competitorManaged = analysisData.competitor?.managed || 57

        setBrandingData({
          current: { organic: asterasysOrganic, managed: asterasysManaged },
          competitor: { organic: competitorOrganic, managed: competitorManaged },
          target: { organic: 35, managed: 65 }
        })
      } catch (error) {
        console.error('브랜딩 전략 데이터 로드 실패:', error)
        // Fallback to calculated values from analysis
        setBrandingData({
          current: { organic: 14, managed: 86 },
          competitor: { organic: 43, managed: 57 },
          target: { organic: 35, managed: 65 }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBrandingData()
  }, [month])

  const roadmapData = [
    {
      quarter: 'Q4 2025',
      target: { organic: 20, managed: 80 },
      actions: [
        '병원 네트워크 30개 확대 (병원블로그 268 → 400건)',
        '카페 비중 유지하되 질적 개선'
      ]
    },
    {
      quarter: 'Q1 2026',
      target: { organic: 28, managed: 72 },
      actions: [
        '카페 점진적 감소 (1,550 → 1,200건)',
        '병원 자발적 콘텐츠 증가'
      ]
    },
    {
      quarter: 'Q2 2026',
      target: { organic: 35, managed: 65 },
      actions: [
        '경쟁사 평균(43%) 근접',
        '병원 중심 Organic 브랜딩 확립'
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
    labels: ['Organic Growth', 'Managed Branding'],
    colors: [color === 'primary' ? '#3b82f6' : color === 'warning' ? '#ffc107' : '#10b981', '#94a3b8'],
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

  if (loading) {
    return (
      <div className="card stretch stretch-full">
        <CardLoader />
      </div>
    )
  }

  return (
    <div className="card stretch stretch-full">
      <div className="card-header">
        <h5 className="card-title mb-1">브랜딩 전략 로드맵</h5>
        <p className="text-muted fs-12 mb-0">Organic Growth vs Managed Branding 균형 전략</p>
      </div>
      <div className="card-body">
        {/* Donut Charts Row */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="text-center mb-3">
              <h6 className="fs-13 fw-bold text-dark mb-3">현재 (아스테라시스)</h6>
              <Chart
                options={createDonutOptions('현재', 'primary')}
                series={[brandingData.current.organic, brandingData.current.managed]}
                type="donut"
                height={280}
              />
              <div className="mt-3">
                <span className="badge bg-soft-warning text-warning">Managed 주도</span>
                <p className="fs-11 text-muted mt-2 mb-0">카페 1,550건 (Managed의 85%)</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="text-center mb-3">
              <h6 className="fs-13 fw-bold text-dark mb-3">경쟁사 5개 평균</h6>
              <Chart
                options={createDonutOptions('경쟁사', 'warning')}
                series={[brandingData.competitor.organic, brandingData.competitor.managed]}
                type="donut"
                height={280}
              />
              <div className="mt-3">
                <span className="badge bg-soft-info text-info">균형 전략</span>
                <p className="fs-11 text-muted mt-2 mb-0">덴서티/세르프/볼뉴머/텐써마 (4개 평균)</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="text-center mb-3">
              <h6 className="fs-13 fw-bold text-dark mb-3">목표 (6개월 후)</h6>
              <Chart
                options={createDonutOptions('목표', 'success')}
                series={[brandingData.target.organic, brandingData.target.managed]}
                type="donut"
                height={280}
              />
              <div className="mt-3">
                <span className="badge bg-soft-success text-success">Organic 증가 목표</span>
                <p className="fs-11 text-muted mt-2 mb-0">35% 달성 → 경쟁사 평균 근접</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Insights */}
        <div className="mt-4 pt-4 border-top">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <div className="flex-shrink-0">
                  <span className="badge bg-soft-primary text-primary" style={{ minWidth: '80px' }}>8월 분석</span>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="fs-12 text-dark mb-0">
                    8월은 카페 중심의 댓글 마케팅이 전체 발행량의 45.3%를 차지하며 리프테라(503건), 쿨소닉(605건)이 초음파 그룹 내 2~4위를 유지했습니다. 고주파 시장에서는 쿨페이즈(789건)가 2위로 강세를 보였으나, 뉴스 채널에서는 12건으로 8위에 그쳐 언론 노출이 매우 부족했습니다. YouTube는 쿨페이즈(2건), 리프테라(7건)로 경쟁사 대비 심각하게 낮은 수준이며, 볼뉴머(71건 뉴스 기사, 캠페인 강도 HIGH)와 울쎄라(198건 뉴스)가 압도적 미디어 점유율을 보였습니다.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <div className="flex-shrink-0">
                  <span className="badge bg-soft-warning text-warning" style={{ minWidth: '80px' }}>9월 분석</span>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="fs-12 text-dark mb-0">
                    9월은 슈링크(200건 뉴스)가 울쎄라(161건)를 제치고 뉴스 채널 1위로 급부상하며 병원발행 64.3%로 B2B 마케팅을 강화했습니다. Asterasys는 카페에서 쿨페이즈(598건→4위), 리프테라(430건→4위)로 하락했고, 블로그는 쿨페이즈(132건→9위)로 8월 대비 발행량이 크게 감소했습니다. YouTube는 쿨페이즈(62건), 리프테라(203건)로 증가했으나 써마지(457건), 덴서티(245건) 대비 여전히 낮습니다. 경쟁사인 세르프(44건, 캠페인 강도 MEDIUM)가 적극적 PR을 전개했습니다.
                  </p>
                </div>
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
                  <span className="badge bg-soft-info text-info" style={{ minWidth: '80px' }}>현재 상황</span>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="fs-12 text-dark mb-0">
                    <strong>Organic {brandingData.current.organic}% / Managed {brandingData.current.managed}%</strong>로
                    경쟁사 평균(Organic {brandingData.competitor.organic}%)보다 <strong className="text-danger">{Math.abs(brandingData.current.organic - brandingData.competitor.organic)}%p 낮습니다.</strong>
                    카페 1,550건(전체 Managed의 85%)을 통한 인위 바이럴 전략에 집중하고 있으며, 이는 시장 초기 진입 단계에서 빠른 인지도 확산을 위한 적절한 선택입니다.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <div className="flex-shrink-0">
                  <span className="badge bg-soft-success text-success" style={{ minWidth: '80px' }}>성장 방향</span>
                </div>
                <div className="flex-grow-1 ms-3">
                  <ul className="fs-12 text-dark mb-0 ps-3">
                    <li><strong>병원 네트워크 확대</strong>: 30개 병원 추가 → 병원블로그 268 → 400건 (Q4 2025)</li>
                    <li><strong>카페 질적 개선</strong>: 단순 발행량보다 진정성 있는 콘텐츠로 전환</li>
                    <li><strong>카페 점진적 감소</strong>: 1,550 → 1,200건 (Q1 2026), 병원 자발적 콘텐츠 증가</li>
                    <li><strong>Organic 35% 목표</strong>: 경쟁사 평균(43%)에 근접, 병원 중심 브랜딩 확립 (Q2 2026)</li>
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