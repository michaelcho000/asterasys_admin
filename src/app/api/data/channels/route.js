import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { resolveRequestMonth } from '@/lib/server/requestMonth';

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
    const monthContext = resolveRequestMonth(request, { required: ['processed'] });

    if (monthContext.error) {
      return NextResponse.json({ error: monthContext.error.message }, { status: 400 });
    }

    if (!monthContext.ok) {
      return NextResponse.json({
        error: '월별 채널 데이터를 찾을 수 없습니다',
        month: monthContext.month,
        missing: monthContext.missing
      }, { status: 404 });
    }

    const channelsFilePath = path.join(monthContext.paths.processed, 'channels.json');
    
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
    channelsData.meta = {
      ...(channelsData.meta || {}),
      month: monthContext.month,
      source: path.relative(process.cwd(), channelsFilePath)
    };
    
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
  const monthContext = resolveRequestMonth(request, { required: ['processed'] });

  if (!monthContext.ok) {
    return new NextResponse(null, { status: 404 });
  }

  const channelsFilePath = path.join(monthContext.paths.processed, 'channels.json');
  return new NextResponse(null, { status: fs.existsSync(channelsFilePath) ? 200 : 404 });
}
