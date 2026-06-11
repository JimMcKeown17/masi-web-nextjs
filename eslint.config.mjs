// Next 16 ships eslint-config-next as native ESLint flat configs, so we import
// them directly. The old FlatCompat.extends(...) shim routed them through the
// legacy @eslint/eslintrc loader, which crashed on a circular plugin reference.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    // Ambient type shims for untyped JS libraries (e.g. react-plotly.js) legitimately
    // use `any` to bridge an untyped surface -- don't fail lint on that.
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
