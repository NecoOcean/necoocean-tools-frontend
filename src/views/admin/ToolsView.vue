<template>
  <div>
    <div class="head">
      <h1 class="page-title">工具管理</h1>
      <RouterLink class="chip is-active" to="/admin/tools/new">新建工具</RouterLink>
    </div>
    <p v-if="loading" class="state-line">加载中…</p>
    <p v-else-if="error" class="state-line is-error">{{ error }}</p>
    <template v-else>
      <p class="state-line">共 {{ total }} 个工具（含下架）</p>
      <table class="table">
        <thead>
          <tr>
            <th>名称</th>
            <th>标识</th>
            <th>分类</th>
            <th>状态</th>
            <th>版本</th>
            <th>更新</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tools" :key="row.id">
            <td>{{ row.name }}</td>
            <td><code>{{ row.slug }}</code></td>
            <td>{{ row.category?.name || '—' }}</td>
            <td>{{ statusText(row.status) }}</td>
            <td>{{ row.latest_version || '—' }}</td>
            <td>{{ formatDateTime(row.updated_at) }}</td>
            <td><RouterLink :to="`/admin/tools/${row.id}`">编辑</RouterLink></td>
          </tr>
        </tbody>
      </table>
      <p v-if="tools.length === 0" class="state-line">暂无工具</p>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ApiError } from '../../api/http'
import { listAdminTools } from '../../api/adminApi'
import { formatDateTime } from '../../utils/format'

const tools = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref('')

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await listAdminTools({ page: 1, page_size: 50 })
    tools.value = data?.list || []
    total.value = data?.pagination?.total ?? tools.value.length
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function statusText(status) {
  if (status === 1) return '上架'
  if (status === 0) return '下架'
  return String(status ?? '—')
}
</script>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  margin-bottom: var(--sp-4);
}

.page-title {
  font-size: clamp(26px, 3.4vw, 38px);
  font-weight: 600;
}

.table {
  width: 100%;
  margin-top: var(--sp-4);
  border-collapse: collapse;
  font-size: 14px;
}

.table th,
.table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--line-1);
  text-align: left;
  vertical-align: top;
}

.table th {
  color: var(--tx-3);
  font-weight: 400;
}

.table a {
  color: var(--brand);
}

code {
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--tx-2);
}
</style>
