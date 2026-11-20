import { Sentry } from "./instrument";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { router } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimit } from "./middleware/rate-limit";
import { client as posthogClient } from "./utils/posthog";

const requiredEnvVars = [
  "OPENAI_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const app = express();
const port = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Audit trail in Sentry: one structured log line per request, including rate-limited probes
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const forwarded = req.headers["x-forwarded-for"];
    Sentry.logger.info("request", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
      ip:
        (Array.isArray(forwarded) ? forwarded[0] : forwarded)
          ?.split(",")[0]
          ?.trim() ??
        req.ip ??
        "unknown",
      userAgent: req.headers["user-agent"] ?? "",
    });
  });
  next();
});

app.use(rateLimit());

app.use("/", router);

// Report route errors to Sentry before the app's own handler formats the response
Sentry.setupExpressErrorHandler(app);

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received. Closing HTTP server...");
  await posthogClient.shutdown();
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received. Closing HTTP server...");
  await posthogClient.shutdown();
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
