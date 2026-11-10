/** @type {import('lint-staged').Configuration} */
const config = {
  "*.{ts,tsx,mts}": ["eslint --fix --max-warnings=0", "prettier --write"],
  "*.{js,mjs,cjs,json,md,css,yml,yaml}": ["prettier --write"],
  "prisma/schema.prisma": () => "prisma format",
};

export default config;
