import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ["node_modules/**", ".next/**", "next-env.d.ts", "prisma/migrations/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      boundaries: (await import("eslint-plugin-boundaries")).default,
    },
    settings: {
      "boundaries/elements": [
        { type: "domain", pattern: "src/domain/**" },
        { type: "application", pattern: "src/application/**" },
        { type: "infrastructure", pattern: "src/infrastructure/**" },
        { type: "presentation", pattern: "src/presentation/**" },
        // src/app e middleware.ts sao composition roots — podem importar tudo.
        { type: "composition-root", pattern: ["src/app/**", "src/middleware.ts"] },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "domain", allow: ["domain"] },
            { from: "application", allow: ["domain", "application"] },
            { from: "infrastructure", allow: ["domain", "application", "infrastructure"] },
            { from: "presentation", allow: ["domain", "application", "presentation"] },
            {
              from: "composition-root",
              allow: [
                "domain",
                "application",
                "infrastructure",
                "presentation",
                "composition-root",
              ],
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
