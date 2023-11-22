const path = require("path");
const baseConfig = require("../vue.config");
const WebpackShellPlugin = require("webpack-shell-plugin");

module.exports = {
    ...baseConfig,
    outputDir: path.join(__dirname, "../../server/public/js"),
    configureWebpack: {
        ...baseConfig.configureWebpack,
        devServer: {
            writeToDisk: true
        },
        output: {
            filename: "wodin.umd.min.js",
            libraryTarget: "umd",
            library: "lib",
            hotUpdateChunkFilename: "../hot/hot-update.js",
            hotUpdateMainFilename: "../hot/hot-update.json"
        },
        optimization: {
            splitChunks: false
        },
        plugins: [
            ...baseConfig.configureWebpack?.plugins,
            new WebpackShellPlugin({
                onBuildEnd: "npm run copy-fonts-serve"
            })
        ]
    },
    css: {
        extract: {
            filename: "../css/wodin.css"
        }
    }
};
