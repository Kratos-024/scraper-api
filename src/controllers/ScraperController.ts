import type { Request, Response } from "express";
import Scraper from "../services/Scraper.js";
import { ApiError } from "../utils/ApiError.js";

class ScraperController {
  private scraper: Scraper;

  constructor() {
    this.scraper = new Scraper();
  }

  async scrapeMovie(req: Request, res: Response) {
    try {
      const { imdbid } = req.body;

      if (!imdbid) {
        return res.status(400).json({
          error: "imdbid is required",
          example: { url: "imdbid tt1234567" },
        });
      }

      console.log("Starting scrape for:", imdbid);
      const link = `https://www.imdb.com/title/${imdbid}/`;
      const movieData = await this.scraper.scrapeCompleteMovieData(link);

      res.json({
        success: true,
        data: movieData,
        scrapedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Scraping error:", error.message);

      res.status(500).json({
        error: "Failed to scrape movie data",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }

  async scrapeTrendingMovies(req: Request, res: Response) {
    try {
      console.log("🎬 Starting to scrape trending movies from IMDb...");

      const movieList = await this.scraper.scrapeTrending(
        "https://www.imdb.com/list/ls082250769/"
      );
      console.log("📊 Raw scraper result:", {
        type: typeof movieList,
        isArray: Array.isArray(movieList),
        length: Array.isArray(movieList) ? movieList.length : "N/A",
      });

      if (!movieList) {
        console.error("❌ Scraper returned null/undefined");
        throw new ApiError(500, "Scraper returned no data");
      }

      if (!Array.isArray(movieList)) {
        console.error("❌ Scraper returned non-array data:", typeof movieList);
        throw new ApiError(500, "Scraper returned invalid data format");
      }

      if (movieList.length === 0) {
        console.error("❌ Scraper returned empty array");
        throw new ApiError(500, "No trending movies found on IMDb");
      }

      const validMovies = movieList.filter((movie) => {
        const isValid =
          movie &&
          typeof movie === "object" &&
          movie.title &&
          movie.title.trim() !== "";

        if (!isValid) {
          console.warn("⚠️ Filtered out invalid movie:", movie);
        }

        return isValid;
      });

      console.log(`✅ Successfully scraped ${validMovies.length} valid movies`);

      if (validMovies.length === 0) {
        throw new ApiError(500, "No valid trending movies data found");
      }

      res.json({
        success: true,
        data: validMovies,
        count: validMovies.length,
        type: "trending",
        scrapedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Trending movies error:", error.message);
      res.status(500).json({
        error: "Failed to scrape trending movies",
        message: error.message,
      });
    }
  }

  // // NEW METHOD: Scrape videos only
  // async scrapeVideosOnly(req: Request, res: Response) {
  //   try {
  //     const { url } = req.body;

  //     if (!url) {
  //       return res.status(400).json({
  //         error: "URL is required",
  //         example: { url: "https://www.imdb.com/title/tt1234567/" },
  //       });
  //     }

  //     if (!url.includes("imdb.com/title/")) {
  //       return res.status(400).json({
  //         error: "Invalid IMDb URL format",
  //         expected: "https://www.imdb.com/title/tt1234567/",
  //       });
  //     }

  //     console.log("Scraping videos only for:", url);
  //     const videoData = await this.scraper.scrapeVideosOnly(url);

  //     res.json({
  //       success: true,
  //       data: videoData,
  //       scrapedAt: new Date().toISOString(),
  //     });
  //   } catch (error: any) {
  //     console.error("Videos scraping error:", error.message);
  //     res.status(500).json({
  //       error: "Failed to scrape videos",
  //       message: error.message,
  //     });
  //   }
  // }

  async healthCheck(req: Request, res: Response) {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      service: "IMDb Scraper API",
      version: "1.0.0",
    });
  }
}

export { ScraperController };
