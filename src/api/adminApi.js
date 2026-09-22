import { del, get, post, put } from './http'

/** 先拉 /me 以种下 csrf_token，再登录。 */
export async function ensureCsrf() {
  try {
    await get('/api/v1/admin/me')
  } catch {
    // 未登录会 401，Cookie 仍应已下发
  }
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

// 其余后台接口随页面推进再补；此处预留入口避免多处散落 fetch。
export const adminGet = get
export const adminPost = post
export const adminPut = put
export const adminDel = del
