import { del, get, post, put } from './http'
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

export function listAdminMessages(query = {}) {
  return get('/api/v1/admin/messages', query)
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

export const adminGet = get
export const adminPost = post
export const adminPut = put
export const adminDel = del
