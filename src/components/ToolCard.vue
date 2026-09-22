<template>
  <RouterLink
    class="card"
    :to="`/tool/${tool.slug}`"
    @mousemove="onMove"
    @mouseleave="onLeave"
  >
    <div class="card-top">
      <div class="appicon" aria-hidden="true">{{ initial }}</div>
      <div>
        <div class="card-name">
          {{ tool.name }}
          <span v-if="tool.latest_version" class="tier">{{ tool.latest_version }}</span>
        </div>
      </div>
    </div>
    <p class="card-desc">{{ tool.summary }}</p>
    <div class="card-tags">
      <span class="tag">{{ categoryName }}</span>
      <span v-for="p in platforms" :key="p" class="tag">{{ p }}</span>
    </div>
    <div class="card-foot">
      <span class="ver">{{ updatedText }}</span>
      <span class="go">
        进入
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
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
const my = ref(0)

const categoryName = computed(() => props.tool.category?.name || '未分类')
const platforms = computed(() => props.tool.platforms || [])
const updatedText = computed(() => formatDateTime(props.tool.updated_at))
const initial = computed(() => (props.tool.name || '?').slice(0, 1))

function onMove(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  mx.value = ((event.clientX - rect.left) / rect.width) * 100
  my.value = ((event.clientY - rect.top) / rect.height) * 100
  event.currentTarget.style.setProperty('--mx', `${mx.value}%`)
  event.currentTarget.style.setProperty('--my', `${my.value}%`)
}

function onLeave(event) {
  mx.value = 50
  my.value = 0
  event.currentTarget.style.setProperty('--mx', '50%')
  event.currentTarget.style.setProperty('--my', '0%')
}
</script>

<style scoped>
.card {
  position: relative;
  background: var(--bg-1);
  border: 1px solid var(--line-1);
  border-radius: var(--r-lg);
  padding: var(--sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  transition: transform 0.3s var(--ease), border-color 0.3s, background 0.3s;
  overflow: hidden;
}

.card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(420px 180px at var(--mx, 50%) var(--my, 0%), var(--brand-soft), transparent 62%);
  opacity: 0;
  transition: opacity 0.35s;
}

.card:hover {
  transform: translateY(-4px);
  border-color: var(--line-2);
  background: var(--bg-2);
}

.card:hover::after {
  opacity: 1;
}

.card-top {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-4);
  position: relative;
  z-index: 1;
}

.appicon {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  font-size: 19px;
  font-weight: 600;
  background: var(--bg-3);
  border: 1px solid var(--line-1);
}

.card-name {
  font-size: 16.5px;
  font-weight: 600;
  letter-spacing: -0.015em;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tier {
  font-family: var(--f-mono);
  font-size: 9.5px;
  letter-spacing: 0.08em;
  padding: 2.5px 7px;
  border-radius: 5px;
  font-weight: 400;
  background: var(--brand-soft);
  color: var(--brand);
}

.card-desc {
  font-size: 14px;
  color: var(--tx-2);
  line-height: 1.65;
  position: relative;
  z-index: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.tag {
  font-size: 11.5px;
  color: var(--tx-3);
  border: 1px solid var(--line-1);
  border-radius: 5px;
  padding: 3px 8px;
  font-family: var(--f-mono);
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--sp-4);
  border-top: 1px solid var(--line-1);
  font-size: 12.5px;
  color: var(--tx-3);
  position: relative;
  z-index: 1;
  margin-top: auto;
}

.card-foot .ver {
  font-family: var(--f-mono);
}

.card-foot .go {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--tx-2);
  transition: color 0.2s, gap 0.25s var(--ease);
}

.card:hover .card-foot .go {
  color: var(--brand);
  gap: 9px;
}

.card-foot .go svg {
  width: 13px;
  height: 13px;
}
</style>
