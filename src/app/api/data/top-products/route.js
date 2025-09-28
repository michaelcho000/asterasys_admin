import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { resolveRequestMonth } from '@/lib/server/requestMonth';

/**
 * Top Products API Endpoint
 * Serves top product rankings and performance data
 */


// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'posts';
    const limit = parseInt(searchParams.get('limit')) || 10;
    const brand = searchParams.get('brand') || 'all';
    const category = searchParams.get('category') || 'all';

    // Read processed KPI data
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
          error: 'Product data not found',
          message: 'Please run data processing first: npm run process-data'
        },
        { status: 404 }
      );
    }

    const kpiData = JSON.parse(fs.readFileSync(kpiFilePath, 'utf8'));
    
    // Get the appropriate product data based on metric
    let productData = [];
    
    switch (metric) {
      case 'posts':
        productData = kpiData.topProducts?.byPosts || [];
        break;
      case 'sales':
        productData = kpiData.topProducts?.bySales || [];
        break;
      case 'search':
        productData = kpiData.topProducts?.bySearch || [];
        break;
      case 'asterasys':
        productData = kpiData.topProducts?.asterasysOnly || [];
        break;
      default:
        productData = kpiData.topProducts?.byPosts || [];
    }

    // Apply filters
    let filteredData = productData;
    
    if (brand !== 'all') {
      filteredData = filteredData.filter(product => product.brand === brand);
    }
    
    if (category !== 'all') {
      filteredData = filteredData.filter(product => product.category === category);
    }

    // Apply limit
    const limitedData = filteredData.slice(0, limit);

    // Prepare response
    const response = NextResponse.json({
      data: limitedData,
      meta: {
        total: limitedData.length,
        metric,
        brand,
        category,
        limit,
        processedAt: kpiData.processedAt,
        month: monthContext.month,
        source: path.relative(process.cwd(), kpiFilePath)
      }
    });
    
    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    
    return response;
    
  } catch (error) {
    console.error('Error loading top products data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load product data',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function HEAD(request) {
  // For preflight checks
  return new NextResponse(null, { status: 200 });
}
