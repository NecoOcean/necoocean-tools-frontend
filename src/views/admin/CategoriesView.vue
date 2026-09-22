<template>
  <div>
    <header class="head">
      <div>
        <h1 class="admin-page-title">分类管理</h1>
        <p class="admin-page-sub">维护工具分类名称与排序，供前台筛选使用</p>
      </div>
    </header>

    <form class="form-card" @submit.prevent="onCreate">
      <div class="form-row">
        <input v-model="name" class="admin-input" type="text" maxlength="50" placeholder="分类名称" required />
        <input v-model.number="sortOrder" class="admin-input narrow" type="number" placeholder="排序" />
        <button class="admin-btn" type="submit" :disabled="busy">新增</button>
      </div>
    </form>

    <p v-if="hint" class="admin-state" :class="{ 'is-error': isError }">{{ hint }}</p>
    <p v-if="loading" class="admin-state">加载中…</p>
    <div v-else class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>排序</th>
            <th>工具数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in categories" :key="row.id">
            <td>
              <input v-model="row._name" class="admin-input inline" type="text" maxlength="50" />
            </td>
            <td>
              <input v-model.number="row._sort" class="admin-input inline narrow" type="number" />
            </td>
            <td>{{ row.tool_count ?? 0 }}</td>
            <td class="actions">
              <button type="button" class="admin-link btn" :disabled="busy" @click="onSave(row)">保存</button>
              <button type="button" class="admin-link btn danger" :disabled="busy" @click="onDelete(row)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="!loading && categories.length === 0" class="admin-state">暂无分类</p>
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
.head {
  margin-bottom: 22px;
}

.form-card {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: var(--ad-radius);
  background: var(--ad-panel);
  border: 1px solid var(--ad-line);
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.narrow {
  width: 120px;
  flex: 0 0 auto;
}

.inline {
  height: 38px;
  min-width: 140px;
}

.actions {
  display: flex;
  gap: 14px;
  white-space: nowrap;
}

.btn {
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  font: inherit;
}

.btn.danger {
  color: var(--ad-danger);
}
</style>
