"use client";

import { useState } from "react";
import { putRecord } from "@/lib/storage/indexeddb";
import type { LedgerEntry } from "@/lib/storage/indexeddb";

interface Props {
  entries: LedgerEntry[];
  onUpdate: (entries: LedgerEntry[]) => void;
}

const CATEGORIES = [
  "Uncategorized",
  "Sales Revenue",
  "Interest Income",
  "Payroll",
  "Rent",
  "Utilities",
  "Insurance",
  "Office Supplies",
  "Telecommunications",
  "Marketing",
  "Vehicle",
  "Travel",
  "Software",
  "Bank Fees",
  "Interest Expense",
  "Transfer",
  "Loan Repayment",
  "Owner Draw",
  "Other Income",
  "Other Expense",
];

export default function TransactionReviewTable({ entries, onUpdate }: Props) {
  const [filter, setFilter] = useState<"all" | "unreviewed" | "uncategorized">("all");

  const filtered = entries.filter((e) => {
    if (filter === "unreviewed") return !e.reviewed;
    if (filter === "uncategorized") return e.category === "Uncategorized";
    return true;
  });

  async function updateEntry(id: string, updates: Partial<LedgerEntry>) {
    const updated = entries.map((e) =>
      e.id === id ? { ...e, ...updates } : e
    );
    const entry = updated.find((e) => e.id === id);
    if (entry) await putRecord("ledger", entry);
    onUpdate(updated);
  }

  async function markReviewed(id: string) {
    await updateEntry(id, { reviewed: true });
  }

  async function changeCategory(id: string, category: string) {
    await updateEntry(id, { category, reviewed: true });
  }

  return (
    <div>
      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
        {(["all", "unreviewed", "uncategorized"] as const).map((f) => (
          <button
            key={f}
            className={filter === f ? "primary" : "secondary"}
            onClick={() => setFilter(f)}
            style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id} style={{ opacity: entry.reviewed ? 0.7 : 1 }}>
                <td style={{ whiteSpace: "nowrap", fontSize: "0.875rem" }}>{entry.date}</td>
                <td style={{ fontSize: "0.875rem", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {entry.description}
                </td>
                <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: "0.875rem" }}>
                  {entry.type === "debit" ? "-" : ""}
                  {entry.amount.toFixed(2)}
                </td>
                <td>
                  <span style={{
                    fontSize: "0.75rem",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "9999px",
                    background: entry.type === "credit" ? "#dcfce7" : "#fee2e2",
                    color: entry.type === "credit" ? "#166534" : "#991b1b",
                  }}>
                    {entry.type}
                  </span>
                </td>
                <td>
                  <select
                    value={entry.category}
                    onChange={(e) => changeCategory(entry.id, e.target.value)}
                    style={{ fontSize: "0.75rem", padding: "0.25rem" }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </td>
                <td>
                  {entry.reviewed ? (
                    <span style={{ color: "var(--success)", fontSize: "0.75rem" }}>Reviewed</span>
                  ) : (
                    <button
                      className="secondary"
                      onClick={() => markReviewed(entry.id)}
                      style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
