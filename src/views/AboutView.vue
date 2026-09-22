<template>
  <div class="visor page-block">
    <h1>关于</h1>
    <p v-if="loading" class="state-line">加载中…</p>
    <p v-else-if="error" class="state-line is-error">{{ error }}</p>
    <template v-else>
      <pre v-if="content" class="prose">{{ content }}</pre>
      <p v-else class="lede">{{ intro || 'NecoOcean 个人工具展示站。' }}</p>
      <p v-if="copyright || icp" class="meta">
        <span v-if="copyright">{{ copyright }}</span>
        <span v-if="icp"> · {{ icp }}</span>
      </p>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ApiError } from '../api/http'
import { getSiteInfo } from '../api/publicApi'

const loading = ref(true)
const error = ref('')
const content = ref('')
const intro = ref('')
const copyright = ref('')
const icp = ref('')

onMounted(async () => {
  try {
    const data = await getSiteInfo()
    content.value = data?.about_content || ''
    intro.value = data?.home_intro || ''
    copyright.value = data?.copyright || ''
    icp.value = data?.icp_number || ''
    if (data?.site_title) {
      document.title = `${data.site_title} · 关于`
    }
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.prose {
  margin-top: var(--sp-4);
  white-space: pre-wrap;
  color: var(--tx-2);
  font-family: inherit;
  font-size: 15px;
  line-height: 1.7;
  max-width: 42rem;
}

.lede {
  margin-top: var(--sp-4);
  color: var(--tx-2);
  max-width: 40rem;
}

.meta {
  margin-top: var(--sp-6);
  color: var(--tx-3);
  font-size: 13px;
}
</style>
