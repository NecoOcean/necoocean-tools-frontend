<template>
  <RouterLink
    class="tool-card"
    :to="`/tool/${tool.slug}`"
    @mousemove="onMove"
    @mouseleave="onLeave"
  >
    <div class="tool-card__glow" :style="glowStyle" aria-hidden="true"></div>
    <div class="tool-card__meta">
      <span class="tool-card__cat">{{ categoryName }}</span>
      <span v-if="tool.latest_version" class="tool-card__ver">{{ tool.latest_version }}</span>
    </div>
    <h3 class="tool-card__title">{{ tool.name }}</h3>
    <p class="tool-card__desc">{{ tool.summary }}</p>
    <div class="tool-card__foot">
      <span v-for="p in platforms" :key="p" class="tool-card__plat">{{ p }}</span>
      <span class="tool-card__time">{{ updatedText }}</span>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed, ref } from 'vue'
import { formatDateTime } from '../utils/format'

const props = defineProps({
  tool: { type: Object, required: true },
})

const mx = ref(50)
const my = ref(50)

const categoryName = computed(() => props.tool.category?.name || '未分类')
const platforms = computed(() => props.tool.platforms || [])
const updatedText = computed(() => formatDateTime(props.tool.updated_at))
const glowStyle = computed(() => ({
  '--mx': `${mx.value}%`,
  '--my': `${my.value}%`,
}))

function onMove(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  mx.value = ((event.clientX - rect.left) / rect.width) * 100
  my.value = ((event.clientY - rect.top) / rect.height) * 100
}

function onLeave() {
  mx.value = 50
  my.value = 50
}
</script>

<style scoped>
.tool-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  min-height: 220px;
  padding: var(--sp-5);
  border: 1px solid var(--line-1);
  border-radius: var(--r-lg);
  background: var(--bg-1);
  overflow: hidden;
  transition: border-color 0.25s var(--ease), background 0.25s var(--ease), transform 0.25s var(--ease);
}

.tool-card:hover {
  border-color: var(--line-2);
  background: var(--bg-2);
  transform: translateY(-2px);
}

.tool-card__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    420px circle at var(--mx) var(--my),
    var(--brand-soft),
    transparent 55%
  );
  opacity: 0;
  transition: opacity 0.25s var(--ease);
}

.tool-card:hover .tool-card__glow {
  opacity: 1;
}

.tool-card__meta,
.tool-card__foot {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-2);
}

.tool-card__meta {
  justify-content: space-between;
  color: var(--tx-3);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-family: var(--f-mono);
}

.tool-card__title,
.tool-card__desc,
.tool-card__foot {
  position: relative;
}

.tool-card__title {
  font-size: 16.5px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.015em;
}

.tool-card__desc {
  flex: 1;
  color: var(--tx-2);
  font-size: 14px;
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-card__plat {
  padding: 2px 8px;
  border: 1px solid var(--line-1);
  border-radius: 999px;
  color: var(--tx-2);
  font-size: 12px;
}

.tool-card__time {
  margin-left: auto;
  color: var(--tx-3);
  font-size: 12px;
}
</style>
