import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'


// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const csvFilePath = path.join(process.cwd(), 'data', 'raw', 'asterasys_total_data - facebook_targeting.csv')
    
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json({ error: 'Facebook targeting data file not found' }, { status: 404 })
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
    
    const targetingAdsData = []
    let currentProduct = ''
    
    records.forEach(record => {
      const product = record['기기구븐'] || record['기기구분'] || record.product || ''
      const hospital = record['병원명'] || record.hospital || ''
      const reportStart = record['보고 시작'] || record.report_start || ''
      const reportEnd = record['보고 종료'] || record.report_end || ''
      const campaignName = record['캠페인 이름'] || record.campaign_name || ''
      const results = parseInt(record['결과'] || record.results || '0')
      const resultTool = record['결과 표시 도구'] || record.result_tool || ''
      const reach = record['도달수'] || record.reach || ''
      const impressions = record['노출'] || record.impressions || ''
      const endDate = record['종료'] || record.end_date || ''
      const clicks = parseInt(record['클릭수'] || record.clicks || '0')
      
      // Update current product if provided
      if (product) {
        currentProduct = product
      }
      
      // Skip if no essential data (hospital and campaign are essential)
      if (!hospital || !campaignName || !currentProduct) return
      
      // Convert reach and impressions from string with commas to number
      const reachNum = parseInt(String(reach).replace(/,/g, '') || '0')
      const impressionsNum = parseInt(String(impressions).replace(/,/g, '') || '0')
      
      targetingAdsData.push({
        product: currentProduct,
        hospital: hospital,
        reportStart: reportStart,
        reportEnd: reportEnd,
        campaignName: campaignName,
        results: results,
        resultTool: resultTool,
        reach: reachNum,
        impressions: impressionsNum,
        endDate: endDate,
        clicks: clicks
      })
    })
    
    // Add metadata
    const asterasysProducts = ['리프테라', '쿨페이즈', '쿨소닉']
    
    const processedData = targetingAdsData.map(item => ({
      ...item,
      isAsterasys: asterasysProducts.includes(item.product)
    }))
    
    // Calculate summary statistics
    const totalCampaigns = processedData.length
    const asterasysCampaigns = processedData.filter(item => item.isAsterasys).length
    const totalResults = processedData.reduce((sum, item) => sum + item.results, 0)
    const asterasysResults = processedData.filter(item => item.isAsterasys).reduce((sum, item) => sum + item.results, 0)
    const totalReach = processedData.reduce((sum, item) => sum + item.reach, 0)
    const totalImpressions = processedData.reduce((sum, item) => sum + item.impressions, 0)
    const totalClicks = processedData.reduce((sum, item) => sum + item.clicks, 0)
    
    // Product breakdown
    const productBreakdown = {}
    processedData.forEach(item => {
      if (!productBreakdown[item.product]) {
        productBreakdown[item.product] = {
          totalCampaigns: 0,
          totalResults: 0,
          totalReach: 0,
          totalImpressions: 0,
          totalClicks: 0,
          uniqueHospitals: new Set(),
          isAsterasys: asterasysProducts.includes(item.product)
        }
      }
      productBreakdown[item.product].totalCampaigns++
      productBreakdown[item.product].totalResults += item.results
      productBreakdown[item.product].totalReach += item.reach
      productBreakdown[item.product].totalImpressions += item.impressions
      productBreakdown[item.product].totalClicks += item.clicks
      productBreakdown[item.product].uniqueHospitals.add(item.hospital)
    })
    
    // Convert to array for easier handling
    const productStats = Object.entries(productBreakdown).map(([product, stats]) => ({
      product,
      totalCampaigns: stats.totalCampaigns,
      totalResults: stats.totalResults,
      totalReach: stats.totalReach,
      totalImpressions: stats.totalImpressions,
      totalClicks: stats.totalClicks,
      uniqueHospitals: stats.uniqueHospitals.size,
      averageResultsPerCampaign: stats.totalCampaigns > 0 ? Math.round(stats.totalResults / stats.totalCampaigns) : 0,
      ctr: stats.totalImpressions > 0 ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2) : '0.00',
      isAsterasys: stats.isAsterasys
    })).sort((a, b) => b.totalResults - a.totalResults)
    
    const response = {
      success: true,
      targetingAdsData: processedData,
      summary: {
        totalCampaigns,
        asterasysCampaigns,
        totalResults,
        asterasysResults,
        totalReach,
        totalImpressions,
        totalClicks,
        asterasysMarketShare: totalCampaigns > 0 ? ((asterasysCampaigns / totalCampaigns) * 100).toFixed(1) : '0.0',
        overallCTR: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'
      },
      productStats
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error processing Facebook targeting data:', error)
    return NextResponse.json(
      { error: 'Failed to process Facebook targeting data' },
      { status: 500 }
    )
  }
}