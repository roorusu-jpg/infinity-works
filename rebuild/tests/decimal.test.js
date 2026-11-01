import test from "node:test";
import assert from "node:assert/strict";
import { add, compare, divide, format, from, multiply, subtract } from "../src/core/decimal.js";

test("normalizes and formats large values", () => {
  assert.deepEqual(from(1000), { m: 1, e: 3 });
  assert.equal(format(from("1.25e30")), "1.25e30");
});

test("adds values with distant exponents safely", () => {
  assert.deepEqual(add("1e30", "1e10"), from("1e30"));
  assert.deepEqual(add("1e3", "2e3"), from("3e3"));
});

test("supports arithmetic and comparisons", () => {
  assert.deepEqual(multiply("2e10", "3e5"), from("6e15"));
  assert.deepEqual(divide("6e15", "3e5"), from("2e10"));
  assert.deepEqual(subtract("5e3", "2e3"), from("3e3"));
  assert.equal(compare("1e20", "9e19"), 1);
  assert.throws(() => subtract(1, 2), RangeError);
});
