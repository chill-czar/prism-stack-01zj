const http = require("http");
const { calculate } = require("./calculator");
const { convert, CONVERSIONS } = require("./converter");

const port = Number(process.env.PORT || 3000);

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function createServer() {
  return http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url || "/", "http://127.0.0.1");
    const pathname = parsedUrl.pathname;
    const method = req.method ? req.method.toUpperCase() : "GET";

    if (method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }

    // Health check endpoint
    if (pathname === "/health") {
      return sendJson(res, 200, { ok: true });
    }

    // API: Calculate
    if (pathname === "/api/calculate") {
      let expression = "";
      if (method === "POST") {
        try {
          const body = await parseBody(req);
          expression = body.expression || "";
        } catch (err) {
          return sendJson(res, 400, { ok: false, error: err.message });
        }
      } else if (method === "GET") {
        expression = parsedUrl.searchParams.get("expr") || "";
      }

      if (!expression) {
        return sendJson(res, 400, { ok: false, error: "Missing 'expression' parameter" });
      }

      const outcome = calculate(expression);
      if (!outcome.ok) {
        return sendJson(res, 400, outcome);
      }
      return sendJson(res, 200, outcome);
    }

    // API: Convert
    if (pathname === "/api/convert") {
      let category = "";
      let value = 0;
      let fromUnit = "";
      let toUnit = "";

      if (method === "POST") {
        try {
          const body = await parseBody(req);
          category = body.category;
          value = body.value;
          fromUnit = body.from;
          toUnit = body.to;
        } catch (err) {
          return sendJson(res, 400, { ok: false, error: err.message });
        }
      } else if (method === "GET") {
        category = parsedUrl.searchParams.get("category");
        value = parsedUrl.searchParams.get("value");
        fromUnit = parsedUrl.searchParams.get("from");
        toUnit = parsedUrl.searchParams.get("to");
      }

      if (!category || value === undefined || value === null || !fromUnit || !toUnit) {
        return sendJson(res, 400, {
          ok: false,
          error: "Missing required parameters: category, value, from, to",
        });
      }

      const outcome = convert(category, value, fromUnit, toUnit);
      if (!outcome.ok) {
        return sendJson(res, 400, outcome);
      }
      return sendJson(res, 200, outcome);
    }

    // API: Conversion unit schemas
    if (pathname === "/api/units") {
      const unitsMap = {
        length: Object.keys(CONVERSIONS.length.units),
        weight: Object.keys(CONVERSIONS.weight.units),
        temperature: ["C", "F", "K"],
      };
      return sendJson(res, 200, { ok: true, units: unitsMap });
    }

    // Root GET: Placeholder until UI is added
    if (pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!doctype html><html><body><p>Calculator API</p></body></html>`);
      return;
    }

    // 404
    sendJson(res, 404, { ok: false, error: "Not found" });
  });
}

const server = createServer();

if (require.main === module) {
  server.listen(port, "0.0.0.0", () => {
    console.log("listening on :" + port);
  });
}

module.exports = { createServer, server };
