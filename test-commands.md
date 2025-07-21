# HTML to PDF Converter - Testing Commands

## Start the server first:
```cmd
cd "d:\NextJs Mine\htmltopdf"
npm run dev
```

## Test API availability:
```cmd
curl http://localhost:3000/api/test
```

## Test HTML to PDF conversion:
```cmd
curl -X POST http://localhost:3000/api/convert -H "Content-Type: application/json" -d "{\"html\":\"<h1>Hello World</h1><p>This is a test.</p>\"}" --output html-test.pdf
```

## Test URL to PDF conversion:
```cmd
curl -X POST http://localhost:3000/api/convert -H "Content-Type: application/json" -d "{\"url\":\"https://example.com\"}" --output example.pdf
```

## Test more complex website:
```cmd
curl -X POST http://localhost:3000/api/convert -H "Content-Type: application/json" -d "{\"url\":\"https://news.ycombinator.com\"}" --output hackernews.pdf
```

## Windows PowerShell alternatives:

### Test HTML conversion
```powershell
$body = @{
    html = "<h1>Hello World</h1><p>This is a test document.</p>"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/convert" -Method POST -Body $body -ContentType "application/json" -OutFile "test.pdf"
```

### Test URL conversion  
```powershell
$body = @{
    url = "https://github.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/convert" -Method POST -Body $body -ContentType "application/json" -OutFile "github.pdf"
```

### Test URL with options
```powershell
$body = @{
    url = "https://news.ycombinator.com"
    options = @{
        format = "A4"
        landscape = $true
        printBackground = $true
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/api/convert" -Method POST -Body $body -ContentType "application/json" -OutFile "hn-landscape.pdf"
```

## Troubleshooting:

### If you get "Puppeteer not found" error:
```cmd
npm install puppeteer --save
```

### If you get permission errors on Windows:
```cmd
npm config set puppeteer_skip_chromium_download true
```

### Check if Chromium was downloaded:
Look for folder: `node_modules/puppeteer/.local-chromium/`

### Alternative: Install Chrome manually and set path:
```js
// In your API route, add:
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true
});
```
