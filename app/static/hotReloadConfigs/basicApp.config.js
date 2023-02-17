const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path")

module.exports = {
    lintOnSave: false,
    outputDir: path.join(__dirname, "../../server/public"),
    runtimeCompiler: true,
    configureWebpack: {
        plugins: [new MonacoWebpackPlugin({
            languages: ["r"]
        })],
        devServer: {
            writeToDisk: true
        },
        output: {
            filename: "basicApp.umd.min.js",
            libraryTarget: "umd",
            library: "lib",
            hotUpdateChunkFilename: "hot/hot-update.js",
            hotUpdateMainFilename: "hot/hot-update.json"
        },
    },
    css: {
        extract: {
            filename: "./css/basicApp.css"
        }
    }
};
