import globals from "globals";
import pluginJs from "@eslint/js";
import someConfig from "some-other-config-you-use";
import eslintConfigPrettier from "eslint-config-prettier/flat";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      eqeqeq: "error",
    },
  },
  {
    extends: ["some-other-config-you-use", "prettier"],
  },
  someConfig,
  eslintConfigPrettier,
];
