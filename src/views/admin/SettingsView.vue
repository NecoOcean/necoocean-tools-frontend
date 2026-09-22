<template>
  <div>
    <h1 class="page-title">站点设置</h1>
    <p v-if="loading" class="state-line">加载中…</p>
    <p v-else-if="loadError" class="state-line is-error">{{ loadError }}</p>
    <form v-else class="form" @submit.prevent="onSave">
      <input v-model="form.site_title" class="search" type="text" placeholder="站点标题" />
      <textarea v-model="form.home_intro" class="textarea" rows="2" placeholder="首页简介" />
      <input v-model="form.copyright" class="search" type="text" placeholder="版权文案" />
      <input v-model="form.icp_number" class="search" type="text" placeholder="备案号（选填）" />
      <textarea v-model="form.about_content" class="textarea" rows="5" placeholder="关于我" />
      <textarea v-model="form.privacy_content" class="textarea" rows="5" placeholder="隐私政策（后台维护；公开页暂用固定摘要）" />
      <textarea v-model="form.announcement" class="textarea" rows="2" placeholder="公告（选填）" />
      <label class="check">
        <input v-model="form.message_enabled" type="checkbox" />
        开放留言提交
      </label>
      <select v-model="form.message_audit_mode" class="search select">
        <option value="post">先发后审（一期）</option>
        <option value="pre">先审后发（二期）</option>
      </select>
      <textarea v-model="form.message_keywords" class="textarea" rows="2" placeholder="关键词（逗号或换行分隔）" />
      <div class="form__actions">
        <button class="chip is-active" type="submit" :disabled="busy">{{ busy ? '保存中…' : '保存设置' }}</button>
        <span v-if="hint" class="state-line" :class="{ 'is-error': isError }">{{ hint }}</span>
      </div>
    </form>

    <section class="section">
      <h2>数据导出</h2>
      <p class="state-line">默认不含邮箱。勾选后才会导出 contact_email 并写审计。</p>
      <div class="export-row">
        <select v-model="exportType" class="search select">
          <option value="tools">tools</option>
          <option value="messages">messages</option>
          <option value="replies">replies</option>
          <option value="all">all</option>
        </select>
        <select v-model="exportFormat" class="search select">
          <option value="json">json</option>
          <option value="csv">csv</option>
        </select>
        <label class="check">
          <input v-model="includeEmail" type="checkbox" />
          含邮箱
        </label>
        <button class="chip is-active" type="button" :disabled="exportBusy" @click="onExport">
          {{ exportBusy ? '导出中…' : '下载' }}
        </button>
      </div>
      <p v-if="exportHint" class="state-line" :class="{ 'is-error': exportError }">{{ exportHint }}</p>
    </section>

    <section class="section">
      <h2>修改口令</h2>
      <form class="form" @submit.prevent="onChangePassword">
        <input v-model="pwd.old_password" class="search" type="password" autocomplete="current-password" placeholder="当前口令" required />
        <input v-model="pwd.new_password" class="search" type="password" autocomplete="new-password" placeholder="新口令（8～72）" required minlength="8" maxlength="72" />
        <div class="form__actions">
          <button class="chip is-active" type="submit" :disabled="pwdBusy">{{ pwdBusy ? '提交中…' : '更新口令' }}</button>
          <span v-if="pwdHint" class="state-line" :class="{ 'is-error': pwdError }">{{ pwdHint }}</span>
        </div>
      </form>
    </section>

    <section class="section">
      <h2>存储维护</h2>
      <p class="state-line">手动清理无登记的 COS 孤儿对象（与每日 03:30 任务同逻辑）。</p>
      <button class="chip" type="button" :disabled="orphanBusy" @click="onCleanup">
        {{ orphanBusy ? '清理中…' : '立即清理孤儿对象' }}
      </button>
      <p v-if="orphanHint" class="state-line" :class="{ 'is-error': orphanError }">{{ orphanHint }}</p>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ApiError } from '../../api/http'
import { downloadExport, changePassword, cleanupOrphans, ensureCsrf, getAdminSettings, updateAdminSettings } from '../../api/adminApi'

const loading = ref(true)
const loadError = ref('')
const busy = ref(false)
const hint = ref('')
const isError = ref(false)

const form = reactive({
  site_title: '',
  home_intro: '',
  copyright: '',
  about_content: '',
  privacy_content: '',
  icp_number: '',
  announcement: '',
  message_enabled: true,
  message_audit_mode: 'post',
  message_keywords: '',
})

