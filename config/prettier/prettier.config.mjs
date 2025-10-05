/**
 * @typedef {import('prettier').Config} PrettierConfig
 */

/** @type { PrettierConfig } */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  printWidth: 160,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: "as-needed",
  jsxSingleQuote: true,
  trailingComma: "es5",
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "auto",
  bracketSameLine: true,
};

export default config;
