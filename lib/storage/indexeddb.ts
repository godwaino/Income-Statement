const DB_NAME = "income-statement";
const DB_VERSION = 1;

export interface StatementMeta {
  id: string;
  filename: string;
  importedAt: number;
  pageCount: number;
  extractionMethod: "text" | "ocr";
}

export interface LedgerEntry {
  id: string;
  statementId: string;
  date: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  category: string;
  account: string;
  vatHint?: string;
  isTransfer?: boolean;
  isOwnerDraw?: boolean;
  isLoan?: boolean;
  reviewed: boolean;
}

export interface ReportSnapshot {
  id: string;
  type: "income-statement" | "balance-sheet";
  createdAt: number;
  periodStart: string;
  periodEnd: string;
  data: string; // encrypted JSON
}

type StoreName = "statements" | "extractedText" | "ledger" | "reports" | "settings";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("statements")) {
        db.createObjectStore("statements", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("extractedText")) {
        db.createObjectStore("extractedText", { keyPath: "statementId" });
      }
      if (!db.objectStoreNames.contains("ledger")) {
        const store = db.createObjectStore("ledger", { keyPath: "id" });
        store.createIndex("byStatement", "statementId", { unique: false });
        store.createIndex("byCategory", "category", { unique: false });
        store.createIndex("byDate", "date", { unique: false });
      }
      if (!db.objectStoreNames.contains("reports")) {
        const store = db.createObjectStore("reports", { keyPath: "id" });
        store.createIndex("byType", "type", { unique: false });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function putRecord<T>(
  storeName: StoreName,
  record: T
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getRecord<T>(
  storeName: StoreName,
  key: string
): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllRecords<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getByIndex<T>(
  storeName: StoreName,
  indexName: string,
  key: string
): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const index = tx.objectStore(storeName).index(indexName);
    const request = index.getAll(key);
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteRecord(
  storeName: StoreName,
  key: string
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
