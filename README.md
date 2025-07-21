# HTML to PDF Converter

A Next.js application that converts HTML content or web URLs to PDF files using Puppeteer. Optimized for both local development and Vercel deployment.

## Features

- Convert HTML content to PDF
- Convert web URLs to PDF
- Web interface for easy testing
- REST API for programmatic access
- Vercel deployment compatible
- CURL command support

## API Endpoints

### Local Development
- `POST /api/convert` - Convert HTML or URL to PDF (Puppeteer)

### Production (Vercel)
- `POST /api/convert-vercel` - Convert HTML or URL to PDF (@sparticuz/chromium)

The frontend automatically switches between endpoints based on environment.

## Usage

### Web Interface
Visit the application URL and use the web form to:
1. Select HTML or URL input
2. Enter your content
3. Click "Convert to PDF" to download

### API Usage with CURL

#### Convert HTML to PDF
```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Hello World</h1><p>This is a test PDF.</p>"}' \
  --output result.pdf
```

#### Convert URL to PDF
```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' \
  --output webpage.pdf
```

### Production API (Vercel)
Replace the endpoint with `/api/convert-vercel` when deployed:

```bash
curl -X POST https://your-app.vercel.app/api/convert-vercel \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Hello World</h1>"}' \
  --output result.pdf
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel Deployment

This app is optimized for Vercel deployment:

1. Push your code to GitHub
2. Connect to Vercel
3. Deploy automatically

The app uses `@sparticuz/chromium` for Vercel compatibility, which provides a smaller Chromium binary optimized for serverless environments.

### Environment Variables

No environment variables are required for basic functionality.

### Vercel Configuration

The `vercel.json` file includes optimized settings:
- 30-second function timeout for PDF generation
- Automatic endpoint switching for production

## Technical Details

### Dependencies
- Next.js 15.4.2
- React 19.1.0
- Puppeteer 24.14.0 (local development)
- @sparticuz/chromium (Vercel deployment)
- puppeteer-core (Vercel deployment)
- TypeScript & Tailwind CSS

### Limitations
- Vercel free plan has 10-second function timeout (upgraded to 30s in config)
- Large pages may timeout on serverless platforms
- Complex JavaScript-heavy sites may require longer load times

## Error Handling

The API includes comprehensive error handling for:
- Invalid HTML content
- Unreachable URLs
- Network timeouts
- PDF generation failures

## Development

To add new features:
1. Modify `app/api/convert/route.ts` for local development
2. Update `app/api/convert-vercel/route.ts` for Vercel compatibility
3. Test both endpoints before deployment

## License

MIT License