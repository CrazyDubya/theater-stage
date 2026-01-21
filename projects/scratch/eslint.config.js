import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jestPlugin from 'eslint-plugin-jest';

export default [
    js.configs.recommended,
    prettier,
    {
        files: ['js/**/*.js', '__tests__/**/*.js', 'server/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                THREE: 'readonly',
                console: 'readonly',
                document: 'readonly',
                window: 'readonly',
                fetch: 'readonly',
                setInterval: 'readonly',
                setTimeout: 'readonly',
                clearInterval: 'readonly',
                clearTimeout: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                global: 'readonly',
                Map: 'readonly',
                Set: 'readonly',
                Date: 'readonly',
                Math: 'readonly',
                JSON: 'readonly',
                Promise: 'readonly',
                WebSocket: 'readonly',
                alert: 'readonly',
                confirm: 'readonly',
                prompt: 'readonly',
                performance: 'readonly',
                // Application-specific globals
                collaborationManager: 'writable',
                CollaborationManager: 'readonly',
                props: 'writable',
                actors: 'writable',
                scene: 'writable',
                camera: 'writable',
                stage: 'writable',
                curtainState: 'writable',
                toggleCurtains: 'readonly',
                movePlatforms: 'readonly',
                applyLightingPreset: 'readonly',
                currentLightingPreset: 'writable',
                sceneSerializer: 'writable',
                saveScene: 'readonly',
                loadScene: 'readonly',
                // Browser APIs
                navigator: 'readonly',
                Blob: 'readonly',
                URL: 'readonly',
                FileReader: 'readonly',
                Audio: 'readonly',
                localStorage: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            'no-undef': 'error',
            'prefer-const': 'warn',
            'no-var': 'warn'
        }
    },
    {
        files: ['__tests__/**/*.js'],
        plugins: {
            jest: jestPlugin
        },
        languageOptions: {
            globals: {
                ...jestPlugin.environments.globals.globals,
                describe: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                jest: 'readonly'
            }
        },
        rules: {
            ...jestPlugin.configs.recommended.rules,
            'no-unused-vars': ['off'] // Allow unused vars in tests for mock definitions
        }
    },
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            'coverage/**',
            '*.backup',
            'package-lock.json'
        ]
    }
];
