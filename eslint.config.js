// eslint.config.js
import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config([
  // Bỏ qua thư mục build
  globalIgnores(["dist", "node_modules"]),

  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: ["dist/**", "node_modules/**"],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },

    plugins: {
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
    },

    rules: {
      // --- React & TS Base ---
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],

      // --- Import Rules ---
      "import/no-duplicates": "error",
      "import/first": "error",
      "import/newline-after-import": ["warn", { count: 1 }],
      "import/no-unresolved": "off", // vì Vite xử lý alias @/
      "simple-import-sort/imports": [
        "warn",
        {
          groups: [
            // Nhóm 1: React + core libs
            ["^react", "^@?\\w"],
            // Nhóm 2: alias nội bộ (@/something)
            ["^@/"],
            // Nhóm 3: import tương đối
            ["^\\./", "^\\.\\./"],
          ],
        },
      ],
      "simple-import-sort/exports": "warn",
    },
  },
]);
