import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { resolveRequestMonth } from '@/lib/server/requestMonth'

/**
 * Dynamic Organic vs Managed Viral Analysis API
 * Calculates in real-time from CSV data
 * Formula: Organic = Hospital Blogs + Hospital News
 *          Managed = General Blogs + Corporate News + Cafe
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Parse CSV helper
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n')
  if (lines.length === 0) return []

  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const values = line.split(',')
    const obj = {}
    headers.forEach((header, i) => {
      obj[header] = values[i]?.trim() || ''
    })
    return obj
  })
}

function analyzeProduct(keyword, blogRows, newsRows, cafeRows) {
  // 1. Blog data (hospital vs general)
  const blogItems = blogRows.filter(r => r['키워드'] === keyword)
  const hospitalBlogs = blogItems
    .filter(r => r['블로그유형'] === '병원블로그')
    .reduce((sum, r) => sum + parseInt(r['총 개수'] || 0), 0)
  const generalBlogs = blogItems
    .filter(r => r['블로그유형'] === '일반블로그')
    .reduce((sum, r) => sum + parseInt(r['총 개수'] || 0), 0)

  // 2. News data (hospital vs corporate)
  const newsItem = newsRows.find(r => r['product_name'] === keyword)
  const totalNews = parseInt(newsItem?.['total_articles'] || 0)
  const hospitalNewsPercent = parseFloat(newsItem?.['category_병원발행'] || 0)
  const corporateNewsPercent = parseFloat(newsItem?.['category_기업소식'] || 0)

  const hospitalNews = Math.round(totalNews * hospitalNewsPercent / 100)
  const corporateNews = Math.round(totalNews * corporateNewsPercent / 100)

  // 3. Cafe data (100% Managed)
  const cafeItem = cafeRows.find(r => r['키워드'] === keyword)
  const cafeVolume = parseInt(cafeItem?.['총 발행량'] || 0)

  // Calculate totals
  const organicVolume = hospitalBlogs + hospitalNews
  const managedVolume = generalBlogs + corporateNews + cafeVolume
  const totalVolume = organicVolume + managedVolume

  const organicPercent = totalVolume > 0 ? Math.round((organicVolume / totalVolume) * 100) : 0
  const managedPercent = 100 - organicPercent

  return {
    organic: {
      hospitalBlogs,
      hospitalNews,
      total: organicVolume
    },
    managed: {
      generalBlogs,
      corporateNews,
      cafe: cafeVolume,
      total: managedVolume
    },
    totalVolume,
    organicPercent,
    managedPercent
  }
}

export async function GET(request) {
  try {
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

    // Load CSV files
    const blogPath = path.join(monthContext.paths.raw, 'asterasys_total_data - blog_rank.csv')
    const newsPath = path.join(monthContext.paths.raw, 'asterasys_total_data - news analysis.csv')
    const cafePath = path.join(monthContext.paths.raw, 'asterasys_total_data - cafe_rank.csv')

    if (!fs.existsSync(blogPath) || !fs.existsSync(newsPath) || !fs.existsSync(cafePath)) {
      return NextResponse.json(
        { error: '필요한 CSV 파일을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const blogData = fs.readFileSync(blogPath, 'utf-8')
    const newsData = fs.readFileSync(newsPath, 'utf-8')
    const cafeData = fs.readFileSync(cafePath, 'utf-8')

    const blogRows = parseCSV(blogData)
    const newsRows = parseCSV(newsData)
    const cafeRows = parseCSV(cafeData)

    // Define keywords
    const asterasysKeywords = ['쿨페이즈', '리프테라', '쿨소닉']
    const competitorKeywords = ['덴서티', '세르프', '볼뉴머', '텐써마'] // Exclude 올리지오 (data error)

    // Analyze products
    const productStats = {}
    asterasysKeywords.concat(competitorKeywords).forEach(keyword => {
      productStats[keyword] = analyzeProduct(keyword, blogRows, newsRows, cafeRows)
    })

    // Calculate Asterasys average
    const asterasysTotalOrganic = asterasysKeywords.reduce((sum, k) => sum + productStats[k].organic.total, 0)
    const asterasysTotalManaged = asterasysKeywords.reduce((sum, k) => sum + productStats[k].managed.total, 0)
    const asterasysTotalVolume = asterasysTotalOrganic + asterasysTotalManaged

    const asterasysOrganic = Math.round((asterasysTotalOrganic / asterasysTotalVolume) * 100)
    const asterasysManaged = 100 - asterasysOrganic

    // Calculate Competitor average
    const competitorTotalOrganic = competitorKeywords.reduce((sum, k) => sum + productStats[k].organic.total, 0)
    const competitorTotalManaged = competitorKeywords.reduce((sum, k) => sum + productStats[k].managed.total, 0)
    const competitorTotalVolume = competitorTotalOrganic + competitorTotalManaged

    const competitorOrganic = Math.round((competitorTotalOrganic / competitorTotalVolume) * 100)
    const competitorManaged = 100 - competitorOrganic

    // Calculate cafe volumes
    const asterasysCafe = asterasysKeywords.reduce((sum, k) => sum + productStats[k].managed.cafe, 0)
    const competitorCafe = competitorKeywords.reduce((sum, k) => sum + productStats[k].managed.cafe, 0)

    const result = {
      asterasys: {
        organic: asterasysOrganic,
        managed: asterasysManaged,
        details: {
          organicVolume: asterasysTotalOrganic,
          managedVolume: asterasysTotalManaged,
          cafeVolume: asterasysCafe,
          hospitalBlogs: asterasysKeywords.reduce((sum, k) => sum + productStats[k].organic.hospitalBlogs, 0),
          hospitalNews: asterasysKeywords.reduce((sum, k) => sum + productStats[k].organic.hospitalNews, 0),
          generalBlogs: asterasysKeywords.reduce((sum, k) => sum + productStats[k].managed.generalBlogs, 0),
          corporateNews: asterasysKeywords.reduce((sum, k) => sum + productStats[k].managed.corporateNews, 0)
        }
      },
      competitor: {
        organic: competitorOrganic,
        managed: competitorManaged,
        details: {
          organicVolume: competitorTotalOrganic,
          managedVolume: competitorTotalManaged,
          cafeVolume: competitorCafe,
          hospitalBlogs: competitorKeywords.reduce((sum, k) => sum + productStats[k].organic.hospitalBlogs, 0),
          hospitalNews: competitorKeywords.reduce((sum, k) => sum + productStats[k].organic.hospitalNews, 0),
          generalBlogs: competitorKeywords.reduce((sum, k) => sum + productStats[k].managed.generalBlogs, 0),
          corporateNews: competitorKeywords.reduce((sum, k) => sum + productStats[k].managed.corporateNews, 0)
        }
      },
      gap: asterasysOrganic - competitorOrganic,
      products: productStats,
      calculation: {
        formula: 'Organic = 병원블로그 + 병원기사 | Managed = 일반블로그 + 기업기사 + 카페',
        asterasysProducts: asterasysKeywords,
        competitorProducts: competitorKeywords,
        month: monthContext.month
      },
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Organic Viral Analysis Error:', error)
    return NextResponse.json(
      {
        error: 'Organic Viral 분석 실패',
        details: error.message
      },
      { status: 500 }
    )
  }
}
