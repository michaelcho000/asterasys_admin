import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

/**
 * Top Products API Endpoint
 * Serves top product rankings and performance data
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'posts';
    const limit = parseInt(searchParams.get('limit')) || 10;
    const brand = searchParams.get('brand') || 'all';
    const category = searchParams.get('category') || 'all';

    // Read processed KPI data
    const kpiFilePath = path.join(process.cwd(), 'data', 'processed', 'kpis.json');
    
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
        processedAt: kpiData.processedAt
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