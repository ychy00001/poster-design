/*
 * @Author: ShawnPhang
 * @Date: 2021-08-19 18:43:22
 * @Description: 前端路由
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2023-09-19 17:32:04
 */
export default [
  // {
  //   path: '/',
  //   name: 'main',
  //   redirect: 'home',
  //   component: () => import('@/views/Ready.vue'),
  //   children: [
  //     {
  //       name: 'Home',
  //       path: '/home',
  //       component: () => import(/* webpackChunkName: 'base' */ '@/views/Index.vue'),
  //     },
  //   ],
  // },
  {
    // 预留主页
    path: '/',
    name: 'main',
    redirect: 'home',
  },
  {
    path: '/draw',
    name: 'Draw',
    component: () => import(/* webpackChunkName: 'draw' */ '@/views/draw/Draw.vue'),
  },
  {
    path: '/cw_draw',
    name: 'CwDraw',
    component: () => import(/* webpackChunkName: 'draw' */ '@/views/draw/CwDraw.vue'),
  },
  {
    path: '/home',
    name: 'Home',
    redirect: '/welcome',
    component: () => import(/* webpackChunkName: 'base' */ '@/views/Index.vue'),
    children: [
      {
        path: '/welcome',
        name: 'Welcome',
        component: () => import(/* webpackChunkName: 'base' */ '@/views/welcome/Index.vue'),
      },
      {
        path: '/design',
        name: 'Design',
        component: () => import(/* webpackChunkName: 'base' */ '@/views/design/Index.vue'),
      },
      {
        path: '/edit',
        name: 'Edit',
        component: () => import(/* webpackChunkName: 'base' */ '@/views/edit/Index.vue'),
      },
      {
        path: '/psd',
        name: 'Psd',
        component: () => import(/* webpackChunkName: 'psd' */ '@/views/psd/Psd.vue'),
      }
    ]
  },
]
