import { add, compare, from, multiply } from "./decimal.js";
import { addCurrency, buy, CLICK_GAIN, equipmentCost, productionForSeconds, productionPerSecond } from "./economy.js";
import { createInitialState } from "./state.js";

export const OFFLINE_CAP_SECONDS = 8 * 60 * 60;

export function collect(state) {
  const gain = CLICK_GAIN;
  return {
    ...state,
    currencies: { ...state.currencies, aether: addCurrency(state.currencies.aether, gain) },
    totalEarned: add(state.totalEarned, gain),
    clicks: state.clicks + 1
  };
}

export function purchaseAutoClicker(state) {
  const owned = state.equipment.autoClicker.owned;
  const cost = equipmentCost(owned);
  const nextBalance = buy(state.currencies.aether, cost);
  if (!nextBalance) return state;
  return {
    ...state,
    currencies: { ...state.currencies, aether: nextBalance },
    equipment: { ...state.equipment, autoClicker: { owned: owned + 1 } }
  };
}

export function advance(state, now = Date.now(), { offline = false } = {}) {
  const elapsed = Math.max(0, (now - state.lastTickAt) / 1000);
  const seconds = offline ? Math.min(elapsed, OFFLINE_CAP_SECONDS) : elapsed;
  const production = productionForSeconds(productionPerSecond(state.equipment.autoClicker.owned), seconds);
  return {
    ...state,
    currencies: { ...state.currencies, aether: add(state.currencies.aether, production) },
    totalEarned: add(state.totalEarned, production),
    totalPlaySeconds: state.totalPlaySeconds + seconds,
    lastTickAt: now
  };
}

export function getProduction(state) {
  return productionPerSecond(state.equipment.autoClicker.owned);
}

export function canBuyAutoClicker(state) {
  return compare(state.currencies.aether, equipmentCost(state.equipment.autoClicker.owned)) >= 0;
}

export function freshGame(now = Date.now()) {
  return createInitialState(now);
}
