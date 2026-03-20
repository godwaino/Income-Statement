"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="container" style={{ textAlign: "center", paddingTop: "6rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Income Statement</h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem", maxWidth: "500px", margin: "0 auto 2rem" }}>
        Process bank statements and generate financial reports entirely in your
        browser. Your financial data never leaves your device.
      </p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button className="primary" onClick={() => router.push("/signin")}>
          Sign In
        </button>
        <button className="secondary" onClick={() => router.push("/workspace")}>
          Open Workspace
        </button>
      </div>
    </div>
  );
}
