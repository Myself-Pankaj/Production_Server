import jsdoc from 'eslint-plugin-jsdoc'
import js from '@eslint/js'
import globals from 'globals'
import eslintConfigPrettier from 'eslint-config-prettier'
export default [
    { ignores: ['dist'] },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: { ...globals.browser, ...globals.node },
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module'
            }
        },
        settings: { react: { version: '18.3' } },
        plugins: {
            jsdoc
        },
        rules: {
            ...js.configs.recommended.rules,
            ...eslintConfigPrettier.rules,
            'no-console': 'error',
            'no-useless-catch': 0,
            quotes: ['error', 'single', { allowTemplateLiterals: true }]
        }
    }
]
