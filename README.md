# ZiYang｜商业增长工作室

这是 ZiYang 的蓝白色 3D 商业增长网站。网站为静态页面，部署到 GitHub Pages 后，每次更新主分支都会自动发布。

## 一起编辑

- 页面文案与结构：`dist/index.html`
- 视觉样式与响应式布局：`dist/assets/site.css`
- 3D 场景、鼠标互动与滚动动画：`dist/assets/site.js`

你可以直接在 GitHub 中编辑这些文件，也可以告诉我想改什么，我会完成修改并同步发布。

## 发布方式

首次创建 GitHub 仓库后，请在 **Settings → Pages** 中把 Source 设为 **GitHub Actions**。

`.github/workflows/deploy-pages.yml` 会在每次推送到 `main` 时，将 `dist` 文件夹发布为网站。GitHub Actions 完成后，可在仓库的 Actions 页面查看部署状态和公开网址。
