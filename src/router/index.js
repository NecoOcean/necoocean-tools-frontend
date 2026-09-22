import { createRouter, createWebHistory } from 'vue-router'

const HomeView = () => import('../views/HomeView.vue')
const ToolDetailView = () => import('../views/ToolDetailView.vue')
const AboutView = () => import('../views/AboutView.vue')
const PrivacyView = () => import('../views/PrivacyView.vue')
const LoginView = () => import('../views/admin/LoginView.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/tool/:slug', name: 'tool', component: ToolDetailView, props: true },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/privacy', name: 'privacy', component: PrivacyView },
    { path: '/admin/login', name: 'admin-login', component: LoginView },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
