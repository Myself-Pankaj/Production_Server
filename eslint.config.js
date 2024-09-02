import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import js from '@eslint/js'
export default [
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser
            }
        }
    },
    {
        files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
        rules: {
            'prefer-const': 'warn',
            'no-constant-binary-expression': 'error',
            'no-console': 'error',
            'no-useless-catch': 0
        }
    },
    eslintConfigPrettier
]

