import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'


// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const csvFilePath = path.join(process.cwd(), 'data', 'raw', 'asterasys_total_data - youtube_comments.csv')
    
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json({ error: 'YouTube comments data file not found' }, { status: 404 })
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
    
    const youtubeCommentsData = []
    let currentProduct = ''
    
    records.forEach(record => {
      const product = record['기기구분'] || record.product || ''
      const channel = record['채널'] || record.channel || ''
      const link = record['링크'] || record.link || ''
      const commentCount = parseInt(record['댓글 수'] || record.comment_count || '0')
      
      // Update current product if provided
      if (product) {
        currentProduct = product
      }
      
      // Skip if no essential data (channel and link are essential)
      if (!channel || !link || !currentProduct) return
      
      youtubeCommentsData.push({
        product: currentProduct,
        channel: channel,
        link: link,
        commentCount: commentCount
      })
    })
    
    // Add metadata
    const asterasysProducts = ['리프테라', '쿨페이즈', '쿨소닉']
    
    const processedData = youtubeCommentsData.map(item => ({
      ...item,
      isAsterasys: asterasysProducts.includes(item.product)
    }))
    
    // Calculate summary statistics
    const totalVideos = processedData.length
    const asterasysVideos = processedData.filter(item => item.isAsterasys).length
    const totalComments = processedData.reduce((sum, item) => sum + item.commentCount, 0)
    const asterasysComments = processedData.filter(item => item.isAsterasys).reduce((sum, item) => sum + item.commentCount, 0)
    const uniqueChannels = [...new Set(processedData.map(item => item.channel))].length
    
    // Product breakdown
    const productBreakdown = {}
    processedData.forEach(item => {
      if (!productBreakdown[item.product]) {
        productBreakdown[item.product] = {
          totalVideos: 0,
          totalComments: 0,
          uniqueChannels: new Set(),
          isAsterasys: asterasysProducts.includes(item.product)
        }
      }
      productBreakdown[item.product].totalVideos++
      productBreakdown[item.product].totalComments += item.commentCount
      productBreakdown[item.product].uniqueChannels.add(item.channel)
    })
    
    // Convert to array for easier handling
    const productStats = Object.entries(productBreakdown).map(([product, stats]) => ({
      product,
      totalVideos: stats.totalVideos,
      totalComments: stats.totalComments,
      uniqueChannels: stats.uniqueChannels.size,
      averageComments: stats.totalVideos > 0 ? (stats.totalComments / stats.totalVideos).toFixed(1) : '0.0',
      isAsterasys: stats.isAsterasys
    })).sort((a, b) => b.totalComments - a.totalComments)
    
    const response = {
      success: true,
      youtubeCommentsData: processedData,
      summary: {
        totalVideos,
        asterasysVideos,
        totalComments,
        asterasysComments,
        uniqueChannels,
        asterasysMarketShare: totalVideos > 0 ? ((asterasysVideos / totalVideos) * 100).toFixed(1) : '0.0',
        averageCommentsPerVideo: totalVideos > 0 ? (totalComments / totalVideos).toFixed(1) : '0.0'
      },
      productStats
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error processing YouTube comments data:', error)
    return NextResponse.json(
      { error: 'Failed to process YouTube comments data' },
      { status: 500 }
    )
  }
}