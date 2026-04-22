const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
    transpileDependencies: true,
    productionSourceMap: false, // 关闭 sourcemap，减小体积
    publicPath: "/uias/",

    // 这里配置关闭webpack体积警告
    configureWebpack: {
        devtool: false,
    },

    // 自动拆包，让首屏更快、文件更小
    chainWebpack: (config) => {
        config.optimization.splitChunks({
            chunks: "all",
        });
    },

    devServer: {
        proxy: {
            "/": {
                target: "https://uias.localvm.outsrkem.top:30078",
                changeOrigin: true,
                secure: false,
                pathRewrite: {
                    "^/api/uias": "/api/uias",
                },
            },
        },
        webSocketServer: false,
    },
});
