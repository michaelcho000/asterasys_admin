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

    const csvFilePath = path.join(monthContext.paths.raw, 'asterasys_total_data - blog_post.csv')
    
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json(
        {
          error: 'Blog post data file not found',
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
    
    // Process data - handle empty product names and hospital names by using previous row's values
    const blogPosts = []
    let currentProduct = ''
    let currentHospital = ''
    
    records.forEach(record => {
      const product = record['기기구분'] || record.product_name || ''
      const hospital = record['병원명'] || record.hospital_name || ''
      const url = record['url'] || ''
      const totalPosts = parseInt(record['총 발행 수'] || record.total_posts || '0')
      
      // Update current product if provided
      if (product) {
        currentProduct = product
      }
      
      // Update current hospital if provided
      if (hospital) {
        currentHospital = hospital
      }
      
      // Skip if no URL (main data rows have URLs)
      if (!url || !currentProduct || !currentHospital) return
      
      blogPosts.push({
        product: currentProduct,
        hospital: currentHospital,
        url: url,
        totalPosts: totalPosts || 1 // Default to 1 if not specified
      })
    })
    
    // Add metadata
    const asterasysProducts = ['쿨페이즈', '쿨소닉', '리프테라']
    
    const processedPosts = blogPosts.map(item => ({
      ...item,
      isAsterasys: asterasysProducts.includes(item.product)
    })).sort((a, b) => a.product.localeCompare(b.product)) // Sort by product name
    
    // Calculate summary statistics
    const totalPosts = processedPosts.length
    const asterasysPosts = processedPosts.filter(item => item.isAsterasys).length
    const uniqueHospitals = [...new Set(processedPosts.map(item => item.hospital))].length
    const asterasysHospitals = [...new Set(
      processedPosts.filter(item => item.isAsterasys).map(item => item.hospital)
    )].length
    
    // Product breakdown
    const productBreakdown = {}
    processedPosts.forEach(item => {
      if (!productBreakdown[item.product]) {
        productBreakdown[item.product] = {
          totalPosts: 0,
          uniqueHospitals: new Set(),
          isAsterasys: asterasysProducts.includes(item.product)
        }
      }
      productBreakdown[item.product].totalPosts++
      productBreakdown[item.product].uniqueHospitals.add(item.hospital)
    })
    
    // Convert to array for easier handling
    const productStats = Object.entries(productBreakdown).map(([product, stats]) => ({
      product,
      totalPosts: stats.totalPosts,
      uniqueHospitals: stats.uniqueHospitals.size,
      isAsterasys: stats.isAsterasys
    })).sort((a, b) => b.totalPosts - a.totalPosts)
    
    const response = {
      success: true,
      blogPosts: processedPosts,
      summary: {
        totalPosts,
        asterasysPosts,
        uniqueHospitals,
        asterasysHospitals,
        asterasysMarketShare: totalPosts > 0 ? ((asterasysPosts / totalPosts) * 100).toFixed(1) : '0.0',
        averagePostsPerHospital: uniqueHospitals > 0 ? (totalPosts / uniqueHospitals).toFixed(1) : '0.0'
      },
      productStats,
      meta: {
        month: monthContext.month,
        source: path.relative(process.cwd(), csvFilePath),
        updatedAt: new Date().toISOString()
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error processing blog post data:', error)
    return NextResponse.json(
      { error: 'Failed to process blog post data' },
      { status: 500 }
    )
  }
}
