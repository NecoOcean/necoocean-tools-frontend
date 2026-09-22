<template>
  <div class="dash">
    <header class="dash-head">
      <div>
        <h1 class="admin-page-title">首页</h1>
        <p class="admin-page-sub">总览站点运营状态，快速进入常用管理操作</p>
      </div>
      <div class="dash-actions">
        <RouterLink class="admin-btn admin-btn--ghost" to="/admin/tools">进入工具管理</RouterLink>
        <RouterLink class="admin-btn" to="/admin/tools/new">新建工具</RouterLink>
      </div>
    </header>

    <p v-if="loading" class="admin-state">加载中…</p>
    <p v-else-if="error" class="admin-state is-error">{{ error }}</p>

    <template v-else>
      <div class="dash-layout">
        <div class="dash-main">
          <div class="stat-grid">
            <article class="stat-card">
              <div class="stat-card__top"><span>在线工具</span><i>+</i></div>
              <b>{{ stats.online }}</b>
            </article>
            <article class="stat-card">
              <div class="stat-card__top"><span>本月更新</span><i>+</i></div>
              <b>{{ stats.monthUpdated }}</b>
            </article>
            <article class="stat-card">
              <div class="stat-card__top"><span>待处理留言</span><i>+</i></div>
              <b>{{ stats.openMessages }}</b>
            </article>
            <article class="stat-card">
              <div class="stat-card__top"><span>分类数量</span><i>+</i></div>
              <b>{{ stats.categories }}</b>
            </article>
          </div>

          <section class="panel">
            <div class="panel-head">
              <h2>快捷入口</h2>
            </div>
            <div class="shortcuts">
              <RouterLink class="shortcut" to="/admin/tools">
                <strong>工具管理</strong>
                <span>上架、下架、编辑文档与版本</span>
              </RouterLink>
              <RouterLink class="shortcut" to="/admin/categories">
                <strong>分类管理</strong>
                <span>维护前台筛选分类与排序</span>
              </RouterLink>
              <RouterLink class="shortcut" to="/admin/messages">
                <strong>用户反馈</strong>
                <span>回复留言、置顶与状态处理</span>
              </RouterLink>
              <RouterLink class="shortcut" to="/admin/settings">
                <strong>系统设置</strong>
                <span>站点文案、导出与口令</span>
              </RouterLink>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h2>最近更新的工具</h2>
              <RouterLink class="admin-link" to="/admin/tools">全部</RouterLink>
            </div>
            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>工具名称</th>
                    <th>状态</th>
                    <th>版本</th>
                    <th>最近更新</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in recentTools" :key="row.id">
                    <td>
                      <div class="name-cell">
                        <strong>{{ row.name }}</strong>
                        <span class="admin-muted">{{ row.slug }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="admin-badge" :class="row.status === 1 ? 'admin-badge--on' : 'admin-badge--off'">
                        {{ row.status === 1 ? '上架' : '下架' }}
                      </span>
                    </td>
                    <td>{{ row.latest_version || '—' }}</td>
                    <td>{{ formatDateTime(row.updated_at) }}</td>
                    <td><RouterLink class="admin-link" :to="`/admin/tools/${row.id}`">管理</RouterLink></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-if="recentTools.length === 0" class="admin-state">暂无工具</p>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h2>最新留言</h2>
              <RouterLink class="admin-link" to="/admin/messages">全部</RouterLink>
            </div>
            <div class="msg-list">
              <article v-for="row in recentMessages" :key="row.id" class="msg-item">
                <header>
                  <strong>{{ row.nickname || '匿名' }}</strong>
                  <span class="admin-muted">{{ row.tool?.name || '工具' }}</span>
                  <span class="time">{{ formatDateTime(row.created_at) }}</span>
                </header>
                <p>{{ row.content }}</p>
                <RouterLink class="admin-link" :to="`/admin/messages/${row.id}`">查看详情</RouterLink>
              </article>
            </div>
            <p v-if="recentMessages.length === 0" class="admin-state">暂无留言</p>
          </section>
        </div>

        <aside class="dash-side">
          <div class="overview-card">
            <h2>发布概览</h2>
            <div class="ring" :style="{ '--p': publishRatio }">
              <div class="ring__inner">
                <span class="ring__label">上架占比</span>
                <strong>{{ publishRatio }}%</strong>
              </div>
            </div>
            <div class="tags">
              <span class="tag">总数 {{ stats.total }}</span>
              <span class="tag tag--accent">上架 {{ stats.online }}</span>
              <span class="tag">下架 {{ stats.offline }}</span>
              <span class="tag">留言 {{ stats.messageTotal }}</span>
            </div>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ApiError } from '../../api/http'
