import { describe,expect,it } from "vitest";
import { isDoctrinalStudyV2 } from "@/features/biblia/doctrinalStudyV2";

describe("isDoctrinalStudyV2",()=>{
  it("detecta el esquema doctrinal 2.x",()=>{
    expect(isDoctrinalStudyV2({schema_version:"2.0.0",nivel:"doctrinal",doctrina_catolica:{}})).toBe(true);
  });

  it("conserva los estudios del esquema anterior",()=>{
    expect(isDoctrinalStudyV2({referencia:"Salmos 8",mensaje_teologico:"Texto"})).toBe(false);
  });
});
