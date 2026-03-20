import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  hasText: boolean;
}

export interface ExtractionResult {
  pages: ExtractedPage[];
  totalPages: number;
  isImageBased: boolean;
}

export async function extractText(
  pdfData: ArrayBuffer
): Promise<ExtractionResult> {
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const pages: ExtractedPage[] = [];
  let textPageCount = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();

    const hasText = text.length > 20;
    if (hasText) textPageCount++;

    pages.push({ pageNumber: i, text, hasText });
  }

  const isImageBased = textPageCount < pdf.numPages * 0.5;

  return { pages, totalPages: pdf.numPages, isImageBased };
}
