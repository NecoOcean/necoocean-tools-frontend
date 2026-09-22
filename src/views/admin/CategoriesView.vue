<template>
  <div>
    <h1 class="page-title">分类管理</h1>
    <form class="form" @submit.prevent="onCreate">
      <div class="form__row">
        <input v-model="name" class="search" type="text" maxlength="50" placeholder="分类名称" required />
        <input v-model.number="sortOrder" class="search" type="number" placeholder="排序（可空）" />
        <button class="chip is-active" type="submit" :disabled="busy">新增</button>
      </div>
    </form>
    <p v-if="hint" class="state-line" :class="{ 'is-error': isError }">{{ hint }}</p>
    <p v-if="loading" class="state-line">加载中…</p>
    <table v-else class="table">
      <thead>
        <tr>
          <th>名称</th>
          <th>排序</th>
          <th>工具数</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in categories" :key="row.id">
          <td>
            <input v-model="row._name" class="search inline" type="text" maxlength="50" />
          </td>
          <td>
            <input v-model.number="row._sort" class="search inline narrow" type="number" />
          </td>
          <td>{{ row.tool_count ?? 0 }}</td>
          <td class="actions">
            <button type="button" class="linkish" :disabled="busy" @click="onSave(row)">保存</button>
            <button type="button" class="linkish danger" :disabled="busy" @click="onDelete(row)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="!loading && categories.length === 0" class="state-line">暂无分类</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ApiError } from '../../api/http'
import {
  createAdminCategory,
  deleteAdminCategory,
  ensureCsrf,
  listAdminCategories,
  updateAdminCategory,
} from '../../api/adminApi'

const categories = ref([])
const loading = ref(true)
const busy = ref(false)
const name = ref('')
const sortOrder = ref(null)
const hint = ref('')
const isError = ref(false)

onMounted(load)

async function load() {
  loading.value = true
  try {
    await ensureCsrf()
    const data = await listAdminCategories()
    const list = data?.list || []
    categories.value = list.map((c) => ({
      ...c,
      _name: c.name,
      _sort: c.sort_order,
    }))
  } catch (err) {
    isError.value = true
    hint.value = err instanceof ApiError ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function onCreate() {
  busy.value = true
  hint.value = ''
  isError.value = false
  try {
    await ensureCsrf()
    const body = { name: name.value.trim() }
    if (sortOrder.value != null && sortOrder.value !== '') {
      body.sort_order = Number(sortOrder.value)
    }
    await createAdminCategory(body)
    name.value = ''
    sortOrder.value = null
    hint.value = '已新增'
    await load()
  } catch (err) {
    isError.value = true
    hint.value = err instanceof ApiError ? err.message : '新增失败'
  } finally {
    busy.value = false
  }
}

async function onSave(row) {
  busy.value = true
  hint.value = ''
  isError.value = false
  try {
    await ensureCsrf()
    await updateAdminCategory(row.id, {
      name: row._name.trim(),
      sort_order: row._sort,
    })
    hint.value = '已保存'
    await load()
  } catch (err) {
    isError.value = true
    hint.value = err instanceof ApiError ? err.message : '保存失败'
  } finally {
    busy.value = false
  }
}

async function onDelete(row) {
  if (!window.confirm(`删除分类「${row.name}」？分类下仍有工具时会被拒绝。`)) {
    return
  }
  busy.value = true
  hint.value = ''
  isError.value = false
  try {
    await ensureCsrf()
    await deleteAdminCategory(row.id)
    hint.value = '已删除'
    await load()
  } catch (err) {
    isError.value = true
    hint.value = err instanceof ApiError ? err.message : '删除失败'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.page-title {
  margin-bottom: var(--sp-4);
  font-size: clamp(26px, 3.4vw, 38px);
  font-weight: 600;
}

.form {
  margin-bottom: var(--sp-4);
}

.form__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th,
.table td {
  padding: 10px 8px;
  border-bottom: 1px solid var(--line-1);
  text-align: left;
  vertical-align: middle;
}

.table th {
  color: var(--tx-3);
  font-weight: 400;
}

.inline {
  min-width: 140px;
  height: 40px;
}

.narrow {
  width: 88px;
  min-width: 88px;
}

.actions {
  display: flex;
  gap: var(--sp-3);
  white-space: nowrap;
}

.linkish {
  color: var(--brand);
  font-size: 13px;
}

.linkish.danger {
  color: var(--danger);
}
</style>
