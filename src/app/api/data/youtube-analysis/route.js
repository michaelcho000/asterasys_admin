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
    const csvFilePath = path.join(monthContext.paths.generated, 'youtube_market_share.csv')
    const insightsFilePath = path.join(monthContext.paths.youtubeProcessed, 'asterasys_youtube_insights.json')
    
    // CSV 파일 존재 확인
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json(
        { 
          error: 'YouTube 분석 데이터를 찾을 수 없습니다',
          message: 'scripts/processYouTubeDataNode.js를 먼저 실행해주세요',
          month: monthContext.month,
          expectedPath: csvFilePath
        },
        { status: 404 }
      )
    }

    // CSV 데이터 파싱
    const csvContent = fs.readFileSync(csvFilePath, 'utf8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    const rankings = lines.slice(1).map((line, index) => {
      const values = line.split(',')
      
      const device = values[0]
      const category = values[1] 
      const marketRank = parseInt(values[2])
      const company = values[3]
      const isAsterasys = values[4] === 'Y'
      const videoCount = parseInt(values[5])
      const videoShare = parseFloat(values[6])
      const totalViews = parseInt(values[7])
      const viewShare = parseFloat(values[8])
      const avgViews = parseInt(values[9])
      const engagement = parseFloat(values[10])
      const channels = parseInt(values[11])
      
      // 상태 계산
      let status = '성장필요'
      if (videoCount >= 200) status = '시장지배'
      else if (videoCount >= 100) status = '경쟁우위'
      else if (videoCount >= 50) status = '안정적'
      else if (videoCount >= 10) status = '성장세'
      
      // 순위 변동 계산 (시장순위 vs YouTube순위)
      const rankChange = marketRank - (index + 1)
      
      return {
        rank: index + 1,
        device,
        category,
        marketRank,
        company,
        isAsterasys,
        videoCount,
        videoShare,
        totalViews,
        viewShare,
        avgViews,
        engagement,
        channels,
        status,
        rankChange
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

  const csvFilePath = path.join(monthContext.paths.generated, 'youtube_market_share.csv')
  return new NextResponse(null, { status: fs.existsSync(csvFilePath) ? 200 : 404 })
}
