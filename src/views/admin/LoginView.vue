<template>
  <div class="admin-root login-page">
    <div class="login-card">
      <div class="login-brand">
        <span class="admin-brand__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round">
            <path d="M3 15c3.5 0 3.5-3 7-3s3.5 3 7 3 4-3 4-3" />
            <path d="M3 9.5c3.5 0 3.5-3 7-3s3.5 3 7 3 4-3 4-3" opacity=".55" />
          </svg>
        </span>
        <div>
          <h1>NecoOcean Admin</h1>
          <p>管理员登录</p>
        </div>
      </div>
      <form class="login-form" @submit.prevent="onSubmit">
        <input
          ref="usernameInput"
          name="username"
          class="admin-input"
          type="text"
          autocomplete="username"
          placeholder="用户名"
          required
        />
        <input
          ref="passwordInput"
          name="password"
          class="admin-input"
          type="password"
          autocomplete="current-password"
          placeholder="密码"
          required
        />
        <button class="admin-btn" type="submit" :disabled="busy">{{ busy ? '登录中…' : '登录' }}</button>
      </form>
      <p v-if="message" class="admin-state" :class="{ 'is-error': isError }">{{ message }}</p>
      <RouterLink class="back" to="/">← 返回前台</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '../../api/http'
import { ensureCsrf, login } from '../../api/adminApi'
import '../../styles/admin.css'

const router = useRouter()
const route = useRoute()
const usernameInput = ref(null)
const passwordInput = ref(null)
const busy = ref(false)
const message = ref('')
const isError = ref(false)

onMounted(() => {
  ensureCsrf().catch(() => {})
})

async function onSubmit() {
  busy.value = true
  message.value = ''
  isError.value = false
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
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(700px 360px at 20% 10%, rgba(124, 140, 253, 0.18), transparent 60%),
    radial-gradient(600px 320px at 90% 80%, rgba(91, 108, 240, 0.12), transparent 55%),
    var(--ad-bg);
}

.login-card {
  width: min(400px, 100%);
  padding: 28px 26px 24px;
  border-radius: 18px;
  background: var(--ad-panel);
  border: 1px solid var(--ad-line);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}

.login-brand h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 650;
}

.login-brand p {
  margin: 4px 0 0;
  color: var(--ad-tx-3);
  font-size: 13px;
}

.login-form {
  display: grid;
  gap: 12px;
}

.admin-btn {
  margin-top: 4px;
  width: 100%;
}

.back {
  display: inline-block;
  margin-top: 16px;
  color: var(--ad-tx-3);
  font-size: 13px;
}

.back:hover {
  color: var(--ad-accent);
}
</style>
