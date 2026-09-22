<template>
  <div class="visor page-block login">
    <h1>管理员登录</h1>
    <form class="login__form" @submit.prevent="onSubmit">
      <input
        ref="usernameInput"
        name="username"
        class="search"
        type="text"
        autocomplete="username"
        placeholder="用户名"
        required
      />
      <input
        ref="passwordInput"
        name="password"
        class="search"
        type="password"
        autocomplete="current-password"
        placeholder="密码"
        required
      />
      <button class="chip is-active" type="submit" :disabled="busy">{{ busy ? '登录中…' : '登录' }}</button>
    </form>
    <p v-if="message" class="state-line" :class="{ 'is-error': isError }">{{ message }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '../../api/http'
import { ensureCsrf, login } from '../../api/adminApi'

const router = useRouter()
const route = useRoute()
const usernameInput = ref(null)
const passwordInput = ref(null)
const busy = ref(false)
const message = ref('')
const isError = ref(false)

onMounted(() => {
  // 进页就种下 csrf_token，避免点击登录时才第一次拿 Cookie。
  ensureCsrf().catch(() => {})
})

async function onSubmit() {
  busy.value = true
  message.value = ''
  isError.value = false
  // 直接读 DOM，避免浏览器自动填充未触发 v-model 导致口令空提交。
  const username = (usernameInput.value?.value || '').trim()
  const password = passwordInput.value?.value || ''
  try {
    await ensureCsrf()
    await login(username, password)
    message.value = '登录成功'
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    router.push(redirect.startsWith('/admin') ? redirect : '/admin/tools')
  } catch (err) {
    isError.value = true
    if (err instanceof ApiError && err.code === 40100) {
      message.value = '账号或密码错误。'
    } else if (err instanceof ApiError) {
      message.value = err.message
    } else {
      message.value = '登录失败'
    }
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.login__form {
  display: grid;
  gap: var(--sp-3);
  max-width: 360px;
  margin-top: var(--sp-5);
}

.login__form .chip {
  justify-self: start;
}
</style>
