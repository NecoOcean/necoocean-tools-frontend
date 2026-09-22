import { CSRF_HEADER, readCsrfToken } from '../utils/csrf'

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/**
 * 业务错误。携带后端 code 与 message。
 */
export class ApiError extends Error {
  constructor(code, message, httpStatus) {
    super(message || '请求失败')
    this.name = 'ApiError'
    this.code = code
    this.httpStatus = httpStatus
  }
}

/**
 * 唯一发请求入口：统一信封、credentials、写请求 CSRF。
 * @param {string} path 以 / 开头的路径
 * @param {RequestInit & { json?: unknown }} [options]
 */
export async function request(path, options = {}) {
  const { json, headers: extraHeaders, ...rest } = options
  const method = (rest.method || 'GET').toUpperCase()
  const headers = new Headers(extraHeaders || {})

  if (json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (WRITE_METHODS.has(method)) {
    const token = readCsrfToken()
    if (token) {
      headers.set(CSRF_HEADER, token)
    }
  }

  const response = await fetch(path, {
    credentials: 'include',
    ...rest,
    method,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  })

  // 下载 302 等非 JSON 场景由调用方自行处理；此处只处理 API 信封。
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new ApiError(response.status, `HTTP ${response.status}`, response.status)
    }
    return response
  }

  const envelope = await response.json()
  if (envelope.code !== 0) {
    if (envelope.code === 40100 || envelope.code === 40101) {
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.assign('/admin/login')
      }
    }
    throw new ApiError(envelope.code, envelope.message, response.status)
  }
  return envelope.data
}

export function get(path, query) {
  const url = withQuery(path, query)
  return request(url)
}

export function post(path, json) {
  return request(path, { method: 'POST', json })
}

export function put(path, json) {
  return request(path, { method: 'PUT', json })
}

export function patch(path, json) {
  return request(path, { method: 'PATCH', json })
}

export function del(path) {
  return request(path, { method: 'DELETE' })
}

function withQuery(path, query) {
  if (!query) {
    return path
  }
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }
    params.set(key, String(value))
  })
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}
