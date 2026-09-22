<template>
  <div>
    <div class="head">
      <h1 class="page-title">留言详情</h1>
      <RouterLink class="chip" to="/admin/messages">返回列表</RouterLink>
    </div>
    <p v-if="loading" class="state-line">加载中…</p>
    <p v-else-if="error" class="state-line is-error">{{ error }}</p>
    <template v-else-if="msg">
      <article class="card">
        <header>
          <strong>{{ msg.nickname || '匿名' }}</strong>
          <span>{{ msg.category_text }}</span>
          <span v-if="msg.keyword_flagged" class="flag">关键词</span>
          <span class="time">{{ formatDateTime(msg.created_at) }}</span>
        </header>
        <p class="body">{{ msg.content }}</p>
        <p class="meta">
          {{ msg.tool?.name }} · {{ msg.status_text }} · {{ msg.audit_status_text }}
        </p>
        <p v-if="msg.contact_email" class="meta">邮箱：{{ msg.contact_email }}</p>
        <p v-if="msg.os_platform || msg.tool_version" class="meta">
          <span v-if="msg.os_platform">{{ msg.os_platform }}</span>
          <span v-if="msg.tool_version"> · {{ msg.tool_version }}</span>
        </p>
        <pre v-if="msg.repro_steps" class="repro">{{ msg.repro_steps }}</pre>
        <div class="actions" style="margin-top: 12px">
          <button type="button" class="chip" :disabled="busy" @click="togglePin">
            {{ msg.pinned ? '取消置顶' : '置顶' }}
          </button>
        </div>
      </article>

      <section class="section">
        <h2>处理状态</h2>
        <div class="actions">
          <button
            v-for="s in statusOptions"
            :key="s.value"
            type="button"
            class="chip"
            :class="{ 'is-active': msg.status === s.value }"
            :disabled="busy"
            @click="setStatus(s.value)"
          >
            {{ s.label }}
          </button>
        </div>
      </section>

      <section class="section">
        <h2>回复</h2>
        <div v-for="r in msg.replies || []" :key="r.id" class="reply">
          <header>{{ formatDateTime(r.created_at) }}</header>
          <p>{{ r.content }}</p>
        </div>
        <form class="form" @submit.prevent="onReply">
          <textarea v-model="reply" class="textarea" rows="3" placeholder="回复内容" required />
          <button class="chip is-active" type="submit" :disabled="busy">{{ busy ? '提交中…' : '发送回复' }}</button>
          <span v-if="hint" class="state-line" :class="{ 'is-error': isError }">{{ hint }}</span>
        </form>
      </section>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ApiError } from '../../api/http'
import { ensureCsrf, getAdminMessage, patchMessageStatus, pinAdminMessage, replyAdminMessage } from '../../api/adminApi'
import { formatDateTime } from '../../utils/format'

const route = useRoute()
const msg = ref(null)
const loading = ref(true)
const error = ref('')
const reply = ref('')
const busy = ref(false)
const hint = ref('')
const isError = ref(false)

const statusOptions = [
  { value: 1, label: '未处理' },
  { value: 2, label: '已处理' },
  { value: 3, label: '已跟进' },
  { value: 4, label: '无需处理' },
]

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    await ensureCsrf()
    msg.value = await getAdminMessage(Number(route.params.id))
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function setStatus(status) {
  busy.value = true
  hint.value = ''
  isError.value = false
  try {
    await ensureCsrf()
    await patchMessageStatus(Number(route.params.id), status)
    await load()
    hint.value = '状态已更新'
  } catch (err) {
    isError.value = true
    hint.value = err instanceof ApiError ? err.message : '更新失败'
  } finally {
    busy.value = false
  }
}

async function togglePin() {
  busy.value = true
  hint.value = ''
  isError.value = false
  try {
    await ensureCsrf()
    await pinAdminMessage(Number(route.params.id), !msg.value.pinned)
    await load()
    hint.value = msg.value.pinned ? '已置顶' : '已取消置顶'
  } catch (err) {
    isError.value = true
    hint.value = err instanceof ApiError ? err.message : '置顶失败'
  } finally {
    busy.value = false
  }
}

async function onReply() {
  busy.value = true
  hint.value = ''
  isError.value = false
  try {
    await ensureCsrf()
    await replyAdminMessage(Number(route.params.id), reply.value.trim())
    reply.value = ''
    await load()
    hint.value = '已回复'
  } catch (err) {
    isError.value = true
    hint.value = err instanceof ApiError ? err.message : '回复失败'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--sp-3);
  margin-bottom: var(--sp-4);
}

.page-title {
  font-size: clamp(26px, 3.4vw, 38px);
  font-weight: 600;
}

.card,
.reply,
.form {
  padding: var(--sp-4);
  border: 1px solid var(--line-1);
  border-radius: var(--r-md);
  background: var(--bg-1);
}

.card header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  margin-bottom: var(--sp-3);
  color: var(--tx-3);
  font-size: 13px;
}

.card header strong {
  color: var(--tx-1);
}

.flag {
  color: var(--warn);
}

.time {
  margin-left: auto;
}

.body {
  color: var(--tx-2);
  white-space: pre-wrap;
}

.meta {
  margin-top: var(--sp-2);
  color: var(--tx-3);
  font-size: 13px;
}

.repro {
  margin-top: var(--sp-3);
  padding: var(--sp-3);
  background: var(--bg-0);
  color: var(--tx-2);
  font-family: inherit;
  white-space: pre-wrap;
}

.section {
  margin-top: var(--sp-6);
}

.section h2 {
  margin-bottom: var(--sp-3);
  font-size: 18px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.reply {
  margin-bottom: var(--sp-3);
}

.reply header {
  margin-bottom: var(--sp-2);
  color: var(--tx-3);
  font-size: 12px;
}

.form {
  display: grid;
  gap: var(--sp-3);
  margin-top: var(--sp-3);
}

.textarea {
  width: 100%;
  padding: var(--sp-3);
  border: 1px solid var(--line-1);
  border-radius: var(--r-md);
  background: var(--bg-0);
  color: var(--tx-1);
}
</style>
