import js from "@eslint/js";
import globals from "globals";
import tslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import pluginImport from "eslint-plugin-import";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,vue}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: {
      import: pluginImport
    },
    settings: {
      "import/resolver": {
        typescript: true
      }
    }
  },
  {
    files: ["src/**/*.{js,ts,vue}"],
    rules: {
      "import/extensions": [
        "error",
        "always",
        {
          js: "always",
          ts: "always"
        }
      ]
    },
    overrides: [
      {
        files: ["src/app/**"],
        rules: {
          "import/extensions": [
            "error",
            "always",
            {
              js: "never",
              ts: "never"
            }
          ]
        }
      }
    ]
  },
  ...tslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tslint.parser
        // project: 'tsconfig.json'
      }
    },
    rules: {
      "vue/multi-word-component-names": "off"
    }
  }
]);
