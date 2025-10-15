import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { resolveRequestMonth } from '@/lib/server/requestMonth'


// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
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

    const csvFilePath = path.join(monthContext.paths.raw, 'asterasys_total_data - ott.csv')
    console.log('Looking for file at:', csvFilePath)
    
    if (!fs.existsSync(csvFilePath)) {
      console.log('File not found at:', csvFilePath)
      return NextResponse.json(
        { error: 'OTT data file not found', month: monthContext.month, expectedPath: csvFilePath },
        { status: 404 }
      )
    }
    
    console.log('File found, processing...')
    
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
    
    console.log('Total records parsed:', records.length)
    console.log('First record:', records[0])
    
    records.forEach((record, index) => {
      const product = record['기기'] || record.product || ''  // '기기구분' → '기기'로 변경
      const region = record['지역'] || record.region || ''
      const mediaName = record['매체명'] || record.media_name || ''
      const mediaLocation = record['매체 위치'] || record.media_location || ''
      const mediaType = record['매체 유형'] || record.media_type || ''
      const quantity = record['수량'] || record.quantity || ''
      const dailyBroadcast = record['1일 송출횟수'] || record.daily_broadcast || ''
      const period = record['기간'] || record.period || ''
      const adPeriod = record['광고기간'] || record.ad_period || ''
      
      if (index < 3) {
        console.log(`Record ${index}:`, { product, region, mediaName, mediaLocation })
      }
      
      // Update current product if provided (첫 번째 행에서 제품명 설정)
      if (product && product.trim()) {
        currentProduct = product.trim()
      }
      
      // 첫 번째 행에서 currentProduct를 설정하지 못한 경우 기본값으로 설정
      if (!currentProduct && index === 0) {
        currentProduct = '쿨페이즈'  // CSV 데이터 기준 첫 번째 제품
      }
      
      // Skip if no essential data (mediaName is essential)
      if (!mediaName || !currentProduct) {
        if (index < 3) console.log(`Skipping record ${index}: mediaName='${mediaName}', currentProduct='${currentProduct}'`)
        return
      }
      
      outdoorAdsData.push({
        product: currentProduct,
        region: region,
        mediaName: mediaName,
        mediaLocation: mediaLocation,
        mediaType: mediaType,
        quantity: quantity,
        dailyBroadcast: dailyBroadcast,
        period: period,
        adPeriod: adPeriod
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
      regionStats,
      meta: {
        month: monthContext.month,
        source: path.relative(process.cwd(), csvFilePath),
        updatedAt: new Date().toISOString()
      }
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
