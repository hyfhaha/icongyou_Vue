import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
// [优化] 1. 导入 Pinia
import * as Pinia from 'pinia';

export function createApp() {
  const app = createSSRApp(App)

  // [优化] 2. 创建并使用 Pinia 实例
  app.use(Pinia.createPinia());

  return {
    app,
	Pinia // [优化] 3. 导出 Pinia 以便在 `store` 文件中使用
  }
}
// #endif