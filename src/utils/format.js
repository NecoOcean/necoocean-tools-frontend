/**
 * 时间与文件大小格式化。不引入第三方库。
 */

export function formatDateTime(iso) {
  if (!iso) {
    return '—'
  }
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function formatBytes(bytes) {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n < 0) {
    return '—'
  }
  if (n < 1024) {
    return `${n} B`
  }
  const units = ['KB', 'MB', 'GB']
  let value = n
  let i = -1
  do {
    value /= 1024
    i += 1
  } while (value >= 1024 && i < units.length - 1)
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}
