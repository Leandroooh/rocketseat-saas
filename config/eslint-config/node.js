/**
 * @type {import('eslint').Linter.Config}
 */

module.exports = {
  extends: ['@rocketseat/eslint-config/react1'],
  plugins: ['simple-import-sort'],
  rules: {
    'simple-import-sort/imports': true
  }
}