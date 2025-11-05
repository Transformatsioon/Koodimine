# Setup Guide

Complete setup instructions for using the N8N Web Crawler locally and with n8n.

## Quick Start (5 minutes)

```bash
# 1. Clone/download the project
cd n8n-web-crawler

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium

# 4. Build the project
npm run build

# 5. Run an example
npm run dev
```

## Detailed Setup

### 1. Prerequisites

Before you begin, ensure you have:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** (optional, for cloning)
- At least **2GB** of free disk space for browser binaries

Verify your installation:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

This will install:
- Playwright for browser automation
- TypeScript and build tools
- Supporting libraries

### 3. Install Browser Binaries

Playwright requires browser binaries. Install Chromium:

```bash
npx playwright install chromium
```

This downloads ~200MB of browser binaries. To verify:
```bash
npx playwright --version
```

### 4. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### 5. Test the Installation

Run a basic example:

```bash
npm run dev
```

Or run a compiled example:
```bash
node dist/examples/basic-crawl.js
```

## Running Locally

### Development Mode

Run TypeScript files directly with hot reloading:

```bash
npm run dev
```

Or run specific examples:
```bash
npx ts-node examples/basic-crawl.ts
npx ts-node examples/multiple-urls.ts
npx ts-node examples/advanced-config.ts
```

### Production Mode

Build and run the compiled version:

```bash
npm run build
npm start
```

### Watch Mode

Auto-rebuild on file changes:

```bash
npm run watch
```

## Adding to n8n

### Method 1: Custom Node (Recommended)

This method integrates the crawler directly into n8n as a node.

#### Step 1: Build the Project

```bash
npm run build
```

#### Step 2: Locate n8n Custom Nodes Directory

Default locations:
- **Linux/Mac**: `~/.n8n/custom/`
- **Windows**: `%USERPROFILE%\.n8n\custom\`

Create it if it doesn't exist:
```bash
mkdir -p ~/.n8n/custom
```

#### Step 3: Create Symlink

```bash
# From the project directory
cd /path/to/n8n-web-crawler

# Create symlink
ln -s "$(pwd)" ~/.n8n/custom/n8n-web-crawler
```

Or copy the entire project:
```bash
cp -r /path/to/n8n-web-crawler ~/.n8n/custom/n8n-web-crawler
```

#### Step 4: Update n8n Configuration

Edit your n8n configuration file (`.n8n/config`):

```json
{
  "nodes": {
    "communityPackages": {
      "enabled": true
    }
  }
}
```

#### Step 5: Restart n8n

```bash
# If running via npm
n8n start

# If running via Docker
docker restart n8n

# If running as a service
sudo systemctl restart n8n
```

#### Step 6: Verify Installation

1. Open n8n in your browser
2. Create a new workflow
3. Click "Add node"
4. Search for "Web Crawler"
5. The node should appear under "Data & Storage"

### Method 2: HTTP API Service

Run the crawler as a separate service and call it from n8n using HTTP Request node.

#### Step 1: Install Express

```bash
npm install express @types/express
```

#### Step 2: Run the API Server

```bash
# Development mode
npx ts-node examples/api-server.ts

# Production mode
npm run build
node dist/examples/api-server.js
```

The server runs on `http://localhost:3000` by default.

#### Step 3: Configure n8n HTTP Request Node

In n8n, add an "HTTP Request" node with:

**For single URL:**
- Method: `POST`
- URL: `http://localhost:3000/crawl`
- Body:
  ```json
  {
    "url": "https://example.com",
    "options": {
      "headless": true,
      "timeout": 30000
    }
  }
  ```

**For multiple URLs:**
- Method: `POST`
- URL: `http://localhost:3000/crawl/batch`
- Body:
  ```json
  {
    "urls": ["https://example.com", "https://another.com"],
    "options": {
      "headless": true,
      "rateLimit": {
        "points": 5,
        "duration": 10
      }
    }
  }
  ```

#### Step 4: Process Manager (Production)

For production, use PM2 to keep the server running:

```bash
# Install PM2
npm install -g pm2

# Start the server
pm2 start dist/examples/api-server.js --name web-crawler-api

# Save the process list
pm2 save

# Setup auto-restart on system reboot
pm2 startup
```

Manage the service:
```bash
pm2 status              # Check status
pm2 logs web-crawler-api # View logs
pm2 restart web-crawler-api # Restart
pm2 stop web-crawler-api    # Stop
```

### Method 3: Docker Container

