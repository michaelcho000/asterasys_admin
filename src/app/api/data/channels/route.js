import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

/**
 * Channels Data API Endpoint
 * Serves processed channel data for the dashboard
 */


// Vercel 배포를 위한 설정
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || 'all';
    const expand = searchParams.get('expand') === 'true';

    // Read processed channels data
    const channelsFilePath = path.join(process.cwd(), 'data', 'processed', 'channels.json');
    
    if (!fs.existsSync(channelsFilePath)) {
      return NextResponse.json(
        { 
          error: 'Channels data not found',
          message: 'Please run data processing first: npm run process-data'
        },
        { status: 404 }
      );
    }

    const channelsData = JSON.parse(fs.readFileSync(channelsFilePath, 'utf8'));
    
    // Filter by channel if specified
    let responseData = channelsData;
    
    if (channel !== 'all' && channelsData[channel]) {
      responseData = {
        [channel]: channelsData[channel],
        meta: {
          channel,
          expand,
          processedAt: channelsData.processedAt || new Date().toISOString()
        }
      };
    }

    // Add caching headers
    const response = NextResponse.json(responseData);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    
    return response;
    
  } catch (error) {
    console.error('Error loading channels data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load channels data',
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