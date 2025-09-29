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

    const products = dataset.products.map((product) => ({
      product: product.keyword,
      technology: product.technology,
      technologyLabel: product.technologyLabel,
      rank: product.rank,
      totalPosts: product.totalPosts,
      totalEngagement: product.totalEngagement,
      comments: product.totalComments,
      replies: product.totalReplies,
      participation: product.participation,
      searchVolume: product.searchVolume,
      searchRank: product.searchRank,
      searchToPostRatio: product.searchToPostRatio,
      blogTypes: product.blogTypes,
      isAsterasys: product.isAsterasys
    }))

    const overview = {
      totalProducts: products.length,
      totals: dataset.totals
    }

    return NextResponse.json({
      success: true,
      month: dataset.month,
      products,
      overview
    })
  } catch (error) {
    console.error('[blog-products] API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '블로그 제품 데이터를 불러오는 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}
