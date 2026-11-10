/** `require.context` (webpack) — dipakai registry otomatis di src/projects/index.ts. */
interface WebpackContext {
  (key: string): unknown;
  keys(): string[];
}
declare const require: {
  context(directory: string, useSubdirectories: boolean, regExp: RegExp): WebpackContext;
};
