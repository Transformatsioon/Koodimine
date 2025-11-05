import { WebCrawler } from '../src/crawler/WebCrawler';

/**
 * Multiple URLs crawl example
 * This demonstrates how to crawl multiple URLs with rate limiting
 */
async function crawlMultipleUrls() {
  console.log('Starting multiple URLs crawl example...\n');

  const crawler = new WebCrawler({
    headless: true,
    timeout: 30000,
    rateLimit: {
      points: 3,      // 3 requests
      duration: 10,   // per 10 seconds
    },
    retries: 2,
  });

  const urls = [
    'https://example.com',
    'https://www.iana.org/domains/reserved',
    'https://httpbin.org/html',
  ];

  try {
    console.log(`Crawling ${urls.length} URLs with rate limiting...`);
    console.log('Rate limit: 3 requests per 10 seconds\n');

    const startTime = Date.now();
    const results = await crawler.crawlMultiple(urls);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Completed in ${duration} seconds\n`);

    // Display results
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.url}`);
      console.log(`   Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
      if (result.success) {
        console.log(`   Title: ${result.title || 'N/A'}`);
        console.log(`   Links: ${result.links.length}`);
        console.log(`   Images: ${result.images.length}`);
      } else {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    });

    // Statistics
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('Summary:');
    console.log(`  Total URLs: ${results.length}`);
    console.log(`  Successful: ${successful}`);
    console.log(`  Failed: ${failed}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await crawler.close();
    console.log('\nCrawler closed.');
  }
}

crawlMultipleUrls().catch(console.error);
