import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { resolveRequestMonth } from '@/lib/server/requestMonth'

/**
 * YouTube 스폰서 광고 데이터 API
 * Asterasys 제품별 광고 캠페인 성과 데이터 제공
 */


// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // YouTube 스폰서 광고 CSV 파일 경로
    const monthContext = resolveRequestMonth(request, { required: ['raw'] })

    if (monthContext.error) {
      return NextResponse.json({ error: monthContext.error.message }, { status: 400 })
    }

    if (!monthContext.ok) {
      return NextResponse.json(
        {
          error: '월별 원본 데이터 폴더를 찾을 수 없습니다',
          month: monthContext.month,
          missing: monthContext.missing
        },
        { status: 404 }
      )
    }

    const csvFilePath = path.join(monthContext.paths.raw, 'asterasys_total_data - youtube_sponsor ad.csv')
    
    // 파일 존재 확인
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json(
        { 
          error: 'YouTube 스폰서 광고 데이터를 찾을 수 없습니다',
          month: monthContext.month,
          expectedPath: csvFilePath
        },
        { status: 404 }
      )
    }

    const csvContent = fs.readFileSync(csvFilePath, 'utf-8')
    
    // Remove BOM if present
    const cleanContent = csvContent.replace(/^\uFEFF/, '')
    
    const records = parse(cleanContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,
      skip_records_with_error: true
    })
    
    const campaignData = []
    let currentProduct = ''
    
    records.forEach(record => {
      const product = record['기기구분'] || record.product || ''
      const campaign = record['캠페인'] || record.campaign || ''
      const avgCPV = record['평균 CPV'] || record.avg_cpv || ''
      const views = parseInt(record['조회수'] || record.views || '0')
      const videoUrl = record['동영상'] || record.video || ''
      
      // Update current product if provided
      if (product) {
        currentProduct = product
      }
      
      // Skip if no essential data
      if (!campaign || !videoUrl || !currentProduct) return
      
      const cpvValue = parseFloat(String(avgCPV).replace(/[₩,]/g, '') || 0)
      
      campaignData.push({
        product: currentProduct,
        campaign: campaign,
        cpv: cpvValue,
        views: views,
        videoUrl: videoUrl,
        isAsterasys: ['쿨페이즈', '리프테라', '쿨소닉'].includes(currentProduct)
      })
    })

    // 제품별 요약 통계
    const productSummary = {}
    campaignData.forEach(item => {
      if (!productSummary[item.product]) {
        productSummary[item.product] = {
          product: item.product,
          totalCampaigns: 0,
          totalViews: 0,
          avgCPV: 0,
          cpvValues: [],
          isAsterasys: item.isAsterasys
        }
      }
      
      const summary = productSummary[item.product]
      summary.totalCampaigns++
      summary.totalViews += item.views
      if (item.cpv > 0) {
        summary.cpvValues.push(item.cpv)
      }
    })

    // 평균값 계산
    Object.values(productSummary).forEach(summary => {
      summary.avgCPV = summary.cpvValues.length > 0 
        ? Math.round(summary.cpvValues.reduce((sum, cpv) => sum + cpv, 0) / summary.cpvValues.length)
        : 0
    })

    const response = {
      success: true,
      campaigns: campaignData.sort((a, b) => b.views - a.views), // 조회수 기준 정렬
      productSummary: Object.values(productSummary).sort((a, b) => b.totalViews - a.totalViews),
      summary: {
        totalCampaigns: campaignData.length,
        totalViews: campaignData.reduce((sum, item) => sum + item.views, 0),
        avgCPV: campaignData.length > 0 ? Math.round(campaignData.reduce((sum, item) => sum + item.cpv, 0) / campaignData.length) : 0,
        asterasysMarketShare: campaignData.length > 0 
          ? ((campaignData.filter(item => item.isAsterasys).length / campaignData.length) * 100).toFixed(1) 
          : '0.0'
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        dataSource: path.relative(process.cwd(), csvFilePath),
        recordCount: campaignData.length,
        month: monthContext.month
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
