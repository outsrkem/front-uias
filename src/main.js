import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 加载全局样式文件
import './styles/index.less'

// 加载 引入vue-cookies。
import vueCookies from 'vue-cookies'
import config from './config/config'
const app = createApp(App)

// 注册配置项
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.config.globalProperties.$config = config;
app.use(ElementPlus, {  locale: zhCn, }) // 使用element国际化
app.use(router)
app.use(vueCookies)
app.mount('#app')
