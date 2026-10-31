const MAX_SAFE_EXPONENT = Number.MAX_SAFE_INTEGER;

function normalize(mantissa, exponent) {
  if (!Number.isFinite(mantissa) || !Number.isFinite(exponent)) {
    throw new TypeError("Decimal components must be finite numbers.");
  }
  if (mantissa === 0) return { m: 0, e: 0 };
  const sign = Math.sign(mantissa);
  const abs = Math.abs(mantissa);
  const shift = Math.floor(Math.log10(abs));
  const nextExponent = exponent + shift;
  if (!Number.isSafeInteger(nextExponent) || Math.abs(nextExponent) > MAX_SAFE_EXPONENT) {
    throw new RangeError("Decimal exponent is outside the supported range.");
  }
  return { m: sign * (abs / (10 ** shift)), e: nextExponent };
}

export function from(value) {
  if (value && typeof value === "object" && Number.isFinite(value.m) && Number.isSafeInteger(value.e)) {
    return normalize(value.m, value.e);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    const match = trimmed.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(?:e([+-]?\d+))?$/i);
    if (!match) throw new TypeError(`Invalid decimal value: ${value}`);
    const n = Number(match[1]);
    const e = Number(match[2] || 0);
    if (!Number.isSafeInteger(e)) throw new RangeError("Invalid exponent.");
    return normalize(n, e);
  }
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError("Expected a finite number.");
  if (value === 0) return { m: 0, e: 0 };
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  return normalize(value / (10 ** exponent), exponent);
}

export function add(a, b) {
  const x = from(a), y = from(b);
  if (x.m === 0) return y;
  if (y.m === 0) return x;
  const high = x.e >= y.e ? x : y;
  const low = high === x ? y : x;
  const gap = high.e - low.e;
  if (gap > 16) return high;
  return normalize(high.m + low.m * (10 ** -gap), high.e);
}

export function subtract(a, b) {
  const x = from(a), y = from(b);
  if (compare(x, y) < 0) throw new RangeError("Decimal subtraction cannot produce a negative result.");
  if (y.m === 0) return x;
  const gap = x.e - y.e;
  if (gap > 16) return x;
  return normalize(x.m - y.m * (10 ** -gap), x.e);
}

export function multiply(a, b) {
  const x = from(a), y = from(b);
  if (x.m === 0 || y.m === 0) return { m: 0, e: 0 };
  return normalize(x.m * y.m, x.e + y.e);
}

export function divide(a, b) {
  const x = from(a), y = from(b);
  if (y.m === 0) throw new RangeError("Division by zero.");
  if (x.m === 0) return { m: 0, e: 0 };
  return normalize(x.m / y.m, x.e - y.e);
}

export function compare(a, b) {
  const x = from(a), y = from(b);
  if (x.m === 0 && y.m === 0) return 0;
  if (Math.sign(x.m) !== Math.sign(y.m)) return Math.sign(x.m) > Math.sign(y.m) ? 1 : -1;
  if (x.e !== y.e) return (x.e > y.e ? 1 : -1) * Math.sign(x.m);
  return x.m === y.m ? 0 : (x.m > y.m ? 1 : -1);
}

export function pow(a, power) {
  const x = from(a);
  if (!Number.isFinite(power)) throw new TypeError("Power must be finite.");
  if (x.m === 0) return power === 0 ? from(1) : from(0);
  const logarithm = Math.log10(Math.abs(x.m)) + x.e;
  const result = logarithm * power;
  if (!Number.isFinite(result) || Math.abs(result) > MAX_SAFE_EXPONENT) throw new RangeError("Power result is outside the supported range.");
  return from(`${10 ** (result - Math.floor(result))}e${Math.floor(result)}`);
}

export function toNumber(value) {
  const x = from(value);
  if (x.e > 308) return x.m > 0 ? Infinity : -Infinity;
  if (x.e < -324) return 0;
  return x.m * (10 ** x.e);
}

export function format(value, digits = 2) {
  const x = from(value);
  if (x.m === 0) return "0";
  if (x.e >= -3 && x.e < 6) return toNumber(x).toLocaleString("en-US", { maximumFractionDigits: 2 });
  return `${x.m.toFixed(digits)}e${x.e}`;
}
