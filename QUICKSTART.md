# Quick Start Guide

Get up and running with N8N Web Crawler in 5 minutes!

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Install browser
npx playwright install chromium

# 3. Build the project
npm run build
```

## Test It Out

### Option 1: Run Basic Example

```bash
npx ts-node examples/basic-crawl.ts
```

This will crawl example.com and display:
- Page title
- Status code
- Number of links and images found
- Metadata

### Option 2: Run as API Server

```bash
# Start the API server
npx ts-node examples/api-server.ts
```

Then test with curl:
```bash
curl -X POST http://localhost:3000/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Option 3: Use in Your Code

Create a file `test.ts`:

```typescript
import { WebCrawler } from './src/crawler/WebCrawler';

async function test() {
  const crawler = new WebCrawler({
    headless: true,
    timeout: 30000,
  });

  try {
    const result = await crawler.crawl('https://example.com');
    console.log('Title:', result.title);
    console.log('Links:', result.links.length);
  } finally {
    await crawler.close();
  }
}

test();
```

Run it:
```bash
npx ts-node test.ts
```

## Use in n8n

### Method 1: As Custom Node

```bash
# Create symlink to n8n custom directory
ln -s "$(pwd)" ~/.n8n/custom/n8n-web-crawler

# Restart n8n
n8n start
```

Find "Web Crawler" node in n8n under "Data & Storage"

### Method 2: Via HTTP Request

1. Start API server:
   ```bash
   npm run build
   node dist/examples/api-server.js
   ```

2. In n8n, add "HTTP Request" node:
   - Method: POST
   - URL: http://localhost:3000/crawl
   - Body: `{"url": "https://example.com"}`

### Method 3: Docker

```bash
docker-compose up -d
```

This starts:
- Web Crawler API on port 3000
- n8n on port 5678

Access n8n at http://localhost:5678 (admin/changeme)

## Common Use Cases

### Extract All Links

```typescript
const result = await crawler.crawl('https://example.com');
console.log('Links:', result.links);
```

### Get Page Text

```typescript
const result = await crawler.crawl('https://example.com');
console.log('Text:', result.text);
```

### Wait for Dynamic Content

```typescript
const crawler = new WebCrawler({
  waitForSelector: '.content-loaded',
  waitForTimeout: 2000,
});
```

### Use a Proxy

```typescript
const crawler = new WebCrawler({
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass',
  },
});
```

### Rate Limiting

```typescript
const crawler = new WebCrawler({
  rateLimit: {
    points: 5,      // 5 requests
    duration: 10,   // per 10 seconds
  },
});
```

## Next Steps

- Read [SETUP.md](SETUP.md) for detailed setup instructions
- Read [README.md](README.md) for full documentation
- Check `examples/` directory for more examples
- Import `examples/n8n-workflow-example.json` into n8n

## Troubleshooting

**Browser not found?**
```bash
npx playwright install chromium
```

**Permission errors?**
```bash
chmod +x node_modules/.bin/playwright
```

**Import errors?**
```bash
npm install
npm run build
```

**Need help?** Check the full documentation in [README.md](README.md)
