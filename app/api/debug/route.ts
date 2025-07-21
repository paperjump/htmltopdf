import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html } = body;

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Check if running in development
    const isDev = process.env.NODE_ENV === 'development';
    
    return NextResponse.json({
      success: true,
      message: 'Request received successfully',
      data: {
        htmlLength: html.length,
        environment: process.env.NODE_ENV,
        isDevelopment: isDev,
        nodeVersion: process.version,
        platform: process.platform
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Request processing failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if Puppeteer is available
    let puppeteerStatus = 'unknown';
    try {
      await import('puppeteer');
      puppeteerStatus = 'available';
    } catch {
      puppeteerStatus = 'not available';
    }

    return NextResponse.json({
      status: 'OK',
      message: 'Debug API endpoint',
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        nodeEnv: process.env.NODE_ENV,
        puppeteerStatus,
        workingDirectory: process.cwd()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Debug info failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
