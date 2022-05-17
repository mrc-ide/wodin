const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
    lintOnSave: false,
    outputDir: "./dist",
    runtimeCompiler: true,
    configureWebpack: {
        plugins: [new MonacoWebpackPlugin({
            languages: ['javascript']
        })]
    }
};
