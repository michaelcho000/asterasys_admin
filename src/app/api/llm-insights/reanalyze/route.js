import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

// POST: 재분석 실행
export async function POST() {
  try {
    console.log('🔄 재분석 시작...')

    // Node 스크립트 실행
    const { stdout, stderr } = await execPromise('node scripts/analyzeLLMInsights.js')

    console.log('stdout:', stdout)
    if (stderr) console.error('stderr:', stderr)

    return NextResponse.json({
      success: true,
      message: '재분석이 완료되었습니다.',
      output: stdout
    })
  } catch (error) {
    console.error('재분석 오류:', error)
    return NextResponse.json(
      {
        error: '재분석 실패: ' + error.message,
        details: error.stderr || error.stdout
      },
      { status: 500 }
    )
  }
}
