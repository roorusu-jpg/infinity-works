import test from "node:test";
import assert from "node:assert/strict";
import { advance, collect, freshGame, getProduction, purchaseEquipment, purchaseUpgrade } from "../src/core/engine.js";
import { compare, from } from "../src/core/decimal.js";
import { EQUIPMENT } from "../src/core/economy.js";

test("clicking increases currency and click count", () => {
  const next = collect(freshGame(1000));
  assert.equal(next.clicks, 1); assert.equal(compare(next.currencies.aether, 1), 0);
});
test("equipment purchase spends currency and creates production", () => {
  let state = freshGame(1000);
  for (let i = 0; i < 10; i++) state = collect(state);
  state = purchaseEquipment(state, "autoClicker");
  assert.equal(state.equipment.autoClicker.owned, 1); assert.equal(compare(state.currencies.aether, 0), 0);
  assert.equal(compare(getProduction(state), from(0.5)), 0);
  const progressed = advance(state, 11000); assert.equal(compare(progressed.currencies.aether, 5), 0);
});
test("equipment unlocks in order after owning ten of the previous type", () => {
  let state = freshGame(0);
  state = { ...state, currencies: { aether: from(1e9) } };
  state = purchaseEquipment(state, "autoClicker", 10);
  assert.equal(state.equipment.autoClicker.owned, 10);
  assert.equal(state.equipment.microGenerator.unlocked, true);
  assert.equal(state.equipment.productionPlant.unlocked, false);
});
test("upgrade purchase increases production and every ten levels advances tier", () => {
  let state = freshGame(0);
  state = { ...state, currencies: { aether: from(1e30) }, equipment: { ...state.equipment, autoClicker: { owned: 1, upgradeLevel: 0, unlocked: true } } };
  const before = getProduction(state); state = purchaseUpgrade(state, "autoClicker");
  assert.equal(state.equipment.autoClicker.upgradeLevel, 1);
  assert.equal(compare(getProduction(state), before), 1);
  for (let i = 1; i < 10; i++) state = purchaseUpgrade(state, "autoClicker");
  assert.equal(Math.floor(state.equipment.autoClicker.upgradeLevel / 10) + 1, 2);
});
test("bulk buy stops at affordability and rejects unsupported quantities", () => {
  let state = freshGame(0);
  state = { ...state, currencies: { aether: from(100) } };
  state = purchaseEquipment(state, "autoClicker", 10);
  assert.equal(state.equipment.autoClicker.owned, 6);
  assert.equal(purchaseEquipment(state, "autoClicker", 5), state);
});
test("offline production is capped at eight hours", () => {
  let state = freshGame(0);
  state = { ...state, equipment: { ...state.equipment, autoClicker: { owned: 1, upgradeLevel: 0, unlocked: true } } };
  const progressed = advance(state, 24 * 60 * 60 * 1000, { offline: true });
  assert.equal(progressed.totalPlaySeconds, 8 * 60 * 60);
});
test("the five initial equipment definitions are present", () => { assert.equal(EQUIPMENT.length, 5); });

import { purchaseResearch } from "../src/core/engine.js";
test("research unlocks from equipment requirements and increases production", () => { let s=freshGame(0); s={...s,currencies:{aether:from(10000)},equipment:{...s.equipment,autoClicker:{owned:5,upgradeLevel:0,unlocked:true}}}; const before=getProduction(s); s=purchaseResearch(s,"efficientMotors"); assert.ok(s.research.includes("efficientMotors")); assert.equal(compare(s.currencies.aether,9750),0); assert.equal(compare(getProduction(s),before),1); });
test("research cannot be purchased twice or before its requirement", () => { let s=freshGame(0); s={...s,currencies:{aether:from(10000)}}; assert.equal(purchaseResearch(s,"etherAnalysis"),s); });
