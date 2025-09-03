import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

export async function GET() {
  try {
    const csvFilePath = path.join(process.cwd(), 'data', 'raw', 'asterasys_total_data - ott.csv')
    
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json({ error: 'OTT data file not found' }, { status: 404 })
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
    
    const outdoorAdsData = []
    let currentProduct = ''
    
    records.forEach(record => {
      const product = record['기기구분'] || record.product || ''
      const region = record['지역'] || record.region || ''
      const mediaName = record['매체명'] || record.media_name || ''
      const mediaLocation = record['매체 위치'] || record.media_location || ''
      const mediaType = record['매체 유형'] || record.media_type || ''
      const displayFormat = record['표출 형식'] || record.display_format || ''
      const quantity = record['수량'] || record.quantity || ''
      const dailyBroadcast = record['1일 송출횟수'] || record.daily_broadcast || ''
      const period = record['기간'] || record.period || ''
      
      // Update current product if provided
      if (product) {
        currentProduct = product
      }
      
      // Skip if no essential data (mediaName is essential)
      if (!mediaName || !currentProduct) return
      
      outdoorAdsData.push({
        product: currentProduct,
        region: region,
        mediaName: mediaName,
        mediaLocation: mediaLocation,
        mediaType: mediaType,
        displayFormat: displayFormat,
        quantity: quantity,
        dailyBroadcast: dailyBroadcast,
        period: period
      })
    })
    
    // Add metadata
    const asterasysProducts = ['리프테라', '쿨페이즈', '쿨소닉']
    
    const processedData = outdoorAdsData.map(item => ({
      ...item,
      isAsterasys: asterasysProducts.includes(item.product)
    }))
    
    // Calculate summary statistics
    const totalCampaigns = processedData.length
    const asterasysCampaigns = processedData.filter(item => item.isAsterasys).length
    const uniqueRegions = [...new Set(processedData.map(item => item.region).filter(r => r))].length
    const uniqueMediaTypes = [...new Set(processedData.map(item => item.mediaType).filter(mt => mt))].length
    
    // Product breakdown
    const productBreakdown = {}
    processedData.forEach(item => {
      if (!productBreakdown[item.product]) {
        productBreakdown[item.product] = {
          totalCampaigns: 0,
          uniqueRegions: new Set(),
          uniqueMediaTypes: new Set(),
          isAsterasys: asterasysProducts.includes(item.product)
        }
      }
      productBreakdown[item.product].totalCampaigns++
      if (item.region) productBreakdown[item.product].uniqueRegions.add(item.region)
      if (item.mediaType) productBreakdown[item.product].uniqueMediaTypes.add(item.mediaType)
    })
    
    // Convert to array for easier handling
    const productStats = Object.entries(productBreakdown).map(([product, stats]) => ({
      product,
      totalCampaigns: stats.totalCampaigns,
      uniqueRegions: stats.uniqueRegions.size,
      uniqueMediaTypes: stats.uniqueMediaTypes.size,
      isAsterasys: stats.isAsterasys
    })).sort((a, b) => b.totalCampaigns - a.totalCampaigns)
    
    // Region breakdown
    const regionBreakdown = {}
    processedData.forEach(item => {
      if (item.region) {
        if (!regionBreakdown[item.region]) {
          regionBreakdown[item.region] = {
            totalCampaigns: 0,
            products: new Set()
          }
        }
        regionBreakdown[item.region].totalCampaigns++
        regionBreakdown[item.region].products.add(item.product)
      }
    })
    
    const regionStats = Object.entries(regionBreakdown).map(([region, stats]) => ({
      region,
      totalCampaigns: stats.totalCampaigns,
      uniqueProducts: stats.products.size
    })).sort((a, b) => b.totalCampaigns - a.totalCampaigns)
    
    const response = {
      success: true,
      outdoorAdsData: processedData,
      summary: {
        totalCampaigns,
        asterasysCampaigns,
        uniqueRegions,
        uniqueMediaTypes,
        asterasysMarketShare: totalCampaigns > 0 ? ((asterasysCampaigns / totalCampaigns) * 100).toFixed(1) : '0.0'
      },
      productStats,
      regionStats
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error processing outdoor ads data:', error)
    return NextResponse.json(
      { error: 'Failed to process outdoor ads data' },
      { status: 500 }
    )
  }
}