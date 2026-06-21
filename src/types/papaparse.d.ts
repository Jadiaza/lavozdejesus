declare module "papaparse" {
  export interface ParseConfig<T = unknown> {
    header?: boolean;
    skipEmptyLines?: boolean | "greedy";
    transformHeader?: (header: string, index: number) => string;
    complete?: (results: ParseResult<T>) => void;
    error?: (error: Error) => void;
  }

  export interface ParseResult<T = unknown> {
    data: T[];
    errors: unknown[];
    meta: unknown;
  }

  export function parse<T = unknown>(
    input: string,
    config?: ParseConfig<T>,
  ): ParseResult<T>;

  const Papa: {
    parse: typeof parse;
  };

  export default Papa;
}
