
module.exports = {
  root: true,

  env: {
    "es6": true,
    "browser": true,
    "node": true
  },

  parser: "@typescript-eslint/parser",
  parserOptions: {
    "sourceType": "module",
    "ecmaVersion": 2016,
  },

  globals: {
    "$": true
  },

  rules: {
  },

  extends: [
    'eslint:recommended',
  ],

  plugins: [
  ],

  overrides: [
    // typescript
    {
      files: ["*.ts", "*.tsx"],
      excludedFiles: ["*.js"],
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        //'@typescript-eslint/no-explicit-any': 0,
        //'@typescript-eslint/member-delimiter-style': 0,
        //'@typescript-eslint/interface-name-prefix': 0,
        //'@typescript-eslint/no-use-before-define': 0,
      },
    },
  ],
  settings: {
  }
}