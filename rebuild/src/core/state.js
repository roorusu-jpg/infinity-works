import { from } from "./decimal.js";
import { STARTING_AETHER } from "./economy.js";

export const SAVE_VERSION = 1;

export function createInitialState(now = Date.now()) {
  return {
    schemaVersion: SAVE_VERSION,
    createdAt: now,
    lastTickAt: now,
    totalPlaySeconds: 0,
    currencies: { aether: STARTING_AETHER },
    totalEarned: STARTING_AETHER,
    clicks: 0,
    equipment: { autoClicker: { owned: 0 } },
    unlocked: { equipment: ["autoClicker"] }
  };
}

export function normalizeState(raw, now = Date.now()) {
  if (!raw || typeof raw !== "object") throw new TypeError("Save data must be an object.");
  if (raw.schemaVersion !== SAVE_VERSION) throw new Error("Unsupported save version.");
  const initial = createInitialState(now);
  return {
    ...initial,
    ...raw,
    currencies: { ...initial.currencies, ...(raw.currencies || {}) },
    equipment: { ...initial.equipment, ...(raw.equipment || {}) },
    unlocked: { ...initial.unlocked, ...(raw.unlocked || {}) },
    currencies: { aether: from(raw.currencies?.aether ?? 0) },
    totalEarned: from(raw.totalEarned ?? 0),
    equipment: { autoClicker: { owned: Math.max(0, Math.floor(raw.equipment?.autoClicker?.owned || 0)) } },
    clicks: Math.max(0, Math.floor(raw.clicks || 0)),
    totalPlaySeconds: Math.max(0, Number(raw.totalPlaySeconds) || 0),
    lastTickAt: Math.min(now, Math.max(0, Number(raw.lastTickAt) || now))
  };
}
