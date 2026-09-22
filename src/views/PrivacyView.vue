<template>
  <div class="visor page-block">
    <h1>隐私</h1>
    <p v-if="loading" class="state-line">加载中…</p>
    <template v-else>
      <p class="lede">
        留言邮箱为选填，仅管理员可见，公开接口不返回邮箱。一期不发送任何邮件。
        IP 仅存哈希用于限流，不对外展示。
      </p>
      <p v-if="copyright || icp" class="meta">
        <span v-if="copyright">{{ copyright }}</span>
        <span v-if="icp"> · {{ icp }}</span>
      </p>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getSiteInfo } from '../api/publicApi'

const loading = ref(true)
const copyright = ref('')
const icp = ref('')

onMounted(async () => {
  try {
    const data = await getSiteInfo()
    copyright.value = data?.copyright || ''
    icp.value = data?.icp_number || ''
  } catch {
    // 隐私摘要仍可展示
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.lede {
  margin-top: var(--sp-4);
  color: var(--tx-2);
  max-width: 40rem;
  line-height: 1.7;
}

.meta {
  margin-top: var(--sp-6);
  color: var(--tx-3);
  font-size: 13px;
}
</style>
