import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { resolveRequestMonth } from '@/lib/server/requestMonth'

/**
 * 파일명 기반 동적 데이터 API
 * 사용법: /api/data/files/blog_rank 또는 /api/data/files/cafe_rank
 * 실제 CSV 파일에서 직접 데이터 추출하여 반환
 */

// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { filename } = params
    const monthContext = resolveRequestMonth(request, { required: ['raw'] })

    if (monthContext.error) {
      return NextResponse.json(
        { error: monthContext.error.message },
        { status: 400 }
      )
    }

    if (!monthContext.ok) {
      return NextResponse.json(
        {
          error: '월별 원본 데이터 폴더를 찾을 수 없습니다',
          month: monthContext.month,
          missing: monthContext.missing
        },
        { status: 404 }
      )
    }

    const csvFilePath = path.join(
      monthContext.paths.raw,
      `asterasys_total_data - ${filename}.csv`
    )

    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json(
        {
          error: 'CSV 파일을 찾을 수 없습니다',
          month: monthContext.month,
          filename,
          expectedPath: csvFilePath
        },
        { status: 404 }
      )
    }

    const csvContent = fs.readFileSync(csvFilePath, 'utf8')

    if (filename === 'naver datalab') {
      const lines = csvContent.split('\n')
      const dataLines = lines.slice(6)

      if (dataLines.length === 0) {
        return NextResponse.json(
          { error: '네이버 데이터랩 파일이 비어있습니다', filename, month: monthContext.month },
          { status: 400 }
        )
      }

      const headers = ['날짜', '리프테라', '쿨페이즈', '쿨소닉']
      const marketData = []

      for (let i = 1; i < dataLines.length; i++) {
        const line = dataLines[i].trim()
        if (!line) continue

        const cols = line.split(',')
        if (cols.length >= 6) {
          marketData.push({
            날짜: cols[0],
            리프테라: parseFloat(cols[1]) || 0,
            쿨페이즈: parseFloat(cols[3]) || 0,
            쿨소닉: parseFloat(cols[5]) || 0
          })
        }
      }

      return NextResponse.json({
        success: true,
        filename,
        month: monthContext.month,
        headers,
        asterasysData: marketData,
        marketData,
        dataCount: {
          asterasys: marketData.length,
          market: marketData.length
        },
        lastUpdated: new Date().toISOString(),
        source: path.relative(process.cwd(), csvFilePath)
      })
    }

    const lines = csvContent.split('\n').filter((line) => line.trim())

    if (lines.length === 0) {
      return NextResponse.json(
        { error: 'CSV 파일이 비어있습니다', filename, month: monthContext.month },
        { status: 400 }
      )
    }

    const headers = lines[0].split(',').map((h) => h.trim())
    const data = lines.slice(1).map((line) => {
      const values = []
      let currentValue = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim())
          currentValue = ''
        } else {
          currentValue += char
        }
      }
      values.push(currentValue.trim())

      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || null
      })
      return row
    })

    const asterasysData = data.filter((row) =>
      row.키워드?.includes('쿨페이즈') ||
      row.키워드?.includes('리프테라') ||
      row.키워드?.includes('쿨소닉') ||
      row.기기구분?.includes('쿨페이즈') ||
      row.기기구분?.includes('리프테라') ||
      row.기기구분?.includes('쿨소닉')
    )

    const marketData = data

    return NextResponse.json({
      success: true,
      filename,
      month: monthContext.month,
      headers,
      asterasysData,
      marketData,
      dataCount: {
        asterasys: asterasysData.length,
        market: marketData.length
      },
      lastUpdated: new Date().toISOString(),
      source: path.relative(process.cwd(), csvFilePath)
    })

  } catch (error) {
    console.error('CSV API Error:', error)
    return NextResponse.json(
      {
        error: 'CSV 데이터 처리 실패',
        details: error.message,
        filename: params?.filename
      },
      { status: 500 }
    )
  }
}

export async function HEAD(request, { params }) {
  const monthContext = resolveRequestMonth(request, { required: ['raw'] })

  if (!monthContext.ok) {
    return new NextResponse(null, { status: 404 })
  }

  const csvFilePath = path.join(
    monthContext.paths.raw,
    `asterasys_total_data - ${params.filename}.csv`
  )

  return new NextResponse(null, { status: fs.existsSync(csvFilePath) ? 200 : 404 })
}