Create a Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install Chromium dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Chromium path
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/examples/api-server.js"]
```

Build and run:
```bash
docker build -t n8n-web-crawler .
docker run -p 3000:3000 n8n-web-crawler
```

## Environment Variables

Create a `.env` file for configuration:

```bash
# Logging
LOG_LEVEL=info          # debug, info, warn, error

# API Server (if using Method 2)
PORT=3000

# Rate Limiting
RATE_LIMIT_POINTS=10
RATE_LIMIT_DURATION=10

# Browser
HEADLESS=true
BROWSER_TIMEOUT=30000

# Proxy (optional)
PROXY_SERVER=http://proxy.example.com:8080
PROXY_USERNAME=user
PROXY_PASSWORD=pass
```

Load in your code:
```typescript
import dotenv from 'dotenv';
dotenv.config();
```

## Testing

### Run Examples

```bash
# Basic crawl
npx ts-node examples/basic-crawl.ts

# Multiple URLs
npx ts-node examples/multiple-urls.ts

# Advanced config
npx ts-node examples/advanced-config.ts
```

### Test API Server

Start the server:
```bash
npx ts-node examples/api-server.ts
```

Test with curl:
```bash
# Health check
curl http://localhost:3000/health

# Crawl single URL
curl -X POST http://localhost:3000/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Crawl multiple URLs
curl -X POST http://localhost:3000/crawl/batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://example.com", "https://httpbin.org"],
    "options": {"timeout": 30000}
  }'
```

## Troubleshooting

### Issue: Browser Not Found

**Error**: `Executable doesn't exist`

**Solution**:
```bash
npx playwright install chromium
```

### Issue: Permission Denied

**Error**: `EACCES: permission denied`

**Solution**:
```bash
chmod +x node_modules/.bin/playwright
```

On Linux, you may need to install dependencies:
```bash
npx playwright install-deps chromium
```

### Issue: Out of Memory

**Error**: `JavaScript heap out of memory`

**Solution**: Increase Node.js memory:
```bash
node --max-old-space-size=4096 dist/index.js
```

### Issue: Rate Limiting

**Error**: `Rate limit exceeded`

**Solution**: Adjust rate limiter settings:
```typescript
rateLimit: {
  points: 5,        // Fewer requests
  duration: 30,     // Longer duration
}
```

### Issue: Timeout Errors

**Error**: `Navigation timeout of 30000ms exceeded`

**Solution**:
1. Increase timeout:
   ```typescript
   timeout: 60000
   ```

2. Use waitForSelector:
   ```typescript
   waitForSelector: 'body'
   ```

3. Add additional wait time:
   ```typescript
   waitForTimeout: 3000
   ```

### Issue: Proxy Connection Failed

**Error**: `Proxy connection failed`

**Solution**:
1. Test proxy separately:
   ```bash
   curl -x http://proxy:8080 https://example.com
   ```

2. Check proxy credentials

3. Verify proxy server is running

### Issue: n8n Not Detecting Node

**Solution**:
1. Verify symlink:
   ```bash
   ls -la ~/.n8n/custom/
   ```

2. Check package.json has n8n configuration:
   ```json
   {
     "n8n": {
       "n8nNodesApiVersion": 1
     }
   }
   ```

3. Restart n8n completely

4. Check n8n logs:
   ```bash
   n8n start --log-level=debug
   ```

### Issue: Import Errors

**Error**: `Cannot find module`

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Performance Optimization

### For High-Volume Crawling

1. **Increase rate limits carefully**:
   ```typescript
   rateLimit: {
     points: 20,
     duration: 10,
   }
   ```

2. **Use connection pooling** (create multiple crawler instances)

3. **Disable unnecessary features**:
   ```typescript
   {
     javascript: false,      // If you don't need JS execution
     extractImages: false,   // If you don't need images
   }
   ```

4. **Use lighter extraction** (cheerio instead of full browser)

5. **Implement caching** to avoid re-crawling

### Memory Management

```bash
# Monitor memory usage
node --max-old-space-size=2048 \
     --expose-gc \
     dist/index.js
```

### Scaling

- Use a queue system (Bull, BullMQ) for job management
- Distribute crawling across multiple workers
- Use Redis for shared rate limiting
- Implement result caching

## Next Steps

1. **Read the full documentation** in [README.md](README.md)
2. **Run the examples** in the `examples/` directory
3. **Import the n8n workflow** from `examples/n8n-workflow-example.json`
4. **Customize** crawler options for your use case
5. **Set up monitoring** and logging for production use

## Support

- GitHub Issues: Report bugs and request features
- Documentation: Check README.md for detailed usage
- Examples: Review example files in `examples/` directory
