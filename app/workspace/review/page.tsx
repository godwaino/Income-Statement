"use client";

import { useEffect, useState } from "react";
import { getAllRecords, type LedgerEntry } from "@/lib/storage/indexeddb";
import TransactionReviewTable from "@/components/transaction-review-table";

export default function ReviewPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllRecords<LedgerEntry>("ledger").then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  function handleUpdate(updated: LedgerEntry[]) {
    setEntries(updated);
  }

  if (loading) {
    return (
      <div className="container">
        <p style={{ color: "var(--muted)" }}>Loading transactions...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="container">
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Review Transactions</h1>
        <p style={{ color: "var(--muted)" }}>
          No transactions found. Import a statement first.
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Review Transactions</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        {entries.length} transactions &middot;{" "}
        {entries.filter((e) => e.reviewed).length} reviewed &middot;{" "}
        {entries.filter((e) => e.category === "Uncategorized").length} uncategorized
      </p>
      <TransactionReviewTable entries={entries} onUpdate={handleUpdate} />
    </div>
  );
}
