import { chromium, Browser, Page, BrowserContext } from 'playwright';
// @ts-ignore - no type definitions available
import UserAgent from 'user-agents';
import { RateLimiterMemory } from 'rate-limiter-flexible';
// @ts-ignore - no type definitions available
import robotsParser from 'robots-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Logger } from '../utils/logger';

export interface CrawlerOptions {
  headless?: boolean;
  userAgent?: string;
  viewport?: { width: number; height: number };
  timeout?: number;
  waitForSelector?: string;
  waitForTimeout?: number;
  respectRobotsTxt?: boolean;
  rateLimit?: {
    points: number;
    duration: number;
  };
  retries?: number;
  javascript?: boolean;
  screenshotPath?: string;
  cookies?: Array<{ name: string; value: string; domain: string }>;
  proxy?: {
    server: string;
    username?: string;
    password?: string;
  };
}

export interface CrawlResult {
  url: string;
  html: string;
  text: string;
  title: string;
  metadata: {
    description?: string;
    keywords?: string;
    [key: string]: any;
  };
  links: string[];
  images: string[];
  statusCode?: number;
  screenshot?: string;
  success: boolean;
  error?: string;
}

export class WebCrawler {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private rateLimiter: RateLimiterMemory;
  private logger: Logger;
  private robotsCache: Map<string, any> = new Map();

  constructor(private options: CrawlerOptions = {}) {
    this.logger = new Logger('WebCrawler');

    // Default rate limiter: 10 requests per 10 seconds
    const rateLimitConfig = options.rateLimit || { points: 10, duration: 10 };
    this.rateLimiter = new RateLimiterMemory(rateLimitConfig);
  }

