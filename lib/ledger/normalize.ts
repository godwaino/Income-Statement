import type { LedgerEntry } from "@/lib/storage/indexeddb";

export interface RawTransaction {
  date: string;
  description: string;
  amount: number;
  balance?: number;
}

const MONTH_NAMES: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

const DATE_REGEXES = [
  // DD/MM/YYYY or MM/DD/YYYY or DD-MM-YYYY
  /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/,
  // YYYY-MM-DD
  /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,
  // DD Mon YYYY or DD Mon YY
  /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{2,4})$/i,
  // Mon DD, YYYY
  /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{1,2}),?\s+(\d{2,4})$/i,
  // DD Mon (no year — statement header year used)
  /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*$/i,
];

const AMOUNT_REGEX = /^-?[\d,]+\.\d{2}$/;
// Also matches amounts with currency symbol or CR/DR suffix
const AMOUNT_LOOSE = /(-?[\d,]+\.\d{2})\s*(CR|DR|cr|dr)?$/;

function isDate(token: string): boolean {
  return DATE_REGEXES.some((r) => r.test(token.trim()));
}

function isAmount(token: string): boolean {
  return AMOUNT_REGEX.test(token.trim());
}

function normalizeDate(raw: string): string {
  const t = raw.trim();
  for (const pattern of DATE_REGEXES) {
    const m = t.match(pattern);
    if (!m) continue;

    // Mon DD, YYYY
    if (m[1] && m[1].length >= 3 && isNaN(Number(m[1]))) {
      const month = MONTH_NAMES[m[1].toLowerCase().slice(0, 3)];
      const day = m[2].padStart(2, "0");
      const year = m[3].length === 2 ? `20${m[3]}` : m[3];
      return `${year}-${month}-${day}`;
    }
    // DD Mon YYYY
    if (m[2] && m[2].length >= 3 && isNaN(Number(m[2]))) {
      const month = MONTH_NAMES[m[2].toLowerCase().slice(0, 3)];
      const day = m[1].padStart(2, "0");
      const year = (m[3] ?? new Date().getFullYear().toString()).length === 2
        ? `20${m[3]}`
        : (m[3] ?? new Date().getFullYear().toString());
      return `${year}-${month}-${day}`;
    }
    // YYYY-MM-DD
    if (m[1].length === 4) {
      return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
    }
    // DD/MM/YYYY — assume day-first for ambiguous cases
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${year}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return raw;
}

function parseAmount(raw: string): number {
  const m = raw.match(AMOUNT_LOOSE);
  if (!m) return 0;
  const num = parseFloat(m[1].replace(/,/g, "")) || 0;
  // DR suffix or negative sign = debit (negative)
  if (m[2] && m[2].toUpperCase() === "DR") return -Math.abs(num);
  if (m[2] && m[2].toUpperCase() === "CR") return Math.abs(num);
  return num;
}

/** Strategy 1: single-line  date  description  amount */
function parseSingleLine(lines: string[]): RawTransaction[] {
  const results: RawTransaction[] = [];
  const LINE_PATTERN =
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*(?:\s+\d{2,4})?)\s+(.+?)\s+(-?[\d,]+\.\d{2}(?:\s*(?:CR|DR|cr|dr))?)/i;

  for (const line of lines) {
    const m = line.match(LINE_PATTERN);
    if (m) {
      results.push({
        date: normalizeDate(m[1]),
        description: m[2].trim(),
        amount: parseAmount(m[3]),
      });
    }
  }
  return results;
}

/**
 * Strategy 2: token-window scan.
 * PDF.js often emits each cell as a separate text item joined by spaces/newlines.
 * We scan for a date token, then collect description tokens until we find an amount.
 */
function parseTokenWindow(text: string): RawTransaction[] {
  // Split on whitespace runs and newlines to get individual tokens
  const tokens = text.split(/\s+/).filter((t) => t.length > 0);
  const results: RawTransaction[] = [];
  let i = 0;

  while (i < tokens.length) {
    // Try to match a date at position i (possibly spanning 2-3 tokens for "DD Mon YYYY")
    let dateStr: string | null = null;
    let dateLen = 0;

    for (const span of [3, 2, 1]) {
      const candidate = tokens.slice(i, i + span).join(" ");
      if (isDate(candidate)) {
        dateStr = candidate;
        dateLen = span;
        break;
      }
    }

    if (!dateStr) { i++; continue; }

    // Collect description tokens until we hit an amount (look ahead up to 15 tokens)
    const descTokens: string[] = [];
    let amountStr: string | null = null;
    let amountIdx = -1;

    for (let j = i + dateLen; j < Math.min(i + dateLen + 15, tokens.length); j++) {
      const t = tokens[j];
      if (isAmount(t)) {
        amountStr = t;
        amountIdx = j;
        break;
      }
      // Stop if we hit another date
      if (isDate(t) || isDate(tokens.slice(j, j + 2).join(" "))) break;
      descTokens.push(t);
    }

    if (amountStr && descTokens.length > 0) {
      results.push({
        date: normalizeDate(dateStr),
        description: descTokens.join(" "),
        amount: parseAmount(amountStr),
      });
      i = amountIdx + 1;
    } else {
      i += dateLen;
    }
  }

  return results;
}

export function parseTransactionsFromText(text: string): RawTransaction[] {
  const lines = text.split("\n").filter((l) => l.trim());

  // Try single-line first — most reliable when it works
  const singleLine = parseSingleLine(lines);
  if (singleLine.length > 0) return singleLine;

  // Fall back to token-window scan for columnar/multi-line PDFs
  return parseTokenWindow(text);
}

let entryCounter = 0;

export function toLedgerEntries(
  statementId: string,
  transactions: RawTransaction[]
): LedgerEntry[] {
  return transactions.map((tx) => ({
    id: `${statementId}-${++entryCounter}`,
    statementId,
    date: tx.date,
    description: tx.description,
    amount: Math.abs(tx.amount),
    type: tx.amount < 0 ? "debit" : "credit",
    category: "",
    account: "",
    reviewed: false,
  }));
}
