'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import CardHeader from '@/components/shared/CardHeader'
import { CircularProgressbar } from 'react-circular-progressbar'
import CardLoader from '@/components/shared/CardLoader'
import getIcon from '@/utils/getIcon'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const FacebookTargetingWidget = () => {
    const [fbData, setFbData] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState('전체')
    const month = useSelectedMonthStore((state) => state.selectedMonth)
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()

    useEffect(() => {
        if (!month) return
        const loadFacebookData = async () => {
            try {
                setLoading(true)
                const response = await fetch(withMonthParam('/api/data/files/facebook_targeting', month))
                const data = await response.json()
                
                if (data && data.marketData) {
                    const processed = processFacebookData(data.marketData)
                    setFbData(processed)
                }
            } catch (error) {
                console.error('Facebook 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadFacebookData()
    }, [month, refreshKey])

    const processFacebookData = (rawData) => {
        const products = {}
        
        rawData.forEach(item => {
            const product = item['기기구븐'] || item['기기구분'] || '기타'
            if (!products[product]) {
                products[product] = {
                    name: product,
                    campaigns: [],
                    totalReach: 0,
                    totalImpressions: 0,
                    totalClicks: 0,
                    totalResult: 0
                }
            }
            
            const reach = parseInt(item['도달수']?.replace(/,/g, '') || 0)
            const impressions = parseInt(item['노출']?.replace(/,/g, '') || 0)
            const clicks = parseInt(item['클릭수'] || 0)
            const result = parseInt(item['결과'] || 0)
            
            products[product].campaigns.push(item)
            products[product].totalReach += reach
            products[product].totalImpressions += impressions
            products[product].totalClicks += clicks
            products[product].totalResult += result
        })
        
        return Object.values(products)
    }

    const getTotalMetrics = () => {
        if (selectedProduct === '전체') {
            return {
                reach: fbData.reduce((sum, p) => sum + p.totalReach, 0),
                impressions: fbData.reduce((sum, p) => sum + p.totalImpressions, 0),
                clicks: fbData.reduce((sum, p) => sum + p.totalClicks, 0),
                result: fbData.reduce((sum, p) => sum + p.totalResult, 0)
            }
        } else {
            const product = fbData.find(p => p.name === selectedProduct)
            return product ? {
                reach: product.totalReach,
                impressions: product.totalImpressions,
                clicks: product.totalClicks,
                result: product.totalResult
            } : { reach: 0, impressions: 0, clicks: 0, result: 0 }
        }
    }

    const metrics = getTotalMetrics()
    const ctr = metrics.impressions > 0 ? ((metrics.clicks / metrics.impressions) * 100).toFixed(1) : 0
    const reachRate = metrics.impressions > 0 ? ((metrics.reach / metrics.impressions) * 100).toFixed(0) : 0

    if (isRemoved) {
        return null
    }

    return (
        <div className="col-xxl-4">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <div className="card-header">
                    <h5 className="card-title">Facebook 광고 성과</h5>
                </div>

                <div className="card-body custom-card-action">
                    {loading ? (
                        <CardLoader />
                    ) : (
                        <>
                            <div className="text-center mb-4">
                                <div className="revenue-progress">
                                    <CircularProgressbar
                                        value={parseInt(reachRate)}
                                        text={`${reachRate}%`}
                                        background
                                        styles={{
                                            path: {
                                                transition: "stroke-dashoffset 0.5s ease"
                                            },
                                        }}
                                    />
                                </div>
                                <div className="mt-3">
                                    <h6 className="mb-1">도달률</h6>
                                    <small className="text-muted">노출 대비 실제 도달 비율</small>
                                </div>
                            </div>
                            
                            <div className="row g-4">
                                <MetricCard 
                                    icon='feather-target' 
                                    name={"도달수"} 
                                    value={`${metrics.reach.toLocaleString()}`}
                                    target={`CTR: ${ctr}%`}
                                    color="primary"
                                />
                                <MetricCard 
                                    icon='feather-eye' 
                                    name={"노출수"} 
                                    value={`${metrics.impressions.toLocaleString()}`}
                                    target={`도달률: ${reachRate}%`}
                                    color="success"
                                />
                                <MetricCard 
                                    icon='feather-mouse-pointer' 
                                    name={"클릭수"} 
                                    value={`${metrics.clicks.toLocaleString()}`}
                                    target={`참여도 높음`}
                                    color="warning"
                                />
                                <MetricCard 
                                    icon='feather-trending-up' 
                                    name={"총 성과"} 
                                    value={`${metrics.result.toLocaleString()}`}
                                    target={`목표 달성`}
                                    color="info"
                                />
                            </div>

                            <hr className="border-dashed my-4" />
                            
                            {/* 제품별 성과 리스트 - Revenue Forecast 스타일 */}
                            {fbData.filter(product => product.name !== '전체').slice(0, 3).map((product, index) => {
                                const productReachRate = product.totalImpressions > 0 ? 
                                    ((product.totalReach / product.totalImpressions) * 100).toFixed(0) : 0
                                const productCTR = product.totalImpressions > 0 ? 
                                    ((product.totalClicks / product.totalImpressions) * 100).toFixed(1) : 0
                                
                                return (
                                    <div key={product.name}>
                                        {index !== 0 && <hr className="border-dashed my-3" />}
                                        <div 
                                            className={`d-flex align-items-center justify-content-between cursor-pointer p-3 rounded ${selectedProduct === product.name ? 'border border-primary' : 'border border-transparent'}`}
                                            onClick={() => setSelectedProduct(product.name)}
                                            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                        >
                                            <div className="hstack gap-3">
                                                <div>
                                                    <Link href="#" className="d-block fw-semibold" onClick={(e) => e.preventDefault()}>
                                                        {product.name}
                                                    </Link>
                                                    <span className="fs-12 text-muted">
                                                        Facebook Ads Campaign
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="badge bg-primary text-white">{productReachRate}%</span>
                                                    <span className="badge bg-success text-white">{productCTR}%</span>
                                                </div>
                                                <div className="fs-12 text-muted">{product.totalClicks.toLocaleString()} clicks</div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    )}
                    <CardLoader refreshKey={refreshKey} />
                </div>
            </div>
        </div>
    )
}

const MetricCard = ({ name, value, target, icon, color }) => {
    return (
        <div className="col-sm-6">
            <div className="px-4 py-3 text-center border border-dashed rounded-3 hover-shadow-sm transition-all">
                <div className={`avatar-text bg-${color}-subtle text-${color} mx-auto mb-2`}>
                    {React.cloneElement(getIcon(icon), { size: "16" })}
                </div>
                <h2 className="fs-13 tx-spacing-1 mb-1">{name}</h2>
                <div className={`fw-bold text-${color} fs-6 mb-1`}>{value}</div>
                <div className="fs-10 text-muted">{target}</div>
            </div>
        </div>
    )
}

export default FacebookTargetingWidget
