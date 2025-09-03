import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

export async function GET() {
  try {
    const csvFilePath = path.join(process.cwd(), 'data', 'raw', 'asterasys_total_data - youtube_sponsor ad.csv')
    
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json({ error: 'YouTube sponsor ad data file not found' }, { status: 404 })
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
    
    const youtubeAdsData = []
    let currentProduct = ''
    
    records.forEach(record => {
      const product = record['기기구분'] || record.product || ''
      const campaign = record['캠페인'] || record.campaign || ''
      const avgCPV = record['평균 CPV'] || record.avg_cpv || ''
      const views = parseInt(record['조회수'] || record.views || '0')
      const videoURL = record['동영상'] || record.video || ''
      
      // Update current product if provided
      if (product) {
        currentProduct = product
      }
      
      // Skip if no essential data (campaign and video URL are essential)
      if (!campaign || !videoURL || !currentProduct) return
      
      youtubeAdsData.push({
        product: currentProduct,
        campaign: campaign,
        avgCPV: avgCPV,
        views: views,
        videoURL: videoURL
      })
    })
    
    // Add metadata
    const asterasysProducts = ['리프테라', '쿨페이즈', '쿨소닉']
    
    const processedData = youtubeAdsData.map(item => ({
      ...item,
      isAsterasys: asterasysProducts.includes(item.product)
    }))
    
    // Calculate summary statistics
    const totalCampaigns = processedData.length
    const asterasysCampaigns = processedData.filter(item => item.isAsterasys).length
    const totalViews = processedData.reduce((sum, item) => sum + item.views, 0)
    const asterasysViews = processedData.filter(item => item.isAsterasys).reduce((sum, item) => sum + item.views, 0)
    
    // Calculate average CPV values (remove ₩ symbol for calculation)
    const cpvValues = processedData
      .filter(item => item.avgCPV && item.avgCPV !== '')
      .map(item => parseInt(item.avgCPV.replace(/₩|,/g, '') || '0'))
    const averageCPV = cpvValues.length > 0 ? Math.round(cpvValues.reduce((sum, val) => sum + val, 0) / cpvValues.length) : 0
    
    // Product breakdown
    const productBreakdown = {}
    processedData.forEach(item => {
      if (!productBreakdown[item.product]) {
        productBreakdown[item.product] = {
          totalCampaigns: 0,
          totalViews: 0,
          cpvValues: [],
          isAsterasys: asterasysProducts.includes(item.product)
        }
      }
      productBreakdown[item.product].totalCampaigns++
      productBreakdown[item.product].totalViews += item.views
      
      if (item.avgCPV && item.avgCPV !== '') {
        const cpvValue = parseInt(item.avgCPV.replace(/₩|,/g, '') || '0')
        if (cpvValue > 0) {
          productBreakdown[item.product].cpvValues.push(cpvValue)
        }
      }
    })
    
    // Convert to array for easier handling
    const productStats = Object.entries(productBreakdown).map(([product, stats]) => {
      const avgCPV = stats.cpvValues.length > 0 
        ? Math.round(stats.cpvValues.reduce((sum, val) => sum + val, 0) / stats.cpvValues.length)
        : 0
      
      return {
        product,
        totalCampaigns: stats.totalCampaigns,
        totalViews: stats.totalViews,
        averageCPV: avgCPV,
        averageViewsPerCampaign: stats.totalCampaigns > 0 ? Math.round(stats.totalViews / stats.totalCampaigns) : 0,
        isAsterasys: stats.isAsterasys
      }
    }).sort((a, b) => b.totalViews - a.totalViews)
    
    const response = {
      success: true,
      youtubeAdsData: processedData,
      summary: {
        totalCampaigns,
        asterasysCampaigns,
        totalViews,
        asterasysViews,
        averageCPV,
        asterasysMarketShare: totalCampaigns > 0 ? ((asterasysCampaigns / totalCampaigns) * 100).toFixed(1) : '0.0',
        averageViewsPerCampaign: totalCampaigns > 0 ? Math.round(totalViews / totalCampaigns) : 0
      },
      productStats
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error processing YouTube sponsor ad data:', error)
    return NextResponse.json(
      { error: 'Failed to process YouTube sponsor ad data' },
      { status: 500 }
    )
  }
}