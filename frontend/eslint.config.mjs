// frontend/eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/coverage/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Disable some rules that might cause issues with the tests
      "react/display-name": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      // Special rules for test files
      "@typescript-eslint/no-explicit-any": "off",
      "react/display-name": "off",
    },
  },
];

export default eslintConfig;