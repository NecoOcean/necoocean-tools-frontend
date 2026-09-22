import { del, get, patch, post, put } from './http'
import { readCsrfToken } from '../utils/csrf'

/**
 * 种下 csrf_token。未登录时 /me 返回 401 属预期，只关心 Set-Cookie。
 */
export async function ensureCsrf() {
  if (readCsrfToken()) {
    return
  }
  await fetch('/api/v1/admin/me', { credentials: 'include' }).catch(() => {})
}

export function login(username, password) {
  return post('/api/v1/admin/login', { username, password })
}

export function logout() {
  return post('/api/v1/admin/logout', {})
}

export function me() {
  return get('/api/v1/admin/me')
}

export function listAdminTools(query = {}) {
  return get('/api/v1/admin/tools', query)
}

export function getAdminTool(id) {
  return get(`/api/v1/admin/tools/${id}`)
}

export function createAdminTool(body) {
  return post('/api/v1/admin/tools', body)
}

export function updateAdminTool(id, body) {
  return put(`/api/v1/admin/tools/${id}`, body)
}

export function patchToolStatus(id, status) {
  return patch(`/api/v1/admin/tools/${id}/status`, { status })
}

export function deleteAdminTool(id) {
  return del(`/api/v1/admin/tools/${id}`)
}

export function listAdminCategories() {
  return get('/api/v1/admin/categories')
}

export function createAdminCategory(body) {
  return post('/api/v1/admin/categories', body)
}

export function updateAdminCategory(id, body) {
  return put(`/api/v1/admin/categories/${id}`, body)
}

export function deleteAdminCategory(id) {
  return del(`/api/v1/admin/categories/${id}`)
}

export function getAdminSettings() {
  return get('/api/v1/admin/settings')
}

export function updateAdminSettings(body) {
  return put('/api/v1/admin/settings', body)
}

/**
 * 触发导出下载（C-42）。走 fetch + Blob，以便携带会话 Cookie。
 */
export async function downloadExport({ type = 'all', format = 'json', includeEmail = false } = {}) {
  const url = exportData({
    type,
    format,
    include_email: includeEmail ? 'true' : 'false',
  })
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    let message = `导出失败 HTTP ${response.status}`
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const envelope = await response.json()
      if (envelope?.message) {
        message = envelope.message
      }
    }
    throw new Error(message)
  }
  const blob = await response.blob()
  const disposition = response.headers.get('content-disposition') || ''
  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(disposition)
  const filename = match ? decodeURIComponent(match[1]) : `export.${format === 'csv' ? 'csv' : format === 'json' ? 'json' : 'zip'}`
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}

export function createUploadTicket(toolId, body) {
  return post(`/api/v1/admin/tools/${toolId}/files/upload-ticket`, body)
}

export function completeUpload(fileId, body) {
  return post(`/api/v1/admin/files/${fileId}/complete`, body)
}

export function deleteAdminFile(fileId) {
  return del(`/api/v1/admin/files/${fileId}`)
}

export function listAdminReleaseNotes(toolId, query = {}) {
  return get(`/api/v1/admin/tools/${toolId}/release-notes`, query)
}

export function createReleaseNote(toolId, body) {
  return post(`/api/v1/admin/tools/${toolId}/release-notes`, body)
}

export function deleteReleaseNote(id) {
  return del(`/api/v1/admin/release-notes/${id}`)
}

export function listAdminMessages(query = {}) {
  return get('/api/v1/admin/messages', query)
}

export function getAdminMessage(id) {
  return get(`/api/v1/admin/messages/${id}`)
}

export function replyAdminMessage(id, content) {
  return post(`/api/v1/admin/messages/${id}/replies`, { content })
}

export function patchMessageStatus(id, status) {
  return patch(`/api/v1/admin/messages/${id}/status`, { status })
}

export function exportData(query = {}) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      params.set(k, String(v))
    }
  })
  const qs = params.toString()
  return `/api/v1/admin/export${qs ? `?${qs}` : ''}`
}
