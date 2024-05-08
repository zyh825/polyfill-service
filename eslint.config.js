import js from '@eslint/js';
import pluginPrettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    ignore: ['dist'],
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'all',
          arrowParens: 'always',
          wrapAttributes: true,
          sortAttributes: true,
        },
      ],
    },
  },
];
