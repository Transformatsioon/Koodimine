export { WebCrawler, CrawlerOptions, CrawlResult } from './crawler/WebCrawler';
export { Logger } from './utils/logger';

// Example usage
import { WebCrawler } from './crawler/WebCrawler';

async function example() {
  const crawler = new WebCrawler({
    headless: true,
    timeout: 30000,
    respectRobotsTxt: true,
    rateLimit: {
      points: 5,
      duration: 10,
    },
    retries: 3,
  });

  try {
    const result = await crawler.crawl('https://example.com');
    console.log('Crawl result:', {
      title: result.title,
      linksCount: result.links.length,
      imagesCount: result.images.length,
      success: result.success,
    });
  } finally {
    await crawler.close();
  }
}

// Uncomment to run example
// example().catch(console.error);
