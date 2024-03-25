// @ts-check
import eslint from '@eslint/js';
import tslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';

export default tslint.config(eslint.configs.recommended, prettier, ...tslint.configs.recommendedTypeChecked, {
    files: ['src/**/*.ts', 'eslint.config.js'],
    languageOptions: {
        parserOptions: {
            project: true,
            tsconfigRootDir: import.meta.dirname,
        },
    },
    rules: {
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                "args": "all",
                "argsIgnorePattern": "^_",
                "caughtErrors": "all",
                "caughtErrorsIgnorePattern": "^_",
                "destructuredArrayIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "ignoreRestSiblings": true
            }
        ]
    }
});
