import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { db, usersTable } from "@cphub/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth, requireRole } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { sendPasswordResetEmail } from "../lib/email";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.trim().toLowerCase()))
      .limit(1);
    if (!user?.passwordHash) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    logger.error({ err }, "Login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);
    if (!user) {
      // Always succeed to avoid leaking which emails exist.
      res.json({ success: true });
      return;
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await db
      .update(usersTable)
      .set({
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));
    await sendPasswordResetEmail({ email: user.email, name: user.name, resetToken });
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Forgot password error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  try {
    const { token, password } = req.body as { token?: string; password?: string };
    if (!token || !password) {
      res.status(400).json({ error: "Token and password are required" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.resetPasswordToken, token))
      .limit(1);
    if (
      !user ||
      !user.resetPasswordTokenExpiresAt ||
      user.resetPasswordTokenExpiresAt < new Date()
    ) {
      res.status(400).json({ error: "This reset link is invalid or has expired" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await db
      .update(usersTable)
      .set({
        passwordHash,
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Reset password error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  res.json(req.user);
});

// ── Users management (admin only) ───────────────────────────────────────────

router.get("/users", requireRole("admin"), async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable);
  res.json(rows);
});

router.post("/users", requireRole("admin"), async (req, res): Promise<void> => {
  const b = req.body ?? {};
  if (!b.email || !b.name || !b.password) {
    res.status(400).json({ error: "email, name, password required" });
    return;
  }
  const passwordHash = await bcrypt.hash(String(b.password), 12);
  const [row] = await db
    .insert(usersTable)
    .values({
      email: String(b.email).toLowerCase().trim(),
      name: String(b.name),
      role: b.role ?? "editor",
      passwordHash,
    })
    .returning();
  res.json({ id: row.id, email: row.email, name: row.name, role: row.role });
});

router.delete("/users/:id", requireRole("admin"), async (req, res): Promise<void> => {
  await db.delete(usersTable).where(eq(usersTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

export default router;
