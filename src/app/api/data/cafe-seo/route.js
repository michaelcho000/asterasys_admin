import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'


// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const csvFilePath = path.join(process.cwd(), 'data', 'raw', 'asterasys_total_data - cafe_seo.csv')
    
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json({ error: 'Cafe SEO data file not found' }, { status: 404 })
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
    
    const cafeSeoData = []
    let currentProduct = ''
    
    records.forEach(record => {
      const product = record['기기구분'] || record.product || ''
      const keyword = record['키워드'] || record.keyword || ''
      const link = record['링크'] || record.link || ''
      const exposure = parseInt(record['노출현황'] || record.exposure || '0')
      const smartBlock = record['스마트블록'] || record.smart_block || ''
      const popularPost = record['인기글'] || record.popular_post || ''
      const cafeRank = record['카페순위'] || record.cafe_rank || ''
      
      // Update current product if provided
      if (product && product.trim()) {
        currentProduct = product.trim()
      }
      
      // Skip if no keyword or link (main data rows have both)
      if (!keyword || !link) return
      
      // Use the last known product if current row doesn't have one
      // If still no product, use 'Other' as fallback
      const finalProduct = currentProduct || 'Other'
      
      cafeSeoData.push({
        product: finalProduct,
        keyword: keyword.trim(),
        link: link.trim(),
        exposure: exposure,
        smartBlock: smartBlock === 'O',
        popularPost: popularPost === 'O',
        cafeRank: parseInt(cafeRank) || 0
      })
    })
    
    // Add metadata
    const asterasysProducts = ['리프테라', '쿨페이즈', '쿨소닉']
    
    const processedData = cafeSeoData.map(item => ({
      ...item,
      isAsterasys: asterasysProducts.includes(item.product)
    }))
    
    // Calculate summary statistics
    const totalEntries = processedData.length
    const asterasysEntries = processedData.filter(item => item.isAsterasys).length
    const uniqueKeywords = [...new Set(processedData.map(item => item.keyword))].length
    const totalExposures = processedData.reduce((sum, item) => sum + item.exposure, 0)
    const smartBlockCount = processedData.filter(item => item.smartBlock).length
    const popularPostCount = processedData.filter(item => item.popularPost).length
    
    // Product breakdown
    const productBreakdown = {}
    processedData.forEach(item => {
      if (!productBreakdown[item.product]) {
        productBreakdown[item.product] = {
          totalEntries: 0,
          totalExposures: 0,
          smartBlocks: 0,
          popularPosts: 0,
          uniqueKeywords: new Set(),
          isAsterasys: asterasysProducts.includes(item.product)
        }
      }
      productBreakdown[item.product].totalEntries++
      productBreakdown[item.product].totalExposures += item.exposure
      productBreakdown[item.product].smartBlocks += item.smartBlock ? 1 : 0
      productBreakdown[item.product].popularPosts += item.popularPost ? 1 : 0
      productBreakdown[item.product].uniqueKeywords.add(item.keyword)
    })
    
    // Convert to array for easier handling
    const productStats = Object.entries(productBreakdown).map(([product, stats]) => ({
      product,
      totalEntries: stats.totalEntries,
      totalExposures: stats.totalExposures,
      smartBlocks: stats.smartBlocks,
      popularPosts: stats.popularPosts,
      uniqueKeywords: stats.uniqueKeywords.size,
      isAsterasys: stats.isAsterasys
    })).sort((a, b) => b.totalExposures - a.totalExposures)
    
    const response = {
      success: true,
      cafeSeoData: processedData,
      summary: {
        totalEntries,
        asterasysEntries,
        uniqueKeywords,
        totalExposures,
        smartBlockCount,
        popularPostCount,
        asterasysMarketShare: totalEntries > 0 ? ((asterasysEntries / totalEntries) * 100).toFixed(1) : '0.0'
      },
      productStats
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error processing cafe SEO data:', error)
    return NextResponse.json(
      { error: 'Failed to process cafe SEO data' },
      { status: 500 }
    )
  }
}