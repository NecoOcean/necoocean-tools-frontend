<template>
  <div>
    <h1 class="page-title">留言管理</h1>
    <p v-if="loading" class="state-line">加载中…</p>
    <p v-else-if="error" class="state-line is-error">{{ error }}</p>
    <template v-else>
      <p class="state-line">共 {{ total }} 条</p>
      <article v-for="row in messages" :key="row.id" class="row">
        <header>
          <strong>{{ row.nickname || '匿名' }}</strong>
          <span>{{ row.category_text || row.category }}</span>
          <span v-if="row.keyword_flagged" class="flag">关键词</span>
          <span v-if="row.pinned" class="flag">置顶</span>
          <span class="time">{{ formatDateTime(row.created_at) }}</span>
        </header>
        <p>{{ row.content }}</p>
        <p class="meta">
          {{ row.tool?.name || '工具' }}
          · {{ row.status_text || row.status }}
          · {{ row.audit_status_text || row.audit_status }}
          <template v-if="row.has_email"> · 含邮箱</template>
          · <RouterLink :to="`/admin/messages/${row.id}`">详情 / 回复</RouterLink>
        </p>
      </article>
      <p v-if="messages.length === 0" class="state-line">暂无留言</p>
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
.page-title {
  margin-bottom: var(--sp-4);
  font-size: clamp(26px, 3.4vw, 38px);
  font-weight: 600;
}

.row {
  margin-top: var(--sp-4);
  padding: var(--sp-4);
  border: 1px solid var(--line-1);
  border-radius: var(--r-md);
  background: var(--bg-1);
}

.row header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2) var(--sp-3);
  margin-bottom: var(--sp-2);
  color: var(--tx-3);
  font-size: 13px;
}

.row header strong {
  color: var(--tx-1);
}

.flag {
  color: var(--warn);
}

.time {
  margin-left: auto;
}

.row p {
  color: var(--tx-2);
  white-space: pre-wrap;
}

.meta {
  margin-top: var(--sp-2);
  color: var(--tx-3);
  font-size: 12px;
}

.meta a {
  color: var(--brand);
}
</style>
