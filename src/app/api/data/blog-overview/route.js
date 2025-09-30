import { NextResponse } from 'next/server'
import { resolveRequestMonth } from '@/lib/server/requestMonth'
import { buildBlogDataset } from '@/services/blog/blogAnalysisService'

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
          error: '요청한 월의 블로그 데이터가 존재하지 않습니다.',
          month: monthContext.month,
          missing: monthContext.missing
        },
        { status: 404 }
      )
    }

    const dataset = buildBlogDataset(monthContext.month)
    const { totals } = dataset

    const summary = {
      totalPosts: totals.totalPosts,
      monthlySales: totals.monthlySales,
      totalSales: totals.totalSales,
      asterasysPosts: totals.asterasys.totalPosts,
      asterasysMonthlySales: totals.asterasys.monthlySales,
      asterasysTotalSales: totals.asterasys.totalSales,
      asterasysShare: totals.asterasysShare,
      averageSalesEfficiency: totals.averageSalesEfficiency,
      postsPerThousandSearch: totals.postsPerThousandSearch,
      searchVolume: totals.searchVolume
    }

    return NextResponse.json({
      success: true,
      month: dataset.month,
      summary,
      technologyBreakdown: totals.technologyBreakdown,
      asterasys: totals.asterasys.products,
      metadata: {
        products: dataset.products.length,
        authors: dataset.authors.length,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[blog-overview] API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '블로그 요약 데이터를 불러오는 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}
