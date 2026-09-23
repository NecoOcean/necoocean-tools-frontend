/**
 * 计算文件 SHA-256（小写十六进制），供 C-29 回传。
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export async function sha256Hex(blob) {
  const buffer = await blob.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * 从文件名取扩展名（不含点，小写）。
 * @param {string} name
 */
export function fileExt(name) {
  const i = name.lastIndexOf('.')
  if (i < 0 || i === name.length - 1) {
    return ''
  }
  return name.slice(i + 1).toLowerCase()
}
