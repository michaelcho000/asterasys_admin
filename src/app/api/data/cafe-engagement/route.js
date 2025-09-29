import { NextResponse } from 'next/server'
import { resolveRequestMonth } from '@/lib/server/requestMonth'
import {
  buildCafeDataset,
  splitCafeProductsByTechnology,
  buildCafeLeaderboard,
  mapCafeCorrelation
} from '@/services/cafe/cafeAnalysisService'

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
    const buckets = splitCafeProductsByTechnology(dataset.products)

    const correlation = {
      ALL: mapCafeCorrelation(buckets.ALL),
      RF: mapCafeCorrelation(buckets.RF),
      HIFU: mapCafeCorrelation(buckets.HIFU)
    }

    const leaderboard = {
      ALL: buildCafeLeaderboard(buckets.ALL),
      RF: buildCafeLeaderboard(buckets.RF),
      HIFU: buildCafeLeaderboard(buckets.HIFU)
    }

    return NextResponse.json({
      success: true,
      month: dataset.month,
      correlation,
      leaderboard,
      totals: dataset.totals
    })
  } catch (error) {
    console.error('[cafe-engagement] API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '카페 상관관계 데이터를 불러오는 중 오류가 발생했습니다.',
        details: error.message
      },
      { status: 500 }
    )
  }
}
