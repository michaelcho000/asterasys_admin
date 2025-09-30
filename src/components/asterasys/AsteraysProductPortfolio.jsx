'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { FiTrendingUp, FiMessageSquare, FiShoppingBag, FiSearch, FiTarget, FiDollarSign, FiMousePointer, FiUsers } from 'react-icons/fi'
import getIcon from '@/utils/getIcon'
import { ASTERASYS_PRODUCTS } from '../../../config/calculations.config.js'
import { formatNumber } from '@/utils/formatNumber'
import { useSelectedMonthStore } from '@/store/useSelectedMonthStore'
import { withMonthParam } from '@/utils/withMonthParam'

const formatMonthLabel = (month) => {
    if (!month) return '데이터 준비 중'
    const [year, monthPart] = month.split('-')
    return `${year}년 ${parseInt(monthPart, 10)}월`
}

const getMonthNumber = (month) => {
    if (!month) return null
    const [, monthPart] = month.split('-')
    return parseInt(monthPart, 10)
}

/**
 * Asterasys 3종 제품 포트폴리오 컴포넌트
 * Duralux 템플릿 기반 + 실제 CSV 데이터 (쿨페이즈, 리프테라, 쿨소닉)
 */

const AsteraysProductPortfolio = () => {
    const [productData, setProductData] = useState([])
    const [loading, setLoading] = useState(true)
    const month = useSelectedMonthStore((state) => state.selectedMonth)

    const monthNumber = useMemo(() => getMonthNumber(month), [month])
    const monthLabel = useMemo(() => formatMonthLabel(month), [month])
    const monthlySalesColumn = useMemo(() => {
        if (!monthNumber) return '8월 판매량'
        return `${monthNumber}월 판매량`
    }, [monthNumber])
    const monthlyDisplayLabel = useMemo(() => {
        if (!monthNumber) return '8월'
        return `${monthNumber}월`
    }, [monthNumber])

    useEffect(() => {
        if (!month) return

        const loadAllData = async () => {
            try {
                setLoading(true)

                // Load all required data files - add timestamp to prevent caching
                const timestamp = Date.now()
                const fetchOptions = {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                }

                const buildUrl = (basePath) => withMonthParam(`${basePath}?t=${timestamp}`, month)

                const [blogResponse, cafeResponse, trafficResponse, salesResponse] = await Promise.all([
                    fetch(buildUrl('/api/data/files/blog_rank'), fetchOptions),
                    fetch(buildUrl('/api/data/files/cafe_rank'), fetchOptions),
                    fetch(buildUrl('/api/data/files/traffic'), fetchOptions),
                    fetch(buildUrl('/api/data/files/sale'), fetchOptions)
                ])

                const [blogData, cafeData, trafficData, salesData] = await Promise.all([
                    blogResponse.json(),
                    cafeResponse.json(),
                    trafficResponse.json(),
                    salesResponse.json()
                ])

                // Process portfolio data for Asterasys products
                const portfolioData = ASTERASYS_PRODUCTS.map(productName => {
                    const blogItem = blogData.marketData?.find(item => item['키워드'] === productName) || {}
                    const cafeItem = cafeData.marketData?.find(item => item['키워드'] === productName) || {}
                    const trafficItem = trafficData.marketData?.find(item => item['키워드'] === productName) || {}
                    const salesItem = salesData.marketData?.find(item => item['키워드'] === productName) || {}

                    // Determine category
                    const category = productName === '쿨페이즈' ? 'RF' : 'HIFU'
                    const categoryKr = category === 'RF' ? '고주파' : '초음파'
                    
                    // Calculate rankings from market data
                    const blogRank = parseInt(blogItem['발행량 순위']) || 0
                    const cafeRank = parseInt(cafeItem['발행량 순위']) || 0
                    const searchRank = parseInt(trafficItem['검색량 순위'] || trafficItem[' 검색량 순위']) || 0  // Handle column name with/without leading space
                    
                    // Parse numbers with comma removal
                    const parseNumber = (value) => {
                        if (!value) return 0
                        return parseInt(String(value).replace(/,/g, '')) || 0
                    }
                    
                    const currentMonthSales = parseNumber(
                        salesItem[monthlySalesColumn] ?? salesItem['8월 판매량'] ?? 0
                    )

                    return {
                        id: productName,
                        name: productName,
                        category,
                        categoryKr,
                        highlight: true,
                        performance: {
                            blog: {
                                count: parseNumber(blogItem['발행량합']),
                                marketRank: blogRank
                            },
                            cafe: {
                                count: parseNumber(cafeItem['총 발행량']) + parseNumber(cafeItem['총 댓글수']) + parseNumber(cafeItem['총 대댓글수']),
                                marketRank: cafeRank
                            },
                            search: {
                                count: parseNumber(trafficItem['월간 검색량'] || trafficItem['월간 검색량 ']),  // Handle column name with/without trailing space
                                marketRank: searchRank
                            },
                            sales: {
                                totalCount: parseNumber(salesItem['총 판매량']),  // 총 판매량
                                monthlyCount: currentMonthSales,
                                monthlyLabel: monthlyDisplayLabel,
                                count: parseNumber(salesItem['총 판매량'])  // 기본 표시용 (총 판매량)
                            }
                        }
                    }
                })

                setProductData(portfolioData)
            } catch (error) {
                console.error('포트폴리오 데이터 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }

        loadAllData()
    }, [month, monthlySalesColumn, monthlyDisplayLabel])


    return (
        <div className="col-12">
            <div className="card border-top-4 border-top-primary stretch stretch-full">
                <div className="card-header">
                    <h5 className="card-title d-flex align-items-center">
                        <i className="feather-package me-2 text-primary"></i>
                        Asterasys 제품 포트폴리오 분석
                        <span className="badge bg-primary ms-2">{monthLabel}</span>
                    </h5>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                    <div className="row">
                        {productData.map((product) => (
                            <div key={product.id} className="col-lg-4 col-md-6">
                                <div className={`card border border-light shadow-sm h-100 ${product.highlight ? 'border-top-4 border-top-primary' : ''}`}>
                                    <div className="card-header bg-primary-subtle">
                                        <div className="d-flex align-items-start justify-content-between w-100">
                                            <div>
                                                <h6 className="card-title mb-1 fw-bold text-primary">
                                                    {product.name}
                                                </h6>
                                                <small className="text-muted fw-medium">
                                                    {product.categoryKr} • {product.category}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            {/* Top Row */}
                                            <div className="col-6">
                                                <div className="p-3 rounded-3 h-100 position-relative overflow-hidden" 
                                                     style={{
                                                         background: `linear-gradient(135deg, ${product.performance.blog.marketRank <= 3 ? '#1e40af' : product.performance.blog.marketRank <= 6 ? '#3b82f6' : '#93c5fd'}15, ${product.performance.blog.marketRank <= 3 ? '#1e40af' : product.performance.blog.marketRank <= 6 ? '#3b82f6' : '#93c5fd'}05)`
                                                     }}>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <FiTrendingUp className={`mb-1 ${product.performance.blog.marketRank <= 3 ? 'text-primary' : 'text-primary'}`} size={20} />
                                                            <div className={`fs-4 fw-bold mb-1 ${product.performance.blog.marketRank <= 3 ? 'text-primary' : 'text-primary'}`}>
                                                                {formatNumber(product.performance.blog.count)}
                                                            </div>
                                                            <small className="text-muted fw-medium">블로그 발행</small>
                                                        </div>
                                                        <div className="badge bg-primary">
                                                            {product.category} 블로그 {product.performance.blog.marketRank}위
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="col-6">
                                                <div className="p-3 rounded-3 h-100 position-relative overflow-hidden"
                                                     style={{
                                                         background: `linear-gradient(135deg, ${product.performance.cafe.marketRank <= 3 ? '#1e40af' : product.performance.cafe.marketRank <= 6 ? '#3b82f6' : '#93c5fd'}15, ${product.performance.cafe.marketRank <= 3 ? '#1e40af' : product.performance.cafe.marketRank <= 6 ? '#3b82f6' : '#93c5fd'}05)`
                                                     }}>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <FiMessageSquare className={`mb-1 ${product.performance.cafe.marketRank <= 3 ? 'text-primary' : 'text-primary'}`} size={20} />
                                                            <div className={`fs-4 fw-bold mb-1 ${product.performance.cafe.marketRank <= 3 ? 'text-primary' : 'text-primary'}`}>
                                                                {formatNumber(product.performance.cafe.count)}
                                                            </div>
                                                            <small className="text-muted fw-medium">카페 발행</small>
                                                        </div>
                                                        <div className="badge bg-success">
                                                            {product.category} 카페 {product.performance.cafe.marketRank}위
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Row */}
                                            <div className="col-6">
                                                <div className="p-3 rounded-3 h-100 position-relative overflow-hidden"
                                                     style={{
                                                         background: `linear-gradient(135deg, ${product.performance.search.marketRank <= 3 ? '#1e40af' : product.performance.search.marketRank <= 6 ? '#3b82f6' : '#93c5fd'}15, ${product.performance.search.marketRank <= 3 ? '#1e40af' : product.performance.search.marketRank <= 6 ? '#3b82f6' : '#93c5fd'}05)`
                                                     }}>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <FiSearch className={`mb-1 ${product.performance.search.marketRank <= 3 ? 'text-primary' : 'text-primary'}`} size={20} />
                                                            <div className={`fs-4 fw-bold mb-1 ${product.performance.search.marketRank <= 3 ? 'text-primary' : 'text-primary'}`}>
                                                                {formatNumber(product.performance.search.count)}
                                                            </div>
                                                            <small className="text-muted fw-medium">월 검색량</small>
                                                        </div>
                                                        <div className="badge bg-warning text-dark">
                                                            {product.category} 검색 {product.performance.search.marketRank}위
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="col-6">
                                                <div className="p-3 rounded-3 h-100 position-relative overflow-hidden sales-card"
                                                     style={{
                                                         background: 'linear-gradient(135deg, #64748b15, #64748b05)',
                                                         transition: 'all 0.3s ease'
                                                     }}>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="flex-grow-1">
                                                            <FiShoppingBag className="text-secondary mb-1" size={20} />
                                                            <div className="d-flex align-items-baseline gap-2 mb-1">
                                                                <div className="fs-4 fw-bold text-secondary">
                                                                    {formatNumber(product.performance.sales.totalCount)}
                                                                </div>
                                                            <small className="text-primary fw-medium">
                                                                    {product.performance.sales.monthlyLabel}: {formatNumber(product.performance.sales.monthlyCount)}대
                                                                </small>
                                                            </div>
                                                            <small className="text-muted fw-medium">총 판매량</small>
                                                        </div>
                                                        <div className="badge bg-secondary text-white fs-11">
                                                            {product.performance.sales.monthlyCount > 10 ? '활발' : 
                                                             product.performance.sales.monthlyCount > 0 ? '양호' : '관찰'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Performance Summary */}
                                        <div className="mt-3 pt-3 border-top">
                                            <div className="text-center">
                                                <small className="text-primary fw-medium d-block">
                                                    통합 마케팅 순위 • 발행량+댓글 합산 기준
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AsteraysProductPortfolio
