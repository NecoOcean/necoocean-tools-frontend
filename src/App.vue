<template>
  <div class="app-shell">
    <div v-if="showOpening" id="opening" :class="{ 'is-fade': openingFade }" role="status" aria-label="页面加载中">
      <div>
        <div class="op-id">NECOOCEAN</div>
        <div class="op-bar"><i /></div>
      </div>
    </div>

    <div class="page-bg is-empty" aria-hidden="true"></div>
    <div class="page-bg-veil" aria-hidden="true"></div>

    <template v-if="!isAdminArea">
      <nav class="nav" :class="{ 'is-solid': navSolid }" id="nav">
        <div class="visor nav-in">
          <RouterLink class="brand" to="/">
            <span class="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round">
                <path d="M3 15c3.5 0 3.5-3 7-3s3.5 3 7 3 4-3 4-3" />
                <path d="M3 9.5c3.5 0 3.5-3 7-3s3.5 3 7 3 4-3 4-3" opacity=".55" />
              </svg>
            </span>
            NecoOcean
          </RouterLink>
          <div class="nav-links">
            <RouterLink to="/">首页</RouterLink>
            <a href="#tools" @click.prevent="goTools">全部工具</a>
            <RouterLink to="/about">关于我</RouterLink>
          </div>
          <div class="nav-right">
            <button class="icon-btn" type="button" title="切换主题" aria-label="切换主题" @click="toggleTheme">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            </button>
            <button
              class="icon-btn burger"
              type="button"
              title="菜单"
              aria-label="菜单"
              :aria-expanded="drawerOpen"
              @click="drawerOpen = !drawerOpen"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div class="drawer" :class="{ open: drawerOpen }" :aria-hidden="!drawerOpen">
        <RouterLink to="/" @click="drawerOpen = false">首页</RouterLink>
        <a href="#tools" @click.prevent="goTools">全部工具</a>
        <RouterLink to="/about" @click="drawerOpen = false">关于我</RouterLink>
        <RouterLink to="/privacy" @click="drawerOpen = false">隐私</RouterLink>
      </div>
    </template>

    <main :class="{ 'main--flush': isAdminArea || isHome }">
      <RouterView />
    </main>

    <footer v-if="!isAdminArea" class="site-footer">
      <div class="visor foot-in">
        <p>
          <span v-if="copyright">{{ copyright }}</span>
          <span v-if="icp">{{ copyright ? ' · ' : '' }}{{ icp }}</span>
          <span v-if="!copyright && !icp">© NecoOcean</span>
        </p>
        <div class="foot-links">
          <RouterLink to="/about">关于我</RouterLink>
          <RouterLink to="/privacy">隐私</RouterLink>
          <RouterLink to="/admin/login">管理</RouterLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSiteInfo } from './api/publicApi'

const route = useRoute()
const router = useRouter()
const isAdminArea = computed(() => route.path.startsWith('/admin') && route.name !== 'admin-login')
const isHome = computed(() => route.name === 'home')

const copyright = ref('')
const icp = ref('')
const navSolid = ref(false)
const drawerOpen = ref(false)
const showOpening = ref(true)
const openingFade = ref(false)

function onScroll() {
  navSolid.value = window.scrollY > 24
}

function toggleTheme() {
  const root = document.documentElement
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light'
  root.setAttribute('data-theme', next)
  localStorage.setItem('neco-theme', next)
}

function goTools() {
  drawerOpen.value = false
  if (route.name === 'home') {
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })
    return
  }
  router.push({ name: 'home', hash: '#tools' })
}

onMounted(async () => {
  const saved = localStorage.getItem('neco-theme')
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.setAttribute('data-theme', saved)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    showOpening.value = false
  } else {
    window.setTimeout(() => {
      openingFade.value = true
      window.setTimeout(() => {
        showOpening.value = false
      }, 480)
    }, 1100)
  }

  try {
    const data = await getSiteInfo()
    copyright.value = data?.copyright || ''
    icp.value = data?.icp_number || ''
    if (data?.site_title) {
      document.title = data.site_title
    }
  } catch {
    // ignore
  }

  if (route.hash === '#tools') {
    window.setTimeout(() => {
      document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>
