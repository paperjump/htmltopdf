'use client';

import { useState } from 'react';

export default function Home() {
  const [html, setHtml] = useState('<h1>Hello World!</h1>\n<p>This is a sample HTML document that will be converted to PDF.</p>\n<div style="color: blue; font-size: 18px;">Styled content works too!</div>');
  const [url, setUrl] = useState('');
  const [inputType, setInputType] = useState<'html' | 'url'>('html');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const convertToPdf = async () => {
    if (inputType === 'html' && !html.trim()) {
      setError('Please enter HTML content');
      return;
    }
    
    if (inputType === 'url' && !url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Starting PDF conversion...');
      const requestBody = inputType === 'html' 
        ? { html } 
        : { url: url.trim() };
        
      // Use Vercel-compatible endpoint when deployed
      const apiEndpoint = process.env.NODE_ENV === 'production' 
        ? '/api/convert-vercel'
        : '/api/convert';
        
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Conversion failed');
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (!contentType?.includes('application/pdf')) {
        const textResponse = await response.text();
        console.error('Expected PDF but got:', textResponse);
        throw new Error('Server did not return a PDF file');
      }

      // Create blob and download PDF
      const blob = await response.blob();
      console.log('PDF blob size:', blob.size, 'bytes');
      
      const url_obj = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url_obj;
      a.download = inputType === 'url' ? 'webpage.pdf' : 'converted.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url_obj);
      document.body.removeChild(a);
      
      console.log('PDF download initiated successfully');
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const testAPI = async () => {
    try {
      setDebugInfo('Testing API connection...');
      const response = await fetch('/api/test');
      const data = await response.json();
      setDebugInfo(`API Test Result: ${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      setDebugInfo(`API Test Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HTML to PDF Converter</h1>
          <p className="text-gray-600 mb-8">Convert HTML content to PDF files using our online converter</p>
          
          <div className="space-y-6">
            {/* Input Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Input Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="inputType"
                    value="html"
                    checked={inputType === 'html'}
                    onChange={(e) => setInputType(e.target.value as 'html' | 'url')}
                    className="mr-2"
                  />
                  HTML Content
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="inputType"
                    value="url"
                    checked={inputType === 'url'}
                    onChange={(e) => setInputType(e.target.value as 'html' | 'url')}
                    className="mr-2"
                  />
                  Website URL
                </label>
              </div>
            </div>

            {/* HTML Input */}
            {inputType === 'html' && (
              <div>
                <label htmlFor="html-input" className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Content
                </label>
                <textarea
                  id="html-input"
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-800"
                  placeholder="Enter your HTML content here..."
                />
              </div>
            )}

            {/* URL Input */}
            {inputType === 'url' && (
              <div>
                <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  id="url-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-800"
                  placeholder="https://example.com"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter the complete URL including http:// or https://
                </p>
                
                {/* Quick URL examples */}
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Quick examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'https://example.com',
                      'https://news.ycombinator.com', 
                      'https://github.com/trending',
                      'https://wikipedia.org'
                    ].map((exampleUrl) => (
                      <button
                        key={exampleUrl}
                        onClick={() => setUrl(exampleUrl)}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border transition-colors"
                      >
                        {exampleUrl.replace('https://', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={convertToPdf}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading 
                ? (inputType === 'url' ? 'Loading webpage and converting...' : 'Converting...') 
                : (inputType === 'url' ? 'Convert Website to PDF' : 'Convert HTML to PDF')
              }
            </button>

            <div className="flex gap-4">
              <button
                onClick={testAPI}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Test API
              </button>
            </div>

            {debugInfo && (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Debug Information:</h3>
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">{debugInfo}</pre>
              </div>
            )}
          </div>

          <div className="mt-12 border-t pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">API Usage</h2>
            <div className="bg-gray-100 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-4">Use this API endpoint to convert HTML to PDF programmatically:</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Endpoint:</h3>
                  <code className="bg-white px-3 py-2 rounded border border-gray-300 text-sm text-gray-800">POST /api/convert</code>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">cURL Examples:</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">HTML Content:</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <pre className="text-sm">
{`curl -X POST http://localhost:3000/api/convert \\
  -H "Content-Type: application/json" \\
  -d '{"html":"<h1>Hello World</h1>"}' \\
  --output output.pdf`}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Website URL:</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <pre className="text-sm">
{`curl -X POST http://localhost:3000/api/convert \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com"}' \\
  --output webpage.pdf`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Request Body Options:</h3>
                  <div className="bg-white p-4 rounded border">
                    <pre className="text-sm text-gray-800">
{`// For HTML content:
{
  "html": "<h1>Your HTML content</h1>",
  "options": {
    "format": "A4",
    "printBackground": true,
    "marginTop": "1cm",
    "marginRight": "1cm", 
    "marginBottom": "1cm",
    "marginLeft": "1cm",
    "landscape": false
  }
}

// For website URL:
{
  "url": "https://example.com",
  "options": {
    "format": "A4",
    "printBackground": true,
    "marginTop": "1cm",
    "marginRight": "1cm", 
    "marginBottom": "1cm",
    "marginLeft": "1cm",
    "landscape": false
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
