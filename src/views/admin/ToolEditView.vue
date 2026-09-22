<template>
  <div>
    <div class="head">
      <h1 class="page-title">{{ isNew ? '新建工具' : '编辑工具' }}</h1>
      <RouterLink class="chip" to="/admin/tools">返回列表</RouterLink>
    </div>

    <p v-if="loading" class="state-line">加载中…</p>
    <p v-else-if="loadError" class="state-line is-error">{{ loadError }}</p>
    <form v-else class="form" @submit.prevent="onSave">
      <div class="form__row">
        <input v-model="form.name" class="search" type="text" placeholder="名称" required maxlength="100" />
        <input
          v-model="form.slug"
          class="search"
          type="text"
          placeholder="slug（小写字母数字连字符）"
          required
          maxlength="80"
          :disabled="!isNew"
        />
      </div>
      <textarea v-model="form.summary" class="textarea" rows="2" placeholder="简介" required maxlength="500" />
      <div class="form__row">
        <select v-model.number="form.category_id" class="search select" required>
          <option disabled :value="null">选择分类</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <input v-model="form.developed_at" class="search" type="date" />
      </div>
      <div class="platforms">
        <label v-for="p in platformOptions" :key="p" class="plat">
          <input v-model="form.platforms" type="checkbox" :value="p" />
          {{ p }}
        </label>
      </div>
      <textarea v-model="form.tutorial" class="textarea" rows="6" placeholder="使用说明（可写 Markdown 纯文本）" />
      <div class="form__row">
        <input v-model="form.repo_url" class="search" type="url" placeholder="仓库 URL（选填）" />
        <input v-model="form.web_url" class="search" type="url" placeholder="网页版 URL（选填）" />
      </div>
      <div class="form__actions">
        <button class="chip is-active" type="submit" :disabled="busy">{{ busy ? '保存中…' : '保存' }}</button>
        <button
          v-if="!isNew"
          class="chip"
          type="button"
          :disabled="busy"
          @click="toggleStatus"
        >
          {{ form.status === 1 ? '下架' : '上架' }}
        </button>
        <span v-if="hint" class="state-line" :class="{ 'is-error': isError }">{{ hint }}</span>
      </div>
    </form>

    <section v-if="!isNew && toolId" class="section">
      <h2>上传文件</h2>
      <FileUploader :tool-id="toolId" @done="onUploaded" />
      <p v-if="uploadHint" class="state-line">{{ uploadHint }}</p>
    </section>

    <section v-if="!isNew && toolId" class="section">
      <h2>更新日志</h2>
      <form class="form compact" @submit.prevent="onAddNote">
        <div class="form__row">
          <input v-model="note.version" class="search" type="text" placeholder="版本" required maxlength="32" />
          <input v-model="note.released_at" class="search" type="datetime-local" />
        </div>
        <textarea v-model="note.content" class="textarea" rows="3" placeholder="更新内容" required />
        <button class="chip is-active" type="submit" :disabled="noteBusy">{{ noteBusy ? '提交中…' : '新增日志' }}</button>
      </form>
      <article v-for="n in notes" :key="n.id" class="note">
        <header>
          <strong>{{ n.version }}</strong>
          <span>{{ formatDateTime(n.released_at) }}</span>
          <button type="button" class="linkish" @click="onDeleteNote(n.id)">删除</button>
        </header>
        <pre>{{ n.content }}</pre>
      </article>
      <p v-if="notes.length === 0" class="state-line">暂无更新日志</p>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FileUploader from '../../components/FileUploader.vue'
import { ApiError } from '../../api/http'
import {
  createAdminTool,
  createReleaseNote,
  deleteReleaseNote,
  ensureCsrf,
  getAdminTool,
  listAdminCategories,
  listAdminReleaseNotes,
  patchToolStatus,
  updateAdminTool,
} from '../../api/adminApi'
import { formatDateTime } from '../../utils/format'

const route = useRoute()
const router = useRouter()
const platformOptions = ['Windows', 'Android', 'Mac', '通用']

const isNew = computed(() => route.name === 'admin-tool-new')
const toolId = computed(() => (isNew.value ? null : Number(route.params.id)))

const categories = ref([])
const notes = ref([])
const loading = ref(!isNew.value)
const loadError = ref('')
const busy = ref(false)
const noteBusy = ref(false)
const hint = ref('')
const isError = ref(false)
const uploadHint = ref('')

const form = reactive({
  name: '',
  slug: '',
  summary: '',
  category_id: null,
  platforms: ['通用'],
  tutorial: '',
  repo_url: '',
  web_url: '',
  developed_at: '',
  status: 0,
})

const note = reactive({
  version: '',
  content: '',
  released_at: '',
})

onMounted(async () => {
  await ensureCsrf()
  try {
    const cats = await listAdminCategories()
    categories.value = Array.isArray(cats) ? cats : (cats?.list || [])
  } catch (err) {
    loadError.value = err instanceof ApiError ? err.message : '分类加载失败'
    return
  }
  if (!isNew.value) {
    await loadTool()
    await loadNotes()
  }
})

