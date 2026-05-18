import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";
import apiRouter from "./routes";

const app: Express = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(pinoHttp({ logger }));

app.use("/api", apiRouter);

app.get("/", (_req, res) => {
  res.json({ name: "cphub-api", status: "ok" });
});

export default app;
