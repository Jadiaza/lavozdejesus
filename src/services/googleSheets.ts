import Papa from "papaparse";

const EVANGELIO_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7j7j9nNJ9DP7pFXM68yMrFUOan_pmUuGscDseMbkSWo4T1srKj2VsyUYE8XWnJlRpMAuR9QvQ2KVS/pub?gid=746027598&single=true&output=csv";

export interface Evangelio {
  fecha: string;
  cita: string;
  extracto: string;
}

export async function getEvangelios(): Promise<Evangelio[]> {
  const response = await fetch(EVANGELIO_URL);

  const csv = await response.text();

  const result = Papa.parse<Evangelio>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return result.data;
}