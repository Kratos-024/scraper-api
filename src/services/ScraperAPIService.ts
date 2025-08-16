import axios from "axios";

interface ScraperAPIOptions {
  render?: boolean;
  country_code?: string;
  premium?: boolean;
  session_number?: number;
  keep_headers?: boolean;
}

export default class ScraperAPIService {
  private apiKey: string;
  private baseUrl: string = "http://api.scraperapi.com";

  constructor() {
    this.apiKey = "80dd264b47f09639597483cd7eae2844";
    if (!this.apiKey) {
      throw new Error("SCRAPER_API_KEY is required");
    }
  }

  // Helper function to convert all values to strings
  private toStringParams(obj: Record<string, any>): Record<string, string> {
    const params: Record<string, string> = {};
    for (const key in obj) {
      const value = obj[key];
      if (value === undefined || value === null) continue;
      if (typeof value === "boolean") {
        params[key] = value ? "true" : "false";
      } else {
        params[key] = String(value);
      }
    }
    return params;
  }

  async scrapeUrl(
    url: string,
    options: ScraperAPIOptions = {}
  ): Promise<string> {
    try {
      // Build parameters object with all string values
      const paramsData = {
        api_key: this.apiKey,
        url: url,
        render: (options.render ?? true).toString(),
        country_code: options.country_code || "us",
        premium: (options.premium ?? false).toString(),
        keep_headers: (options.keep_headers ?? true).toString(),
        // Convert any additional options to strings
        ...this.toStringParams(options),
      };

      const params = new URLSearchParams(paramsData);

      const response = await axios.get(
        `${this.baseUrl}/?${params.toString()}`,
        {
          timeout: 60000, // 60 seconds timeout
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("ScraperAPI error:", error.message);
      throw new Error(`Failed to scrape URL: ${error.message}`);
    }
  }

  async scrapeWithRetry(
    url: string,
    maxRetries: number = 3,
    options: ScraperAPIOptions = {}
  ): Promise<string> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Scraping attempt ${attempt}/${maxRetries} for: ${url}`);
        const html = await this.scrapeUrl(url, options);
        return html;
      } catch (error: any) {
        lastError = error;
        console.log(`Attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }
}
