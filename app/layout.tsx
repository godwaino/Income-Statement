import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Income Statement - Local-First Financial Processor",
  description: "Process bank statements and generate financial reports entirely in your browser.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
