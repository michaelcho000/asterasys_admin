import { NextResponse } from 'next/server'
import { resolveRequestMonth } from '@/lib/server/requestMonth'
import { buildCafeDataset } from '@/services/cafe/cafeAnalysisService'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
          error: '요청한 월의 카페 데이터가 존재하지 않습니다.',
          month: monthContext.month,
          missing: monthContext.missing
        },
        { status: 404 }
      )
    }

    const dataset = buildCafeDataset(monthContext.month)

    const asterasysProducts = dataset.products
      .filter((product) => product.isAsterasys)
      .map((product) => ({
        keyword: product.keyword,
        technology: product.technology,
        technologyLabel: product.technologyLabel,
        rank: product.rank,
        totalPosts: product.totalPosts,
        totalEngagement: product.totalEngagement,
        participation: product.participation,
        searchVolume: product.searchVolume,
        postsPerThousandSearch: product.postsPerThousandSearch,
        monthlySales: product.monthlySales,
        totalSales: product.totalSales,
        salesPerPost: product.salesPerPost,
        salesPerThousandSearch: product.salesPerThousandSearch,
        searchToSalesRate: product.searchToSalesRate,
        technologyShare: product.technologyShare,
        marketShare: product.marketShare
      }))

    return NextResponse.json({
      success: true,
      month: dataset.month,
      products: asterasysProducts,
      totals: dataset.totals.asterasys,
      marketTotals: dataset.totals,
      technologyBreakdown: dataset.totals.technologyBreakdown
    })
  } catch (error) {
    console.error('[cafe-products] API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '카페 제품 데이터를 불러오는 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}
