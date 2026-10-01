import { getMysqlPool, hasMysqlConfig } from "./_mysql.js";

type ApiRequest = {
  query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

type DbRow = Record<string, unknown>;

const text = (row: DbRow | null | undefined, key: string) => {
  const value = row?.[key];
  return value === undefined || value === null ? "" : String(value).trim();
};

const boolValue = (value: unknown, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  return ["1", "true", "si", "sí", "yes", "activo"].includes(
    String(value).trim().toLowerCase(),
  );
};

const firstRow = async (sql: string, params: Record<string, unknown> = {}) => {
  const [rows] = await getMysqlPool().execute(sql, params);
  return (rows as DbRow[])[0] ?? null;
};

const optionalFirstRow = async (
  sql: string,
  params: Record<string, unknown> = {},
) => {
  try {
    return await firstRow(sql, params);
  } catch {
    return null;
  }
};

const optionalRows = async (
  sql: string,
  params: Record<string, unknown> = {},
) => {
  try {
    const [rows] = await getMysqlPool().execute(sql, params);
    return rows as DbRow[];
  } catch {
    return [];
  }
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!hasMysqlConfig()) {
    res.status(503).json({ error: "MYSQL_ENV_NOT_CONFIGURED" });
    return;
  }

  try {
    const base = await firstRow(`
      SELECT
        e.id AS emisora_id,
        COALESCE(app.modo_mantenimiento, 0) AS modo_mantenimiento_global
      FROM lvj_cfg_emisora e
      LEFT JOIN lvj_cfg_app app
        ON app.emisora_id = e.id AND app.estado = 1
      WHERE e.estado = 1
      ORDER BY e.id ASC
      LIMIT 1
    `);

    if (!base) {
      res.status(404).json({ error: "CONFIG_NOT_FOUND" });
      return;
    }

    const emisoraId = Number(base.emisora_id);
    const globalMaintenance = boolValue(base.modo_mantenimiento_global, false);

    const readQuery = (key: string) => {
      const raw = req.query?.[key];
      if (typeof raw === "string") return raw.trim();
      if (Array.isArray(raw)) return String(raw[0] ?? "").trim();
      return "";
    };

    const module = readQuery("modulo");
    const submodule = readQuery("submodulo");

    if (submodule && !module) {
      res.status(400).json({
        error: "MODULE_REQUIRED",
        mensaje: "El parámetro modulo es obligatorio cuando se consulta un submódulo.",
      });
      return;
    }

    if (module) {
      const row = await optionalFirstRow(
        `
          SELECT modulo, modo_mantenimiento, mensaje_mantenimiento
          FROM lvj_cfg_modulos
          WHERE emisora_id = :emisoraId AND modulo = :modulo
          LIMIT 1
        `,
        { emisoraId, modulo: module },
      );

      if (!row) {
        res.status(404).json({
          error: "MODULE_NOT_FOUND",
          emisora_id: String(emisoraId),
          modulo: module,
        });
        return;
      }

      const moduleMaintenance = boolValue(row.modo_mantenimiento, false);

      if (submodule) {
        const subRow = await optionalFirstRow(
          `
            SELECT modulo, submodulo, modo_mantenimiento, mensaje_mantenimiento
            FROM lvj_cfg_submodulos
            WHERE emisora_id = :emisoraId
              AND modulo = :modulo
              AND submodulo = :submodule
            LIMIT 1
          `,
          { emisoraId, modulo: module, submodule },
        );

        const submoduleMaintenance = subRow
          ? boolValue(subRow.modo_mantenimiento, false)
          : false;

        res.status(200).json({
          ok: true,
          emisora_id: String(emisoraId),
          modulo: text(row, "modulo"),
          submodulo: subRow ? text(subRow, "submodulo") : submodule,
          modo_mantenimiento_global: globalMaintenance,
          modo_mantenimiento: moduleMaintenance,
          modo_mantenimiento_submodulo: submoduleMaintenance,
          mantenimiento_activo:
            globalMaintenance || moduleMaintenance || submoduleMaintenance,
          nivel_mantenimiento_activo: globalMaintenance
            ? "global"
            : moduleMaintenance
              ? "modulo"
              : submoduleMaintenance
                ? "submodulo"
                : "ninguno",
          mensaje_mantenimiento: globalMaintenance
            ? "La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde."
            : moduleMaintenance
              ? text(row, "mensaje_mantenimiento")
              : submoduleMaintenance
                ? text(subRow, "mensaje_mantenimiento")
                : "",
        });
        return;
      }

      const subRows = await optionalRows(
        `
          SELECT submodulo, modo_mantenimiento, mensaje_mantenimiento
          FROM lvj_cfg_submodulos
          WHERE emisora_id = :emisoraId AND modulo = :modulo
          ORDER BY submodulo ASC
        `,
        { emisoraId, modulo: module },
      );

      const submodules: Record<string, unknown> = {};
      for (const subRow of subRows) {
        const submoduleName = text(subRow, "submodulo");
        const submoduleMaintenance = boolValue(subRow.modo_mantenimiento, false);
        submodules[submoduleName] = {
          modo_mantenimiento: submoduleMaintenance,
          mantenimiento_activo:
            globalMaintenance || moduleMaintenance || submoduleMaintenance,
          mensaje_mantenimiento: globalMaintenance
            ? "La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde."
            : moduleMaintenance
              ? text(row, "mensaje_mantenimiento")
              : submoduleMaintenance
                ? text(subRow, "mensaje_mantenimiento")
                : "",
        };
      }

      res.status(200).json({
        ok: true,
        emisora_id: String(emisoraId),
        modulo: text(row, "modulo"),
        modo_mantenimiento_global: globalMaintenance,
        modo_mantenimiento: moduleMaintenance,
        mantenimiento_activo: globalMaintenance || moduleMaintenance,
        mensaje_mantenimiento: globalMaintenance
          ? "La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde."
          : moduleMaintenance
            ? text(row, "mensaje_mantenimiento")
            : "",
        submodulos: submodules,
      });
      return;
    }

    const rows = await optionalRows(
      `
        SELECT modulo, modo_mantenimiento, mensaje_mantenimiento
        FROM lvj_cfg_modulos
        WHERE emisora_id = :emisoraId
        ORDER BY modulo ASC
      `,
      { emisoraId },
    );

    const subRows = await optionalRows(
      `
        SELECT modulo, submodulo, modo_mantenimiento, mensaje_mantenimiento
        FROM lvj_cfg_submodulos
        WHERE emisora_id = :emisoraId
        ORDER BY modulo ASC, submodulo ASC
      `,
      { emisoraId },
    );

    const submodulesByModule: Record<string, Record<string, unknown>> = {};

    for (const subRow of subRows) {
      const moduleName = text(subRow, "modulo");
      const submoduleName = text(subRow, "submodulo");
      const submoduleMaintenance = boolValue(subRow.modo_mantenimiento, false);

      submodulesByModule[moduleName] ??= {};
      submodulesByModule[moduleName][submoduleName] = {
        modo_mantenimiento: submoduleMaintenance,
        mantenimiento_activo: globalMaintenance || submoduleMaintenance,
        mensaje_mantenimiento: globalMaintenance
          ? "La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde."
          : submoduleMaintenance
            ? text(subRow, "mensaje_mantenimiento")
            : "",
      };
    }

    const modules: Record<string, unknown> = {};

    for (const row of rows) {
      const moduleName = text(row, "modulo");
      const moduleMaintenance = boolValue(row.modo_mantenimiento, false);

      modules[moduleName] = {
        modo_mantenimiento: moduleMaintenance,
        mantenimiento_activo: globalMaintenance || moduleMaintenance,
        mensaje_mantenimiento: globalMaintenance
          ? "La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde."
          : moduleMaintenance
            ? text(row, "mensaje_mantenimiento")
            : "",
        submodulos: submodulesByModule[moduleName] ?? {},
      };
    }

    res.status(200).json({
      ok: true,
      emisora_id: String(emisoraId),
      modo_mantenimiento_global: globalMaintenance,
      modulos: modules,
    });
  } catch (error) {
    res.status(500).json({
      error: "MAINTENANCE_QUERY_FAILED",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
