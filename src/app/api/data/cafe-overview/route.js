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
    const { totals } = dataset

    const summary = {
      totalPosts: totals.totalPosts,
      totalComments: totals.totalComments,
      totalReplies: totals.totalReplies,
      totalEngagement: totals.totalEngagement,
      totalViews: totals.totalViews,
      searchVolume: totals.searchVolume,
      totalSales: totals.totalSales,
      monthlySales: totals.monthlySales,
      averageParticipation: totals.averageParticipation,
      postsPerThousandSearch: totals.postsPerThousandSearch,
      salesPerThousandSearch: totals.salesPerThousandSearch,
      searchToSalesRate: totals.searchToSalesRate,
      asterasysSearchVolume: totals.asterasys.searchVolume,
      asterasysPosts: totals.asterasys.totalPosts,
      asterasysEngagement: totals.asterasys.totalEngagement,
      asterasysMonthlySales: totals.asterasys.monthlySales,
      asterasysSearchToSalesRate: totals.asterasys.searchToSalesRate,
      asterasysPostsPerThousandSearch: totals.asterasys.postsPerThousandSearch,
      asterasysSalesPerThousandSearch: totals.asterasys.salesPerThousandSearch,
      asterasysShare: totals.asterasysShare
    }

    return NextResponse.json({
      success: true,
      month: dataset.month,
      summary,
      technologyBreakdown: totals.technologyBreakdown,
      asterasys: totals.asterasys,
      metadata: {
        products: dataset.products.length,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[cafe-overview] API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '카페 요약 데이터를 불러오는 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}
