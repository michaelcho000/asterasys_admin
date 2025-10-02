import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// POST: 인사이트 승인
export async function POST(request) {
  try {
    const body = await request.json()
    const { month } = body

    if (!month) {
      return NextResponse.json(
        { error: 'month 파라미터가 필요합니다.' },
        { status: 400 }
      )
    }

    // 월별 인사이트 파일 경로
    const INSIGHTS_FILE = path.join(process.cwd(), `data/processed/llm-insights-${month}.json`)

    // 파일 읽기
    const data = await fs.readFile(INSIGHTS_FILE, 'utf-8')
    const insights = JSON.parse(data)

    // 이미 승인된 경우
    if (insights.status === 'approved') {
      return NextResponse.json({
        success: true,
        message: '이미 승인된 인사이트입니다.',
        insights
      })
    }

    // 승인 처리
    insights.status = 'approved'
    insights.approvedAt = new Date().toISOString()
    insights.approvedBy = 'admin' // TODO: 실제 사용자 정보로 교체

    // 파일 저장
    await fs.writeFile(
      INSIGHTS_FILE,
      JSON.stringify(insights, null, 2),
      'utf-8'
    )

    return NextResponse.json({
      success: true,
      message: `${month} 인사이트가 승인되었습니다.`,
      insights
    })
  } catch (error) {
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: '인사이트 파일이 없습니다.' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: '승인 처리 실패: ' + error.message },
      { status: 500 }
    )
  }
}
