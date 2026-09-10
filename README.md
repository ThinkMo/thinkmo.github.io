# 平凡世界

个人技术博客，使用 [Hugo](https://gohugo.io/) 和 Tranquilpeak 主题构建。

站点地址：<https://thinkmo.github.io/>

## 目录结构

- `content/`：文章和独立页面
- `static/`：图片等静态资源
- `themes/hugo-tranquilpeak-theme/`：站点主题
- `config.toml`：Hugo 配置
- `scripts/check_site.py`：构建结果检查脚本
- `.github/workflows/hugo.yaml`：GitHub Pages 构建和部署工作流

## 本地预览

安装 Hugo `0.166.0`，然后运行：

```sh
hugo server
```

访问 <http://localhost:1313/> 查看站点。

## 构建与检查

```sh
hugo --gc --minify --panicOnWarning
python scripts/check_site.py public
```

检查脚本使用 Python 3 标准库，验证生成页面、站内链接、静态资源和 canonical URL。

## 发布

推送到默认分支后，GitHub Actions 自动构建并发布到 GitHub Pages。Pull Request 会执行相同的构建检查，但不会部署。

构建产物位于 `public/`，由 Actions 生成，无需提交到仓库。
