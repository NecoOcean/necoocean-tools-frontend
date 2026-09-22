import { createRouter, createWebHistory } from 'vue-router'
import { me } from '../api/adminApi'

const HomeView = () => import('../views/HomeView.vue')
const ToolDetailView = () => import('../views/ToolDetailView.vue')
const AboutView = () => import('../views/AboutView.vue')
const PrivacyView = () => import('../views/PrivacyView.vue')
const LoginView = () => import('../views/admin/LoginView.vue')
const AdminLayout = () => import('../views/admin/AdminLayout.vue')
const ToolsView = () => import('../views/admin/ToolsView.vue')
const ToolEditView = () => import('../views/admin/ToolEditView.vue')
const MessagesView = () => import('../views/admin/MessagesView.vue')
const MessageDetailView = () => import('../views/admin/MessageDetailView.vue')
const CategoriesView = () => import('../views/admin/CategoriesView.vue')
const SettingsView = () => import('../views/admin/SettingsView.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/tool/:slug', name: 'tool', component: ToolDetailView, props: true },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/privacy', name: 'privacy', component: PrivacyView },
    { path: '/admin/login', name: 'admin-login', component: LoginView, meta: { publicAdmin: true } },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/admin/tools' },
        { path: 'tools', name: 'admin-tools', component: ToolsView },
        { path: 'tools/new', name: 'admin-tool-new', component: ToolEditView },
        { path: 'tools/:id', name: 'admin-tool-edit', component: ToolEditView },
        { path: 'messages', name: 'admin-messages', component: MessagesView },
        { path: 'messages/:id', name: 'admin-message-detail', component: MessageDetailView },
        { path: 'categories', name: 'admin-categories', component: CategoriesView },
        { path: 'settings', name: 'admin-settings', component: SettingsView },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  if (!to.matched.some((r) => r.meta.requiresAuth)) {
    return true
  }
  try {
    await me()
    return true
  } catch {
    return {
      name: 'admin-login',
      query: { redirect: to.fullPath },
    }
  }
})

export default router
