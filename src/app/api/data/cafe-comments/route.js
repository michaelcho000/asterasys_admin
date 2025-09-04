import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'


// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const csvFilePath = path.join(process.cwd(), 'data', 'raw', 'asterasys_total_data - cafe_comments.csv')
    
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json({ error: 'Cafe comments data file not found' }, { status: 404 })
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
    
    const cafeCommentsData = []
    let currentProduct = ''
    
    records.forEach(record => {
      const product = record['기기구분'] || record.product || ''
      const workDate = record['작업일'] || record.work_date || ''
      const cafe = record['진행카페'] || record.cafe || ''
      const workURL = record['작업ULR'] || record.work_url || ''
      const nickname = record['닉네임'] || record.nickname || ''
      const commentContent = record['댓글내용'] || record.comment_content || record['카페 댓글'] || ''
      
      // Update current product if provided
      if (product) {
        currentProduct = product
      }
      
      // Skip if no essential data (URL and comment content are essential)
      if (!workURL || !commentContent || !currentProduct) return
      
      cafeCommentsData.push({
        product: currentProduct,
        workDate: workDate,
        cafe: cafe,
        workURL: workURL,
        nickname: nickname,
        commentContent: commentContent
      })
    })
    
    // Add metadata
    const asterasysProducts = ['리프테라', '쿨페이즈', '쿨소닉']
    
    const processedData = cafeCommentsData.map(item => ({
      ...item,
      isAsterasys: asterasysProducts.includes(item.product)
    }))
    
    // Calculate summary statistics
    const totalComments = processedData.length
    const asterasysComments = processedData.filter(item => item.isAsterasys).length
    const uniqueCafes = [...new Set(processedData.map(item => item.cafe))].length
    const uniqueNicknames = [...new Set(processedData.map(item => item.nickname))].length
    
    // Product breakdown
    const productBreakdown = {}
    processedData.forEach(item => {
      if (!productBreakdown[item.product]) {
        productBreakdown[item.product] = {
          totalComments: 0,
          uniqueCafes: new Set(),
          uniqueNicknames: new Set(),
          isAsterasys: asterasysProducts.includes(item.product)
        }
      }
      productBreakdown[item.product].totalComments++
      productBreakdown[item.product].uniqueCafes.add(item.cafe)
      productBreakdown[item.product].uniqueNicknames.add(item.nickname)
    })
    
    // Convert to array for easier handling
    const productStats = Object.entries(productBreakdown).map(([product, stats]) => ({
      product,
      totalComments: stats.totalComments,
      uniqueCafes: stats.uniqueCafes.size,
      uniqueNicknames: stats.uniqueNicknames.size,
      isAsterasys: stats.isAsterasys
    })).sort((a, b) => b.totalComments - a.totalComments)
    
    const response = {
      success: true,
      cafeCommentsData: processedData,
      summary: {
        totalComments,
        asterasysComments,
        uniqueCafes,
        uniqueNicknames,
        asterasysMarketShare: totalComments > 0 ? ((asterasysComments / totalComments) * 100).toFixed(1) : '0.0'
      },
      productStats
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error processing cafe comments data:', error)
    return NextResponse.json(
      { error: 'Failed to process cafe comments data' },
      { status: 500 }
    )
  }
}