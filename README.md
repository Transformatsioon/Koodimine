# N8N Web Crawler

A reliable, production-ready web crawler for n8n with advanced anti-blocking features. This crawler is designed to avoid bot detection and can be used as a standalone library or as a custom n8n node.

## Features

### Anti-Blocking Capabilities
- **Playwright-based**: Uses Playwright for reliable browser automation
- **Random User Agents**: Rotates user agents to avoid detection
- **Human-like Behavior**: Simulates mouse movements, scrolling, and random delays
- **Anti-Detection**: Removes webdriver flags and adds realistic browser properties
- **Rate Limiting**: Built-in rate limiter to avoid overwhelming servers
- **Robots.txt Compliance**: Optional respect for robots.txt rules
- **Proxy Support**: Configure HTTP/HTTPS proxies with authentication
- **Retry Logic**: Automatic retries with exponential backoff
- **Cookie Support**: Maintain session state with custom cookies

### Data Extraction
- **HTML Content**: Full page HTML
- **Text Content**: Clean text extraction
- **Metadata**: Extract meta tags (title, description, keywords, etc.)
- **Links**: All hyperlinks on the page
- **Images**: All image URLs
- **Screenshots**: Optional full-page screenshots
- **Status Codes**: HTTP response codes

### Reliability Features
- Configurable timeouts
- Wait for specific selectors
- Multiple retry attempts
- Comprehensive error handling
- Detailed logging

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Install Playwright Browsers

```bash
npx playwright install chromium
```

## Usage

### As a Standalone Library

```typescript
import { WebCrawler } from './src/crawler/WebCrawler';

async function crawlWebsite() {
  const crawler = new WebCrawler({
    headless: true,
    timeout: 30000,
    respectRobotsTxt: true,
    rateLimit: {
      points: 5,      // 5 requests
      duration: 10,   // per 10 seconds
    },
    retries: 3,
  });

  try {
    // Crawl a single URL
    const result = await crawler.crawl('https://example.com');

    console.log('Title:', result.title);
    console.log('Text length:', result.text.length);
    console.log('Links found:', result.links.length);
    console.log('Images found:', result.images.length);

    // Crawl multiple URLs
    const results = await crawler.crawlMultiple([
      'https://example.com',
      'https://example.com/about',
      'https://example.com/contact',
    ]);

    results.forEach(r => {
      console.log(`${r.url}: ${r.success ? 'Success' : 'Failed'}`);
    });
  } finally {
    await crawler.close();
  }
}

crawlWebsite().catch(console.error);
```

### Advanced Configuration

```typescript
const crawler = new WebCrawler({
  // Browser settings
  headless: false,                    // Set to false for debugging
  viewport: { width: 1920, height: 1080 },

  // Timing
  timeout: 60000,                     // 60 second timeout
  waitForSelector: '.content-loaded', // Wait for specific element
  waitForTimeout: 2000,               // Additional 2s wait after load

  // Anti-blocking
  userAgent: 'Custom User Agent',     // Or leave empty for random
  respectRobotsTxt: true,

  // Rate limiting
  rateLimit: {
    points: 10,                       // 10 requests
    duration: 30,                     // per 30 seconds
  },

  // Retry logic
  retries: 5,

  // Proxy configuration
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'proxyuser',
    password: 'proxypass',
  },

  // Cookies
  cookies: [
    {
      name: 'session',
      value: 'abc123',
      domain: '.example.com',
    },
  ],

  // Screenshot
  screenshotPath: './screenshots/page.png',
});
```

## Using as an n8n Node

### Method 1: Install as Custom Node (Recommended)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Link the node to your n8n installation:**
   ```bash
   # Navigate to your n8n custom nodes directory
   cd ~/.n8n/custom

   # Create a symlink to this project
   ln -s /path/to/n8n-web-crawler ./n8n-web-crawler
   ```

3. **Restart n8n:**
   ```bash
   n8n start
   ```

4. **Find the "Web Crawler" node** in the n8n node library under "Data & Storage"

### Method 2: Run as Local Service

If you prefer to run the crawler as a separate service, you can create an HTTP API wrapper:

1. **Create an API wrapper** (see `examples/api-server.ts`)

2. **Run the server:**
   ```bash
   npm run dev
   ```

3. **Use n8n's HTTP Request node** to call your crawler API

### n8n Node Configuration

The Web Crawler node provides these options:

#### Operations
- **Crawl Single URL**: Crawl one URL at a time
- **Crawl Multiple URLs**: Crawl multiple URLs (comma-separated)

#### Options
- **Headless Mode**: Run browser in headless mode (default: true)
- **Timeout**: Maximum wait time in milliseconds (default: 30000)
- **Wait For Selector**: CSS selector to wait for before extracting
- **Wait For Timeout**: Additional wait time after page load
- **Respect robots.txt**: Honor robots.txt rules (default: true)
- **Rate Limit**: Configure request rate limiting
- **Retries**: Number of retry attempts (default: 3)
- **User Agent**: Custom user agent (random if empty)
- **Viewport**: Browser window size
- **Proxy Settings**: HTTP/HTTPS proxy configuration

