/**
 * Currency unicode glyphs mapping.
 */
export const CURRENCY_GLYPHS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  PKR: "Rs.",
};

/**
 * Formats a numeric value with its currency glyph.
 * For PKR, inserts a space: e.g. "Rs. 0.00".
 * For others, directly prepends: e.g. "€0.00".
 */
export function formatCurrency(value: number | string, currency: string = "USD"): string {
  const glyph = CURRENCY_GLYPHS[currency] || "$";
  const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
  const space = currency === "PKR" ? " " : "";
  return `${glyph}${space}${numValue.toFixed(2)}`;
}
