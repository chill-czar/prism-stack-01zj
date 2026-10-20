/**
 * Safe, accurate mathematical expression evaluator for the calculator.
 * Supports +, -, *, /, %, ^, unary minus, parentheses, and square root.
 */

function tokenize(expr) {
  const tokens = [];
  let i = 0;
  const str = expr.replace(/\s+/g, "");

  while (i < str.length) {
    const ch = str[i];

    // Numbers (including decimals)
    if (/[0-9]/.test(ch) || (ch === "." && i + 1 < str.length && /[0-9]/.test(str[i + 1]))) {
      let numStr = "";
      while (i < str.length && (/[0-9]/.test(str[i]) || str[i] === ".")) {
        numStr += str[i];
        i++;
      }
      tokens.push({ type: "NUMBER", value: parseFloat(numStr) });
      continue;
    }

    // Unary minus vs binary minus
    if (ch === "-" || ch === "−") {
      const prev = tokens[tokens.length - 1];
      if (!prev || prev.type === "OPERATOR" || (prev.type === "PAREN" && prev.value === "(")) {
        tokens.push({ type: "UNARY_MINUS", value: "neg" });
        i++;
        continue;
      }
    }

    if (ch === "+" || ch === "-" || ch === "−" || ch === "*" || ch === "×" || ch === "/" || ch === "÷" || ch === "%" || ch === "^") {
      let op = ch;
      if (op === "−") op = "-";
      if (op === "×") op = "*";
      if (op === "÷") op = "/";
      tokens.push({ type: "OPERATOR", value: op });
      i++;
      continue;
    }

    if (ch === "√") {
      tokens.push({ type: "FUNCTION", value: "sqrt" });
      i++;
      continue;
    }

    if (ch === "(" || ch === ")") {
      tokens.push({ type: "PAREN", value: ch });
      i++;
      continue;
    }

    // Ignore or throw on unknown character
    throw new Error(`Unexpected character: ${ch}`);
  }

  return tokens;
}

const PRECEDENCE = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "%": 2,
  "^": 3,
  "neg": 4,
  "sqrt": 4
};

function evaluateTokens(tokens) {
  const outputQueue = [];
  const opStack = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "NUMBER") {
      outputQueue.push(token.value);
    } else if (token.type === "FUNCTION" || token.type === "UNARY_MINUS") {
      opStack.push(token);
    } else if (token.type === "OPERATOR") {
      while (
        opStack.length > 0 &&
        opStack[opStack.length - 1].value !== "(" &&
        (
          PRECEDENCE[opStack[opStack.length - 1].value] > PRECEDENCE[token.value] ||
          (PRECEDENCE[opStack[opStack.length - 1].value] === PRECEDENCE[token.value] && token.value !== "^")
        )
      ) {
        outputQueue.push(opStack.pop());
      }
      opStack.push(token);
    } else if (token.type === "PAREN" && token.value === "(") {
      opStack.push(token);
    } else if (token.type === "PAREN" && token.value === ")") {
      let foundParen = false;
      while (opStack.length > 0) {
        const top = opStack.pop();
        if (top.type === "PAREN" && top.value === "(") {
          foundParen = true;
          break;
        }
        outputQueue.push(top);
      }
      if (!foundParen) {
        throw new Error("Mismatched parentheses");
      }
      if (opStack.length > 0 && opStack[opStack.length - 1].type === "FUNCTION") {
        outputQueue.push(opStack.pop());
      }
    }
  }

  while (opStack.length > 0) {
    const top = opStack.pop();
    if (top.type === "PAREN") {
      throw new Error("Mismatched parentheses");
    }
    outputQueue.push(top);
  }

  // Evaluate Reverse Polish Notation (RPN)
  const evalStack = [];
  for (const item of outputQueue) {
    if (typeof item === "number") {
      evalStack.push(item);
    } else if (item.type === "UNARY_MINUS") {
      if (evalStack.length < 1) throw new Error("Invalid syntax");
      const a = evalStack.pop();
      evalStack.push(-a);
    } else if (item.type === "FUNCTION" && item.value === "sqrt") {
      if (evalStack.length < 1) throw new Error("Invalid syntax");
      const a = evalStack.pop();
      if (a < 0) throw new Error("Invalid square root of negative number");
      evalStack.push(Math.sqrt(a));
    } else if (item.type === "OPERATOR") {
      if (evalStack.length < 2) throw new Error("Invalid syntax");
      const b = evalStack.pop();
      const a = evalStack.pop();
      let res;
      switch (item.value) {
        case "+": res = a + b; break;
        case "-": res = a - b; break;
        case "*": res = a * b; break;
        case "/":
          if (b === 0) throw new Error("Cannot divide by zero");
          res = a / b;
          break;
        case "%":
          if (b === 0) throw new Error("Cannot divide by zero");
          res = a % b;
          break;
        case "^": res = Math.pow(a, b); break;
        default: throw new Error(`Unknown operator: ${item.value}`);
      }
      evalStack.push(res);
    }
  }

  if (evalStack.length !== 1) {
    throw new Error("Invalid expression");
  }

  const result = evalStack[0];
  // Round floating point inaccuracies (e.g. 0.1 + 0.2 = 0.3)
  const rounded = Number(parseFloat(result.toPrecision(14)).toFixed(10));
  return Number(rounded.toString()); // removes trailing zeros cleanly
}

function calculate(expression) {
  if (!expression || typeof expression !== "string" || expression.trim() === "") {
    return { ok: false, error: "Empty expression" };
  }
  try {
    const tokens = tokenize(expression);
    const result = evaluateTokens(tokens);
    return { ok: true, result, expression };
  } catch (err) {
    return { ok: false, error: err.message || "Calculation error" };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { calculate, tokenize, evaluateTokens };
}
