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
            target: 'https://uias-devops.outsrkem.top:30078',
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
