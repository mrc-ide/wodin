module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": [
        "airbnb-base"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "comma-dangle": ["error", "never"],
        indent: ["error", 4],
        quotes: ["error", "double", { avoidEscape: true }],
        "max-len": [2, 120, 4],
        "arrow-body-style": "off",
        "import/prefer-default-export": "off",
        "import/no-unresolved": "off",
        "import/extensions": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": ["error"],
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "error",
        "no-underscore-dangle": "off",
    },
    overrides: [{
        files: [
            "**/tests/**/*.{j,t}s"
        ],
        env: {
            jest: true
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "global-require": "off"
        }
    }]
};
