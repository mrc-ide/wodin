module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        "plugin:vue/vue3-essential",
        "@vue/airbnb",
        "@vue/typescript/recommended"
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "comma-dangle": ["error", "never"],
        indent: ["error", 4],
        quotes: ["error", "double", { avoidEscape: true }],
        "arrow-body-style": "off",
        "import/prefer-default-export": "off",
        "@typescript-eslint/no-non-null-assertion": "off"
    },
    overrides: [{
        files: [
            "**/tests/**/*.{j,t}s"
        ],
        env: {
            jest: true
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off"
        }
    }]
};
