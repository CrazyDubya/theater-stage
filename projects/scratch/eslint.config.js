import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                THREE: 'readonly',
                performance: 'readonly',
                fetch: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
            'complexity': ['warn', 15],
            'max-lines': ['warn', 1000],
            'max-params': ['warn', 5],
            'max-depth': ['warn', 4]
        },
        ignores: [
            'node_modules/',
            'build/',
            'demo/',
            'test/',
            'archive/',
            'js/lib/'
        ]
    }
];