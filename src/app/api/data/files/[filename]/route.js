import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * 파일명 기반 동적 데이터 API
 * 사용법: /api/data/files/blog_rank?month=2025-09 또는 /api/data/files/cafe_rank?month=2025-08
 * public/data/ 디렉토리에서 CSV/JSON 파일 데이터 추출하여 반환
 * 배포 환경(Vercel) 호환성을 위해 public 디렉토리 사용
 */

// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { filename } = params
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || '2025-09'

    // JSON 인사이트 파일 처리 (llm-insights, organic-viral-analysis)
    if (filename === 'llm-insights' || filename === 'organic-viral-analysis') {
      const jsonFileName = filename === 'llm-insights'
        ? `llm-insights-${month}.json`
        : 'organic-viral-analysis.json'

      const jsonFilePath = path.join(process.cwd(), 'public/data/processed', jsonFileName)

      if (!fs.existsSync(jsonFilePath)) {
        return NextResponse.json(
          {
            error: 'JSON 파일을 찾을 수 없습니다',
            filename,
            month,
            expectedPath: jsonFilePath
          },
          { status: 404 }
        )
      }

      const jsonContent = fs.readFileSync(jsonFilePath, 'utf8')
      const jsonData = JSON.parse(jsonContent)

      return NextResponse.json(jsonData)
    }

    // CSV 파일 처리
    const csvFilePath = path.join(
      process.cwd(),
      'public/data/raw',
      month,
      `asterasys_total_data - ${filename}.csv`
    )

    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json(
        {
          error: 'CSV 파일을 찾을 수 없습니다',
          month,
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
          { error: '네이버 데이터랩 파일이 비어있습니다', filename, month },
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
        month,
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
        { error: 'CSV 파일이 비어있습니다', filename, month },
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
      month,
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
  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month') || '2025-09'

  const csvFilePath = path.join(
    process.cwd(),
    'public/data/raw',
    month,
    `asterasys_total_data - ${params.filename}.csv`
  )

  return new NextResponse(null, { status: fs.existsSync(csvFilePath) ? 200 : 404 })
}
