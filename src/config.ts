// const prefix = import.meta.env
const prefix = process.env

const isDev = prefix.NODE_ENV === 'development'
import { version } from '../package.json'

export default {
  isDev,
  BASE_URL: isDev ? '/' : './',
  VERSION: version,
  APP_NAME: '云从AI海报',
  COPYRIGHT: 'Cloudwalk - www.cloudwalk.com',
  // API_URL: isDev ? 'http://localhost:9998' : '${API}',
  API_URL: 'https://palxp.cn:8887', // 服务端地址
  POSTER_API_URL: isDev ? 'http://localhost:48080/app-api' : 'http://10.128.172.93:32001/app-api',
  SCREEN_URL: isDev ? 'http://localhost:7001' : 'http://10.128.172.93:31001', // 截图服务地址
  IMG_URL: 'https://store.palxp.com/', // 七牛云资源地址
  // ICONFONT_URL: '//at.alicdn.com/t/font_3223711_74mlzj4jdue.css',
  ICONFONT_URL: '//at.alicdn.com/t/font_2717063_ypy8vprc3b.css?display=swap',
  ICONFONT_EXTRA: '//at.alicdn.com/t/c/font_3228074_42xym3extur.css',
  QINIUYUN_PLUGIN: 'https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/qiniu-js/2.5.5/qiniu.min.js',
  supportSubFont: true, // 是否开启服务端字体压缩
}
