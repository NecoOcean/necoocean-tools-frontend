<template>
  <div class="visor page-block login">
    <h1>管理员登录</h1>
    <form class="login__form" @submit.prevent="onSubmit">
      <input v-model="username" class="search" type="text" autocomplete="username" placeholder="用户名" required />
      <input
        v-model="password"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError } from '../../api/http'
import { ensureCsrf, login } from '../../api/adminApi'

const router = useRouter()
const username = ref('')
const password = ref('')
const busy = ref(false)
const message = ref('')
const isError = ref(false)

async function onSubmit() {
  busy.value = true
  message.value = ''
  isError.value = false
  try {
    await ensureCsrf()
    await login(username.value.trim(), password.value)
    message.value = '登录成功'
    router.push('/')
  } catch (err) {
    isError.value = true
    message.value = err instanceof ApiError ? err.message : '登录失败'
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
