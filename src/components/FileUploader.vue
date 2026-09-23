<template>
  <div class="uploader">
    <div class="form__row">
      <input v-model="version" class="search" type="text" maxlength="32" placeholder="版本号，如 1.0.0" required />
      <select v-model="platform" class="search select">
        <option v-for="p in platforms" :key="p" :value="p">{{ p }}</option>
      </select>
    </div>
    <input type="file" @change="onFile" />
    <button class="chip is-active" type="button" :disabled="busy || !file" @click="upload">
      {{ busy ? progress : '上传到 COS' }}
    </button>
    <p v-if="hint" class="state-line" :class="{ 'is-error': isError }">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ApiError } from '../api/http'
import { completeUpload, createUploadTicket, ensureCsrf } from '../api/adminApi'
import { fileExt, sha256Hex } from '../utils/sha256'

const props = defineProps({
  toolId: { type: [Number, String], required: true },
})

const emit = defineEmits(['done'])

const platforms = ['Windows', 'Android', 'Mac', '通用']
const version = ref('0.0.1')
const platform = ref('通用')
const file = ref(null)
const busy = ref(false)
const progress = ref('上传中…')
const hint = ref('')
const isError = ref(false)

function onFile(event) {
  file.value = event.target.files?.[0] || null
}

async function upload() {
  if (!file.value) {
    return
  }
  busy.value = true
  hint.value = ''
  isError.value = false
  try {
    await ensureCsrf()
    progress.value = '计算校验…'
    const sha256 = await sha256Hex(file.value)
    const ext = fileExt(file.value.name)
    progress.value = '申请凭证…'
    const ticket = await createUploadTicket(props.toolId, {
      display_name: file.value.name,
      ext,
      file_size: file.value.size,
      version: version.value.trim(),
      platform: platform.value,
    })
    progress.value = '直传 COS…'
    const headers = new Headers()
    Object.entries(ticket.upload_headers || {}).forEach(([k, v]) => {
      headers.set(k, v)
    })
    const putRes = await fetch(ticket.upload_url, {
      method: ticket.upload_method || 'PUT',
      headers,
      body: file.value,
      mode: 'cors',
      credentials: 'omit',
    })
    if (!putRes.ok) {
      throw new Error(`COS 上传失败 HTTP ${putRes.status}`)
    }
    progress.value = '登记…'
    await completeUpload(ticket.file_id, {
      sha256,
      file_size: file.value.size,
    })
    hint.value = `已上传：${file.value.name}`
    isError.value = false
    file.value = null
    emit('done')
  } catch (err) {
    isError.value = true
    if (err instanceof ApiError) {
      hint.value = err.message
    } else if (err instanceof TypeError) {
      hint.value =
        '直传 COS 失败（多为桶未配置 CORS）。请重启后端让其自动写入 CORS，或在控制台为当前站点 Origin 放行 PUT，并允许 Content-Type。'
    } else {
      hint.value = err.message || '上传失败'
    }
  } finally {
    busy.value = false
    progress.value = '上传中…'
  }
}
</script>

<style scoped>
.uploader {
  display: grid;
  gap: var(--sp-3);
  margin-top: var(--sp-3);
}

.form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
}

.select {
  height: 46px;
  padding: 0 var(--sp-4);
  border: 1px solid var(--line-1);
  border-radius: var(--r-md);
  background: var(--bg-0);
}

@media (max-width: 640px) {
  .form__row {
    grid-template-columns: 1fr;
  }
}
</style>
