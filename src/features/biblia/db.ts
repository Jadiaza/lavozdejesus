export interface VersiculoRow {
  id: string;
  version: string;
  libroId: number;
  capitulo: number;
  versiculo: number;
  texto: string;
  tieneNota: boolean;
}

export interface NotaStraubingerRow {
  id: string;
  libroId: number;
  capitulo: number;
  versiculo: number;
  texto: string;
}

export interface NotaPersonalRow {
  id: string;
  libroId: number;
  capitulo: number;
  versiculo: number;
  texto: string;
  createdAt: string;
}

export interface FavoritoRow {
  id: string;
  libroId: number;
  capitulo: number;
  versiculo: number;
  createdAt: string;
}

export interface MetaRow<T = unknown> {
  key: string;
  value: T;
}

const DB_NAME = "lvj_biblia";
const DB_VERSION = 1;

type StoreName =
  | "versiculos"
  | "notas_straubinger"
  | "notas_personales"
  | "favoritos"
  | "meta";

let dbPromise: Promise<IDBDatabase> | null = null;

const requestToPromise = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const transactionDone = (tx: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

export function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("versiculos")) {
        const store = db.createObjectStore("versiculos", { keyPath: "id" });
        store.createIndex("porCapitulo", ["version", "libroId", "capitulo"]);
        store.createIndex("porLibro", ["version", "libroId"]);
      }

      if (!db.objectStoreNames.contains("notas_straubinger")) {
        const store = db.createObjectStore("notas_straubinger", { keyPath: "id" });
        store.createIndex("porVersiculo", ["libroId", "capitulo", "versiculo"]);
      }

      if (!db.objectStoreNames.contains("notas_personales")) {
        const store = db.createObjectStore("notas_personales", { keyPath: "id" });
        store.createIndex("porVersiculo", ["libroId", "capitulo", "versiculo"]);
      }

      if (!db.objectStoreNames.contains("favoritos")) {
        db.createObjectStore("favoritos", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

const storeFor = async (name: StoreName, mode: IDBTransactionMode = "readonly") => {
  const db = await getDb();
  const tx = db.transaction(name, mode);
  return { tx, store: tx.objectStore(name) };
};

const getAll = async <T>(name: StoreName) => {
  const { store } = await storeFor(name);
  return requestToPromise<T[]>(store.getAll());
};

const getAllByIndex = async <T>(
  name: StoreName,
  indexName: string,
  key: IDBValidKey | IDBKeyRange,
) => {
  const { store } = await storeFor(name);
  return requestToPromise<T[]>(store.index(indexName).getAll(key));
};

const putRow = async <T>(name: StoreName, row: T) => {
  const { tx, store } = await storeFor(name, "readwrite");
  store.put(row);
  await transactionDone(tx);
};

const deleteRow = async (name: StoreName, key: IDBValidKey) => {
  const { tx, store } = await storeFor(name, "readwrite");
  store.delete(key);
  await transactionDone(tx);
};

export async function clearAllBibleData() {
  const db = await getDb();
  const tx = db.transaction(["versiculos", "notas_straubinger", "meta"], "readwrite");
  tx.objectStore("versiculos").clear();
  tx.objectStore("notas_straubinger").clear();
  tx.objectStore("meta").clear();
  await transactionDone(tx);
}

export async function importParsedBibleData(
  versiculos: Array<Omit<VersiculoRow, "id" | "version">>,
  notas: Array<Omit<NotaStraubingerRow, "id">>,
) {
  const db = await getDb();
  const tx = db.transaction(["versiculos", "notas_straubinger"], "readwrite");
  const versiculosStore = tx.objectStore("versiculos");
  const notasStore = tx.objectStore("notas_straubinger");
  const noteCounters: Record<string, number> = {};

  for (const verse of versiculos) {
    versiculosStore.put({
      id: `straubinger:${verse.libroId}:${verse.capitulo}:${verse.versiculo}`,
      version: "straubinger",
      ...verse,
    });
  }

  for (const nota of notas) {
    const key = `${nota.libroId}:${nota.capitulo}:${nota.versiculo}`;
    const count = (noteCounters[key] ?? 0) + 1;
    noteCounters[key] = count;
    notasStore.put({
      id: `${key}:${count}`,
      ...nota,
    });
  }

  await transactionDone(tx);
}

export async function setMeta<T>(key: string, value: T) {
  await putRow<MetaRow<T>>("meta", { key, value });
}

export async function getMeta<T>(key: string): Promise<T | null> {
  const { store } = await storeFor("meta");
  const row = await requestToPromise<MetaRow<T> | undefined>(store.get(key));
  return row?.value ?? null;
}

export async function getVersiculosDeCapitulo(
  version: string,
  libroId: number,
  capitulo: number,
) {
  const key = IDBKeyRange.only([version, libroId, capitulo]);
  const rows = await getAllByIndex<VersiculoRow>("versiculos", "porCapitulo", key);
  return rows.sort((a, b) => a.versiculo - b.versiculo);
}

export async function getCapitulosDeLibro(version: string, libroId: number) {
  const key = IDBKeyRange.only([version, libroId]);
  const rows = await getAllByIndex<VersiculoRow>("versiculos", "porLibro", key);
  return Array.from(new Set(rows.map((row) => row.capitulo))).sort((a, b) => a - b);
}

export async function getNotasStraubinger(
  libroId: number,
  capitulo: number,
  versiculo: number,
) {
  const key = IDBKeyRange.only([libroId, capitulo, versiculo]);
  return getAllByIndex<NotaStraubingerRow>("notas_straubinger", "porVersiculo", key);
}

const favId = (libroId: number, capitulo: number, versiculo: number) =>
  `${libroId}:${capitulo}:${versiculo}`;

export async function esFavorito(libroId: number, capitulo: number, versiculo: number) {
  const { store } = await storeFor("favoritos");
  const row = await requestToPromise<FavoritoRow | undefined>(
    store.get(favId(libroId, capitulo, versiculo)),
  );
  return !!row;
}

export async function toggleFavorito(
  libroId: number,
  capitulo: number,
  versiculo: number,
) {
  const id = favId(libroId, capitulo, versiculo);
  const exists = await esFavorito(libroId, capitulo, versiculo);
  if (exists) {
    await deleteRow("favoritos", id);
    return false;
  }

  await putRow<FavoritoRow>("favoritos", {
    id,
    libroId,
    capitulo,
    versiculo,
    createdAt: new Date().toISOString(),
  });
  return true;
}

export async function listarFavoritos() {
  return getAll<FavoritoRow>("favoritos");
}

export async function crearNotaPersonal(row: Omit<NotaPersonalRow, "id" | "createdAt">) {
  const id = `${row.libroId}:${row.capitulo}:${row.versiculo}:${Date.now()}`;
  await putRow<NotaPersonalRow>("notas_personales", {
    ...row,
    id,
    createdAt: new Date().toISOString(),
  });
}

export async function listarNotasPersonales() {
  return getAll<NotaPersonalRow>("notas_personales");
}

export async function eliminarNotaPersonal(id: string) {
  await deleteRow("notas_personales", id);
}
