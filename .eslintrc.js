// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  'env': {
    'browser': true,
    'node': true,
    'es6': true,
  },
  "rules": {
    "@typescript-eslint/no-var-requires": "off"
  }
}