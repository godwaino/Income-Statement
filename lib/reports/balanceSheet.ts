import type { LedgerEntry } from "@/lib/storage/indexeddb";

export interface BalanceSheetItem {
  account: string;
  amount: number;
}

export interface BalanceSheet {
  asOf: string;
  assets: BalanceSheetItem[];
  totalAssets: number;
  liabilities: BalanceSheetItem[];
  totalLiabilities: number;
  equity: BalanceSheetItem[];
  totalEquity: number;
  balanced: boolean;
  unresolvedItems: string[];
}

export interface OpeningBalances {
  cashOnHand?: number;
  bankBalance?: number;
  accountsReceivable?: number;
  fixedAssets?: number;
  accountsPayable?: number;
  loansPayable?: number;
  ownerEquity?: number;
  retainedEarnings?: number;
}

export function generateBalanceSheet(
  entries: LedgerEntry[],
  asOf: string,
  openingBalances: OpeningBalances,
  netIncome: number
): BalanceSheet {
  const unresolvedItems: string[] = [];

  // Cash from ledger: credits in minus debits out
  const cashEntries = entries.filter((e) => e.date <= asOf);
  const cashInflows = cashEntries
    .filter((e) => e.type === "credit")
    .reduce((sum, e) => sum + e.amount, 0);
  const cashOutflows = cashEntries
    .filter((e) => e.type === "debit")
    .reduce((sum, e) => sum + e.amount, 0);
  const cashMovement = cashInflows - cashOutflows;
  const bankBalance = (openingBalances.bankBalance ?? 0) + cashMovement;

  // Assets
  const assets: BalanceSheetItem[] = [];
  assets.push({ account: "Bank Account", amount: bankBalance });

  if (openingBalances.cashOnHand !== undefined) {
    assets.push({ account: "Cash on Hand", amount: openingBalances.cashOnHand });
  }
  if (openingBalances.accountsReceivable !== undefined) {
    assets.push({ account: "Accounts Receivable", amount: openingBalances.accountsReceivable });
  } else {
    unresolvedItems.push("Accounts Receivable not provided - excluded from balance sheet");
  }
  if (openingBalances.fixedAssets !== undefined) {
    assets.push({ account: "Fixed Assets", amount: openingBalances.fixedAssets });
  } else {
    unresolvedItems.push("Fixed Assets not provided - excluded from balance sheet");
  }

  const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);

  // Liabilities
  const liabilities: BalanceSheetItem[] = [];
  if (openingBalances.accountsPayable !== undefined) {
    liabilities.push({ account: "Accounts Payable", amount: openingBalances.accountsPayable });
  } else {
    unresolvedItems.push("Accounts Payable not provided - excluded from balance sheet");
  }

  const loanRepayments = cashEntries
    .filter((e) => e.isLoan)
    .reduce((sum, e) => sum + e.amount, 0);
  const loansPayable = (openingBalances.loansPayable ?? 0) - loanRepayments;
  if (openingBalances.loansPayable !== undefined || loanRepayments > 0) {
    liabilities.push({ account: "Loans Payable", amount: loansPayable });
  }

  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);

  // Equity
  const equity: BalanceSheetItem[] = [];
  const ownerDraws = cashEntries
    .filter((e) => e.isOwnerDraw)
    .reduce((sum, e) => sum + e.amount, 0);

  const ownerEquity = openingBalances.ownerEquity ?? 0;
  equity.push({ account: "Owner's Equity", amount: ownerEquity });
  equity.push({ account: "Retained Earnings", amount: (openingBalances.retainedEarnings ?? 0) + netIncome });
  if (ownerDraws > 0) {
    equity.push({ account: "Owner Drawings", amount: -ownerDraws });
  }

  const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0);
  const balanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01;

  if (!balanced) {
    unresolvedItems.push(
      `Balance sheet does not balance: Assets (${totalAssets.toFixed(2)}) != Liabilities (${totalLiabilities.toFixed(2)}) + Equity (${totalEquity.toFixed(2)})`
    );
  }

  return {
    asOf,
    assets,
    totalAssets,
    liabilities,
    totalLiabilities,
    equity,
    totalEquity,
    balanced,
    unresolvedItems,
  };
}
