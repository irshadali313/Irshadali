import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    ignores: ["lib/pdfParser/pdf.js"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" }
      ],
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
]);