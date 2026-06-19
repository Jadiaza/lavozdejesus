// api/evangelio.ts

export default async function handler(req: any, res: any) {
  try {
    const response = await fetch(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7j7j9nNJ9DP7pFXM68yMrFUOan_pmUuGscDseMbkSWo4T1srKj2VsyUYE8XWnJlRpMAuR9QvQ2KVS/pub?gid=746027598&single=true&output=csv"
    );

    const csv = await response.text();

    const rows = csv.trim().split("\n");

    const data = rows.slice(1).map((row) => {
      const match = row.match(
        /^([^,]+),"([^"]+)",(.+)$/
      );

      if (!match) return null;

      return {
        fecha: match[1].trim(),
        cita: match[2].trim(),
        extracto: match[3].trim(),
      };
    });

    res.status(200).json(
      data.filter(Boolean)
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
}