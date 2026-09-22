<template>
  <div class="visor">
    <section class="hero">
      <h1>{{ siteTitle }}</h1>
      <p>{{ homeIntro }}</p>
    </section>

    <div class="toolbar">
      <input
        v-model="keyword"
        class="search"
        type="search"
        placeholder="搜索名称或简介"
        maxlength="50"
        @input="onKeywordInput"
      />
      <button
        type="button"
        class="chip"
        :class="{ 'is-active': categoryId == null }"
        @click="selectCategory(null)"
      >
        全部
      </button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        class="chip"
        :class="{ 'is-active': categoryId === cat.id }"
        @click="selectCategory(cat.id)"
      >
        {{ cat.name }}
      </button>
    </div>

    <p v-if="loading" class="state-line">加载中…</p>
    <p v-else-if="error" class="state-line is-error">{{ error }}</p>
    <p v-else-if="tools.length === 0" class="state-line">暂无上架工具</p>
    <div v-else class="tool-grid">
      <ToolCard v-for="tool in tools" :key="tool.id" :tool="tool" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import ToolCard from '../components/ToolCard.vue'
import { ApiError } from '../api/http'
import { getSiteInfo, listTools } from '../api/publicApi'

const tools = ref([])
const categories = ref([])
const categoryId = ref(null)
const keyword = ref('')
const loading = ref(true)
const error = ref('')
const siteTitle = ref('工具集')
const homeIntro = ref('个人自用工具的展示与下载入口。一期纯色底（D-7），封面与安装包走 COS。')
let debounceTimer = 0

onMounted(() => {
  loadSite()
  loadTools()
})

async function loadSite() {
  try {
    const data = await getSiteInfo()
    if (data?.site_title) {
      siteTitle.value = data.site_title
      document.title = data.site_title
    }
    if (data?.home_intro) {
      homeIntro.value = data.home_intro
    }
  } catch {
    // 首页仍可用默认文案
  }
}

function selectCategory(id) {
  categoryId.value = id
  loadTools()
}

function onKeywordInput() {
  window.clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    loadTools()
  }, 280)
}

async function loadTools() {
  loading.value = true
  error.value = ''
  try {
    const data = await listTools({
      category_id: categoryId.value ?? undefined,
      keyword: keyword.value.trim() || undefined,
      page: 1,
      page_size: 50,
    })
    tools.value = data?.list || []
    syncCategories(tools.value)
  } catch (err) {
    tools.value = []
    error.value = err instanceof ApiError ? err.message : '加载失败，请确认后端已启动'
  } finally {
    loading.value = false
  }
}

function syncCategories(list) {
  const map = new Map()
  list.forEach((item) => {
    const cat = item.category
    if (cat?.id != null) {
      map.set(cat.id, { id: cat.id, name: cat.name })
    }
  })
  // 筛选后列表可能不全；保留已见过的分类，避免芯片消失。
  const merged = new Map(categories.value.map((c) => [c.id, c]))
  map.forEach((v, k) => merged.set(k, v))
  categories.value = Array.from(merged.values())
}
</script>
