module.exports = {
  extends: [
    "eslint:recommended",
    "next/core-web-vitals",
    "eslint-config-turbo",
    "prettier",
  ],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "dist/",
    ".eslintrc.js",
    "**/*.css",
    "react-app-env.d.ts",
  ],
  globals: {
    React: true,
    JSX: true,
  },
  env: { browser: true, es6: true, node: true },
};
