import { Transaction } from "./types";

const CLIENT_NAMES = [
  "Meridian Capital Group",
  "Apex Digital Holdings",
  "Citadel Trading LLC",
  "Vanguard Settlements Inc",
  "Horizon Financial Partners",
  "Sterling Wire Services",
  "Pacific Coast Transfers",
  "Blackrock Settlement Corp",
  "Atlas Payment Solutions",
  "Pinnacle Fund Admin",
  "Nova Bridge Capital",
  "Eagle Creek Finance",
  "Summit Ledger Partners",
  "Ironclad Clearing House",
  "Blue Harbor Fintech",
  "Granite Point Capital",
  "Redwood Digital Assets",
  "Cascade Settlement Group",
  "Trident Wire Corp",
  "Osprey Payment Systems",
  "Golden Gate Transfers",
  "Silverlake Trading Co",
  "Northstar Clearance Ltd",
  "Cobalt Financial Services",
  "Ember Capital Markets",
  "Whitepine Settlement Inc",
  "Driftwood Asset Mgmt",
  "Keystone Digital Pay",
  "Lakeshore Fund Services",
  "Rivermount Holdings",
];

const STATUS_WEIGHTS = [
  { status: "Pending" as const, weight: 0.6 },
  { status: "Cleared" as const, weight: 0.3 },
  { status: "Failed" as const, weight: 0.1 },
];

function pickWeightedStatus(): "Pending" | "Cleared" | "Failed" {
  const rand = Math.random();
  let cumulative = 0;
  for (const { status, weight } of STATUS_WEIGHTS) {
    cumulative += weight;
    if (rand < cumulative) return status;
  }
  return "Pending";
}

function randomInRange(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

let globalIdCounter = 0;

export function generateSingleTransaction(): Transaction {
  globalIdCounter++;
  const isInstitutional = Math.random() < 0.3;
  const amount = isInstitutional
    ? randomInRange(10_000, 250_000)
    : randomInRange(50, 1_000);

  const now = Date.now();
  const twoHoursAgo = now - 2 * 60 * 60 * 1000;
  const timestampMs = Math.floor(
    Math.random() * (now - twoHoursAgo) + twoHoursAgo
  );

  return {
    id: `TXN-${String(globalIdCounter).padStart(5, "0")}`,
    clientName: CLIENT_NAMES[Math.floor(Math.random() * CLIENT_NAMES.length)],
    amount,
    status: "Pending",
    op: "idle",
    attempt: 0,
    timestampMs,
  };
}

export function generateTransactions(count = 50): Transaction[] {
  const transactions: Transaction[] = [];

  for (let i = 0; i < count; i++) {
    const isInstitutional = Math.random() < 0.3;
    const amount = isInstitutional
      ? randomInRange(10_000, 250_000)
      : randomInRange(50, 1_000);

    globalIdCounter++;
    const now = Date.now();
    const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000;
    const timestampMs = Math.floor(
      Math.random() * (now - fortyEightHoursAgo) + fortyEightHoursAgo
    );

    transactions.push({
      id: `TXN-${String(globalIdCounter).padStart(5, "0")}`,
      clientName:
        CLIENT_NAMES[Math.floor(Math.random() * CLIENT_NAMES.length)],
      amount,
      status: pickWeightedStatus(),
      op: "idle",
      attempt: 0,
      timestampMs,
    });
  }

  return transactions.sort((a, b) => b.timestampMs - a.timestampMs);
}