  /**
   * Initialize the browser instance
   */
  async initialize(): Promise<void> {
    if (this.browser) {
      return;
    }

    try {
      this.logger.info('Initializing browser...');

      this.browser = await chromium.launch({
        headless: this.options.headless !== false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
        ],
      });

      // Create context with anti-detection features
      this.context = await this.browser.newContext({
        viewport: this.options.viewport || { width: 1920, height: 1080 },
        userAgent: this.options.userAgent || new UserAgent().toString(),
        locale: 'en-US',
        timezoneId: 'America/New_York',
        permissions: [],
        ...(this.options.proxy && { proxy: this.options.proxy }),
      });

      // Add cookies if provided
      if (this.options.cookies && this.options.cookies.length > 0) {
        await this.context.addCookies(this.options.cookies);
      }

      // Anti-detection: Remove webdriver flag
      // Note: This script runs in the browser context, not Node.js
      await this.context.addInitScript(() => {
        // @ts-ignore - browser context globals
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });

        // Add chrome object
        // @ts-ignore - browser context globals
        window.chrome = {
          runtime: {},
        };

        // Mock permissions
        // @ts-ignore - browser context globals
        const originalQuery = window.navigator.permissions.query;
        // @ts-ignore - browser context globals
        window.navigator.permissions.query = (parameters: any) =>
          parameters.name === 'notifications'
            // @ts-ignore - browser context globals
            ? Promise.resolve({ state: Notification.permission })
            : originalQuery(parameters);
      });

      this.logger.info('Browser initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize browser', error);
      throw error;
    }
  }

  /**
   * Check robots.txt compliance
   */
  private async checkRobotsTxt(url: string): Promise<boolean> {
    if (!this.options.respectRobotsTxt) {
      return true;
    }

    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

      if (!this.robotsCache.has(robotsUrl)) {
        const response = await axios.get(robotsUrl, { timeout: 5000 });
        const robots = robotsParser(robotsUrl, response.data);
        this.robotsCache.set(robotsUrl, robots);
      }

      const robots = this.robotsCache.get(robotsUrl);
      const userAgent = this.options.userAgent || new UserAgent().toString();

      return robots.isAllowed(url, userAgent) ?? true;
    } catch (error) {
      // If robots.txt doesn't exist or can't be fetched, allow crawling
      return true;
    }
  }

  /**
   * Random delay to mimic human behavior
   */
  private async randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Simulate human-like mouse movements
   */
  private async simulateHumanBehavior(page: Page): Promise<void> {
    try {
      // Random scroll
      await page.evaluate(() => {
        // @ts-ignore - browser context globals
        window.scrollBy(0, Math.floor(Math.random() * 300));
      });

      await this.randomDelay(500, 1500);

      // Random mouse movement
      await page.mouse.move(
        Math.floor(Math.random() * 800),
        Math.floor(Math.random() * 600)
      );
    } catch (error) {
      // Ignore errors in simulation
    }
  }

  /**
   * Crawl a single URL
   */
  async crawl(url: string): Promise<CrawlResult> {
    let retries = this.options.retries || 3;
    let lastError: any;

    while (retries > 0) {
      try {
        return await this._crawl(url);
      } catch (error) {
        lastError = error;
        retries--;

        if (retries > 0) {
          this.logger.warn(`Retry crawling ${url}. Attempts left: ${retries}`);
          await this.randomDelay(2000, 5000);
        }
      }
    }

    return {
      url,
      html: '',
      text: '',
      title: '',
      metadata: {},
      links: [],
      images: [],
      success: false,
      error: lastError?.message || 'Unknown error',
    };
  }

  private async _crawl(url: string): Promise<CrawlResult> {
    // Rate limiting
    await this.rateLimiter.consume(url);

    // Check robots.txt
    const allowed = await this.checkRobotsTxt(url);
    if (!allowed) {
      throw new Error('URL is disallowed by robots.txt');
    }

    await this.initialize();

    if (!this.context) {
      throw new Error('Browser context not initialized');
    }

    const page = await this.context.newPage();

    try {
      this.logger.info(`Crawling: ${url}`);

      // Navigate with random delay
      await this.randomDelay(500, 1500);

      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: this.options.timeout || 30000,
      });

      // Wait for specific selector if provided
      if (this.options.waitForSelector) {
        await page.waitForSelector(this.options.waitForSelector, {
          timeout: this.options.timeout || 30000,
        });
      }

      // Additional wait time if specified
      if (this.options.waitForTimeout) {
        await page.waitForTimeout(this.options.waitForTimeout);
      }

      // Simulate human behavior
      await this.simulateHumanBehavior(page);

      // Extract data
      const html = await page.content();
      const $ = cheerio.load(html);

      // Extract metadata
      const metadata: any = {};
      $('meta').each((_, elem) => {
        const name = $(elem).attr('name') || $(elem).attr('property');
        const content = $(elem).attr('content');
        if (name && content) {
          metadata[name] = content;
        }
      });

      // Extract links
      const links = Array.from(
        new Set(
          $('a[href]')
            .map((_, elem) => $(elem).attr('href'))
            .get()
            .filter(Boolean)
            .map(href => {
              try {
                return new URL(href, url).href;
              } catch {
                return null;
              }
            })
            .filter(Boolean) as string[]
        )
      );

      // Extract images
      const images = Array.from(
        new Set(
          $('img[src]')
            .map((_, elem) => $(elem).attr('src'))
            .get()
            .filter(Boolean)
            .map(src => {
              try {
                return new URL(src, url).href;
              } catch {
                return null;
              }
            })
            .filter(Boolean) as string[]
        )
      );

      // Take screenshot if requested
      let screenshot: string | undefined;
      if (this.options.screenshotPath) {
        await page.screenshot({ path: this.options.screenshotPath, fullPage: true });
        screenshot = this.options.screenshotPath;
      }

      const result: CrawlResult = {
        url,
        html,
        text: $('body').text().trim(),
        title: $('title').text() || '',
        metadata,
        links,
        images,
        statusCode: response?.status(),
        screenshot,
        success: true,
      };

      await page.close();
      return result;
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  /**
   * Crawl multiple URLs
   */
  async crawlMultiple(urls: string[]): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];

    for (const url of urls) {
      const result = await this.crawl(url);
      results.push(result);

      // Random delay between requests
      if (urls.indexOf(url) < urls.length - 1) {
        await this.randomDelay(2000, 5000);
      }
    }

    return results;
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    this.logger.info('Browser closed');
  }
}
