"use client";

import { useState } from "react";
import { generateIncomeStatement, type IncomeStatement } from "@/lib/reports/incomeStatement";
import { generateBalanceSheet, type BalanceSheet, type OpeningBalances } from "@/lib/reports/balanceSheet";
import type { LedgerEntry } from "@/lib/storage/indexeddb";

interface Props {
  entries: LedgerEntry[];
}

export default function ReportViewer({ entries }: Props) {
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [incomeStmt, setIncomeStmt] = useState<IncomeStatement | null>(null);
  const [balSheet, setBalSheet] = useState<BalanceSheet | null>(null);
  const [openingBalance, setOpeningBalance] = useState<string>("0");

  function generate() {
    if (!periodStart || !periodEnd) return;

    const is = generateIncomeStatement(entries, periodStart, periodEnd);
    setIncomeStmt(is);

    const openingBalances: OpeningBalances = {
      bankBalance: parseFloat(openingBalance) || 0,
    };
    const bs = generateBalanceSheet(entries, periodEnd, openingBalances, is.netIncome);
    setBalSheet(bs);
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "end", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Period Start</label>
            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Period End</label>
            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Opening Bank Balance</label>
            <input type="number" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} step="0.01" />
          </div>
          <button className="primary" onClick={generate}>Generate Reports</button>
        </div>
      </div>

      {incomeStmt && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
            Income Statement (Draft)
          </h2>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
            {incomeStmt.periodStart} to {incomeStmt.periodEnd}
          </p>

          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>Revenue</h3>
          <table style={{ marginBottom: "1rem" }}>
            <tbody>
              {incomeStmt.revenue.map((item) => (
                <tr key={item.account}>
                  <td style={{ fontSize: "0.875rem" }}>{item.account}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: "0.875rem" }}>
                    {item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr style={{ fontWeight: 600 }}>
                <td style={{ fontSize: "0.875rem" }}>Total Revenue</td>
                <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: "0.875rem" }}>
                  {incomeStmt.totalRevenue.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>Expenses</h3>
          <table style={{ marginBottom: "1rem" }}>
            <tbody>
              {incomeStmt.expenses.map((item) => (
                <tr key={item.account}>
                  <td style={{ fontSize: "0.875rem" }}>{item.account}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: "0.875rem" }}>
                    {item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr style={{ fontWeight: 600 }}>
                <td style={{ fontSize: "0.875rem" }}>Total Expenses</td>
                <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: "0.875rem" }}>
                  {incomeStmt.totalExpenses.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{
            padding: "0.75rem",
            background: incomeStmt.netIncome >= 0 ? "#dcfce7" : "#fee2e2",
            borderRadius: "var(--radius)",
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 600,
          }}>
            <span>Net Income</span>
            <span style={{ fontFamily: "monospace" }}>{incomeStmt.netIncome.toFixed(2)}</span>
          </div>

          {incomeStmt.unresolvedItems.length > 0 && (
            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fef9c3", borderRadius: "var(--radius)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--warning)" }}>
                {incomeStmt.unresolvedItems.length} unresolved items need review
              </p>
            </div>
          )}
        </div>
      )}

      {balSheet && (
        <div className="card">
          <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
            Balance Sheet (Draft)
          </h2>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
            As of {balSheet.asOf}
          </p>

          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>Assets</h3>
          <table style={{ marginBottom: "1rem" }}>
            <tbody>
              {balSheet.assets.map((item) => (
                <tr key={item.account}>
                  <td style={{ fontSize: "0.875rem" }}>{item.account}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: "0.875rem" }}>
                    {item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr style={{ fontWeight: 600 }}>
                <td style={{ fontSize: "0.875rem" }}>Total Assets</td>
                <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: "0.875rem" }}>
                  {balSheet.totalAssets.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>Liabilities</h3>
          <table style={{ marginBottom: "1rem" }}>
            <tbody>
              {balSheet.liabilities.map((item) => (
                <tr key={item.account}>
                  <td style={{ fontSize: "0.875rem" }}>{item.account}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: "0.875rem" }}>
                    {item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr style={{ fontWeight: 600 }}>
                <td style={{ fontSize: "0.875rem" }}>Total Liabilities</td>
                <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: "0.875rem" }}>
                  {balSheet.totalLiabilities.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>Equity</h3>
          <table style={{ marginBottom: "1rem" }}>
            <tbody>
              {balSheet.equity.map((item) => (
                <tr key={item.account}>
                  <td style={{ fontSize: "0.875rem" }}>{item.account}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: "0.875rem" }}>
                    {item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr style={{ fontWeight: 600 }}>
                <td style={{ fontSize: "0.875rem" }}>Total Equity</td>
                <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: "0.875rem" }}>
                  {balSheet.totalEquity.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{
            padding: "0.75rem",
            background: balSheet.balanced ? "#dcfce7" : "#fee2e2",
            borderRadius: "var(--radius)",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}>
            {balSheet.balanced ? "Balance sheet is balanced" : "Balance sheet does not balance"}
          </div>

          {balSheet.unresolvedItems.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--warning)", marginBottom: "0.5rem" }}>
                Unresolved Items:
              </p>
              <ul style={{ fontSize: "0.75rem", color: "var(--muted)", paddingLeft: "1.25rem" }}>
                {balSheet.unresolvedItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
