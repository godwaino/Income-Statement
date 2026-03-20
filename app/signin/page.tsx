"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Supabase auth will be wired here
    // For now, redirect to workspace
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    router.push("/workspace");
  }

  return (
    <div className="container" style={{ maxWidth: "400px", paddingTop: "6rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Sign In</h1>
      <form onSubmit={handleSubmit} className="card">
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        {error && (
          <p style={{ color: "var(--error)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            {error}
          </p>
        )}
        <button type="submit" className="primary" style={{ width: "100%" }}>
          Sign In
        </button>
      </form>
    </div>
  );
}
