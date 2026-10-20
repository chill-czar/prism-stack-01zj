const test = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("../src/index");

test("server API endpoints", async (t) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  t.after(() => {
    server.close();
  });

  await t.test("GET /health returns ok", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.deepEqual(json, { ok: true });
  });

  await t.test("POST /api/calculate evaluates math expressions", async () => {
    const res = await fetch(`${baseUrl}/api/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expression: "15 * (4 + 6) / 2" }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.equal(data.result, 75);
  });

  await t.test("GET /api/calculate with query param", async () => {
    const res = await fetch(`${baseUrl}/api/calculate?expr=7%20%2B%203%20*%205`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.equal(data.result, 22);
  });

  await t.test("POST /api/convert converts units accurately", async () => {
    const res = await fetch(`${baseUrl}/api/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "length", value: 100, from: "cm", to: "m" }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.equal(data.result, 1);
  });

  await t.test("GET /api/units returns category unit lists", async () => {
    const res = await fetch(`${baseUrl}/api/units`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.ok(Array.isArray(data.units.length));
    assert.ok(data.units.length.includes("km"));
  });
});
