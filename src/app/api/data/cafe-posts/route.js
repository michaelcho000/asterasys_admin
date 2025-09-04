import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'


// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const csvFilePath = path.join(process.cwd(), 'data', 'raw', 'asterasys_total_data - cafe_post.csv')
    
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json({ error: 'Cafe posts data file not found' }, { status: 404 })
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
    
    const cafePostsData = []
    let currentProduct = ''
    
    records.forEach(record => {
      const product = record['기기구분'] || record.product || ''
      const workDate = record['작업일'] || record.work_date || ''
      const cafe = record['진행카페'] || record.cafe || ''
      const workURL = record['작업ULR'] || record.work_url || ''
      const nickname = record['닉네임'] || record.nickname || ''
      
      // Update current product if provided
      if (product) {
        currentProduct = product
      }
      
      // Skip if no essential data (URL and nickname are essential)
      if (!workURL || !nickname || !currentProduct) return
      
      cafePostsData.push({
        product: currentProduct,
        workDate: workDate,
        cafe: cafe,
        workURL: workURL,
        nickname: nickname
      })
    })
    
    // Add metadata
    const asterasysProducts = ['리프테라', '쿨페이즈', '쿨소닉']
    
    const processedData = cafePostsData.map(item => ({
      ...item,
      isAsterasys: asterasysProducts.includes(item.product)
    }))
    
    // Calculate summary statistics
    const totalPosts = processedData.length
    const asterasysPosts = processedData.filter(item => item.isAsterasys).length
    const uniqueCafes = [...new Set(processedData.map(item => item.cafe))].length
    const uniqueNicknames = [...new Set(processedData.map(item => item.nickname))].length
    
    // Product breakdown
    const productBreakdown = {}
    processedData.forEach(item => {
      if (!productBreakdown[item.product]) {
        productBreakdown[item.product] = {
          totalPosts: 0,
          uniqueCafes: new Set(),
          uniqueNicknames: new Set(),
          isAsterasys: asterasysProducts.includes(item.product)
        }
      }
      productBreakdown[item.product].totalPosts++
      productBreakdown[item.product].uniqueCafes.add(item.cafe)
      productBreakdown[item.product].uniqueNicknames.add(item.nickname)
    })
    
    // Convert to array for easier handling
    const productStats = Object.entries(productBreakdown).map(([product, stats]) => ({
      product,
      totalPosts: stats.totalPosts,
      uniqueCafes: stats.uniqueCafes.size,
      uniqueNicknames: stats.uniqueNicknames.size,
      isAsterasys: stats.isAsterasys
    })).sort((a, b) => b.totalPosts - a.totalPosts)
    
    const response = {
      success: true,
      cafePostsData: processedData,
      summary: {
        totalPosts,
        asterasysPosts,
        uniqueCafes,
        uniqueNicknames,
        asterasysMarketShare: totalPosts > 0 ? ((asterasysPosts / totalPosts) * 100).toFixed(1) : '0.0'
      },
      productStats
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error processing cafe posts data:', error)
    return NextResponse.json(
      { error: 'Failed to process cafe posts data' },
      { status: 500 }
    )
  }
}