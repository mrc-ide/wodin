module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ["plugin:vue/vue3-essential", "@vue/airbnb", "@vue/typescript/recommended", "prettier"],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        quotes: ["error", "double", { avoidEscape: true }],
        "max-len": [2, 120, 4],
        "arrow-body-style": "off",
        "import/prefer-default-export": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "no-plusplus": "off",
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": ["error"],
        "no-underscore-dangle": "off",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error"],
        "no-await-in-loop": "off",
        "no-useless-concat": "off"
    },
    overrides: [
        {
            files: ["**/tests/**/*.{j,t}s"],
            env: {
                jest: true
            },
            rules: {
                "@typescript-eslint/no-explicit-any": "off",
                "@typescript-eslint/explicit-module-boundary-types": "off",
                "@typescript-eslint/no-unused-vars": "off",
                "@typescript-eslint/no-empty-function": "off",
                "max-classes-per-file": "off",
                "no-useless-constructor": "off"
            }
        }
    ],
    globals: {
        NodeJS: true
    }
};
