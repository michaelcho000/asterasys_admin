import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * YouTube 스폰서 광고 데이터 API
 * Asterasys 제품별 광고 캠페인 성과 데이터 제공
 */

export async function GET(request) {
  try {
    // YouTube 스폰서 광고 CSV 파일 경로
    const csvFilePath = path.join(process.cwd(), 'data', 'raw', 'asterasys_total_data - youtube_sponsor ad.csv')
    
    // 파일 존재 확인
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json(
        { 
          error: 'YouTube 스폰서 광고 데이터를 찾을 수 없습니다',
          expectedPath: csvFilePath
        },
        { status: 404 }
      )
    }

    // CSV 파일 읽기
    const csvContent = fs.readFileSync(csvFilePath, 'utf8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      return NextResponse.json(
        { error: 'CSV 파일이 비어있습니다' },
        { status: 400 }
      )
    }

    // CSV 파싱 (따옴표로 감싼 쉼표 포함 숫자 처리)
    const headers = lines[0].split(',').map(h => h.trim())
    const data = lines.slice(1).map(line => {
      // CSV 파싱: 따옴표로 감싼 부분은 하나의 필드로 처리
      const values = []
      let currentValue = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim())
          currentValue = ''
        } else {
          currentValue += char
        }
      }
      values.push(currentValue.trim()) // 마지막 값 추가
      
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || null
      })
      return row
    }).filter(row => row['기기구분']) // 기기구분이 있는 행만

    // 데이터 처리 및 계산
    const processedData = data.map(item => {
      const product = item['기기구분']
      const campaign = item['캠페인']
      const currency = item['통화 코드']
      const cpv = parseFloat(item['평균 CPV']?.replace(/[₩,]/g, '') || 0)
      const impressions = parseInt(item['노출수']?.replace(/,/g, '') || 0)
      const views = parseInt(item['조회수']?.replace(/,/g, '') || 0)
      const videoUrl = item['동영상']
      
      // ROI 계산 (조회수 / (CPV × 노출수) × 100)
      const adCost = cpv * impressions / 1000 // 천원 단위
      const roi = adCost > 0 ? (views / adCost * 100).toFixed(1) : 0
      
      // 전환율 (조회수 / 노출수 × 100)
      const conversionRate = impressions > 0 ? (views / impressions * 100).toFixed(2) : 0
      
      return {
        product,
        campaign,
        cpv,
        impressions,
        views,
        videoUrl,
        roi: parseFloat(roi),
        conversionRate: parseFloat(conversionRate),
        adCost: Math.round(adCost),
        isAsterasys: ['쿨페이즈', '리프테라', '쿨소닉'].includes(product)
      }
    })

    // 제품별 요약 통계
    const productSummary = {}
    processedData.forEach(item => {
      if (!productSummary[item.product]) {
        productSummary[item.product] = {
          product: item.product,
          totalCampaigns: 0,
          totalImpressions: 0,
          totalViews: 0,
          totalCost: 0,
          avgCPV: 0,
          totalROI: 0,
          avgConversionRate: 0,
          isAsterasys: item.isAsterasys
        }
      }
      
      const summary = productSummary[item.product]
      summary.totalCampaigns++
      summary.totalImpressions += item.impressions
      summary.totalViews += item.views
      summary.totalCost += item.adCost
      summary.totalROI += item.roi
    })

    // 평균값 계산
    Object.values(productSummary).forEach(summary => {
      summary.avgCPV = summary.totalCampaigns > 0 ? Math.round(summary.totalCost / summary.totalImpressions * 1000) : 0
      summary.avgConversionRate = summary.totalImpressions > 0 ? (summary.totalViews / summary.totalImpressions * 100).toFixed(2) : 0
      summary.avgROI = summary.totalCampaigns > 0 ? (summary.totalROI / summary.totalCampaigns).toFixed(1) : 0
    })

    const response = {
      success: true,
      campaigns: processedData.sort((a, b) => b.views - a.views), // 조회수 기준 정렬
      productSummary: Object.values(productSummary).sort((a, b) => b.totalViews - a.totalViews),
      summary: {
        totalCampaigns: processedData.length,
        totalImpressions: processedData.reduce((sum, item) => sum + item.impressions, 0),
        totalViews: processedData.reduce((sum, item) => sum + item.views, 0),
        totalCost: processedData.reduce((sum, item) => sum + item.adCost, 0),
        avgCPV: processedData.length > 0 ? Math.round(processedData.reduce((sum, item) => sum + item.cpv, 0) / processedData.length) : 0
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        dataSource: 'asterasys_total_data - youtube_sponsor ad.csv',
        recordCount: processedData.length
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('YouTube 스폰서 광고 API 오류:', error)
    return NextResponse.json(
      { 
        error: 'YouTube 스폰서 광고 데이터 처리 실패', 
        details: error.message
      },
      { status: 500 }
    )
  }
}