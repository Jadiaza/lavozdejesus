import { describe, expect, it } from "vitest";
import {
  getModuleAccessPolicy,
  getRouteAccessPolicy,
  getRouteTarget,
  loadAccessPolicy,
} from "@/services/accessPolicy";

describe("access policy routes", () => {
  it("maps legacy routes to their canonical module and submodule", () => {
    expect(getRouteTarget("/devociones")).toEqual({ module: "oraciones", submodule: "devociones" });
    expect(getRouteTarget("/lecturas-del-dia")).toEqual({ module: "liturgia" });
    expect(getRouteTarget("/podcast/santos-arcangeles-33-dias")).toEqual({ module: "podcast", submodule: "series" });
  });

  it("requires registration for protected personal prayer routes on API fallback", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const policy = await loadAccessPolicy();

    expect(getRouteAccessPolicy("/capilla/intenciones", policy)).toBe("free");
    expect(getRouteAccessPolicy("/oraciones/mis-oraciones", policy)).toBe("free");
    expect(getRouteAccessPolicy("/oraciones/peticion", policy)).toBe("free");
    expect(getRouteAccessPolicy("/oraciones/recordatorios", policy)).toBe("free");
    expect(getRouteAccessPolicy("/rosario/diario", policy)).toBe("free");
  });

  it("uses explicitly configured submodule levels over module defaults", () => {
    expect(getModuleAccessPolicy("oraciones", "mis_oraciones", [
      { module: "oraciones", level: "guest", submodules: { mis_oraciones: "free" } },
    ])).toBe("free");
    expect(getModuleAccessPolicy("oraciones", "devociones", [
      { module: "oraciones", level: "free", submodules: { devociones: "guest" } },
    ])).toBe("guest");
  });
});
