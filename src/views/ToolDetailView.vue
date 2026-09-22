<template>
  <div class="visor page-block">
    <p v-if="loading" class="state-line">加载中…</p>
    <p v-else-if="error" class="state-line is-error">{{ error }}</p>
    <template v-else-if="tool">
      <p class="eyebrow">{{ tool.category?.name }}</p>
      <h1>{{ tool.name }}</h1>
      <p>{{ tool.summary }}</p>
      <p v-if="tool.latest_version" class="state-line">版本 {{ tool.latest_version }}</p>
      <p class="hint">专题页（下载区 / 更新日志 / 留言）将在后续迭代补齐。</p>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { ApiError } from '../api/http'
import { getTool } from '../api/publicApi'

const props = defineProps({
  slug: { type: String, required: true },
})

const tool = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(load)
watch(() => props.slug, load)

async function load() {
  loading.value = true
  error.value = ''
  tool.value = null
  try {
    tool.value = await getTool(props.slug)
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
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

.hint {
  margin-top: var(--sp-6);
  color: var(--tx-3);
  font-size: 14px;
}
</style>
