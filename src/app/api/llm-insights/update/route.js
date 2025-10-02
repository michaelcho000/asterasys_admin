import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// POST: 인사이트 수정 내용 저장
export async function POST(request) {
  try {
    const updatedInsights = await request.json()

    // month가 없으면 에러
    if (!updatedInsights.month) {
      return NextResponse.json(
        { error: 'month 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    const month = updatedInsights.month

    // 월별 인사이트 파일 경로
    const INSIGHTS_FILE = path.join(
      process.cwd(),
      `data/processed/llm-insights-${month}.json`
    )

    // 기존 파일 읽기 (메타데이터 유지)
    let existingInsights = {}
    try {
      const data = await fs.readFile(INSIGHTS_FILE, 'utf-8')
      existingInsights = JSON.parse(data)
    } catch (error) {
      // 파일이 없으면 새로 생성
    }

    // 업데이트 시간 갱신
    updatedInsights.updatedAt = new Date().toISOString()

    // 승인 관련 메타데이터 제거 (편집 시 draft 상태로 변경)
    delete updatedInsights.approvedAt
    delete updatedInsights.approvedBy

    // 기존 메타데이터 유지 (generatedAt, model 등)
    const finalInsights = {
      ...existingInsights,
      ...updatedInsights,
      generatedAt: existingInsights.generatedAt || new Date().toISOString(),
      status: 'draft' // 편집된 내용은 항상 draft 상태
    }

    // 파일 저장
    await fs.writeFile(
      INSIGHTS_FILE,
      JSON.stringify(finalInsights, null, 2),
      'utf-8'
    )

    return NextResponse.json({
      success: true,
      message: '인사이트가 저장되었습니다.',
      insights: finalInsights
    })
  } catch (error) {
    console.error('인사이트 저장 오류:', error)
    return NextResponse.json(
      { error: '인사이트 저장 실패: ' + error.message },
      { status: 500 }
    )
  }
}
