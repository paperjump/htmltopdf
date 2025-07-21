import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function POST(request: NextRequest) {
  console.log('Vercel PDF conversion request received');
  
  try {
    const body = await request.json();
    const { html, url, options = {} } = body;

    console.log('Request body parsed:', { 
      hasHtml: !!html, 
      hasUrl: !!url, 
      htmlLength: html?.length || 0,
      url: url || 'none'
    });

    if (!html && !url) {
      console.log('Error: No HTML content or URL provided');
      return NextResponse.json(
        { error: 'Either HTML content or URL is required' },
        { status: 400 }
      );
    }

    if (html && url) {
      console.log('Error: Both HTML and URL provided');
      return NextResponse.json(
        { error: 'Please provide either HTML content or URL, not both' },
        { status: 400 }
      );
    }

    console.log('Launching Puppeteer browser for Vercel...');
    
    // Vercel-optimized browser launch
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 720 },
      executablePath: await chromium.executablePath(),
      headless: true,
      ignoreDefaultArgs: ['--disable-extensions'],
    });

    console.log('Browser launched successfully');
    const page = await browser.newPage();
    console.log('New page created');

    // Set viewport for better rendering
    await page.setViewport({ width: 1200, height: 800 });

    if (url) {
      console.log('Loading URL:', url);
      
      // Validate URL format
      try {
        new URL(url);
      } catch {
        await browser.close();
        return NextResponse.json(
          { error: 'Invalid URL format', details: 'Please provide a valid URL starting with http:// or https://' },
          { status: 400 }
        );
      }

      // Navigate to URL with timeout
      try {
        await page.goto(url, { 
          waitUntil: 'networkidle0',
          timeout: 15000  // Reduced timeout for Vercel
        });
        console.log('URL loaded successfully');
      } catch (error) {
        await browser.close();
        console.error('Failed to load URL:', error);
        return NextResponse.json(
          { error: 'Failed to load URL', details: 'The website may be slow to respond or unreachable' },
          { status: 500 }
        );
      }
    } else {
      // Set HTML content
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 10000 
      });
      console.log('HTML content set on page');
    }

    // PDF options with defaults optimized for Vercel
    const pdfOptions = {
      format: options.format || 'A4',
      printBackground: options.printBackground !== false,
      margin: {
        top: options.marginTop || '1cm',
        right: options.marginRight || '1cm',
        bottom: options.marginBottom || '1cm',
        left: options.marginLeft || '1cm',
      },
      timeout: 30000, // PDF generation timeout
      ...options
    };

    console.log('Generating PDF with options:', pdfOptions);
    // Generate PDF
    const pdf = await page.pdf(pdfOptions);
    console.log('PDF generated successfully, size:', pdf.length, 'bytes');

    await browser.close();
    console.log('Browser closed');

    // Return PDF as response
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${url ? 'webpage' : 'converted'}.pdf"`,
        'Content-Length': pdf.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error: unknown) {
    console.error('PDF conversion error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // More specific error messages for common Vercel issues
    let friendlyMessage = errorMessage;
    if (errorMessage.includes('timeout') || errorMessage.includes('TimeoutError')) {
      friendlyMessage = 'PDF generation timed out. The page may be too complex or slow to load.';
    } else if (errorMessage.includes('Protocol error') || errorMessage.includes('Target closed')) {
      friendlyMessage = 'Browser connection lost. This may be due to memory constraints.';
    } else if (errorMessage.includes('net::')) {
      friendlyMessage = 'Network error loading the website. Please check the URL and try again.';
    }
    
    return NextResponse.json(
      { error: 'Failed to convert to PDF', details: friendlyMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Vercel-Compatible HTML to PDF Converter API',
    status: 'operational',
    features: [
      'HTML content to PDF conversion',
      'Website URL to PDF conversion', 
      'Optimized for Vercel serverless functions',
      'Reduced memory footprint',
      'Timeout handling for production'
    ],
    usage: {
      method: 'POST',
      endpoint: '/api/convert-vercel',
      body: {
        html: 'Optional: HTML content as string (use either html or url)',
        url: 'Optional: Website URL to convert (use either html or url)', 
        options: {
          format: 'Optional: Paper format (A4, A3, Letter, etc.)',
          printBackground: 'Optional: Print background graphics (default: true)',
          marginTop: 'Optional: Top margin (default: 1cm)',
          marginRight: 'Optional: Right margin (default: 1cm)',
          marginBottom: 'Optional: Bottom margin (default: 1cm)',
          marginLeft: 'Optional: Left margin (default: 1cm)',
          landscape: 'Optional: Landscape orientation (default: false)',
        }
      },
      examples: {
        htmlConversion: {
          curl: 'curl -X POST https://your-app.vercel.app/api/convert-vercel -H "Content-Type: application/json" -d \'{"html":"<h1>Hello World</h1>"}\' --output output.pdf'
        },
        urlConversion: {
          curl: 'curl -X POST https://your-app.vercel.app/api/convert-vercel -H "Content-Type: application/json" -d \'{"url":"https://example.com"}\' --output webpage.pdf'
        }
      }
    },
    limits: {
      timeout: '30 seconds for PDF generation',
      memory: 'Optimized for Vercel 1GB limit',
      complexity: 'Simple to medium complexity pages recommended'
    }
  });
}
