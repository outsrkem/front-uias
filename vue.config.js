const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    configureWebpack: {
        devtool: false,
    },
    transpileDependencies: true,
    publicPath: '/uias/',
    devServer: {
        proxy: {
          '/': {
            target: 'http://10.10.10.14:8080',
            changeOrigin: true,
            secure: false,
            pathRewrite: {
              '^/api/uias': '/api/uias'
            }
          }
        },
        webSocketServer: false,
    },
})
