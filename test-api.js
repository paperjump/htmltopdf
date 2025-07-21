// Test script for HTML to PDF converter API endpoints
import fs from 'fs';

async function testEndpoint(endpoint, data, outputFile) {
  console.log(`\n🧪 Testing ${endpoint}...`);
  
  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      return false;
    }

    if (response.headers.get('content-type')?.includes('application/pdf')) {
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(outputFile, Buffer.from(buffer));
      console.log(`✅ Success! PDF saved as ${outputFile} (${buffer.byteLength} bytes)`);
      return true;
    } else {
      console.error('❌ Response is not a PDF');
      return false;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log('Make sure the development server is running with: npm run dev');

  // Test data
  const htmlData = { 
    html: '<h1>Test PDF</h1><p>This is a test HTML to PDF conversion.</p><p>Generated at: ' + new Date().toISOString() + '</p>' 
  };
  const urlData = { 
    url: 'https://example.com' 
  };

  // Test original endpoint
  const test1 = await testEndpoint('/api/v1', htmlData, 'test-convert-html.pdf');
  const test2 = await testEndpoint('/api/v1', urlData, 'test-convert-url.pdf');

  // Test Vercel endpoint
  const test3 = await testEndpoint('/api/v2', htmlData, 'test-vercel-html.pdf');
  const test4 = await testEndpoint('/api/v2', urlData, 'test-vercel-url.pdf');

  console.log('\n📊 Test Results Summary:');
  console.log(`/api/v1 (HTML): ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`/api/v1 (URL): ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`/api/v2 (HTML): ${test3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`/api/v2 (URL): ${test4 ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = test1 && test2 && test3 && test4;
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed'}`);
}

// Run tests
runTests().catch(console.error);
