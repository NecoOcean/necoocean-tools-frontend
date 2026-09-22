/**
 * CSRF 双提交。
 * 后端实际 Cookie / 头名为 csrf_token 与 X-CSRF-Token
 *（架构说明里的 XSRF-TOKEN / X-XSRF-TOKEN 已按落地实现对齐）。
 */
const CSRF_COOKIE = 'csrf_token'

export function readCsrfToken() {
  const parts = document.cookie ? document.cookie.split(';') : []
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.startsWith(`${CSRF_COOKIE}=`)) {
      return decodeURIComponent(trimmed.slice(CSRF_COOKIE.length + 1))
    }
  }
  return null
}

export const CSRF_HEADER = 'X-CSRF-Token'
