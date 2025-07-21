// Simple test to verify Puppeteer installation
async function testPuppeteer() {
  try {
    console.log('Testing Puppeteer installation...');
    
    const puppeteer = require('puppeteer');
    console.log('✓ Puppeteer module loaded successfully');
    
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✓ Browser launched successfully');
    
    const page = await browser.newPage();
    console.log('✓ New page created');
    
    await page.setContent('<h1>Test Page</h1><p>This is a test.</p>');
    console.log('✓ HTML content set');
    
    const pdf = await page.pdf({ format: 'A4' });
    console.log('✓ PDF generated, size:', pdf.length, 'bytes');
    
    await browser.close();
    console.log('✓ Browser closed');
    
    console.log('🎉 Puppeteer test completed successfully!');
    
    // Save test PDF
    const fs = require('fs');
    fs.writeFileSync('puppeteer-test.pdf', pdf);
    console.log('✓ Test PDF saved as puppeteer-test.pdf');
    
  } catch (error) {
    console.error('❌ Puppeteer test failed:', error.message);
    console.error('Full error:', error);
  }
}

testPuppeteer();
