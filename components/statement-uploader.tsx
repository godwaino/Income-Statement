"use client";

import { useRef } from "react";
import { extractText } from "@/lib/pdf/extractText";
import { renderAllPages } from "@/lib/pdf/renderPages";
import { ocrPages } from "@/lib/ocr/tesseractWorker";
import { parseTransactionsFromText, toLedgerEntries } from "@/lib/ledger/normalize";
import { classifyAll } from "@/lib/ledger/classify";
import { putRecord } from "@/lib/storage/indexeddb";
import { saveStatement, saveOcrPage } from "@/lib/storage/opfs";
import type { StatementMeta, LedgerEntry } from "@/lib/storage/indexeddb";

interface Props {
  onStatusChange: (status: "idle" | "processing" | "done" | "error") => void;
  onMessage: (msg: string) => void;
}

export default function StatementUploader({ onStatusChange, onMessage }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      onStatusChange("error");
      onMessage("Please select a PDF file.");
      return;
    }

    onStatusChange("processing");
    onMessage("Reading file...");

    try {
      const buffer = await file.arrayBuffer();
      const id = crypto.randomUUID();

      // Save raw PDF to OPFS
      onMessage("Saving statement...");
      await saveStatement(id, buffer);

      // Try text extraction first
      onMessage("Extracting text from PDF...");
      const extraction = await extractText(buffer);

      let fullText: string;
      let method: "text" | "ocr";

      if (!extraction.isImageBased) {
        // PDF has extractable text
        fullText = extraction.pages.map((p) => p.text).join("\n");
        method = "text";
      } else {
        // Fallback to OCR
        onMessage("PDF is image-based. Running OCR...");
        const imagePages = extraction.pages
          .filter((p) => !p.hasText)
          .map((p) => p.pageNumber);

        const rendered = await renderAllPages(buffer, imagePages);

        // Save OCR page images
        for (const page of rendered) {
          await saveOcrPage(id, page.pageNumber, page.imageData);
        }

        onMessage(`OCR processing ${rendered.length} pages...`);
        const ocrResults = await ocrPages(
          rendered.map((r) => ({ imageData: r.imageData, pageNumber: r.pageNumber }))
        );

        // Merge text-extracted pages with OCR pages
        const allText = extraction.pages.map((p) => {
          if (p.hasText) return p.text;
          const ocr = ocrResults.find((o) => o.pageNumber === p.pageNumber);
          return ocr?.text ?? "";
        });
        fullText = allText.join("\n");
        method = "ocr";
      }

      // Save metadata
      const meta: StatementMeta = {
        id,
        filename: file.name,
        importedAt: Date.now(),
        pageCount: extraction.totalPages,
        extractionMethod: method,
      };
      await putRecord("statements", meta);

      // Save extracted text
      await putRecord("extractedText", { statementId: id, text: fullText });

      // Parse and classify transactions
      onMessage("Parsing transactions...");
      const rawTransactions = parseTransactionsFromText(fullText);
      const ledgerEntries = toLedgerEntries(id, rawTransactions);
      const classified = classifyAll(ledgerEntries);

      // Save each entry
      for (const entry of classified) {
        await putRecord<LedgerEntry>("ledger", entry);
      }

      onStatusChange("done");
      onMessage(
        `Imported ${classified.length} transactions from ${extraction.totalPages} pages (${method}).`
      );
    } catch (err) {
      onStatusChange("error");
      onMessage(err instanceof Error ? err.message : "Processing failed.");
    }
  }

  return (
    <div className="card">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        className="primary"
        onClick={() => inputRef.current?.click()}
        style={{ width: "100%" }}
      >
        Select PDF Statement
      </button>
      <p style={{ color: "var(--muted)", fontSize: "0.75rem", marginTop: "0.75rem", textAlign: "center" }}>
        Your file is processed locally and never uploaded to any server.
      </p>
    </div>
  );
}
