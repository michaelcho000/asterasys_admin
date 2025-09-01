import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

/**
 * KPI Data API Endpoint
 * Serves processed KPI data for the dashboard
 */

export async function GET(request) {
  try {
    // Read processed KPI data
    const kpiFilePath = path.join(process.cwd(), 'data', 'processed', 'kpis.json');
    
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
  // For preflight checks
  return new NextResponse(null, { status: 200 });
}