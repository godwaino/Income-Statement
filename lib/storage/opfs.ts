async function getDirectory(
  ...path: string[]
): Promise<FileSystemDirectoryHandle> {
  let dir = await navigator.storage.getDirectory();
  for (const segment of path) {
    dir = await dir.getDirectoryHandle(segment, { create: true });
  }
  return dir;
}

export async function writeFile(
  path: string[],
  filename: string,
  data: ArrayBuffer | Uint8Array<ArrayBuffer>
): Promise<void> {
  const dir = await getDirectory(...path);
  const fileHandle = await dir.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(data);
  await writable.close();
}

export async function readFile(
  path: string[],
  filename: string
): Promise<ArrayBuffer> {
  const dir = await getDirectory(...path);
  const fileHandle = await dir.getFileHandle(filename);
  const file = await fileHandle.getFile();
  return file.arrayBuffer();
}

export async function deleteFile(
  path: string[],
  filename: string
): Promise<void> {
  const dir = await getDirectory(...path);
  await dir.removeEntry(filename);
}

export async function listFiles(path: string[]): Promise<string[]> {
  const dir = await getDirectory(...path);
  const names: string[] = [];
  for await (const [name] of dir as unknown as AsyncIterable<[string, FileSystemHandle]>) {
    names.push(name);
  }
  return names;
}

export async function saveStatement(
  id: string,
  data: ArrayBuffer
): Promise<void> {
  await writeFile(["statements"], `${id}.pdf`, data);
}

export async function loadStatement(id: string): Promise<ArrayBuffer> {
  return readFile(["statements"], `${id}.pdf`);
}

export async function saveOcrPage(
  statementId: string,
  page: number,
  data: ArrayBuffer
): Promise<void> {
  await writeFile(["ocr-pages", statementId], `${page}.png`, data);
}

export async function loadOcrPage(
  statementId: string,
  page: number
): Promise<ArrayBuffer> {
  return readFile(["ocr-pages", statementId], `${page}.png`);
}