import { listAdminCategories, listAdminMessages, listAdminTools } from '../../api/adminApi'
import { formatDateTime } from '../../utils/format'

const loading = ref(true)
const error = ref('')
const recentTools = ref([])
const recentMessages = ref([])
const stats = reactive({
  total: 0,
  online: 0,
  offline: 0,
  monthUpdated: 0,
  categories: 0,
  openMessages: 0,
  messageTotal: 0,
})

const publishRatio = computed(() => {
  if (!stats.total) return 0
  return Math.round((stats.online / stats.total) * 100)
})

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [toolsData, msgData, catData] = await Promise.all([
      listAdminTools({ page: 1, page_size: 50 }),
      listAdminMessages({ page: 1, page_size: 5 }),
      listAdminCategories(),
    ])
    const tools = toolsData?.list || []
    recentTools.value = tools.slice(0, 5)
    recentMessages.value = msgData?.list || []
    stats.categories = (catData?.list || []).length
    stats.messageTotal = msgData?.pagination?.total ?? recentMessages.value.length
    stats.openMessages = recentMessages.value.filter((m) => {
      const s = m.status
      return s === 'open' || s === 0 || s === 'pending' || m.status_text === '待处理'
    }).length
    if (stats.openMessages === 0 && stats.messageTotal > 0) {
      // 列表未带齐状态时，用留言总数作提示量
      stats.openMessages = Math.min(stats.messageTotal, recentMessages.value.length)
    }

    const now = new Date()
    let online = 0
    let offline = 0
    let monthUpdated = 0
    tools.forEach((row) => {
      if (row.status === 1) online += 1
      else offline += 1
      if (row.updated_at) {
        const d = new Date(row.updated_at)
        if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
          monthUpdated += 1
        }
      }
    })
    stats.total = toolsData?.pagination?.total ?? tools.length
    stats.online = online
    stats.offline = offline
    stats.monthUpdated = monthUpdated
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dash-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.dash-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.dash-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 22px;
  align-items: start;
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

.panel {
  margin-bottom: 18px;
  padding: 18px;
  border-radius: var(--ad-radius);
  background: var(--ad-panel);
  border: 1px solid var(--ad-line);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.panel-head h2 {
  margin: 0;
  font-size: 16px;
}

.shortcuts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.shortcut {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--ad-line);
  transition: border-color 0.2s, background 0.2s;
}

.shortcut:hover {
  border-color: rgba(124, 140, 253, 0.45);
  background: var(--ad-accent-soft);
}

.shortcut strong {
  font-size: 14px;
}

.shortcut span {
  font-size: 12px;
  color: var(--ad-tx-3);
  line-height: 1.5;
}

.name-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.msg-list {
  display: grid;
  gap: 12px;
}

.msg-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--ad-line);
}

.msg-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.msg-item header {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}

.msg-item .time {
  margin-left: auto;
  color: var(--ad-tx-3);
  font-size: 12px;
}

.msg-item p {
  margin: 0 0 8px;
  color: var(--ad-tx-2);
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.overview-card {
  padding: 22px 18px 20px;
  border-radius: 18px;
  background: var(--ad-panel);
  border: 1px solid var(--ad-line);
  position: sticky;
  top: calc(var(--ad-top) + 16px);
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
  .dash-layout {
    grid-template-columns: 1fr;
  }

  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .stat-grid,
  .shortcuts {
    grid-template-columns: 1fr;
  }
}
</style>
