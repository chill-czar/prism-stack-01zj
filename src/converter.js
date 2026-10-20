/**
 * Unit conversion module for the calculator app.
 * Supports Length, Weight/Mass, and Temperature.
 */

const CONVERSIONS = {
  length: {
    base: "m",
    units: {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      in: 0.0254,
      ft: 0.3048,
      yd: 0.9144,
      mi: 1609.344,
    },
  },
  weight: {
    base: "kg",
    units: {
      kg: 1,
      g: 0.001,
      mg: 0.000001,
      lb: 0.45359237,
      oz: 0.028349523125,
    },
  },
  temperature: {
    custom: true,
  },
};

function convertTemperature(value, from, to) {
  // Convert from input unit to Celsius first
  let c;
  if (from === "C") {
    c = value;
  } else if (from === "F") {
    c = (value - 32) * (5 / 9);
  } else if (from === "K") {
    c = value - 273.15;
  } else {
    throw new Error(`Unsupported temperature unit: ${from}`);
  }

  // Convert from Celsius to target unit
  let result;
  if (to === "C") {
    result = c;
  } else if (to === "F") {
    result = c * (9 / 5) + 32;
  } else if (to === "K") {
    result = c + 273.15;
  } else {
    throw new Error(`Unsupported temperature unit: ${to}`);
  }

  return Number(parseFloat(result.toPrecision(12)).toFixed(6));
}

function convert(category, value, fromUnit, toUnit) {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return { ok: false, error: "Invalid numeric value" };
  }

  if (category === "temperature") {
    try {
      const res = convertTemperature(num, fromUnit, toUnit);
      return { ok: true, result: res, category, value: num, from: fromUnit, to: toUnit };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  const catData = CONVERSIONS[category];
  if (!catData) {
    return { ok: false, error: `Unknown conversion category: ${category}` };
  }

  const fromFactor = catData.units[fromUnit];
  const toFactor = catData.units[toUnit];

  if (fromFactor === undefined) {
    return { ok: false, error: `Unknown unit: ${fromUnit}` };
  }
  if (toFactor === undefined) {
    return { ok: false, error: `Unknown unit: ${toUnit}` };
  }

  const baseVal = num * fromFactor;
  const result = baseVal / toFactor;
  const rounded = Number(parseFloat(result.toPrecision(14)).toFixed(8));

  return {
    ok: true,
    result: Number(rounded.toString()),
    category,
    value: num,
    from: fromUnit,
    to: toUnit,
  };
}

module.exports = {
  convert,
  CONVERSIONS,
};
