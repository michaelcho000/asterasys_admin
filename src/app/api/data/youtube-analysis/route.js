import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { resolveRequestMonth } from '@/lib/server/requestMonth'

/**
 * YouTube 분석 데이터 API
 * 처리된 YouTube 시장 분석 데이터 제공
 */


// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const monthContext = resolveRequestMonth(request, { required: ['generated', 'youtubeProcessed'] })

    if (monthContext.error) {
      return NextResponse.json({ error: monthContext.error.message }, { status: 400 })
    }

    if (!monthContext.ok) {
      return NextResponse.json(
        {
          error: '월별 YouTube 분석 데이터를 찾을 수 없습니다',
          month: monthContext.month,
          missing: monthContext.missing
        },
        { status: 404 }
      )
    }

    // YouTube 분석 데이터 파일 경로들
    const csvFilePath = path.join(monthContext.paths.generated, 'youtube_products.csv')
    const insightsFilePath = path.join(monthContext.paths.youtubeProcessed, 'asterasys_youtube_insights.json')
    
    // CSV 파일 존재 확인
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json(
        {
          error: 'YouTube 분석 데이터를 찾을 수 없습니다',
          message: 'npm run youtube:process -- --month=YYYY-MM 을 먼저 실행해주세요',
          month: monthContext.month,
          expectedPath: csvFilePath
        },
        { status: 404 }
      )
    }

    // CSV 데이터 파싱 (youtube_products.csv 포맷)
    // Headers: product,brand,category,videos,views,likes,comments,views_avg,likes_avg,comments_avg,engagement_rate,shorts_ratio,views_median,views_p90,sov_posts,sov_views
    const csvContent = fs.readFileSync(csvFilePath, 'utf8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')

    const rankings = lines.slice(1).map((line, index) => {
      const values = line.split(',')

      const device = values[0]  // product name
      const brand = values[1]  // competitor or asterasys
      const category = values[2]  // RF or HIFU
      const videoCount = parseInt(values[3])
      const totalViews = parseInt(values[4])
      const likes = parseInt(values[5])
      const comments = parseInt(values[6])
      const avgViews = parseFloat(values[7])
      const engagement = parseFloat(values[10])  // engagement_rate
      const shortsRatio = parseFloat(values[11])
      const videoShare = parseFloat(values[14])  // sov_posts
      const viewShare = parseFloat(values[15])  // sov_views

      const isAsterasys = brand === 'asterasys'

      // 상태 계산
      let status = '성장필요'
      if (videoCount >= 200) status = '시장지배'
      else if (videoCount >= 100) status = '경쟁우위'
      else if (videoCount >= 50) status = '안정적'
      else if (videoCount >= 10) status = '성장세'

      return {
        rank: index + 1,
        device,
        category,
        company: device,  // product name as company for compatibility
        isAsterasys,
        videoCount,
        videoShare: videoShare * 100,  // convert to percentage
        totalViews,
        viewShare: viewShare * 100,  // convert to percentage
        avgViews: Math.round(avgViews),
        engagement: engagement * 100,  // convert to percentage
        likes,
        comments,
        shortsRatio: shortsRatio * 100,  // convert to percentage
        status
      }
    })

    // Asterasys 인사이트 데이터 로드 (있다면)
    let asterasysInsights = null
    if (fs.existsSync(insightsFilePath)) {
      const insightsContent = fs.readFileSync(insightsFilePath, 'utf8')
      asterasysInsights = JSON.parse(insightsContent)
    }

    // 요약 통계 계산
    const totalVideos = rankings.reduce((sum, r) => sum + r.videoCount, 0)
    const totalViews = rankings.reduce((sum, r) => sum + r.totalViews, 0)
    const asterasysData = rankings.filter(r => r.isAsterasys)
    const asterasysVideos = asterasysData.reduce((sum, r) => sum + r.videoCount, 0)
    const asterasysViews = asterasysData.reduce((sum, r) => sum + r.totalViews, 0)
    
    const summary = {
      totalVideos,
      totalViews,
      totalChannels: rankings.reduce((sum, r) => sum + r.channels, 0),
      asterasysVideos,
      asterasysViews,
      asterasysShare: ((asterasysVideos / totalVideos) * 100).toFixed(2),
      asterasysViewShare: ((asterasysViews / totalViews) * 100).toFixed(2),
      topDevice: rankings[0].device,
      topAsterasysDevice: asterasysData.sort((a, b) => b.videoCount - a.videoCount)[0]?.device || 'N/A'
    }

    // 카테고리별 분석
    const categoryAnalysis = {
      RF: rankings.filter(r => r.category === 'RF'),
      HIFU: rankings.filter(r => r.category === 'HIFU')
    }

    const response = {
      success: true,
      summary,
      rankings,
      categoryAnalysis,
      asterasysInsights,
      metadata: {
        lastUpdated: new Date().toISOString(),
        recordCount: rankings.length,
        dataSource: path.relative(process.cwd(), csvFilePath),
        insightsSource: fs.existsSync(insightsFilePath) ? path.relative(process.cwd(), insightsFilePath) : null,
        month: monthContext.month
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('YouTube 분석 API 오류:', error)
    return NextResponse.json(
      { 
        error: 'YouTube 분석 데이터 처리 실패', 
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function HEAD(request) {
  const monthContext = resolveRequestMonth(request, { required: ['generated'] })

  if (!monthContext.ok) {
    return new NextResponse(null, { status: 404 })
  }

  const csvFilePath = path.join(monthContext.paths.generated, 'youtube_products.csv')
  return new NextResponse(null, { status: fs.existsSync(csvFilePath) ? 200 : 404 })
}
