module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "no-unused-vars": "warn",
        "no-console": "off",
        "complexity": ["warn", 15],
        "max-lines": ["warn", 1000],
        "max-lines-per-function": ["warn", 100],
        "max-params": ["warn", 5],
        "max-depth": ["warn", 4]
    },
    "ignorePatterns": [
        "node_modules/",
        "build/",
        "demo/",
        "test/",
        "archive/"
    ]
};