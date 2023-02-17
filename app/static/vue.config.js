const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
    lintOnSave: false,
    outputDir: "./dist",
    runtimeCompiler: true,
    configureWebpack: {
        plugins: [new MonacoWebpackPlugin({
            languages: ["r"]
        })],
        devServer: {
            writeToDisk: true
        },
        output: {
            filename: "[name].umd.min.js",
            libraryTarget: "umd",
            library: "lib",
            hotUpdateChunkFilename: "hot/hot-update.js",
            hotUpdateMainFilename: "hot/hot-update.json"
        },
    },
    css: {
        extract: {
            filename: "./css/[name].css"
        }
    }
};
