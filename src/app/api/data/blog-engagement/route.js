import { NextResponse } from 'next/server'
import { resolveRequestMonth } from '@/lib/server/requestMonth'
import { buildBlogDataset, splitProductsByTechnology, buildLeaderboard } from '@/services/blog/blogAnalysisService'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function mapCorrelation(products) {
  return products.map((product) => ({
    keyword: product.keyword,
    technology: product.technology,
    technologyLabel: product.technologyLabel,
    totalPosts: product.totalPosts,
    totalEngagement: product.totalEngagement,
    participation: product.participation,
    searchVolume: product.searchVolume,
    searchToPostRatio: product.searchToPostRatio,
    isAsterasys: product.isAsterasys
  }))
}

export async function GET(request) {
  try {
    const monthContext = resolveRequestMonth(request, { required: ['raw'] })

    if (monthContext.error) {
      return NextResponse.json({ success: false, error: monthContext.error.message }, { status: 400 })
    }

    if (!monthContext.ok) {
      return NextResponse.json(
        {
          success: false,
          error: '요청한 월의 블로그 데이터가 존재하지 않습니다.',
          month: monthContext.month,
          missing: monthContext.missing
        },
        { status: 404 }
      )
    }

    const dataset = buildBlogDataset(monthContext.month)
    const buckets = splitProductsByTechnology(dataset.products)

    const correlation = {
      ALL: mapCorrelation(buckets.ALL),
      RF: mapCorrelation(buckets.RF),
      HIFU: mapCorrelation(buckets.HIFU)
    }

    const leaderboard = {
      ALL: buildLeaderboard(buckets.ALL),
      RF: buildLeaderboard(buckets.RF),
      HIFU: buildLeaderboard(buckets.HIFU)
    }

    return NextResponse.json({
      success: true,
      month: dataset.month,
      correlation,
      leaderboard,
      totals: dataset.totals
    })
  } catch (error) {
    console.error('[blog-engagement] API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '블로그 상관관계 데이터를 불러오는 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}
