import { WebCrawler } from '../src/crawler/WebCrawler';

/**
 * Advanced configuration example
 * This demonstrates advanced features like custom user agent,
 * waiting for selectors, and extracting specific content
 */
async function advancedCrawl() {
  console.log('Starting advanced crawl example...\n');

  const crawler = new WebCrawler({
    // Browser configuration
    headless: true,
    viewport: {
      width: 1920,
      height: 1080,
    },

    // Custom user agent
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',

    // Timing configuration
    timeout: 60000,                     // 60 second timeout
    waitForTimeout: 2000,               // Wait 2s after page load

    // Anti-blocking features
    respectRobotsTxt: true,

    // Rate limiting - be respectful!
    rateLimit: {
      points: 5,
      duration: 15,
    },

    // Retry logic
    retries: 3,
  });

  try {
    console.log('Crawling with advanced configuration...');

    // Example: Crawl a page and extract specific information
    const result = await crawler.crawl('https://example.com');

    if (result.success) {
      console.log('\n✅ Crawl successful!\n');

      // Display comprehensive information
      console.log('Page Information:');
      console.log(`  URL: ${result.url}`);
      console.log(`  Title: ${result.title}`);
      console.log(`  Status Code: ${result.statusCode}`);

      console.log('\nContent Statistics:');
      console.log(`  HTML Size: ${(result.html.length / 1024).toFixed(2)} KB`);
      console.log(`  Text Length: ${result.text.length} characters`);
      console.log(`  Word Count: ${result.text.split(/\s+/).length} words`);

      console.log('\nExtracted Resources:');
      console.log(`  Links: ${result.links.length}`);
      console.log(`  Images: ${result.images.length}`);

      console.log('\nMetadata:');
      Object.entries(result.metadata).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });

      // Analyze links
      console.log('\nLink Analysis:');
      const internalLinks = result.links.filter(link =>
        link.includes(new URL(result.url).hostname)
      );
      const externalLinks = result.links.filter(link =>
        !link.includes(new URL(result.url).hostname)
      );

      console.log(`  Internal Links: ${internalLinks.length}`);
      console.log(`  External Links: ${externalLinks.length}`);

      // Image analysis
      console.log('\nImage Types:');
      const imageTypes = result.images.reduce((acc: any, img) => {
        const ext = img.split('.').pop()?.split('?')[0]?.toLowerCase();
        if (ext) {
          acc[ext] = (acc[ext] || 0) + 1;
        }
        return acc;
      }, {});

      Object.entries(imageTypes).forEach(([type, count]) => {
        console.log(`  .${type}: ${count}`);
      });

      // Extract first paragraph
      const firstParagraph = result.text.split('\n\n')[0];
      console.log('\nFirst Paragraph:');
      console.log(`  ${firstParagraph.slice(0, 200)}...`);
    } else {
      console.error('\n❌ Crawl failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await crawler.close();
    console.log('\nCrawler closed.');
  }
}

advancedCrawl().catch(console.error);
