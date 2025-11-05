import express, { Request, Response } from 'express';
import { WebCrawler, CrawlerOptions } from '../src/crawler/WebCrawler';

/**
 * API Server Example
 * Run the web crawler as an HTTP API service
 * This allows you to use the HTTP Request node in n8n
 */

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Crawl single URL endpoint
app.post('/crawl', async (req: Request, res: Response) => {
  const { url, options } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const crawler = new WebCrawler(options as CrawlerOptions);

  try {
    const result = await crawler.crawl(url);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      error: 'Crawl failed',
      message: error.message,
    });
  } finally {
    await crawler.close();
  }
});

// Crawl multiple URLs endpoint
app.post('/crawl/batch', async (req: Request, res: Response) => {
  const { urls, options } = req.body;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'URLs array is required' });
  }

  const crawler = new WebCrawler(options as CrawlerOptions);

  try {
    const results = await crawler.crawlMultiple(urls);
    res.json({
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Batch crawl failed',
      message: error.message,
    });
  } finally {
    await crawler.close();
  }
});

// Get crawler options documentation
app.get('/options', (req: Request, res: Response) => {
  res.json({
    description: 'Available crawler options',
    options: {
      headless: {
        type: 'boolean',
        default: true,
        description: 'Run browser in headless mode',
      },
      userAgent: {
        type: 'string',
        default: 'random',
        description: 'Custom user agent string',
      },
      viewport: {
        type: 'object',
        default: { width: 1920, height: 1080 },
        description: 'Browser viewport size',
      },
      timeout: {
        type: 'number',
        default: 30000,
        description: 'Page load timeout in milliseconds',
      },
      waitForSelector: {
        type: 'string',
        description: 'CSS selector to wait for',
      },
      waitForTimeout: {
        type: 'number',
        default: 0,
        description: 'Additional wait time in milliseconds',
      },
      respectRobotsTxt: {
        type: 'boolean',
        default: true,
        description: 'Honor robots.txt rules',
      },
      rateLimit: {
        type: 'object',
        default: { points: 10, duration: 10 },
        description: 'Rate limiting configuration',
      },
      retries: {
        type: 'number',
        default: 3,
        description: 'Number of retry attempts',
      },
      proxy: {
        type: 'object',
        description: 'Proxy configuration (server, username, password)',
      },
      cookies: {
        type: 'array',
        description: 'Initial cookies array',
      },
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Web Crawler API Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Crawl single:  POST http://localhost:${PORT}/crawl`);
  console.log(`   Crawl batch:   POST http://localhost:${PORT}/crawl/batch`);
  console.log(`   Options docs:  GET http://localhost:${PORT}/options`);
});

export default app;
