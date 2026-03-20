"use client";

import { useState } from "react";
import Link from "next/link";

export default function Workspace() {
  const [passphrase, setPassphrase] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (passphrase.length < 8) return;
    // In production, derive key and verify against stored salt
    setUnlocked(true);
  }

  if (!unlocked) {
    return (
      <div className="container" style={{ maxWidth: "400px", paddingTop: "6rem" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Unlock Workspace</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          Enter your local passphrase to decrypt your workspace data.
        </p>
        <form onSubmit={handleUnlock} className="card">
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
              Passphrase
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Minimum 8 characters"
              style={{ width: "100%" }}
            />
          </div>
          <button type="submit" className="primary" style={{ width: "100%" }}>
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem" }}>Workspace</h1>
        <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 500 }}>
          Unlocked
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        <Link href="/workspace/import" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="card" style={{ cursor: "pointer" }}>
            <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Import Statement</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              Upload a bank statement PDF for processing.
            </p>
          </div>
        </Link>
        <Link href="/workspace/review" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="card" style={{ cursor: "pointer" }}>
            <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Review Transactions</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              Categorize and verify extracted transactions.
            </p>
          </div>
        </Link>
        <Link href="/workspace/reports" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="card" style={{ cursor: "pointer" }}>
            <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Reports</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              Generate income statement and balance sheet drafts.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
