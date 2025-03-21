module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-empty-function': 'warn',
        'require-await': 'error',
        'no-return-await': 'error',
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/restrict-template-expressions': ['error', {
            allowNumber: true,
            allowBoolean: true,
            allowAny: true,
            allowNullish: true,
        }],
        '@typescript-eslint/no-base-to-string': 'warn',
        '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
    },
    overrides: [
        {
            files: ['src/config/**/*.ts', 'src/common/filters/**/*.ts', 'src/app.module.ts'],
            rules: {
                '@typescript-eslint/no-unsafe-assignment': 'off',
                '@typescript-eslint/no-base-to-string': 'off',
                '@typescript-eslint/restrict-template-expressions': 'off',
                '@typescript-eslint/no-unsafe-enum-comparison': 'off'
            },
        },
    ],
}; 