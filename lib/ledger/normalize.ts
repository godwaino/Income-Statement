import type { LedgerEntry } from "@/lib/storage/indexeddb";

export interface RawTransaction {
  date: string;
  description: string;
  amount: number;
  balance?: number;
}

const DATE_PATTERNS = [
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
  /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
  /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{2,4})/i,
];

const MONTH_NAMES: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function normalizeDate(raw: string): string {
  for (const pattern of DATE_PATTERNS) {
    const match = raw.match(pattern);
    if (!match) continue;

    if (match[2] in MONTH_NAMES || match[2]?.toLowerCase() in MONTH_NAMES) {
      const day = match[1].padStart(2, "0");
      const month = MONTH_NAMES[match[2].toLowerCase().slice(0, 3)];
      const year = match[3].length === 2 ? `20${match[3]}` : match[3];
      return `${year}-${month}-${day}`;
    }

    if (match[1].length === 4) {
      return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
    }

    const year = match[3].length === 2 ? `20${match[3]}` : match[3];
    return `${year}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  }
  return raw;
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.\-,]/g, "").replace(/,/g, "");
  return parseFloat(cleaned) || 0;
}

export function parseTransactionsFromText(text: string): RawTransaction[] {
  const lines = text.split("\n").filter((l) => l.trim());
  const transactions: RawTransaction[] = [];

  const TX_PATTERN = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+\w{3}\s+\d{2,4})\s+(.+?)\s+([\-]?[\d,]+\.\d{2})/;

  for (const line of lines) {
    const match = line.match(TX_PATTERN);
    if (match) {
      transactions.push({
        date: normalizeDate(match[1]),
        description: match[2].trim(),
        amount: parseAmount(match[3]),
      });
    }
  }

  return transactions;
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
