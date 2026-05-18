import { Router, type IRouter } from "express";
import authRouter from "./auth";
import cphubRouter from "./cphub";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  res.json({ status: "ok" });
});

router.use(authRouter);
router.use(cphubRouter);

export default router;
