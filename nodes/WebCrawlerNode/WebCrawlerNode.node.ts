import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import { WebCrawler, CrawlerOptions } from '../../src/crawler/WebCrawler';

export class WebCrawlerNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Web Crawler',
    name: 'webCrawler',
    icon: 'fa:spider',
    group: ['transform'],
    version: 1,
    description: 'Reliable web crawler with anti-blocking features',
    defaults: {
      name: 'Web Crawler',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: false,
        options: [
          {
            name: 'Crawl Single URL',
            value: 'crawlSingle',
            description: 'Crawl a single URL',
            action: 'Crawl a single URL',
          },
          {
            name: 'Crawl Multiple URLs',
            value: 'crawlMultiple',
            description: 'Crawl multiple URLs',
            action: 'Crawl multiple URLs',
          },
        ],
        default: 'crawlSingle',
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['crawlSingle'],
          },
        },
        default: '',
        required: true,
        description: 'The URL to crawl',
      },
      {
        displayName: 'URLs',
        name: 'urls',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['crawlMultiple'],
          },
        },
        default: '',
        required: true,
        description: 'Comma-separated list of URLs to crawl',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Headless Mode',
            name: 'headless',
            type: 'boolean',
            default: true,
            description: 'Whether to run browser in headless mode',
          },
          {
            displayName: 'Timeout (ms)',
            name: 'timeout',
            type: 'number',
            default: 30000,
            description: 'Maximum time to wait for page load',
          },
          {
            displayName: 'Wait For Selector',
            name: 'waitForSelector',
            type: 'string',
            default: '',
            description: 'CSS selector to wait for before extracting content',
          },
          {
            displayName: 'Wait For Timeout (ms)',
            name: 'waitForTimeout',
            type: 'number',
            default: 0,
            description: 'Additional time to wait after page load',
          },
          {
            displayName: 'Respect robots.txt',
            name: 'respectRobotsTxt',
            type: 'boolean',
            default: true,
            description: 'Whether to respect robots.txt rules',
          },
          {
            displayName: 'Rate Limit - Requests',
            name: 'rateLimitPoints',
            type: 'number',
            default: 10,
            description: 'Number of requests allowed per duration',
          },
          {
            displayName: 'Rate Limit - Duration (s)',
            name: 'rateLimitDuration',
            type: 'number',
            default: 10,
            description: 'Duration in seconds for rate limiting',
          },
          {
            displayName: 'Retries',
            name: 'retries',
            type: 'number',
            default: 3,
            description: 'Number of retry attempts on failure',
          },
          {
            displayName: 'User Agent',
            name: 'userAgent',
            type: 'string',
            default: '',
            description: 'Custom user agent string (leave empty for random)',
          },
          {
            displayName: 'Viewport Width',
            name: 'viewportWidth',
            type: 'number',
            default: 1920,
            description: 'Browser viewport width',
          },
          {
            displayName: 'Viewport Height',
            name: 'viewportHeight',
            type: 'number',
            default: 1080,
            description: 'Browser viewport height',
          },
          {
            displayName: 'Extract Links',
            name: 'extractLinks',
            type: 'boolean',
            default: true,
            description: 'Whether to extract all links from the page',
          },
          {
            displayName: 'Extract Images',
            name: 'extractImages',
            type: 'boolean',
            default: true,
            description: 'Whether to extract all images from the page',
          },
          {
            displayName: 'Extract Metadata',
            name: 'extractMetadata',
            type: 'boolean',
            default: true,
            description: 'Whether to extract meta tags',
          },
          {
            displayName: 'Proxy Server',
            name: 'proxyServer',
            type: 'string',
            default: '',
            description: 'Proxy server URL (e.g., http://proxy.example.com:8080)',
          },
          {
            displayName: 'Proxy Username',
            name: 'proxyUsername',
            type: 'string',
            default: '',
            description: 'Proxy authentication username',
          },
          {
            displayName: 'Proxy Password',
            name: 'proxyPassword',
            type: 'string',
            typeOptions: {
              password: true,
            },
            default: '',
            description: 'Proxy authentication password',
          },
        ],
      },
      {
        displayName: 'Output Format',
        name: 'outputFormat',
        type: 'options',
        options: [
          {
            name: 'Full',
            value: 'full',
            description: 'Return all extracted data',
          },
          {
            name: 'HTML Only',
            value: 'html',
            description: 'Return only HTML content',
          },
          {
            name: 'Text Only',
            value: 'text',
            description: 'Return only text content',
          },
          {
            name: 'Links Only',
            value: 'links',
            description: 'Return only extracted links',
          },
          {
            name: 'Custom',
            value: 'custom',
            description: 'Select specific fields to return',
          },
        ],
        default: 'full',
        description: 'What data to return',
      },
      {
        displayName: 'Custom Fields',
        name: 'customFields',
        type: 'multiOptions',
        displayOptions: {
          show: {
            outputFormat: ['custom'],
          },
        },
        options: [
          {
            name: 'URL',
            value: 'url',
          },
          {
            name: 'HTML',
            value: 'html',
          },
          {
            name: 'Text',
            value: 'text',
          },
          {
            name: 'Title',
            value: 'title',
          },
          {
            name: 'Metadata',
            value: 'metadata',
          },
          {
            name: 'Links',
            value: 'links',
          },
          {
            name: 'Images',
            value: 'images',
          },
          {
            name: 'Status Code',
            value: 'statusCode',
          },
        ],
        default: ['url', 'title', 'text'],
        description: 'Fields to include in the output',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const operation = this.getNodeParameter('operation', 0) as string;
    const options = this.getNodeParameter('options', 0, {}) as any;
    const outputFormat = this.getNodeParameter('outputFormat', 0) as string;

    // Build crawler options
    const crawlerOptions: CrawlerOptions = {
      headless: options.headless !== false,
      timeout: options.timeout || 30000,
      waitForSelector: options.waitForSelector || undefined,
      waitForTimeout: options.waitForTimeout || undefined,
      respectRobotsTxt: options.respectRobotsTxt !== false,
      retries: options.retries || 3,
      userAgent: options.userAgent || undefined,
      viewport: {
        width: options.viewportWidth || 1920,
        height: options.viewportHeight || 1080,
      },
      rateLimit: {
        points: options.rateLimitPoints || 10,
        duration: options.rateLimitDuration || 10,
      },
    };

    // Add proxy if provided
    if (options.proxyServer) {
      crawlerOptions.proxy = {
        server: options.proxyServer,
        username: options.proxyUsername || undefined,
        password: options.proxyPassword || undefined,
      };
    }

    const crawler = new WebCrawler(crawlerOptions);

    try {
      for (let i = 0; i < items.length; i++) {
        try {
          if (operation === 'crawlSingle') {
            const url = this.getNodeParameter('url', i) as string;

            if (!url) {
              throw new NodeOperationError(this.getNode(), 'URL is required', {
                itemIndex: i,
              });
            }

            const result = await crawler.crawl(url);

            if (!result.success) {
              throw new NodeOperationError(
                this.getNode(),
                `Failed to crawl URL: ${result.error}`,
                { itemIndex: i }
              );
            }

            // Format output based on user selection
            let outputData: any = {};

            switch (outputFormat) {
              case 'html':
                outputData = { html: result.html };
                break;
              case 'text':
                outputData = { text: result.text };
                break;
              case 'links':
                outputData = { links: result.links };
                break;
              case 'custom':
                const customFields = this.getNodeParameter('customFields', i) as string[];
                customFields.forEach(field => {
                  outputData[field] = result[field as keyof typeof result];
                });
                break;
              case 'full':
              default:
                outputData = result;
                break;
            }

            returnData.push({
              json: outputData,
              pairedItem: { item: i },
            });
          } else if (operation === 'crawlMultiple') {
            const urlsString = this.getNodeParameter('urls', i) as string;
            const urls = urlsString.split(',').map(u => u.trim()).filter(Boolean);

            if (urls.length === 0) {
              throw new NodeOperationError(
                this.getNode(),
                'At least one URL is required',
                { itemIndex: i }
              );
            }

            const results = await crawler.crawlMultiple(urls);

            for (const result of results) {
              let outputData: any = {};

              switch (outputFormat) {
                case 'html':
                  outputData = { html: result.html };
                  break;
                case 'text':
                  outputData = { text: result.text };
                  break;
                case 'links':
                  outputData = { links: result.links };
                  break;
                case 'custom':
                  const customFields = this.getNodeParameter('customFields', i) as string[];
                  customFields.forEach(field => {
                    outputData[field] = result[field as keyof typeof result];
                  });
                  break;
                case 'full':
                default:
                  outputData = result;
                  break;
              }

              returnData.push({
                json: outputData,
                pairedItem: { item: i },
              });
            }
          }
        } catch (error) {
          if (this.continueOnFail()) {
            returnData.push({
              json: {
                error: error.message,
              },
              pairedItem: { item: i },
            });
            continue;
          }
          throw error;
        }
      }
    } finally {
      await crawler.close();
    }

    return [returnData];
  }
}
