import { get, post } from './http'

/** C-01 工具列表 */
export function listTools(query = {}) {
  return get('/api/v1/public/tools', query)
}

/** C-02 工具详情 */
export function getTool(slug) {
  return get(`/api/v1/public/tools/${encodeURIComponent(slug)}`)
}

/** C-03 更新日志 */
export function listReleaseNotes(slug, query = {}) {
  return get(`/api/v1/public/tools/${encodeURIComponent(slug)}/release-notes`, query)
}

/** C-04 文件列表 */
export function listFiles(slug) {
  return get(`/api/v1/public/tools/${encodeURIComponent(slug)}/files`)
}

/** C-04b 留言状态 */
export function getMessageStatus(id) {
  return get(`/api/v1/public/messages/${id}/status`)
}

/** C-06 留言列表 */
export function listMessages(slug, query = {}) {
  return get(`/api/v1/public/tools/${encodeURIComponent(slug)}/messages`, query)
}

/** C-07 提交留言（公开写，豁免 CSRF） */
export function submitMessage(slug, body) {
  return post(`/api/v1/public/tools/${encodeURIComponent(slug)}/messages`, body)
}

/** C-08 站点信息 */
export function getSiteInfo() {
  return get('/api/v1/public/site-info')
}

/** C-05 下载入口：整页跳转，由后端 302 */
export function downloadUrl(fileId) {
  return `/download/${encodeURIComponent(fileId)}`
}
