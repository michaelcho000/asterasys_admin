import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// GET: 월별 인사이트 조회
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || '2025-09'

    const insightsFile = path.join(process.cwd(), `data/processed/llm-insights-${month}.json`)

    const data = await fs.readFile(insightsFile, 'utf-8')
    const insights = JSON.parse(data)
    return NextResponse.json(insights)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: `해당 월의 인사이트 파일이 없습니다. 먼저 분석을 실행해주세요: npm run analyze-insights-enhanced ${request.nextUrl.searchParams.get('month') || '2025-09'}` },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: '인사이트 로드 실패: ' + error.message },
      { status: 500 }
    )
  }
}
