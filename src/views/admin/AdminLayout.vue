<template>
  <div class="admin-shell">
    <header class="admin-bar">
      <div class="visor admin-bar__inner">
        <RouterLink class="brand" to="/admin/tools">后台</RouterLink>
        <nav class="admin-bar__nav">
          <RouterLink to="/admin/tools">工具</RouterLink>
          <RouterLink to="/admin/messages">留言</RouterLink>
          <RouterLink to="/admin/categories">分类</RouterLink>
          <RouterLink to="/admin/settings">设置</RouterLink>
          <RouterLink to="/">前台</RouterLink>
          <button type="button" class="linkish" @click="onLogout">退出</button>
        </nav>
      </div>
    </header>
    <div class="visor admin-main">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ensureCsrf, logout } from '../../api/adminApi'

const router = useRouter()

async function onLogout() {
  try {
    await ensureCsrf()
    await logout()
  } catch {
    // 即使失败也回登录页
  }
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-bar {
  border-bottom: 1px solid var(--line-1);
  background: var(--bg-1);
}

.admin-bar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}

.admin-bar__nav {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  font-size: 14px;
}

.admin-bar__nav a {
  color: var(--tx-2);
}

.admin-bar__nav a.router-link-active {
  color: var(--tx-1);
}

.linkish {
  color: var(--tx-2);
}

.admin-main {
  padding: var(--sp-6) 0 var(--sp-8);
}
</style>
