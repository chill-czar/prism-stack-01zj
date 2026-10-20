const assert = require("node:assert");
const test = require("node:test");
const { convert } = require("../src/converter.js");

test("length conversions", () => {
  const kmToM = convert("length", 1.5, "km", "m");
  assert.strictEqual(kmToM.ok, true);
  assert.strictEqual(kmToM.result, 1500);

  const mToCm = convert("length", 2, "m", "cm");
  assert.strictEqual(mToCm.ok, true);
  assert.strictEqual(mToCm.result, 200);

  const inToCm = convert("length", 1, "in", "cm");
  assert.strictEqual(inToCm.ok, true);
  assert.strictEqual(inToCm.result, 2.54);
});

test("weight conversions", () => {
  const kgToG = convert("weight", 3.2, "kg", "g");
  assert.strictEqual(kgToG.ok, true);
  assert.strictEqual(kgToG.result, 3200);

  const lbToKg = convert("weight", 10, "lb", "kg");
  assert.strictEqual(lbToKg.ok, true);
  assert.strictEqual(lbToKg.result, 4.5359237);
});

test("temperature conversions", () => {
  const cToF = convert("temperature", 0, "C", "F");
  assert.strictEqual(cToF.ok, true);
  assert.strictEqual(cToF.result, 32);

  const boilingC = convert("temperature", 100, "C", "F");
  assert.strictEqual(boilingC.ok, true);
  assert.strictEqual(boilingC.result, 212);

  const cToK = convert("temperature", 25, "C", "K");
  assert.strictEqual(cToK.ok, true);
  assert.strictEqual(cToK.result, 298.15);
});

test("invalid unit or category", () => {
  assert.strictEqual(convert("unknown", 1, "m", "km").ok, false);
  assert.strictEqual(convert("length", 1, "unknown", "km").ok, false);
  assert.strictEqual(convert("length", "abc", "m", "km").ok, false);
});
