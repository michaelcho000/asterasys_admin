import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { resolveRequestMonth } from '@/lib/server/requestMonth'

/**
 * YouTube 채널 데이터 API
 * Asterasys 제품별 상위 채널 데이터 제공
 */


// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const monthContext = resolveRequestMonth(request, { required: ['youtubeProcessed'] })

    if (monthContext.error) {
      return NextResponse.json({ error: monthContext.error.message }, { status: 400 })
    }

    if (!monthContext.ok) {
      return NextResponse.json(
        {
          error: '월별 YouTube 채널 데이터를 찾을 수 없습니다',
          month: monthContext.month,
          missing: monthContext.missing
        },
        { status: 404 }
      )
    }

    // YouTube 채널 데이터 파일 경로
    const channelsFilePath = path.join(monthContext.paths.youtubeProcessed, 'asterasys_channels_data.json')
    
    // 파일 존재 확인
    if (!fs.existsSync(channelsFilePath)) {
      return NextResponse.json(
        { 
          error: 'YouTube 채널 데이터를 찾을 수 없습니다',
          message: 'scripts/extractAsterasysChannels.js를 먼저 실행해주세요',
          month: monthContext.month,
          expectedPath: channelsFilePath
        },
        { status: 404 }
      )
    }

    // JSON 파일 읽기
    const channelsContent = fs.readFileSync(channelsFilePath, 'utf8')
    const channelsData = JSON.parse(channelsContent)

    const response = {
      success: true,
      data: channelsData,
      metadata: {
        lastUpdated: new Date().toISOString(),
        dataSource: path.relative(process.cwd(), channelsFilePath),
        products: Object.keys(channelsData),
        totalProducts: Object.keys(channelsData).length,
        month: monthContext.month
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('YouTube 채널 API 오류:', error)
    return NextResponse.json(
      { 
        error: 'YouTube 채널 데이터 처리 실패', 
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function HEAD(request) {
  const monthContext = resolveRequestMonth(request, { required: ['youtubeProcessed'] })

  if (!monthContext.ok) {
    return new NextResponse(null, { status: 404 })
  }

  const channelsFilePath = path.join(monthContext.paths.youtubeProcessed, 'asterasys_channels_data.json')
  return new NextResponse(null, { status: fs.existsSync(channelsFilePath) ? 200 : 404 })
}
