import dotenv from "dotenv";
dotenv.config({ path: ".env", debug: true });
console.log("process.env.SCRAPER_API_KEY", process.env.SCRAPER_API_KEY);

import express from "express";
import cors from "cors";

import router from "./routes/ScraperRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://yourdomain.com"]
      : [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:5173",
        ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use("/api", router);

app.get("/", (req, res) => {
  res.json({
    message: "IMDb Scraper API",
    version: "1.0.0",
    status: "Running",
    endpoints: {
      "GET /": "API information",
      "GET /api/health": "Health check",
      "POST /api/scrape/movie": "Scrape IMDb movie data",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: ["GET /", "GET /api/health", "POST /api/scrape/movie"],
  });
});

// Error handling middleware
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", error);

    res.status(500).json({
      error: "Internal server error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎬 Scraper endpoint: http://localhost:${PORT}/api/scrape/movie`);

  if (!process.env.SCRAPER_API_KEY) {
    console.warn(
      "⚠️  Warning: SCRAPER_API_KEY not set in environment variables"
    );
  }
});

export default app;
