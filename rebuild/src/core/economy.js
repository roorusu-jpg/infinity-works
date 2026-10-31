import { add, compare, from, multiply, pow, subtract } from "./decimal.js";

export const STARTING_AETHER = from(0);
export const CLICK_GAIN = from(1);
export const EQUIPMENT = [
  { id: "autoClicker", name: "自動クリック装置", description: "小さな機械が、あなたの代わりに採集する。", baseCost: 10, baseProduction: 0.5, icon: "⌁" },
  { id: "microGenerator", name: "小型エーテル発電機", description: "安定したエーテルを生み出す小型発電機。", baseCost: 100, baseProduction: 5, icon: "ϟ" },
  { id: "productionPlant", name: "生産プラント", description: "複数の装置を束ねて生産効率を高める。", baseCost: 1000, baseProduction: 50, icon: "▦" },
  { id: "highReactor", name: "高性能リアクター", description: "高密度のエネルギーを連続生成する。", baseCost: 10000, baseProduction: 500, icon: "✧" },
  { id: "quantumReactor", name: "量子エネルギー炉", description: "量子領域から膨大なエーテルを引き出す。", baseCost: 100000, baseProduction: 5000, icon: "◈" }
];
export const EQUIPMENT_COST_GROWTH = 1.15;
export const UPGRADE_COST_GROWTH = 4;
export const UPGRADE_POWER = 1.25;

export function equipmentCost(definition, owned) {
  return multiply(from(definition.baseCost), pow(from(EQUIPMENT_COST_GROWTH), owned));
}
export function upgradeCost(definition, level) {
  return multiply(from(definition.baseCost * 2.5), pow(from(UPGRADE_COST_GROWTH), level));
}
export function equipmentMultiplier(level) {
  return pow(from(UPGRADE_POWER), level);
}
export function equipmentProduction(definition, owned, level = 0) {
  return multiply(multiply(from(definition.baseProduction), from(owned)), equipmentMultiplier(level));
}
export function canAfford(balance, cost) { return compare(balance, cost) >= 0; }
export function buy(balance, cost) {
  if (!canAfford(balance, cost)) return null;
  return subtract(balance, cost);
}
export function addCurrency(balance, amount) { return add(balance, amount); }
