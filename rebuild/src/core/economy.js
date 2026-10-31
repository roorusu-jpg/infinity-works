import { add, compare, from, multiply, pow, subtract } from "./decimal.js";

export const STARTING_AETHER = from(0);
export const CLICK_GAIN = from(1);
export const EQUIPMENT_BASE_COST = from(10);
export const EQUIPMENT_BASE_PRODUCTION = from(0.5);
export const EQUIPMENT_COST_GROWTH = 1.15;

export function equipmentCost(owned) {
  return multiply(EQUIPMENT_BASE_COST, pow(from(EQUIPMENT_COST_GROWTH), owned));
}

export function canAfford(balance, cost) {
  return compare(balance, cost) >= 0;
}

export function buy(balance, cost) {
  if (!canAfford(balance, cost)) return null;
  return subtract(balance, cost);
}

export function productionPerSecond(owned) {
  return multiply(EQUIPMENT_BASE_PRODUCTION, from(owned));
}

export function productionForSeconds(rate, seconds) {
  return multiply(rate, from(seconds));
}

export function addCurrency(balance, amount) {
  return add(balance, amount);
}
