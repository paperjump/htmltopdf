import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { PDFOptions } from 'puppeteer';

export async function POST(request: NextRequest) {
  console.log('PDF conversion request received');
  
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

    console.log('Launching Puppeteer browser...');
    // Launch Puppeteer browser
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images'
      ],
      timeout: 30000
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

      // Navigate to URL
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      console.log('URL loaded successfully');
    } else {
      // Set HTML content
      await page.setContent(html, { waitUntil: 'networkidle0' });
      console.log('HTML content set on page');
    }

    // PDF options with defaults
    const pdfOptions: Partial<PDFOptions> = {
      format: options.format || 'A4',
      printBackground: options.printBackground !== false,
      margin: {
        top: options.marginTop || '1cm',
        right: options.marginRight || '1cm',
        bottom: options.marginBottom || '1cm',
        left: options.marginLeft || '1cm',
      },
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
      },
    });

  } catch (error: unknown) {
    console.error('PDF conversion error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to convert HTML to PDF', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'HTML to PDF Converter API',
    usage: {
      method: 'POST',
      endpoint: '/api/v1',
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
          scale: 'Optional: Scale factor (0.1 to 2, default: 1)',
          headerTemplate: 'Optional: HTML template for header',
          footerTemplate: 'Optional: HTML template for footer',
          displayHeaderFooter: 'Optional: Display header and footer (default: false)'
        }
      },
      examples: {
        htmlConversion: {
          curl: 'curl -X POST http://localhost:3000/api/v1 -H "Content-Type: application/json" -d \'{"html":"<h1>Hello World</h1>"}\' --output output.pdf'
        },
        urlConversion: {
          curl: 'curl -X POST http://localhost:3000/api/v1 -H "Content-Type: application/json" -d \'{"url":"https://example.com"}\' --output webpage.pdf'
        }
      }
    }
  });
}
