"use client";

import { useState } from "react";
import StatementUploader from "@/components/statement-uploader";

export default function ImportPage() {
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [rawText, setRawText] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="container" style={{ maxWidth: "700px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Import Statement</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Select a bank statement PDF. It will be processed entirely in your browser.
      </p>

      <StatementUploader
        onStatusChange={setStatus}
        onMessage={setMessage}
        onRawText={setRawText}
      />

      {status === "processing" && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <p style={{ fontSize: "0.875rem" }}>Processing... {message}</p>
        </div>
      )}
      {status === "done" && (
        <div className="card" style={{ marginTop: "1rem", borderColor: "var(--success)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--success)" }}>{message}</p>
        </div>
      )}
      {status === "error" && (
        <div className="card" style={{ marginTop: "1rem", borderColor: "var(--error)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--error)" }}>{message}</p>
        </div>
      )}

      {rawText && (
        <div style={{ marginTop: "1rem" }}>
          <button
            className="secondary"
            onClick={() => setShowRaw((v) => !v)}
            style={{ fontSize: "0.75rem" }}
          >
            {showRaw ? "Hide" : "Show"} extracted text ({rawText.length} chars)
          </button>
          {showRaw && (
            <pre style={{
              marginTop: "0.5rem",
              padding: "1rem",
              background: "#f4f4f5",
              borderRadius: "var(--radius)",
              fontSize: "0.7rem",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              maxHeight: "400px",
              overflowY: "auto",
            }}>
              {rawText.slice(0, 5000)}{rawText.length > 5000 ? "\n\n[truncated...]" : ""}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