async function loadTool() {
  loading.value = true
  loadError.value = ''
  try {
    const data = await getAdminTool(toolId.value)
    form.name = data.name || ''
    form.slug = data.slug || ''
    form.summary = data.summary || ''
    form.category_id = data.category?.id ?? null
    form.platforms = data.platforms?.length ? [...data.platforms] : ['通用']
    form.tutorial = data.tutorial || ''
    form.repo_url = data.repo_url || ''
    form.web_url = data.web_url || ''
    form.developed_at = data.developed_at || ''
    form.status = data.status ?? 0
  } catch (err) {
    loadError.value = err instanceof ApiError ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function loadNotes() {
  try {
    const data = await listAdminReleaseNotes(toolId.value, { page: 1, page_size: 50 })
    notes.value = data?.list || []
  } catch {
    notes.value = []
  }
}

function buildBody(includeStatus) {
  const body = {
    name: form.name.trim(),
    slug: form.slug.trim(),
    summary: form.summary.trim(),
    category_id: form.category_id,
    platforms: form.platforms.length ? form.platforms : ['通用'],
    tutorial: form.tutorial || null,
    repo_url: form.repo_url.trim() || null,
    web_url: form.web_url.trim() || null,
    developed_at: form.developed_at || null,
  }
  if (includeStatus) {
    body.status = form.status ?? 0
  }
  return body
}

async function onSave() {
  busy.value = true
  hint.value = ''
  isError.value = false
  try {
    await ensureCsrf()
    if (isNew.value) {
      const created = await createAdminTool(buildBody(true))
      hint.value = '已创建'
      router.replace(`/admin/tools/${created.id}`)
    } else {
      await updateAdminTool(toolId.value, buildBody(false))
      hint.value = '已保存'
      await loadTool()
    }
  } catch (err) {
    isError.value = true
    hint.value = err instanceof ApiError ? err.message : '保存失败'
  } finally {
    busy.value = false
  }
}

async function toggleStatus() {
  const next = form.status === 1 ? 0 : 1
  busy.value = true
  hint.value = ''
  isError.value = false
  try {
    await ensureCsrf()
    await patchToolStatus(toolId.value, next)
    form.status = next
    hint.value = next === 1 ? '已上架' : '已下架'
  } catch (err) {
    isError.value = true
    hint.value = err instanceof ApiError ? err.message : '状态更新失败'
  } finally {
    busy.value = false
  }
}

function onUploaded() {
  uploadHint.value = '文件已登记。可在前台专题页下载区查看（工具需上架）。'
}

async function onAddNote() {
  noteBusy.value = true
  try {
    await ensureCsrf()
    const body = {
      version: note.version.trim(),
      content: note.content.trim(),
    }
    if (note.released_at) {
      body.released_at = new Date(note.released_at).toISOString()
    }
    await createReleaseNote(toolId.value, body)
    note.version = ''
    note.content = ''
    note.released_at = ''
    await loadNotes()
  } catch (err) {
    hint.value = err instanceof ApiError ? err.message : '新增日志失败'
    isError.value = true
  } finally {
    noteBusy.value = false
  }
}

async function onDeleteNote(id) {
  if (!window.confirm('删除这条更新日志？')) {
    return
  }
  try {
    await ensureCsrf()
    await deleteReleaseNote(id)
    await loadNotes()
  } catch (err) {
    hint.value = err instanceof ApiError ? err.message : '删除失败'
    isError.value = true
  }
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

.form {
  display: grid;
  gap: var(--sp-3);
  padding: var(--sp-4);
  border: 1px solid var(--line-1);
  border-radius: var(--r-md);
  background: var(--bg-1);
}

.form.compact {
  margin-bottom: var(--sp-4);
}

.form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
}

.textarea,
.select {
  width: 100%;
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--line-1);
  border-radius: var(--r-md);
  background: var(--bg-0);
  color: var(--tx-1);
  outline: none;
}

.platforms {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
}

.plat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--tx-2);
  font-size: 14px;
}

.form__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-3);
}

.section {
  margin-top: var(--sp-7);
}

.section h2 {
  margin-bottom: var(--sp-3);
  font-size: 20px;
}

.note {
  margin-top: var(--sp-3);
  padding: var(--sp-3);
  border: 1px solid var(--line-1);
  border-radius: var(--r-md);
  background: var(--bg-1);
}

.note header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  margin-bottom: var(--sp-2);
  color: var(--tx-3);
  font-size: 13px;
}

.note pre {
  white-space: pre-wrap;
  color: var(--tx-2);
  font-family: inherit;
  font-size: 14px;
}

.linkish {
  margin-left: auto;
  color: var(--danger);
  font-size: 13px;
}

@media (max-width: 640px) {
  .form__row {
    grid-template-columns: 1fr;
  }
}
</style>
