import { promises as fs } from "node:fs";
import path from "node:path";

type PurchaseRecord = {
  email: string;
  sessionId?: string;
  source: "stripe" | "lemonsqueezy";
  purchasedAt: string;
  status: "active" | "canceled";
};

type DbShape = {
  purchases: PurchaseRecord[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "payments.json");

async function ensureDb(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DB_PATH);
  } catch {
    const seed: DbShape = { purchases: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(seed, null, 2), "utf-8");
  }
}

async function readDb(): Promise<DbShape> {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  const parsed = JSON.parse(raw) as Partial<DbShape>;

  return {
    purchases: Array.isArray(parsed.purchases) ? parsed.purchases : []
  };
}

async function writeDb(db: DbShape): Promise<void> {
  await ensureDb();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export async function upsertPurchase(input: PurchaseRecord): Promise<void> {
  const db = await readDb();

  const existingIndex = db.purchases.findIndex((p) => {
    if (input.sessionId && p.sessionId) {
      return p.sessionId === input.sessionId;
    }

    return p.email.toLowerCase() === input.email.toLowerCase() && p.status === "active";
  });

  if (existingIndex >= 0) {
    db.purchases[existingIndex] = {
      ...db.purchases[existingIndex],
      ...input
    };
  } else {
    db.purchases.push(input);
  }

  await writeDb(db);
}

export async function hasActivePurchase(email: string): Promise<boolean> {
  const db = await readDb();
  return db.purchases.some(
    (purchase) => purchase.status === "active" && purchase.email.toLowerCase() === email.toLowerCase()
  );
}

export async function getPurchaseBySession(sessionId: string): Promise<PurchaseRecord | null> {
  const db = await readDb();
  return db.purchases.find((purchase) => purchase.sessionId === sessionId) ?? null;
}
