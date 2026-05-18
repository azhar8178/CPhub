import app from "./app";
import { logger } from "./lib/logger";
import { runMigrations } from "@cphub/db/migrate";
import { seedInitialAdmin } from "./lib/seed";
import { seedCphubContent } from "./lib/seedCphub";

const REQUIRED = ["DATABASE_URL", "JWT_SECRET"];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const port = Number(process.env.PORT ?? 3001);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "API server listening");
  try {
    await runMigrations();
    logger.info("Database migrations complete");
    await seedInitialAdmin();
    await seedCphubContent();
  } catch (err) {
    logger.error({ err }, "Startup tasks failed");
  }
});
