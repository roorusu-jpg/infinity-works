import { add, compare, from } from "./decimal.js";
import { addCurrency, buy, CLICK_GAIN, EQUIPMENT, equipmentCost, equipmentProduction, productionForSeconds, upgradeCost, RESEARCH } from "./economy.js";
import { createInitialState } from "./state.js";

export const OFFLINE_CAP_SECONDS = 8 * 60 * 60;
export function getClickGain(state) { return from(state.research.includes("focusedCollection") ? 2 : 1); }
export function purchaseResearch(state, id) {
  const item = RESEARCH.find(x => x.id === id);
  if (!item || state.research.includes(id) || !item.requirement(state)) return state;
  const next = buy(state.currencies.aether, from(item.cost));
  if (!next) return state;
  return { ...state, currencies: { ...state.currencies, aether: next }, research: [...state.research, id] };
}
export function collect(state) {
  const gain = getClickGain(state);
  return { ...state, currencies: { ...state.currencies, aether: addCurrency(state.currencies.aether, gain) }, totalEarned: add(state.totalEarned, gain), clicks: state.clicks + 1 };
}
export function getEquipmentCost(state, id) {
  const def = EQUIPMENT.find(item => item.id === id), item = state.equipment[id];
  return def && item ? equipmentCost(def, item.owned) : from(0);
}
export function getUpgradeCost(state, id) {
  const def = EQUIPMENT.find(item => item.id === id), item = state.equipment[id];
  return def && item ? upgradeCost(def, item.upgradeLevel) : from(0);
}
export function purchaseEquipment(state, id, quantity = 1) {
  const index = EQUIPMENT.findIndex(item => item.id === id), def = EQUIPMENT[index], item = state.equipment[id];
  if (!def || !item?.unlocked || ![1, 10, 100].includes(quantity)) return state;
  let balance = state.currencies.aether, owned = item.owned;
  for (let i = 0; i < quantity; i++) {
    const cost = equipmentCost(def, owned), next = buy(balance, cost);
    if (!next) break;
    balance = next; owned++;
  }
  if (owned === item.owned) return state;
  const equipment = { ...state.equipment, [id]: { ...item, owned } };
  if (index + 1 < EQUIPMENT.length && owned >= 10) equipment[EQUIPMENT[index + 1].id] = { ...equipment[EQUIPMENT[index + 1].id], unlocked: true };
  return { ...state, currencies: { ...state.currencies, aether: balance }, equipment, unlocked: { equipment: EQUIPMENT.filter(x => equipment[x.id].unlocked).map(x => x.id) } };
}
export function purchaseUpgrade(state, id) {
  const def = EQUIPMENT.find(item => item.id === id), item = state.equipment[id];
  if (!def || !item?.unlocked || item.owned < 1) return state;
  const next = buy(state.currencies.aether, upgradeCost(def, item.upgradeLevel));
  if (!next) return state;
  return { ...state, currencies: { ...state.currencies, aether: next }, equipment: { ...state.equipment, [id]: { ...item, upgradeLevel: item.upgradeLevel + 1 } } };
}
export function getProduction(state) {
  const base = EQUIPMENT.reduce((sum, def) => add(sum, equipmentProduction(def, state.equipment[def.id].owned, state.equipment[def.id].upgradeLevel)), from(0));
  const factor = (state.research.includes("efficientMotors") ? 1.25 : 1) * (state.research.includes("etherAnalysis") ? 1.5 : 1);
  return from(base.m * factor, base.e);
}
export function advance(state, now = Date.now(), { offline = false } = {}) {
  const elapsed = Math.max(0, (now - state.lastTickAt) / 1000), seconds = offline ? Math.min(elapsed, OFFLINE_CAP_SECONDS) : elapsed;
  const production = productionForSeconds(getProduction(state), seconds);
  return { ...state, currencies: { ...state.currencies, aether: add(state.currencies.aether, production) }, totalEarned: add(state.totalEarned, production), totalPlaySeconds: state.totalPlaySeconds + seconds, lastTickAt: now };
}
export function freshGame(now = Date.now()) { return createInitialState(now); }
