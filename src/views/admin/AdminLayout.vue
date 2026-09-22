<template>
  <div class="admin-root">
    <header class="admin-top">
      <RouterLink class="admin-brand" to="/admin">
        <span class="admin-brand__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round">
            <path d="M3 15c3.5 0 3.5-3 7-3s3.5 3 7 3 4-3 4-3" />
            <path d="M3 9.5c3.5 0 3.5-3 7-3s3.5 3 7 3 4-3 4-3" opacity=".55" />
          </svg>
        </span>
        NecoOcean Admin
      </RouterLink>

      <div class="admin-top__right">
        <label class="admin-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input v-model="keyword" type="search" placeholder="搜索工具…" @keydown.enter.prevent="goSearch" />
        </label>
        <button class="admin-icon-btn" type="button" title="通知" aria-label="通知">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9" />
            <path d="M10 18a2 2 0 0 0 4 0" />
          </svg>
          <i v-if="pendingHint" class="dot" />
        </button>
        <button class="admin-avatar" type="button" title="退出登录" @click="onLogout">管</button>
      </div>
    </header>

    <div class="admin-body">
      <aside class="admin-side">
        <nav class="admin-nav">
          <RouterLink to="/admin" :class="{ 'is-active': route.name === 'admin-dashboard' }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
            </svg>
            <span class="label">首页</span>
          </RouterLink>
          <RouterLink to="/admin/tools" :class="{ 'is-active': isTools }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="7" height="7" rx="1.5" />
              <rect x="13" y="4" width="7" height="7" rx="1.5" />
              <rect x="4" y="13" width="7" height="7" rx="1.5" />
              <rect x="13" y="13" width="7" height="7" rx="1.5" />
            </svg>
            <span class="label">工具管理</span>
          </RouterLink>
          <RouterLink to="/admin/categories" :class="{ 'is-active': route.name === 'admin-categories' }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
            <span class="label">分类管理</span>
          </RouterLink>
          <RouterLink to="/admin/messages" :class="{ 'is-active': route.path.startsWith('/admin/messages') }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
            </svg>
            <span class="label">用户反馈</span>
          </RouterLink>
          <RouterLink to="/admin/settings" :class="{ 'is-active': route.name === 'admin-settings' }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
            </svg>
            <span class="label">系统设置</span>
          </RouterLink>
        </nav>
        <div class="admin-nav admin-nav__foot">
          <RouterLink to="/">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 4h5v5M14 10l6-6M9 20H4v-5M10 14l-6 6" />
            </svg>
            <span class="label">返回前台</span>
          </RouterLink>
          <button class="nav-item" type="button" @click="onLogout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 7V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-2" />
              <path d="M15 12H4m0 0 3-3M4 12l3 3" />
            </svg>
            <span class="label">退出</span>
          </button>
        </div>
      </aside>

      <main class="admin-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ensureCsrf, listAdminMessages, logout } from '../../api/adminApi'
import '../../styles/admin.css'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const pendingHint = ref(false)

const isTools = computed(() => route.path.startsWith('/admin/tools'))

onMounted(async () => {
  try {
    const data = await listAdminMessages({ page: 1, page_size: 1 })
    pendingHint.value = (data?.pagination?.total ?? data?.list?.length ?? 0) > 0
  } catch {
    pendingHint.value = false
  }
})

function goSearch() {
  const q = keyword.value.trim()
  router.push({ name: 'admin-tools', query: q ? { q } : {} })
}

async function onLogout() {
  try {
    await ensureCsrf()
    await logout()
  } catch {
    // ignore
  }
  router.push('/admin/login')
}
</script>
