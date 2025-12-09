import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// GET: 인사이트 조회 (월별, 상태별)
export async function GET(request) {
  try {
    // URL에서 파라미터 추출
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || '2025-09' // 기본값: 2025-09
    const mode = searchParams.get('mode') // 'admin' 또는 null

    // 월별 인사이트 파일 경로
    const INSIGHTS_FILE = path.join(process.cwd(), `data/processed/llm-insights-${month}.json`)

    const data = await fs.readFile(INSIGHTS_FILE, 'utf-8')
    const insights = JSON.parse(data)

    // 일반 사용자: approved 상태만 반환
    if (mode !== 'admin' && insights.status !== 'approved') {
      return NextResponse.json(
        { error: '승인된 인사이트가 없습니다.' },
        { status: 404 }
      )
    }

    // 관리자 모드: 모든 상태 반환
    return NextResponse.json(insights)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: `${searchParams.get('month')} 인사이트 파일이 없습니다. 먼저 분석을 실행해주세요.` },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: '인사이트 로드 실패: ' + error.message },
      { status: 500 }
    )
  }
}

// PUT: 인사이트 업데이트 (승인/수정)
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || '2025-11'

    const updatedInsights = await request.json()

    // 업데이트 시간 갱신
    updatedInsights.updatedAt = new Date().toISOString()

    // 월별 파일 경로
    const INSIGHTS_FILE = path.join(process.cwd(), `data/processed/llm-insights-${month}.json`)
    const PUBLIC_FILE = path.join(process.cwd(), `public/data/processed/llm-insights-${month}.json`)

    // 파일 저장 (data 폴더)
    await fs.writeFile(
      INSIGHTS_FILE,
      JSON.stringify(updatedInsights, null, 2),
      'utf-8'
    )

    // public 폴더에도 저장
    await fs.writeFile(
      PUBLIC_FILE,
      JSON.stringify(updatedInsights, null, 2),
      'utf-8'
    )

    return NextResponse.json({
      success: true,
      message: `${month} 인사이트가 업데이트되었습니다.`
    })
  } catch (error) {
    return NextResponse.json(
      { error: '인사이트 저장 실패: ' + error.message },
      { status: 500 }
    )
  }
}