const exportType = ref('all')
const exportFormat = ref('json')
const includeEmail = ref(false)
const exportBusy = ref(false)
const exportHint = ref('')
const exportError = ref(false)

const pwd = reactive({ old_password: '', new_password: '' })
const pwdBusy = ref(false)
const pwdHint = ref('')
const pwdError = ref(false)

const orphanBusy = ref(false)
const orphanHint = ref('')
const orphanError = ref(false)

onMounted(load)

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    await ensureCsrf()
    const data = await getAdminSettings()
    form.site_title = data.site_title || ''
    form.home_intro = data.home_intro || ''
    form.copyright = data.copyright || ''
    form.about_content = data.about_content || ''
    form.privacy_content = data.privacy_content || ''
    form.icp_number = data.icp_number || ''
    form.announcement = data.announcement || ''
    form.message_enabled = data.message_enabled !== false
    form.message_audit_mode = data.message_audit_mode || 'post'
    form.message_keywords = data.message_keywords || ''
  } catch (err) {
    loadError.value = err instanceof ApiError ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function onSave() {
  busy.value = true
  hint.value = ''
  isError.value = false
  try {
    await ensureCsrf()
    await updateAdminSettings({
      site_title: form.site_title,
      home_intro: form.home_intro,
      copyright: form.copyright,
      about_content: form.about_content,
      privacy_content: form.privacy_content,
      icp_number: form.icp_number || null,
      announcement: form.announcement || null,
      message_enabled: form.message_enabled,
      message_audit_mode: form.message_audit_mode,
      message_keywords: form.message_keywords,
    })
    hint.value = '已保存'
  } catch (err) {
    isError.value = true
    hint.value = err instanceof ApiError ? err.message : '保存失败'
  } finally {
    busy.value = false
  }
}

async function onExport() {
  exportBusy.value = true
  exportHint.value = ''
  exportError.value = false
  try {
    await ensureCsrf()
    await downloadExport({
      type: exportType.value,
      format: exportFormat.value,
      includeEmail: includeEmail.value,
    })
    exportHint.value = '已开始下载（若含邮箱会写审计记录）'
  } catch (err) {
    exportError.value = true
    exportHint.value = err.message || '导出失败'
  } finally {
    exportBusy.value = false
  }
}

async function onChangePassword() {
  pwdBusy.value = true
  pwdHint.value = ''
  pwdError.value = false
  try {
    await ensureCsrf()
    await changePassword(pwd.old_password, pwd.new_password)
    pwd.old_password = ''
    pwd.new_password = ''
    pwdHint.value = '口令已更新'
  } catch (err) {
    pwdError.value = true
    pwdHint.value = err instanceof ApiError ? err.message : '更新失败'
  } finally {
    pwdBusy.value = false
  }
}

async function onCleanup() {
  if (!window.confirm('确认立即清理孤儿对象？')) {
    return
  }
  orphanBusy.value = true
  orphanHint.value = ''
  orphanError.value = false
  try {
    await ensureCsrf()
    const result = await cleanupOrphans()
    orphanHint.value = `完成：删除对象 ${result?.deleted_objects ?? 0}，清理占位行 ${result?.deleted_pending_rows ?? 0}`
  } catch (err) {
    orphanError.value = true
    orphanHint.value = err instanceof ApiError ? err.message : '清理失败'
  } finally {
    orphanBusy.value = false
  }
}
</script>

<style scoped>
.page-title {
  margin-bottom: var(--sp-4);
  font-size: clamp(26px, 3.4vw, 38px);
  font-weight: 600;
}

.form,
.section {
  display: grid;
  gap: var(--sp-3);
}

.form {
  padding: var(--sp-4);
  border: 1px solid var(--line-1);
  border-radius: var(--r-md);
  background: var(--bg-1);
}

.textarea,
.select {
  width: 100%;
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--line-1);
  border-radius: var(--r-md);
  background: var(--bg-0);
  color: var(--tx-1);
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--tx-2);
  font-size: 14px;
}

.form__actions,
.export-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-3);
}

.section {
  margin-top: var(--sp-7);
}

.section h2 {
  font-size: 20px;
}

.export-row .select,
.export-row .search {
  width: auto;
  min-width: 120px;
  flex: 0 0 auto;
}
</style>
