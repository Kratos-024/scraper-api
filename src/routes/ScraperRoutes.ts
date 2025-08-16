import { Router } from "express";
import { ScraperController } from "../controllers/ScraperController.js";

const router = Router();
const scraperController = new ScraperController();

router.get("/health", scraperController.healthCheck.bind(scraperController));

// Movie data route
router.post(
  "/scrape/movie",
  scraperController.scrapeMovie.bind(scraperController)
);

// NEW: Trending movies route
router.get(
  "/trending/movies",
  scraperController.scrapeTrendingMovies.bind(scraperController)
);

// // NEW: Videos only route
// router.post(
//   "/scrape/videos",
//   scraperController.scrapeVideosOnly.bind(scraperController)
// );

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    message: "Scraper API is running",
    endpoints: {
      "POST /api/scrape/movie": "Scrape IMDb movie data",
      "GET /api/trending/movies": "Get trending movies",
      "POST /api/scrape/videos": "Scrape videos only",
      "GET /api/health": "Health check",
    },
  });
});

export default router;
