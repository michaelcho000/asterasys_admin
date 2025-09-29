import { NextResponse } from 'next/server'
import { resolveRequestMonth } from '@/lib/server/requestMonth'
import { buildBlogDataset, buildAuthorSummary } from '@/services/blog/blogAnalysisService'

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

    const grouped = dataset.authors.reduce((acc, author) => {
      if (!acc[author.product]) {
        acc[author.product] = []
      }
      acc[author.product].push(author)
      return acc
    }, {})

    Object.keys(grouped).forEach((key) => {
      grouped[key] = grouped[key].sort((a, b) => a.rank - b.rank)
    })

    const summary = buildAuthorSummary(dataset.authors)

    return NextResponse.json({
      success: true,
      month: dataset.month,
      authors: dataset.authors,
      grouped,
      summary,
      topAuthors: dataset.authors
        .filter((author) => author.rank && author.rank <= 10)
        .sort((a, b) => a.rank - b.rank)
    })
  } catch (error) {
    console.error('[blog-authors] API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '블로그 작성자 데이터를 불러오는 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}
