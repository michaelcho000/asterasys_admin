import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'


// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const csvFilePath = path.join(process.cwd(), 'data', 'raw', 'asterasys_total_data - bloger_Post.csv')
    
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json({ error: 'Blogger post data file not found' }, { status: 404 })
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
    
    // Process data - handle empty product names by using previous row's product
    const experiencePosts = []
    let currentProduct = ''
    
    records.forEach(record => {
      const product = record['기기구분'] || record.product_name || ''
      const hospital = record['병원명'] || record.hospital_name || ''
      const url = record['url'] || ''
      const postDate = record['포스팅 날짜'] || record.post_date || ''
      
      // Skip header or invalid records
      if (!hospital || !url || !postDate) return
      
      // Use current product or previous product if empty
      if (product) {
        currentProduct = product
      }
      
      if (!currentProduct) return
      
      experiencePosts.push({
        product: currentProduct,
        hospital: hospital,
        url: url,
        postDate: postDate
      })
    })
    
    // Add metadata
    const asterasysProducts = ['쿨페이즈', '쿨소닉', '리프테라']
    
    const processedPosts = experiencePosts.map(item => ({
      ...item,
      isAsterasys: asterasysProducts.includes(item.product)
    }))
    
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
      experiencePosts: processedPosts.sort((a, b) => {
        // Default sort by date descending
        const aDate = new Date(2025, parseInt(a.postDate.split('/')[0]) - 1, parseInt(a.postDate.split('/')[1]))
        const bDate = new Date(2025, parseInt(b.postDate.split('/')[0]) - 1, parseInt(b.postDate.split('/')[1]))
        return bDate - aDate
      }),
      summary: {
        totalPosts,
        asterasysPosts,
        uniqueHospitals,
        asterasysHospitals,
        asterasysMarketShare: totalPosts > 0 ? ((asterasysPosts / totalPosts) * 100).toFixed(1) : '0.0',
        averagePostsPerHospital: uniqueHospitals > 0 ? (totalPosts / uniqueHospitals).toFixed(1) : '0.0'
      },
      productStats
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error processing experience post data:', error)
    return NextResponse.json(
      { error: 'Failed to process experience post data' },
      { status: 500 }
    )
  }
}