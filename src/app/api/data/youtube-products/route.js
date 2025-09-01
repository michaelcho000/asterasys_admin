import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * YouTube 제품 데이터 API
 * 18개 제품 상세 분석 데이터 제공
 */

export async function GET(request) {
  try {
    // YouTube 제품 데이터 CSV 파일 경로
    const csvFilePath = path.join(process.cwd(), 'data', 'processed', 'youtube_products.csv')
    
    // 파일 존재 확인
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json(
        { 
          error: 'YouTube 제품 데이터를 찾을 수 없습니다',
          message: 'youtube_products.csv 파일이 필요합니다'
        },
        { status: 404 }
      )
    }

    // CSV 파일 읽기 및 파싱
    const csvContent = fs.readFileSync(csvFilePath, 'utf8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    const products = lines.slice(1).map((line, index) => {
      const values = line.split(',')
      const product = {}
      
      headers.forEach((header, idx) => {
        const value = values[idx]
        
        // 숫자 필드 변환
        if (['videos', 'views', 'likes', 'comments', 'views_avg', 'likes_avg', 'comments_avg'].includes(header)) {
          product[header] = parseInt(value) || 0
        } else if (['engagement_rate', 'shorts_ratio', 'views_median', 'views_p90', 'sov_posts', 'sov_views'].includes(header)) {
          product[header] = parseFloat(value) || 0
        } else {
          product[header] = value
        }
      })
      
      // YouTube 순위 추가 (조회수 기준 정렬 후)
      return product
    })

    // 조회수 기준 정렬
    const sortedProducts = products.sort((a, b) => b.views - a.views)
    
    // 순위 추가
    const rankedProducts = sortedProducts.map((product, index) => ({
      ...product,
      rank: index + 1,
      isAsterasys: product.brand === 'asterasys'
    }))

    // 요약 통계
    const summary = {
      totalProducts: rankedProducts.length,
      totalVideos: rankedProducts.reduce((sum, p) => sum + p.videos, 0),
      totalViews: rankedProducts.reduce((sum, p) => sum + p.views, 0),
      totalLikes: rankedProducts.reduce((sum, p) => sum + p.likes, 0),
      totalComments: rankedProducts.reduce((sum, p) => sum + p.comments, 0),
      asterasysProducts: rankedProducts.filter(p => p.isAsterasys).length,
      asterasysVideos: rankedProducts.filter(p => p.isAsterasys).reduce((sum, p) => sum + p.videos, 0),
      asterasysViews: rankedProducts.filter(p => p.isAsterasys).reduce((sum, p) => sum + p.views, 0),
      asterasysShare: ((rankedProducts.filter(p => p.isAsterasys).reduce((sum, p) => sum + p.videos, 0) / rankedProducts.reduce((sum, p) => sum + p.videos, 0)) * 100).toFixed(2)
    }

    const response = {
      success: true,
      products: rankedProducts,
      summary,
      metadata: {
        lastUpdated: new Date().toISOString(),
        dataSource: 'youtube_products.csv',
        recordCount: rankedProducts.length
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('YouTube 제품 API 오류:', error)
    return NextResponse.json(
      { 
        error: 'YouTube 제품 데이터 처리 실패', 
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function HEAD(request) {
  const csvFilePath = path.join(process.cwd(), 'data', 'processed', 'youtube_products.csv')
  
  if (fs.existsSync(csvFilePath)) {
    return new NextResponse(null, { status: 200 })
  } else {
    return new NextResponse(null, { status: 404 })
  }
}