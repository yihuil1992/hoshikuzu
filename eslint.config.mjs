import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // 继承 Next.js 官方推荐的 ESLint 规则，不再包含 google 配置
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),

  {
    plugins: {
      prettier, // 支持 ESLint 中调用 prettier
    },
    rules: {
      // 只需设置 prettier 规则为 warn 或 error 按需
      'prettier/prettier': 'warn',
      // 如果仍有其他你需要覆盖的规则，也可以继续明确加进来
    },
  },
];
