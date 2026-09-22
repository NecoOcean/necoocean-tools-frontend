<template>
  <form class="form" @submit.prevent="onSubmit">
    <div class="form__row">
      <input v-model="nickname" class="search" type="text" maxlength="50" placeholder="昵称（默认匿名）" />
      <select v-model.number="category" class="search select">
        <option v-for="opt in categories" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>
    <textarea
      v-model="content"
      class="textarea"
      rows="4"
      maxlength="2000"
      placeholder="留言内容"
      required
    />
    <input
      v-model="contactEmail"
      class="search"
      type="email"
      maxlength="254"
      placeholder="联系邮箱（选填，仅管理员可见）"
    />
    <template v-if="category === 3">
      <div class="form__row">
        <input v-model="osPlatform" class="search" type="text" maxlength="50" placeholder="系统环境（选填）" />
        <input v-model="toolVersion" class="search" type="text" maxlength="32" placeholder="工具版本（选填）" />
      </div>
      <textarea v-model="reproSteps" class="textarea" rows="3" maxlength="1000" placeholder="复现步骤（选填）" />
    </template>
    <div class="form__actions">
      <button class="chip is-active" type="submit" :disabled="busy">{{ busy ? '提交中…' : '提交留言' }}</button>
      <span v-if="hint" class="state-line" :class="{ 'is-error': isError }">{{ hint }}</span>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { ApiError } from '../api/http'
import { submitMessage } from '../api/publicApi'

const props = defineProps({
  slug: { type: String, required: true },
})

const emit = defineEmits(['submitted'])

const categories = [
  { value: 1, label: '使用体验' },
  { value: 2, label: '功能建议' },
  { value: 3, label: 'BUG报错' },
  { value: 4, label: '其他' },
]

const nickname = ref('匿名')
const category = ref(1)
const content = ref('')
const contactEmail = ref('')
const osPlatform = ref('')
const toolVersion = ref('')
const reproSteps = ref('')
const busy = ref(false)
const hint = ref('')
const isError = ref(false)

async function onSubmit() {
  busy.value = true
  hint.value = ''
  isError.value = false
  const body = {
    nickname: (nickname.value || '匿名').trim() || '匿名',
    category: category.value,
    content: content.value.trim(),
    contact_email: contactEmail.value.trim() || null,
  }
  if (category.value === 3) {
    body.os_platform = osPlatform.value.trim() || null
    body.tool_version = toolVersion.value.trim() || null
    body.repro_steps = reproSteps.value.trim() || null
  }
  try {
    await submitMessage(props.slug, body)
    content.value = ''
    contactEmail.value = ''
    osPlatform.value = ''
    toolVersion.value = ''
    reproSteps.value = ''
    hint.value = '已提交'
    isError.value = false
    emit('submitted')
  } catch (err) {
    isError.value = true
    hint.value = err instanceof ApiError ? err.message : '提交失败'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.form {
  display: grid;
  gap: var(--sp-3);
  margin-bottom: var(--sp-5);
  padding: var(--sp-4);
  border: 1px solid var(--line-1);
  border-radius: var(--r-md);
  background: var(--bg-1);
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
  resize: vertical;
}

.textarea:focus,
.select:focus {
  border-color: var(--brand);
}

.form__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-3);
}

@media (max-width: 640px) {
  .form__row {
    grid-template-columns: 1fr;
  }
}
</style>
