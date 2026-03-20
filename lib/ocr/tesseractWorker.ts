import Tesseract from "tesseract.js";

export interface OcrResult {
  pageNumber: number;
  text: string;
  confidence: number;
}

export async function ocrPage(
  imageData: ArrayBuffer,
  pageNumber: number
): Promise<OcrResult> {
  const blob = new Blob([imageData], { type: "image/png" });
  const result = await Tesseract.recognize(blob, "eng", {
    workerPath: "/tesseract/worker.min.js",
    corePath: "/tesseract-core/tesseract-core-simd-lstm.wasm.js",
    langPath: "/tessdata",
  });

  return {
    pageNumber,
    text: result.data.text,
    confidence: result.data.confidence,
  };
}

export async function ocrPages(
  pages: Array<{ imageData: ArrayBuffer; pageNumber: number }>
): Promise<OcrResult[]> {
  const results: OcrResult[] = [];
  for (const page of pages) {
    results.push(await ocrPage(page.imageData, page.pageNumber));
  }
  return results;
}
