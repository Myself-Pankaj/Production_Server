import globals from 'globals'
import pluginJs from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-config-prettier'

export default [
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    {
        files: ['src/**/*.js'],
        rules: {
            'no-console': 'error',
            'no-useless-catch': 0,
            quotes: ['error', 'single', { allowTemplateLiterals: true }]
        }
    },
    eslintPluginPrettierRecommended
]

