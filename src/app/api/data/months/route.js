import { NextResponse } from 'next/server'
import {
  getAvailableProcessedMonths,
  getAvailableRawMonths,
  getLatestMonth
} from '@/lib/server/monthConfig'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const rawMonths = getAvailableRawMonths()
  const processedMonths = getAvailableProcessedMonths()
  const months = Array.from(new Set([...rawMonths, ...processedMonths])).sort()
  const latest = getLatestMonth()

  return NextResponse.json({
    latest,
    months
  })
}
