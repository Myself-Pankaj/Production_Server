import globals from 'globals'
import pluginJs from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-config-prettier'
import jsdoc from 'eslint-plugin-jsdoc'
export default [
    {
        languageOptions: {
            globals: { ...globals.browser, ...globals.node }
        }
    },
    pluginJs.configs.recommended,
    {
        files: ['src/**/*.js', '*.js'],
        plugins: {
            jsdoc
        },
        rules: {
            'no-console': 'error',
            'no-useless-catch': 0,
            quotes: ['error', 'single', { allowTemplateLiterals: true }]
        }
    },
    eslintPluginPrettierRecommended
]
