import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('Simple PDF conversion request received');
  
  try {
    const body = await request.json();
    const { html } = body;

    console.log('Request body parsed, HTML length:', html?.length || 0);

    if (!html) {
      console.log('Error: No HTML content provided');
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Try to dynamically import puppeteer
    console.log('Attempting to import Puppeteer...');
    
    let puppeteer;
    try {
      puppeteer = await import('puppeteer');
      console.log('Puppeteer imported successfully');
    } catch (importError) {
      console.error('Failed to import Puppeteer:', importError);
      return NextResponse.json(
        { error: 'PDF conversion library not available', details: 'Puppeteer import failed' },
        { status: 500 }
      );
    }

    console.log('Launching browser...');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('Browser launched, creating new page...');
    const page = await browser.newPage();
    
    console.log('Setting HTML content...');
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
    console.log('Generating PDF...');
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });
    
    console.log('PDF generated, closing browser...');
    await browser.close();
    
    console.log('PDF conversion successful, size:', pdf.length, 'bytes');

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="converted.pdf"',
        'Content-Length': pdf.length.toString(),
      },
    });

  } catch (error: unknown) {
    console.error('PDF conversion error:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to convert HTML to PDF', 
        details: errorMessage,
        errorType: error instanceof Error ? error.name : 'Unknown'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple HTML to PDF Converter API',
    status: 'OK',
    usage: 'POST request with { "html": "your html content" }'
  });
}
