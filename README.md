# 平凡世界

Hugo 博客源码，目标地址：<https://thinkmo.github.io/>。

## 本地运行

安装 Hugo **0.166.0**（标准版即可），然后运行：

```sh
hugo server
```

生产构建与检查：

```sh
hugo --gc --minify --panicOnWarning
python scripts/check_site.py public
```

检查脚本只使用 Python 3 标准库。文章位于 `content/`，图片位于 `static/images/`，主题源码及编译好的 CSS/JS 位于 `themes/hugo-tranquilpeak-theme/`，日常写作无需 Node.js、npm 或 Sass。

## GitHub Pages

仓库名称必须为 `ThinkMo/thinkmo.github.io`。在 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**，清空旧自定义域名，启用 HTTPS。

`.github/workflows/hugo.yaml` 在 `master` 或 `main` 的推送、PR 以及手动触发时构建。PR 只验证；只有默认分支能够部署。构建后使用官方 Pages artifact 上传、部署，`public/` 无需提交，也无需 `gh-pages` 分支、跨仓库 PAT 或部署密钥。

工作流固定 Hugo 版本和 SHA256，并将官方 Actions 固定到完整提交 SHA；Dependabot 每月检查 Actions 更新。升级 Hugo 时同时更新工作流中的 `HUGO_VERSION`、`HUGO_SHA256` 和本文版本，并先运行上述构建检查。

## 迁移说明

- 本仓库合并了 `forfreedom` 的发布历史与 `forfreedom-source` 的源码历史；没有重写历史。
- 原发布库末次提交：`a3ffc19`；迁入的源码提交：`9623b4e`。
- 沿用 Tranquilpeak 外观和 `/:year/:month/:slug/` 文章路径。更新了作者信息、分页、语言和评论服务配置以兼容 Hugo 0.166.0。
- 已移除旧 Universal Analytics UA 配置及异步模板调用；如需统计，在 `[services.googleAnalytics]` 中配置有效的 GA4 `id`。原 Disqus 配置保留。
- `content/post/recovered-*.md` 中的 8 篇文章从旧发布库恢复了 HTML 正文，因源码库历史中没有原 Markdown。它们仍通过 Hugo 使用统一主题渲染，并保留原 URL。
- 两个旧 kubelet 文章地址通过 Hugo aliases 指向现有的上篇文章。
- 修复了简历图片相对路径、Swagger 官网链接和不存在的 favicon 路径；favicon 使用已有 GitHub 头像。
- 原有外部 CDN、图片和评论服务仍依赖其提供商。检查脚本验证本地链接，不保证外部服务可用。

首次部署成功并验证页面后，再按需要归档 `forfreedom-source`。原生成页面仍可通过 Git 历史检出用于回退。

参考：[Hugo GitHub Pages 指南](https://gohugo.io/host-and-deploy/host-on-github-pages/)、[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
