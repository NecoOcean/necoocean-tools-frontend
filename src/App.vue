<template>
  <div class="app-shell">
    <div class="page-bg is-empty" aria-hidden="true"></div>
    <div class="page-bg-veil" aria-hidden="true"></div>
    <header v-if="!isAdminArea" class="topbar">
      <div class="visor topbar__inner">
        <RouterLink class="brand" to="/">{{ brand }}</RouterLink>
        <nav class="topbar__nav" aria-label="主导航">
          <RouterLink to="/">工具</RouterLink>
          <RouterLink to="/about">关于</RouterLink>
          <RouterLink to="/privacy">隐私</RouterLink>
        </nav>
      </div>
    </header>
    <main class="main" :class="{ 'main--flush': isAdminArea }">
      <RouterView />
    </main>
    <footer v-if="!isAdminArea" class="site-footer">
      <div class="visor">
        <span v-if="copyright">{{ copyright }}</span>
        <span v-if="icp">{{ icp }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSiteInfo } from './api/publicApi'

const route = useRoute()
const isAdminArea = computed(() => route.path.startsWith('/admin') && route.name !== 'admin-login')

const brand = ref('NecoOcean')
const copyright = ref('')
const icp = ref('')

onMounted(async () => {
  try {
    const data = await getSiteInfo()
    if (data?.site_title) {
      brand.value = data.site_title
    }
    copyright.value = data?.copyright || ''
    icp.value = data?.icp_number || ''
  } catch {
    // 页脚可空
  }
})
</script>

<style scoped>
.main--flush {
  padding: 0;
}

.site-footer {
  border-top: 1px solid var(--line-1);
  padding: var(--sp-5) 0 var(--sp-7);
  color: var(--tx-3);
  font-size: 13px;
}

.site-footer .visor {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3) var(--sp-5);
}
</style>
