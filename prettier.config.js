/**
 *  @type {import("prettier").Config}
 */
const prettierConfig = {
  //#region my specs
  semi: true,
  singleQuote: false,
  //#endregion
  arrowParens: "always",
  bracketSameLine: false,
  bracketSpacing: true,
  experimentalTernaries: false, // por ahora no
  jsxSingleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  singleAttributePerLine: false,
  htmlWhitespaceSensitivity: "css",

  //#region settings for Vue
  vueIndentScriptAndStyle: true,
  //#endregion
  proseWrap: "preserve",
  insertPragma: false,
  requirePragma: false,
  // tabWidth and useTabs will be loaded from .editorconfig
  embeddedLanguageFormatting: "auto", // facil ayuda para @example en docstrings
  printWidth: 120,
  plugins: ["prettier-plugin-organize-imports"],
};

module.exports = prettierConfig;
