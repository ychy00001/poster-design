/*
 * @Author: ShawnPhang
 * @Date: 2022-03-03 14:13:16
 * @Description:
 * @LastEditors: ShawnPhang <site: book.palxp.com>
 * @LastEditTime: 2023-06-29 15:11:46
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import utils from './utils'
import 'normalize.css/normalize.css'
import '@/assets/styles/index.less'
import '@/assets/css/icon.css'
import elementConfig from './utils/widgets/elementConfig'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

elementConfig.components.forEach((component) => {
  app.component(component.name, component)
})

elementConfig.plugins.forEach((plugin: any) => {
  app.use(plugin)
})

app
  .use(store)
  .use(router)
  .use(utils)
  .mount('#app')
