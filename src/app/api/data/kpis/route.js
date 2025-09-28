import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { resolveRequestMonth } from '@/lib/server/requestMonth';

/**
 * KPI Data API Endpoint
 * Serves processed KPI data for the dashboard
 */

// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const monthContext = resolveRequestMonth(request, { required: ['processed'] });

    if (monthContext.error) {
      return NextResponse.json({ error: monthContext.error.message }, { status: 400 });
    }

    if (!monthContext.ok) {
      return NextResponse.json({
        error: '월별 KPI 데이터를 찾을 수 없습니다',
        month: monthContext.month,
        missing: monthContext.missing
      }, { status: 404 });
    }

    const kpiFilePath = path.join(monthContext.paths.processed, 'kpis.json');
    
    if (!fs.existsSync(kpiFilePath)) {
      return NextResponse.json(
        { 
          error: 'KPI data not found',
          message: 'Please run data processing first: npm run process-data'
        },
        { status: 404 }
      );
    }

    const kpiData = JSON.parse(fs.readFileSync(kpiFilePath, 'utf8'));
    kpiData.meta = {
      ...(kpiData.meta || {}),
      month: monthContext.month,
      source: path.relative(process.cwd(), kpiFilePath)
    };
    
    // Add response headers for caching
    const response = NextResponse.json(kpiData);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    
    return response;
  } catch (error) {
    console.error('Error loading KPI data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load KPI data',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function HEAD(request) {
  const monthContext = resolveRequestMonth(request, { required: ['processed'] });

  if (!monthContext.ok) {
    return new NextResponse(null, { status: 404 });
  }

  const kpiFilePath = path.join(monthContext.paths.processed, 'kpis.json');
  return new NextResponse(null, { status: fs.existsSync(kpiFilePath) ? 200 : 404 });
}
