import { WebCrawler } from '../src/crawler/WebCrawler';

/**
 * Basic crawl example
 * This demonstrates the simplest way to use the web crawler
 */
async function basicCrawl() {
  console.log('Starting basic crawl example...\n');

  // Create crawler with default settings
  const crawler = new WebCrawler({
    headless: true,
    timeout: 30000,
  });

  try {
    // Crawl a single URL
    console.log('Crawling https://example.com...');
    const result = await crawler.crawl('https://example.com');

    if (result.success) {
      console.log('\n✅ Crawl successful!');
      console.log(`Title: ${result.title}`);
      console.log(`Status Code: ${result.statusCode}`);
      console.log(`Text Length: ${result.text.length} characters`);
      console.log(`Links Found: ${result.links.length}`);
      console.log(`Images Found: ${result.images.length}`);

      console.log('\nFirst 5 links:');
      result.links.slice(0, 5).forEach((link, i) => {
        console.log(`  ${i + 1}. ${link}`);
      });

      console.log('\nMetadata:');
      console.log(`  Description: ${result.metadata.description || 'N/A'}`);
      console.log(`  Keywords: ${result.metadata.keywords || 'N/A'}`);
    } else {
      console.error('\n❌ Crawl failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Always close the crawler to free resources
    await crawler.close();
    console.log('\nCrawler closed.');
  }
}

// Run the example
basicCrawl().catch(console.error);
