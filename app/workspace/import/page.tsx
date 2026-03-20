"use client";

import { useState } from "react";
import StatementUploader from "@/components/statement-uploader";

export default function ImportPage() {
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  return (
    <div className="container" style={{ maxWidth: "600px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Import Statement</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Select a bank statement PDF. It will be processed entirely in your browser.
      </p>

      <StatementUploader
        onStatusChange={setStatus}
        onMessage={setMessage}
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
    </div>
  );
}
