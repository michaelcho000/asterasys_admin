import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * YouTube vs 판매량 정확한 1:1 매칭 데이터 API
 */

export async function GET(request) {
  try {
    // 정확한 매칭 데이터 파일 로드
    const matchingFilePath = path.join(process.cwd(), 'data', 'processed', 'youtube', 'youtube_sales_exact_matching.json')
    
    // 파일이 없으면 실시간 생성
    if (!fs.existsSync(matchingFilePath)) {
      return NextResponse.json(
        { 
          error: '매칭 데이터를 찾을 수 없습니다',
          message: 'scripts/processYoutubeSalesMatching.js를 먼저 실행해주세요'
        },
        { status: 404 }
      )
    }

    // 매칭 데이터 로드
    const matchingContent = fs.readFileSync(matchingFilePath, 'utf8')
    const matchingData = JSON.parse(matchingContent)

    const response = {
      success: true,
      products: matchingData.ALL || [],
      categories: {
        ALL: matchingData.ALL || [],
        RF: matchingData.RF || [],
        HIFU: matchingData.HIFU || []
      },
      asterasysProducts: matchingData.asterasysProducts || [],
      summary: matchingData.summary || {},
      insights: {
        dataNote: 'YouTube: 2025년 8월 성과 | 판매량: 누적 데이터',
        matchingNote: '1:1 정확 매칭 (Sale 데이터 있는 제품만)',
        youtubeScoreFormula: '조회수(40%) + 영상수(25%) + 좋아요(20%) + 댓글(15%)',
        efficiencyFormula: '판매량 / YouTube종합점수 × 100'
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalMatched: matchingData.summary?.totalMatched || 0,
        totalUnmatched: matchingData.summary?.totalUnmatched || 0,
        asterasysCount: matchingData.summary?.asterasysCount || 0
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('YouTube-Sales 매칭 API 오류:', error)
    return NextResponse.json(
      { 
        error: 'YouTube-Sales 매칭 데이터 처리 실패', 
        details: error.message
      },
      { status: 500 }
    )
  }
}

function getPerformanceType(views, sales) {
  const highViews = views > 50000
  const highSales = sales > 400
  
  if (highViews && highSales) return { type: '마케팅성공', color: 'success' }
  if (!highViews && highSales) return { type: '전통강세', color: 'primary' }
  if (highViews && !highSales) return { type: 'YouTube잠재', color: 'warning' }
  return { type: '개선필요', color: 'secondary' }
}

function getAsterasysAvgEfficiency(asterasysProducts) {
  if (asterasysProducts.length === 0) return 0
  return (asterasysProducts.reduce((sum, p) => sum + p.efficiencyIndex, 0) / asterasysProducts.length).toFixed(1)
}

function generateInsights(products) {
  const asterasysProducts = products.filter(p => p.isAsterasys)
  const bestEfficiency = products.sort((a, b) => b.efficiencyIndex - a.efficiencyIndex)[0]
  const worstEfficiency = products.sort((a, b) => a.efficiencyIndex - b.efficiencyIndex)[0]
  
  return {
    bestPerformer: bestEfficiency,
    worstPerformer: worstEfficiency,
    asterasysPosition: {
      best: asterasysProducts.sort((a, b) => b.efficiencyIndex - a.efficiencyIndex)[0],
      worst: asterasysProducts.sort((a, b) => a.efficiencyIndex - b.efficiencyIndex)[0]
    },
    recommendation: generateRecommendation(asterasysProducts)
  }
}

function generateRecommendation(asterasysProducts) {
  const highEfficiency = asterasysProducts.filter(p => p.efficiencyIndex > 100)
  const lowEfficiency = asterasysProducts.filter(p => p.efficiencyIndex < 50)
  
  if (highEfficiency.length > 0) {
    return `${highEfficiency[0].product} 모델로 다른 제품 마케팅 확대`
  }
  if (lowEfficiency.length > 0) {
    return `${lowEfficiency[0].product} YouTube 마케팅 집중 투자 필요`
  }
  return 'YouTube 마케팅 전반적 강화 필요'
}