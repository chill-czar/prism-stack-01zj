const assert = require("node:assert");
const test = require("node:test");
const { calculate } = require("../src/calculator.js");

test("basic operations", () => {
  assert.strictEqual(calculate("2 + 2").result, 4);
  assert.strictEqual(calculate("10 - 4").result, 6);
  assert.strictEqual(calculate("3 * 5").result, 15);
  assert.strictEqual(calculate("12 / 4").result, 3);
  assert.strictEqual(calculate("7 % 3").result, 1);
});

test("floating point accuracy", () => {
  assert.strictEqual(calculate("0.1 + 0.2").result, 0.3);
  assert.strictEqual(calculate("0.7 * 0.1").result, 0.07);
});

test("operator precedence & parentheses", () => {
  assert.strictEqual(calculate("2 + 3 * 4").result, 14);
  assert.strictEqual(calculate("(2 + 3) * 4").result, 20);
  assert.strictEqual(calculate("2 ^ 3").result, 8);
  assert.strictEqual(calculate("2 ^ 3 + 1").result, 9);
});

test("square root & unary minus", () => {
  assert.strictEqual(calculate("√16").result, 4);
  assert.strictEqual(calculate("-5 + 10").result, 5);
  assert.strictEqual(calculate("-(3 + 4)").result, -7);
});

test("error handling", () => {
  assert.strictEqual(calculate("10 / 0").ok, false);
  assert.strictEqual(calculate("10 / 0").error, "Cannot divide by zero");
  assert.strictEqual(calculate("(2 + 3").ok, false);
  assert.strictEqual(calculate("").ok, false);
});
