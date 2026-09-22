<template>
  <div class="tools-page">
    <div class="tools-layout">
      <div class="tools-main">
        <header class="tools-head">
          <div>
            <h1 class="admin-page-title">工具管理</h1>
            <p class="admin-page-sub">统一管理自研工具的文档、版本、权限与发布状态</p>
          </div>
        </header>

        <div class="stat-grid">
          <article class="stat-card">
            <div class="stat-card__top">
              <span>在线工具</span>
              <i>+</i>
            </div>
            <b>{{ stats.online }}</b>
          </article>
          <article class="stat-card">
            <div class="stat-card__top">
              <span>本月更新</span>
              <i>+</i>
            </div>
            <b>{{ stats.monthUpdated }}</b>
          </article>
          <article class="stat-card">
            <div class="stat-card__top">
              <span>工具总数</span>
              <i>+</i>
            </div>
            <b>{{ stats.total }}</b>
          </article>
          <article class="stat-card">
            <div class="stat-card__top">
              <span>下架工具</span>
              <i>+</i>
            </div>
            <b>{{ stats.offline }}</b>
          </article>
        </div>

        <div class="toolbar">
          <select v-model="statusFilter" class="admin-select filter" @change="load">
            <option value="">工具筛选 · 全部</option>
            <option value="1">仅上架</option>
            <option value="0">仅下架</option>
          </select>
          <RouterLink class="admin-btn" to="/admin/tools/new">新建工具</RouterLink>
        </div>

        <p v-if="loading" class="admin-state">加载中…</p>
        <p v-else-if="error" class="admin-state is-error">{{ error }}</p>
        <template v-else>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th style="width: 42px"><span class="check-ph" /></th>
                  <th>工具名称</th>
                  <th>类型</th>
                  <th>版本</th>
                  <th>最近更新</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tools" :key="row.id">
                  <td><span class="check-ph" /></td>
                  <td>
                    <div class="name-cell">
                      <strong>{{ row.name }}</strong>
                      <span class="admin-muted">{{ row.slug }}</span>
                    </div>
                  </td>
                  <td>{{ row.category?.name || '—' }}</td>
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

      <aside class="overview">
        <div class="overview-card">
          <h2>发布概览</h2>
          <div class="ring" :style="{ '--p': publishRatio }">
            <div class="ring__inner">
              <span class="ring__label">发布完成</span>
              <strong>{{ publishRatio }}%</strong>
            </div>
          </div>
          <div class="tags">
            <span class="tag">上架 {{ stats.online }}</span>
            <span class="tag tag--accent">{{ publishRatio }}%</span>
            <span class="tag tag--accent">已发布</span>
            <span class="tag">下架 {{ stats.offline }}</span>
            <span class="tag">本月更新 {{ stats.monthUpdated }}</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ApiError } from '../../api/http'
import { listAdminTools } from '../../api/adminApi'
import { formatDateTime } from '../../utils/format'

const route = useRoute()
const tools = ref([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('')
const stats = reactive({
  total: 0,
  online: 0,
  offline: 0,
  monthUpdated: 0,
})

const publishRatio = computed(() => {
  if (!stats.total) return 0
  return Math.round((stats.online / stats.total) * 100)
})

onMounted(load)
watch(
  () => route.query.q,
  () => load(),
)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const q = typeof route.query.q === 'string' ? route.query.q.trim() : ''
    const data = await listAdminTools({
      page: 1,
      page_size: 50,
      status: statusFilter.value === '' ? undefined : Number(statusFilter.value),
      keyword: q || undefined,
    })
    tools.value = data?.list || []
    computeStats(tools.value, data?.pagination?.total)
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function computeStats(list, totalHint) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  let online = 0
  let offline = 0
  let monthUpdated = 0
  list.forEach((row) => {
    if (row.status === 1) online += 1
    else offline += 1
    if (row.updated_at) {
      const d = new Date(row.updated_at)
      if (d.getFullYear() === y && d.getMonth() === m) monthUpdated += 1
    }
  })
  // 无筛选时用分页总数；有筛选时以当前列表为准
  const unfiltered = !statusFilter.value && !(typeof route.query.q === 'string' && route.query.q.trim())
  stats.total = unfiltered && totalHint != null ? totalHint : list.length
  stats.online = online
  stats.offline = offline
  stats.monthUpdated = monthUpdated
}
</script>

<style scoped>
.tools-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 22px;
  align-items: start;
}

.tools-head {
  margin-bottom: 22px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  min-height: 108px;
  padding: 16px 16px 18px;
  border-radius: 16px;
  background: var(--ad-grad);
  color: #fff;
  box-shadow: 0 10px 28px rgba(74, 87, 216, 0.28);
}

.stat-card::after {
  content: "";
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: -42%;
  height: 90%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.stat-card__top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  opacity: 0.92;
}

.stat-card__top i {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.18);
  font-style: normal;
  font-size: 14px;
  line-height: 1;
}

.stat-card b {
  position: relative;
  z-index: 1;
  display: block;
  margin-top: 18px;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.filter {
  width: auto;
  min-width: 168px;
  background-color: #6f7ff5;
  border-color: transparent;
  color: #fff;
  font-weight: 500;
}

.name-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name-cell strong {
  font-weight: 600;
}

.check-ph {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid var(--ad-line-2);
  vertical-align: middle;
}

.overview-card {
  padding: 22px 18px 20px;
  border-radius: 18px;
  background: var(--ad-panel);
  border: 1px solid var(--ad-line);
}

.overview-card h2 {
  margin: 0 0 18px;
  font-size: 16px;
  font-weight: 600;
}

.ring {
  --p: 0;
  width: 168px;
  height: 168px;
  margin: 8px auto 20px;
  border-radius: 50%;
  background: conic-gradient(var(--ad-accent) calc(var(--p) * 1%), rgba(255, 255, 255, 0.08) 0);
  display: grid;
  place-items: center;
}

.ring__inner {
  width: 118px;
  height: 118px;
  border-radius: 50%;
  background: var(--ad-panel);
  display: grid;
  place-content: center;
  text-align: center;
  gap: 4px;
}

.ring__label {
  font-size: 12px;
  color: var(--ad-tx-3);
}

.ring__inner strong {
  font-size: 28px;
  letter-spacing: -0.03em;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--ad-tx-2);
  font-size: 12px;
}

.tag--accent {
  background: var(--ad-accent-soft);
  color: #c2caff;
}

@media (max-width: 1100px) {
  .tools-layout {
    grid-template-columns: 1fr;
  }

  .overview {
    order: -1;
  }

  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter {
    width: 100%;
  }
}
</style>
