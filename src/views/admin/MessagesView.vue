<template>
  <div>
    <header class="head">
      <div>
        <h1 class="admin-page-title">用户反馈</h1>
        <p class="admin-page-sub">查看与处理前台留言，支持回复、置顶与状态流转</p>
      </div>
    </header>

    <p v-if="loading" class="admin-state">加载中…</p>
    <p v-else-if="error" class="admin-state is-error">{{ error }}</p>
    <template v-else>
      <p class="admin-muted count">共 {{ total }} 条</p>
      <div class="list">
        <article v-for="row in messages" :key="row.id" class="msg-card">
          <header>
            <strong>{{ row.nickname || '匿名' }}</strong>
            <span class="admin-badge">{{ row.category_text || row.category }}</span>
            <span v-if="row.keyword_flagged" class="admin-badge admin-badge--off">关键词</span>
            <span v-if="row.pinned" class="admin-badge admin-badge--on">置顶</span>
            <span class="time">{{ formatDateTime(row.created_at) }}</span>
          </header>
          <p class="body">{{ row.content }}</p>
          <p class="meta">
            {{ row.tool?.name || '工具' }}
            · {{ row.status_text || row.status }}
            · {{ row.audit_status_text || row.audit_status }}
            <template v-if="row.has_email"> · 含邮箱</template>
            · <RouterLink class="admin-link" :to="`/admin/messages/${row.id}`">详情 / 回复</RouterLink>
          </p>
        </article>
      </div>
      <p v-if="messages.length === 0" class="admin-state">暂无留言</p>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ApiError } from '../../api/http'
import { listAdminMessages } from '../../api/adminApi'
import { formatDateTime } from '../../utils/format'

const messages = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref('')

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await listAdminMessages({ page: 1, page_size: 50 })
    messages.value = data?.list || []
    total.value = data?.pagination?.total ?? messages.value.length
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.head {
  margin-bottom: 22px;
}

.count {
  margin-bottom: 12px;
}

.list {
  display: grid;
  gap: 12px;
}

.msg-card {
  padding: 16px 18px;
  border-radius: var(--ad-radius);
  background: var(--ad-panel);
  border: 1px solid var(--ad-line);
}

.msg-card header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  margin-bottom: 8px;
}

.msg-card strong {
  font-size: 15px;
}

.time {
  margin-left: auto;
  color: var(--ad-tx-3);
  font-size: 12px;
}

.body {
  margin: 0;
  color: var(--ad-tx);
  line-height: 1.65;
  font-size: 14px;
}

.meta {
  margin: 10px 0 0;
  color: var(--ad-tx-3);
  font-size: 13px;
}
</style>
