/**
 * @typedef {import('prettier').Config} PrettierConfig
 */

/** @type { PrettierConfig } */
const config = {
  plugins: ["prettier-plugin-tailwind-css"],
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  jsxSingleQuote: true,
  trailingComma: "es5",
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "auto",
  bracketSameLine: "false",
};

export default config;
