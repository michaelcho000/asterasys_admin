import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const INSIGHTS_FILE = path.join(process.cwd(), 'data/processed/llm-insights.json')

// GET: 인사이트 조회
export async function GET() {
  try {
    const data = await fs.readFile(INSIGHTS_FILE, 'utf-8')
    const insights = JSON.parse(data)
    return NextResponse.json(insights)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: '인사이트 파일이 없습니다. 먼저 분석을 실행해주세요.' },
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
    const updatedInsights = await request.json()

    // 업데이트 시간 갱신
    updatedInsights.updatedAt = new Date().toISOString()

    // 파일 저장
    await fs.writeFile(
      INSIGHTS_FILE,
      JSON.stringify(updatedInsights, null, 2),
      'utf-8'
    )

    return NextResponse.json({
      success: true,
      message: '인사이트가 업데이트되었습니다.'
    })
  } catch (error) {
    return NextResponse.json(
      { error: '인사이트 저장 실패: ' + error.message },
      { status: 500 }
    )
  }
}
