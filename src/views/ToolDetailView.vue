<template>
  <div class="visor tool-detail">
    <p v-if="loading" class="state-line">加载中…</p>
    <p v-else-if="error" class="state-line is-error">{{ error }}</p>
    <template v-else-if="tool">
      <p class="eyebrow">{{ tool.category?.name }}</p>
      <h1>{{ tool.name }}</h1>
      <p class="lede">{{ tool.summary }}</p>
      <div class="meta-row">
        <span v-if="tool.latest_version">版本 {{ tool.latest_version }}</span>
        <span v-for="p in tool.platforms || []" :key="p">{{ p }}</span>
        <span v-if="tool.developed_at">开发 {{ tool.developed_at }}</span>
        <span>更新 {{ formatDateTime(tool.updated_at) }}</span>
      </div>
      <div v-if="tool.repo_url || tool.web_url" class="link-row">
        <a v-if="tool.repo_url" :href="tool.repo_url" target="_blank" rel="noopener">仓库</a>
        <a v-if="tool.web_url" :href="tool.web_url" target="_blank" rel="noopener">网页版</a>
      </div>

      <section class="section">
        <h2>下载</h2>
        <p v-if="filesLoading" class="state-line">加载文件…</p>
        <p v-else-if="files.length === 0" class="state-line">暂无下载文件</p>
        <ul v-else class="file-list">
          <li v-for="file in files" :key="file.id" class="file-row">
            <div>
              <strong>{{ file.display_name || file.version }}</strong>
              <span class="file-meta">
                {{ file.platform || '通用' }} · {{ formatBytes(file.file_size) }}
                <template v-if="file.is_latest"> · 推荐</template>
              </span>
              <code v-if="file.sha256" class="sha">{{ file.sha256 }}</code>
            </div>
            <a class="chip is-active download-btn" :href="downloadHref(file)" rel="noopener">下载</a>
          </li>
        </ul>
      </section>

      <section v-if="tool.tutorial" class="section">
        <h2>使用说明</h2>
        <pre class="prose">{{ tool.tutorial }}</pre>
      </section>

      <section class="section">
        <h2>更新日志</h2>
        <p v-if="notesLoading" class="state-line">加载中…</p>
        <p v-else-if="notes.length === 0" class="state-line">暂无更新日志</p>
        <article v-for="note in notes" :key="note.id" class="note-card">
          <header>
            <strong>{{ note.version }}</strong>
            <span>{{ formatDateTime(note.released_at) }}</span>
          </header>
          <pre class="prose">{{ note.content }}</pre>
        </article>
      </section>

      <section class="section">
        <h2>留言</h2>
        <p v-if="messageEnabled === false" class="state-line">留言提交已关闭，仍可浏览已有留言。</p>
        <MessageForm v-else :slug="slug" @submitted="onMessageSubmitted" />
        <p v-if="messagesLoading" class="state-line">加载留言…</p>
        <p v-else-if="messages.length === 0" class="state-line">还没有留言</p>
        <MessageItem v-for="msg in messages" :key="msg.id" :message="msg" />
      </section>
    </template>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { ApiError } from '../api/http'
import { downloadUrl, getSiteInfo, getTool, listFiles, listMessages, listReleaseNotes } from '../api/publicApi'
import { formatBytes, formatDateTime } from '../utils/format'
import MessageForm from '../components/MessageForm.vue'
import MessageItem from '../components/MessageItem.vue'

const props = defineProps({
  slug: { type: String, required: true },
})

const POLL_MS = 30000

const tool = ref(null)
const files = ref([])
const notes = ref([])
const messages = ref([])
const loading = ref(true)
const filesLoading = ref(false)
const notesLoading = ref(false)
const messagesLoading = ref(false)
const messageEnabled = ref(true)
const error = ref('')
let pollTimer = 0

onMounted(() => {
  loadAll()
  loadSiteFlags()
  pollTimer = window.setInterval(() => {
    if (props.slug) {
      loadMessages(false)
    }
  }, POLL_MS)
})

async function loadSiteFlags() {
  try {
    const data = await getSiteInfo()
    messageEnabled.value = data?.message_enabled !== false
  } catch {
    messageEnabled.value = true
  }
}

onUnmounted(() => {
  window.clearInterval(pollTimer)
})

watch(() => props.slug, () => {
  loadAll()
})

function downloadHref(file) {
  return file.download_url || downloadUrl(file.id)
}

async function loadAll() {
  loading.value = true
  error.value = ''
  tool.value = null
  try {
    tool.value = await getTool(props.slug)
    await Promise.all([loadFiles(), loadNotes(), loadMessages(true)])
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function loadFiles() {
  filesLoading.value = true
  try {
    const data = await listFiles(props.slug)
    files.value = data?.list || []
  } catch {
    files.value = []
  } finally {
    filesLoading.value = false
  }
}

async function loadNotes() {
  notesLoading.value = true
  try {
    const data = await listReleaseNotes(props.slug, { page: 1, page_size: 20 })
    notes.value = data?.list || []
  } catch {
    notes.value = []
  } finally {
    notesLoading.value = false
  }
}

async function loadMessages(showLoading) {
  if (showLoading) {
    messagesLoading.value = true
  }
  try {
    const data = await listMessages(props.slug, { page: 1, page_size: 20 })
    messages.value = data?.list || []
  } catch {
    if (showLoading) {
      messages.value = []
    }
  } finally {
    messagesLoading.value = false
  }
}

function onMessageSubmitted() {
  loadMessages(false)
}
</script>

<style scoped>
.eyebrow {
  margin-bottom: var(--sp-3);
  color: var(--tx-3);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-family: var(--f-mono);
}

.lede {
  margin-top: var(--sp-4);
  max-width: 42rem;
  color: var(--tx-2);
  font-size: 17px;
  line-height: 1.7;
}

.meta-row,
.link-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  margin-top: var(--sp-4);
  color: var(--tx-3);
  font-size: 13px;
}

.link-row a {
  color: var(--brand);
}

.section {
  margin-top: var(--sp-8);
}

.section h2 {
  margin-bottom: var(--sp-4);
  font-size: clamp(22px, 2.8vw, 28px);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.file-list {
  list-style: none;
  display: grid;
  gap: var(--sp-3);
}

.file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
  padding: var(--sp-4);
  border: 1px solid var(--line-1);
  border-radius: var(--r-md);
  background: var(--bg-1);
}

.file-meta {
  display: block;
  margin-top: 4px;
  color: var(--tx-3);
  font-size: 13px;
}

.sha {
  display: block;
  margin-top: 6px;
  color: var(--tx-3);
  font-family: var(--f-mono);
  font-size: 11px;
  word-break: break-all;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;
}

.prose {
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--tx-2);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.7;
}

.note-card {
  margin-bottom: var(--sp-4);
  padding: var(--sp-4);
  border: 1px solid var(--line-1);
  border-radius: var(--r-md);
  background: var(--bg-1);
}

.note-card header {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-3);
  margin-bottom: var(--sp-3);
  color: var(--tx-3);
  font-size: 13px;
}

@media (max-width: 640px) {
  .file-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
