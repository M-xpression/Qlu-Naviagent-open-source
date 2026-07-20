import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '校园介绍' }
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('@/views/MapView.vue'),
    meta: { title: '校园地图' }
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('@/views/ChatView.vue'),
    meta: { title: 'Mars学长' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/AdminHome.vue'),
    meta: { title: '管理后台', requiresAuth: true }
  },
  {
    path: '/admin/hotspots',
    name: 'adminHotspots',
    component: () => import('@/views/admin/HotspotManage.vue'),
    meta: { title: '热点管理', requiresAuth: true }
  },
  {
    path: '/admin/knowledge',
    name: 'adminKnowledge',
    component: () => import('@/views/admin/KnowledgeManage.vue'),
    meta: { title: '知识库管理', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 简单导航守卫：admin 路由检查 localStorage 标记
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const loggedIn = localStorage.getItem('qlu-admin-login') === '1'
    if (!loggedIn) {
      const ok = window.confirm('请先在后台登录（输入 admin/admin123），或点击确定继续')
      if (ok) {
        localStorage.setItem('qlu-admin-login', '1')
        next()
      } else {
        next('/')
      }
      return
    }
  }
  next()
})

export default router
