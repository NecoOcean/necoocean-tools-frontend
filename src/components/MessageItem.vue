<template>
  <article class="msg" :class="{ 'is-pinned': message.is_pinned }">
    <header class="msg__head">
      <strong>{{ message.nickname || '匿名' }}</strong>
      <span>{{ message.category_text }}</span>
      <span v-if="message.is_pinned" class="pin">置顶</span>
      <span class="time">{{ formatDateTime(message.created_at) }}</span>
    </header>
    <p class="msg__body">{{ message.content }}</p>
    <p v-if="message.os_platform || message.tool_version" class="msg__meta">
      <span v-if="message.os_platform">{{ message.os_platform }}</span>
      <span v-if="message.tool_version">v{{ message.tool_version }}</span>
    </p>
    <pre v-if="message.repro_steps" class="msg__repro">{{ message.repro_steps }}</pre>
    <div v-for="reply in message.replies || []" :key="reply.id" class="reply">
      <header>管理员回复 · {{ formatDateTime(reply.created_at) }}</header>
      <p>{{ reply.content }}</p>
    </div>
  </article>
</template>

<script setup>
import { formatDateTime } from '../utils/format'

defineProps({
  message: { type: Object, required: true },
})
</script>

<style scoped>
.msg {
  margin-top: var(--sp-4);
  padding: var(--sp-4);
  border: 1px solid var(--line-1);
  border-radius: var(--r-md);
  background: var(--bg-1);
}

.msg.is-pinned {
  border-color: var(--line-2);
}

.msg__head {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2) var(--sp-3);
  margin-bottom: var(--sp-3);
  color: var(--tx-3);
  font-size: 13px;
}

.msg__head strong {
  color: var(--tx-1);
}

.pin {
  color: var(--brand);
}

.time {
  margin-left: auto;
}

.msg__body {
  color: var(--tx-2);
  white-space: pre-wrap;
}

.msg__meta {
  margin-top: var(--sp-2);
  color: var(--tx-3);
  font-size: 12px;
  display: flex;
  gap: var(--sp-3);
}

.msg__repro {
  margin-top: var(--sp-3);
  padding: var(--sp-3);
  border-radius: var(--r-sm);
  background: var(--bg-0);
  color: var(--tx-2);
  font-family: inherit;
  font-size: 13px;
  white-space: pre-wrap;
}

.reply {
  margin-top: var(--sp-3);
  padding: var(--sp-3);
  border-left: 2px solid var(--brand);
  background: var(--brand-soft);
}

.reply header {
  margin-bottom: var(--sp-2);
  color: var(--tx-3);
  font-size: 12px;
}
</style>
