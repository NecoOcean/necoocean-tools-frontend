# necoocean-tools-frontend

NecoOcean 个人工具展示站的**前端仓库**（Vue 3 + Vite）。与后端、文档仓库分离；接口契约以文档仓库附录 C 为准，本仓库不另立接口定义。

## 约束

- 首屏 gzip 后 ≤163 KB（JS ≤130 / CSS ≤15）
- 不引入 Pinia、UI 组件库、动画库、webfont
- Cookie Session + CSRF 双提交；请求一律 `credentials: 'include'`
- CSRF Cookie / 头与后端一致：`csrf_token` / `X-CSRF-Token`
- D-7：一期不启用全站背景图，纯色底

## 本机开发

```bash
npm install
npm run dev
```

默认 `http://127.0.0.1:5173`，Vite 将 `/api` 与 `/download` 代理到 `http://127.0.0.1:8080`。需先启动后端。

## 构建

```bash
npm run build
```

产物在 `dist/`。服务器不装 Node，本地构建后上传，由 Nginx 同源分发。

## 目录

见文档仓库《前后端分离架构说明》§4.2。
