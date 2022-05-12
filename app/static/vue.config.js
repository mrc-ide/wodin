module.exports = {
    lintOnSave: false,
    outputDir: "./dist",
    runtimeCompiler: true,
    configureWebpack: {
        resolve: {
            fallback: {
                stream: require.resolve("stream-browserify"),
                assert: require.resolve("assert/")
            }
        }
    }
};
