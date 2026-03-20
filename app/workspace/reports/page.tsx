"use client";

import { useEffect, useState } from "react";
import { getAllRecords, type LedgerEntry } from "@/lib/storage/indexeddb";
import ReportViewer from "@/components/report-viewer";

export default function ReportsPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllRecords<LedgerEntry>("ledger").then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="container">
        <p style={{ color: "var(--muted)" }}>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Financial Reports</h1>
      <ReportViewer entries={entries} />
    </div>
  );
}
