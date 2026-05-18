import bcrypt from "bcryptjs";
import { db, usersTable } from "@cphub/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export async function seedInitialAdmin(): Promise<void> {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin1234!";
  const name = process.env.SEED_ADMIN_NAME ?? "Site Admin";

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(usersTable).values({ email, name, role: "admin", passwordHash });
  logger.info({ email }, "Seeded initial admin user");
}