#### Output Format
- **Full**: All extracted data
- **HTML Only**: Just the HTML content
- **Text Only**: Just the text content
- **Links Only**: Just the links array
- **Custom**: Select specific fields

### Example n8n Workflow

```json
{
  "nodes": [
    {
      "parameters": {
        "operation": "crawlSingle",
        "url": "https://example.com",
        "options": {
          "timeout": 30000,
          "respectRobotsTxt": true,
          "rateLimitPoints": 5,
          "rateLimitDuration": 10
        },
        "outputFormat": "full"
      },
      "name": "Web Crawler",
      "type": "n8n-nodes-base.webCrawler",
      "position": [250, 300]
    }
  ]
}
```

## Running Locally

### Development Mode

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run with TypeScript directly
npx ts-node src/index.ts
```

### Production Mode

```bash
# Build the project
npm run build

# Run the compiled version
npm start
```

### Watch Mode

```bash
# Watch for changes and rebuild
npm run watch
```

## Examples

### Example 1: Basic Crawl

```typescript
import { WebCrawler } from './src/crawler/WebCrawler';

const crawler = new WebCrawler();
const result = await crawler.crawl('https://example.com');
console.log(result);
await crawler.close();
```

### Example 2: Crawl with Authentication

```typescript
const crawler = new WebCrawler({
  cookies: [
    {
      name: 'auth_token',
      value: 'your-token-here',
      domain: '.example.com',
    },
  ],
});

const result = await crawler.crawl('https://example.com/protected-page');
await crawler.close();
```

### Example 3: Crawl with Proxy

```typescript
const crawler = new WebCrawler({
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass',
  },
});

const result = await crawler.crawl('https://example.com');
await crawler.close();
```

### Example 4: Wait for Dynamic Content

```typescript
const crawler = new WebCrawler({
  waitForSelector: '.dynamic-content',
  waitForTimeout: 3000,
});

const result = await crawler.crawl('https://example.com/spa-page');
await crawler.close();
```

### Example 5: Batch Crawling

```typescript
const crawler = new WebCrawler({
  rateLimit: {
    points: 3,
    duration: 10,
  },
});

const urls = [
  'https://example.com/page1',
  'https://example.com/page2',
  'https://example.com/page3',
];

const results = await crawler.crawlMultiple(urls);
console.log(`Crawled ${results.length} pages`);
await crawler.close();
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `headless` | boolean | `true` | Run browser in headless mode |
| `userAgent` | string | Random | Custom user agent string |
| `viewport` | object | `{width: 1920, height: 1080}` | Browser viewport size |
| `timeout` | number | `30000` | Page load timeout in ms |
| `waitForSelector` | string | `undefined` | CSS selector to wait for |
| `waitForTimeout` | number | `0` | Additional wait time in ms |
| `respectRobotsTxt` | boolean | `true` | Honor robots.txt rules |
| `rateLimit.points` | number | `10` | Requests per duration |
| `rateLimit.duration` | number | `10` | Duration in seconds |
| `retries` | number | `3` | Retry attempts on failure |
| `proxy` | object | `undefined` | Proxy configuration |
| `cookies` | array | `[]` | Initial cookies |
| `screenshotPath` | string | `undefined` | Save screenshot path |

## Anti-Blocking Techniques Used

1. **Browser Fingerprinting Protection**
   - Removes `navigator.webdriver` flag
   - Adds realistic `chrome` object
   - Mocks permissions API

2. **Human Behavior Simulation**
   - Random delays between actions
   - Mouse movements
   - Page scrolling
   - Variable timing

3. **Request Patterns**
   - Rate limiting
   - Random delays between requests
   - Respects robots.txt (optional)

4. **Browser Properties**
   - Realistic viewport sizes
   - Rotating user agents
   - Timezone and locale settings
   - Standard browser args

## Troubleshooting

### Browser Not Found
```bash
npx playwright install chromium
```

### Permission Errors
```bash
chmod +x node_modules/.bin/playwright
```

### Memory Issues
For large-scale crawling, adjust Node.js memory:
```bash
node --max-old-space-size=4096 dist/index.js
```

### Rate Limiting Errors
Increase the rate limit duration or decrease points:
```typescript
rateLimit: {
  points: 2,
  duration: 30,
}
```

### Proxy Connection Errors
Test your proxy separately:
```bash
curl -x http://proxy:8080 https://example.com
```

## Best Practices

1. **Always close the crawler** when done to free resources
2. **Use rate limiting** to be respectful to servers
3. **Respect robots.txt** unless you have permission
4. **Handle errors gracefully** with try-catch blocks
5. **Use proxies** for large-scale crawling
6. **Rotate user agents** for better anonymity
7. **Add random delays** between requests
8. **Monitor memory usage** for long-running crawls
9. **Use specific selectors** when waiting for dynamic content
10. **Test with headless: false** for debugging

## Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console - Colored output

Set log level via environment variable:
```bash
export LOG_LEVEL=debug
npm start
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or PR.

## Support

For issues, questions, or feature requests, please open a GitHub issue.
