import type { LedgerEntry } from "@/lib/storage/indexeddb";

export interface CategoryRule {
  pattern: RegExp;
  category: string;
  account: string;
}

const DEFAULT_RULES: CategoryRule[] = [
  { pattern: /salary|wages|payroll/i, category: "Payroll", account: "Salaries Expense" },
  { pattern: /rent|lease/i, category: "Rent", account: "Rent Expense" },
  { pattern: /electric|gas|water|utility|utilities/i, category: "Utilities", account: "Utilities Expense" },
  { pattern: /insurance/i, category: "Insurance", account: "Insurance Expense" },
  { pattern: /office\s*supply|staples|officeworks/i, category: "Office Supplies", account: "Office Supplies Expense" },
  { pattern: /internet|telecom|phone|mobile/i, category: "Telecommunications", account: "Telecom Expense" },
  { pattern: /advertis|marketing|google\s*ads|facebook/i, category: "Marketing", account: "Advertising Expense" },
  { pattern: /fuel|petrol|gas\s*station/i, category: "Vehicle", account: "Fuel Expense" },
  { pattern: /travel|flight|airline|hotel|accommodation/i, category: "Travel", account: "Travel Expense" },
  { pattern: /subscription|saas|software/i, category: "Software", account: "Software Expense" },
  { pattern: /bank\s*fee|service\s*charge|atm\s*fee/i, category: "Bank Fees", account: "Bank Charges" },
  { pattern: /interest\s*(earned|received|income)/i, category: "Interest Income", account: "Interest Revenue" },
  { pattern: /interest\s*(paid|charge|expense)/i, category: "Interest Expense", account: "Interest Expense" },
  { pattern: /transfer|tfr/i, category: "Transfer", account: "Transfers" },
  { pattern: /loan\s*repay|mortgage/i, category: "Loan Repayment", account: "Loan Payable" },
  { pattern: /draw|owner|dividend/i, category: "Owner Draw", account: "Owner Drawings" },
  { pattern: /sales|revenue|invoice|payment\s*received/i, category: "Sales Revenue", account: "Sales Revenue" },
];

export function classifyEntry(
  entry: LedgerEntry,
  customRules: CategoryRule[] = []
): LedgerEntry {
  const allRules = [...customRules, ...DEFAULT_RULES];

  for (const rule of allRules) {
    if (rule.pattern.test(entry.description)) {
      return {
        ...entry,
        category: rule.category,
        account: rule.account,
        isTransfer: rule.category === "Transfer",
        isOwnerDraw: rule.category === "Owner Draw",
        isLoan: rule.category === "Loan Repayment",
      };
    }
  }

  return {
    ...entry,
    category: "Uncategorized",
    account: entry.type === "credit" ? "Other Income" : "Other Expense",
  };
}

export function classifyAll(
  entries: LedgerEntry[],
  customRules: CategoryRule[] = []
): LedgerEntry[] {
  return entries.map((e) => classifyEntry(e, customRules));
}
