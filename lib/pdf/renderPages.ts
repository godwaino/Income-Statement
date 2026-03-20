import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export interface RenderedPage {
  pageNumber: number;
  imageData: ArrayBuffer;
  width: number;
  height: number;
}

const RENDER_SCALE = 2.0;

export async function renderPageToImage(
  pdfData: ArrayBuffer,
  pageNumber: number
): Promise<RenderedPage> {
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: RENDER_SCALE });

  const canvas = new OffscreenCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Failed to get 2D context");

  await page.render({ canvasContext: context as unknown as CanvasRenderingContext2D, viewport }).promise;

  const blob = await canvas.convertToBlob({ type: "image/png" });
  const imageData = await blob.arrayBuffer();

  return {
    pageNumber,
    imageData,
    width: viewport.width,
    height: viewport.height,
  };
}

export async function renderAllPages(
  pdfData: ArrayBuffer,
  pageNumbers: number[]
): Promise<RenderedPage[]> {
  const results: RenderedPage[] = [];
  for (const pageNum of pageNumbers) {
    results.push(await renderPageToImage(pdfData, pageNum));
  }
  return results;
}
