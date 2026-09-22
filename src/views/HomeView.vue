<template>
  <div>
    <header class="hero" id="top">
      <div class="hero-bg">
        <div class="hero-bg-slot">
          <div class="hero-grain" />
        </div>
      </div>
      <div class="visor hero-in">
        <span class="hero-tag"><i />一期已上线 · 持续迭代中</span>
        <h1>
          把自研的小工具，
          <br />
          收进<em>一个安静的地方</em>。
        </h1>
        <p class="lede">{{ homeIntro }}</p>
        <div class="hero-cta">
          <a class="btn btn-primary" href="#tools">
            浏览全部工具
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <RouterLink class="btn btn-ghost" to="/about">关于我</RouterLink>
        </div>
        <div class="hero-stats">
          <div class="hstat">
            <b>{{ toolTotal }}</b>
            <span>在线工具</span>
          </div>
          <div class="hstat">
            <b>{{ categories.length || '—' }}</b>
            <span>工具分类</span>
          </div>
          <div class="hstat">
            <b>200<span style="font-size: 14px">MB</span></b>
            <span>单文件上限</span>
          </div>
        </div>
      </div>
    </header>

    <section class="sec" id="tools">
      <div class="visor">
        <div class="sec-head">
          <div>
            <span class="eyebrow">Toolbox</span>
            <h2>全部工具</h2>
            <p class="sub">按分类筛选或搜索关键词。点击任意卡片进入专题页，查看教程与下载。</p>
          </div>
        </div>

        <div class="toolbar">
          <label class="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              v-model="keyword"
              type="search"
              placeholder="搜索工具名称或简介…"
              maxlength="50"
              aria-label="搜索工具"
              @input="onKeywordInput"
            />
          </label>
        </div>

        <div class="chips">
          <button type="button" class="chip" :class="{ on: categoryId == null }" @click="selectCategory(null)">
            全部
            <span class="n">{{ toolTotal }}</span>
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            class="chip"
            :class="{ on: categoryId === cat.id }"
            @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
          </button>
        </div>

        <p v-if="loading" class="state-line">加载中…</p>
        <p v-else-if="error" class="state-line is-error">{{ error }}</p>
        <div v-else-if="tools.length === 0" class="empty">暂无上架工具</div>
        <div v-else class="grid">
          <ToolCard v-for="tool in tools" :key="tool.id" :tool="tool" />
        </div>
      </div>
    </section>
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
const homeIntro = ref(
  '移动端 APP、Python 脚本、桌面小工具 —— 每个工具都有独立的专题页：说明、教程、更新日志、文件下载与留言反馈，都在同一处。',
)
const toolTotal = ref(0)
let debounceTimer = 0

onMounted(() => {
  loadSite()
  loadTools()
})

async function loadSite() {
  try {
    const data = await getSiteInfo()
    if (data?.site_title) {
      document.title = data.site_title
    }
    if (data?.home_intro) {
      homeIntro.value = data.home_intro
    }
  } catch {
    // 使用原型默认文案
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
    const total = data?.pagination?.total
    const unfiltered = categoryId.value == null && !keyword.value.trim()
    if (unfiltered) {
      toolTotal.value = total != null ? total : tools.value.length
      syncCategories(tools.value)
    }
  } catch (err) {
    tools.value = []
    error.value = err instanceof ApiError ? err.message : '加载失败，请确认后端已启动'
  } finally {
    loading.value = false
  }
}

function syncCategories(list) {
  const map = new Map(categories.value.map((c) => [c.id, c]))
  list.forEach((item) => {
    const cat = item.category
    if (cat?.id != null) {
      map.set(cat.id, { id: cat.id, name: cat.name })
    }
  })
  categories.value = Array.from(map.values())
}
</script>
