import { from } from "./decimal.js";
import { EQUIPMENT, STARTING_AETHER } from "./economy.js";

export const SAVE_VERSION = 3;
export function createInitialState(now = Date.now()) {
  const equipment = Object.fromEntries(EQUIPMENT.map((item, index) => [item.id, { owned: 0, upgradeLevel: 0, unlocked: index === 0 }]));
  return {
    schemaVersion: SAVE_VERSION, createdAt: now, lastTickAt: now, totalPlaySeconds: 0, research: [],
    currencies: { aether: STARTING_AETHER }, totalEarned: STARTING_AETHER, clicks: 0,
    equipment, unlocked: { equipment: ["autoClicker"] }
  };
}
export function normalizeState(raw, now = Date.now()) {
  if (!raw || typeof raw !== "object") throw new TypeError("Save data must be an object.");
  const initial = createInitialState(now);
  if (![1, 2, SAVE_VERSION].includes(raw.schemaVersion)) throw new Error("Unsupported save version.");
  const oldEquipment = raw.equipment || {};
  const equipment = Object.fromEntries(EQUIPMENT.map((item, index) => {
    const saved = oldEquipment[item.id] || (index === 0 ? oldEquipment.autoClicker : null) || {};
    return [item.id, {
      owned: Math.max(0, Math.floor(Number(saved.owned) || 0)),
      upgradeLevel: Math.max(0, Math.floor(Number(saved.upgradeLevel) || 0)),
      unlocked: index === 0 || Boolean(saved.unlocked) || (index > 0 && Math.max(0, Math.floor(Number(oldEquipment[EQUIPMENT[index - 1].id]?.owned) || 0)) >= 10)
    }];
  }));
  const unlockedIds = EQUIPMENT.filter(item => equipment[item.id].unlocked).map(item => item.id);
  return {
    ...initial, ...raw, schemaVersion: SAVE_VERSION,
    currencies: { aether: from(raw.currencies?.aether ?? 0) },
    totalEarned: from(raw.totalEarned ?? 0),
    equipment, research: Array.isArray(raw.research) ? raw.research.filter(x => typeof x === 'string') : [], unlocked: { equipment: unlockedIds },
    clicks: Math.max(0, Math.floor(Number(raw.clicks) || 0)),
    totalPlaySeconds: Math.max(0, Number(raw.totalPlaySeconds) || 0),
    lastTickAt: Math.min(now, Math.max(0, Number(raw.lastTickAt) || now))
  };
}
