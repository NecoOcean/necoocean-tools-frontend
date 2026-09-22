<template>
  <div>
    <header class="tools-head">
      <div>
        <h1 class="admin-page-title">工具管理</h1>
        <p class="admin-page-sub">管理工具文档、版本、分类归属与上架状态</p>
      </div>
      <RouterLink class="admin-btn" to="/admin/tools/new">新建工具</RouterLink>
    </header>

    <div class="toolbar">
      <input
        v-model="keyword"
        class="admin-input search"
        type="search"
        placeholder="搜索名称或 slug…"
        maxlength="50"
        @input="onKeywordInput"
      />
      <select v-model="statusFilter" class="admin-select filter" @change="load">
        <option value="">状态 · 全部</option>
        <option value="1">仅上架</option>
        <option value="0">仅下架</option>
      </select>
    </div>

    <p v-if="loading" class="admin-state">加载中…</p>
    <p v-else-if="error" class="admin-state is-error">{{ error }}</p>
    <template v-else>
      <p class="admin-muted count">共 {{ total }} 个工具</p>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>工具名称</th>
              <th>分类</th>
              <th>状态</th>
              <th>版本</th>
              <th>最近更新</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tools" :key="row.id">
              <td>
                <div class="name-cell">
                  <strong>{{ row.name }}</strong>
                  <span class="admin-muted">{{ row.slug }}</span>
                </div>
              </td>
              <td>{{ row.category?.name || '—' }}</td>
              <td>
                <span class="admin-badge" :class="row.status === 1 ? 'admin-badge--on' : 'admin-badge--off'">
                  {{ row.status === 1 ? '上架' : '下架' }}
                </span>
              </td>
              <td>{{ row.latest_version || '—' }}</td>
              <td>{{ formatDateTime(row.updated_at) }}</td>
              <td>
                <RouterLink class="admin-link" :to="`/admin/tools/${row.id}`">管理</RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="tools.length === 0" class="admin-state">暂无工具</p>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '../../api/http'
import { listAdminTools } from '../../api/adminApi'
import { formatDateTime } from '../../utils/format'

const route = useRoute()
const router = useRouter()
const tools = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref('')
const statusFilter = ref('')
const keyword = ref(typeof route.query.q === 'string' ? route.query.q : '')
let debounceTimer = 0

onMounted(load)
watch(
  () => route.query.q,
  (q) => {
    keyword.value = typeof q === 'string' ? q : ''
    load()
  },
)

function onKeywordInput() {
  window.clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    const q = keyword.value.trim()
    router.replace({ name: 'admin-tools', query: q ? { q } : {} })
  }, 280)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const q = typeof route.query.q === 'string' ? route.query.q.trim() : keyword.value.trim()
    const data = await listAdminTools({
      page: 1,
      page_size: 50,
      status: statusFilter.value === '' ? undefined : Number(statusFilter.value),
      keyword: q || undefined,
    })
    tools.value = data?.list || []
    total.value = data?.pagination?.total ?? tools.value.length
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.tools-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.search {
  flex: 1;
  min-width: 200px;
  max-width: 360px;
}

.filter {
  width: auto;
  min-width: 140px;
}

.count {
  margin-bottom: 10px;
}

.name-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name-cell strong {
  font-weight: 600;
}
</style>
