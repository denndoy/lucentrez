export type AppLang = "id" | "en";

export const LANG_COOKIE = "lucentrez_lang";

export function normalizeLang(value?: string | null): AppLang {
  return value === "id" ? "id" : "en";
}
