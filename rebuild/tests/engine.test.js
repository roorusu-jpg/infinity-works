import test from "node:test";
import assert from "node:assert/strict";
import { advance, collect, freshGame, purchaseAutoClicker } from "../src/core/engine.js";
import { compare } from "../src/core/decimal.js";

test("clicking increases currency and click count", () => {
  const next = collect(freshGame(1000));
  assert.equal(next.clicks, 1);
  assert.equal(compare(next.currencies.aether, 1), 0);
});

test("equipment purchase spends currency and unlocks production", () => {
  let state = freshGame(1000);
  for (let i = 0; i < 10; i++) state = collect(state);
  state = purchaseAutoClicker(state);
  assert.equal(state.equipment.autoClicker.owned, 1);
  assert.equal(compare(state.currencies.aether, 0), 0);
  const progressed = advance(state, 11000);
  assert.equal(compare(progressed.currencies.aether, 5), 0);
});

test("offline production is capped at eight hours", () => {
  let state = freshGame(0);
  state = { ...state, equipment: { autoClicker: { owned: 1 } } };
  const progressed = advance(state, 24 * 60 * 60 * 1000, { offline: true });
  assert.equal(progressed.totalPlaySeconds, 8 * 60 * 60);
});
