import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * 파일명 기반 동적 데이터 API
 * 사용법: /api/data/files/blog_rank 또는 /api/data/files/cafe_rank
 * 실제 CSV 파일에서 직접 데이터 추출하여 반환
 */

export async function GET(request, { params }) {
  try {
    const { filename } = params
    
    // CSV 파일 경로 구성
    const csvFilePath = path.join(
      process.cwd(), 
      'data', 
      'raw', 
      `asterasys_total_data - ${filename}.csv`
    )
    
    // 파일 존재 확인
    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json(
        { 
          error: 'CSV 파일을 찾을 수 없습니다',
          filename: filename,
          expectedPath: csvFilePath
        },
        { status: 404 }
      )
    }

    // CSV 파일 읽기
    const csvContent = fs.readFileSync(csvFilePath, 'utf8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      return NextResponse.json(
        { error: 'CSV 파일이 비어있습니다', filename: filename },
        { status: 400 }
      )
    }

    // 헤더와 데이터 분리 (따옴표로 감싼 쉼표 포함 숫자 처리)
    const headers = lines[0].split(',').map(h => h.trim())
    const data = lines.slice(1).map(line => {
      // CSV 파싱: 따옴표로 감싼 부분은 하나의 필드로 처리
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
      values.push(currentValue.trim()) // 마지막 값 추가
      
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || null
      })
      return row
    })

    // Asterasys 제품 필터링 (쿨페이즈, 리프테라, 쿨소닉)
    const asterasysData = data.filter(row => 
      row.키워드?.includes('쿨페이즈') || 
      row.키워드?.includes('리프테라') || 
      row.키워드?.includes('쿨소닉') ||
      row.기기구분?.includes('쿨페이즈') || 
      row.기기구분?.includes('리프테라') || 
      row.기기구분?.includes('쿨소닉')
    )

    // 전체 시장 데이터도 포함
    const marketData = data

    return NextResponse.json({
      success: true,
      filename: filename,
      headers: headers,
      asterasysData: asterasysData,
      marketData: marketData,
      dataCount: {
        asterasys: asterasysData.length,
        market: marketData.length
      },
      lastUpdated: new Date().toISOString(),
      source: `asterasys_total_data - ${filename}.csv`
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
  // 파일 존재 여부만 확인
  const { filename } = params
  const csvFilePath = path.join(
    process.cwd(), 
    'data', 
    'raw', 
    `asterasys_total_data - ${filename}.csv`
  )
  
  if (fs.existsSync(csvFilePath)) {
    return new NextResponse(null, { status: 200 })
  } else {
    return new NextResponse(null, { status: 404 })
  }
}