# 新境世界

个人门户与博客，使用 [Hugo](https://gohugo.io/) 和 [Noesis](https://github.com/josephhutch/noesis) 主题构建。

主站部署在腾讯云：<https://sunflw.com/>。GitHub Pages 镜像：<https://thinkmo.github.io/>。

## 目录结构

- `content/`：文章和独立页面
  - `content/_index.md`：首页（个人定位）
  - `content/categories/`：话题页标题（K8s / LLM / Projects）
  - `content/post/`：博客文章
- `static/`：图片等静态资源
- `themes/noesis/`：站点主题（vendored；已移除上游 `exampleSite/` 与 `.github/`，仅为精简仓库体积，不影响构建）
- `hugo.toml`：Hugo 配置
- `assets/css/override.css`：项目级样式覆盖
- `layouts/`：项目级模板覆盖（见下文）
- `scripts/check_site.py`：构建结果检查脚本
- `.github/workflows/hugo.yaml`：GitHub Pages 构建和部署工作流

带本地图片的文章使用 Hugo 页面包：正文存放在
`content/post/<article-slug>/index.md`，图片存放在同目录的 `images/` 中，
Markdown 使用 `images/<filename>` 相对路径引用。

## 文章缩略图规则

首页卡片和文章页底部的“下一篇文章”卡片共用
`layouts/_partials/card-cover.html`，封面来源优先级为：

1. `featuredImage` 资源（页面包内显式指定的封面）
2. 正文第一张 Markdown 图片
3. 分类封面 `assets/covers/<分类>.svg`
4. 默认封面 `assets/covers/default.svg`

新建文章时最简单的做法是使用页面包，并在正文里放一张图：

```text
content/post/my-article/
  index.md
  images/cover.png
```

```markdown
![文章配图](images/cover.png)
```

第一张正文图片会自动成为首页和“下一篇文章”的缩略图；也可以直接引用
`/images/foo.png` 静态图片或外链图片。若想单独指定缩略图，在页面包里放
图片并在 front matter 中命名：

```toml
[resources]
  name = "featuredImage"
  src = "images/cover.png"

[resources.params]
  description = "封面说明"
```

封面默认也会展示在文章正文前；若只用作列表缩略图（例如正文已有同画面视频），
在 front matter 设置 `hideFeaturedImage = true` 即可隐藏正文前的重复大图。

## 内容发布范围

当前发布 `k8s`、`llm`、`projects` 三个分类的文章。其他文章仍保留在
Git 仓库中，但 front matter 使用下面的配置让 Hugo 构建时直接忽略，
不生成页面、不进入文章列表和话题页：

```toml
[build]
  render = false
  list = false
  publishResources = false
```

被有意下线的旧文章 URL 记录在 `scripts/retired-paths.txt`，检查脚本会
确认它们没有被发布；仍需保留的旧 URL 记录在 `scripts/legacy-paths.txt`。

## 新建分类

分类可以自由新建（上文三个只是当前启用的），步骤：

1. 新建 `content/categories/<分类名>/_index.md`，定义话题的显示名：

   ```toml
   +++
   title = "SRE"
   +++
   ```

   没有这个文件也能工作，但话题名会被自动转成首字母大写的形式（如
   `sre` 显示为 `Sre`）。

2. 新文章的 front matter 写 `categories = ["<分类名>"]`。

3. 可选：补一张 `assets/covers/<分类名>.svg` 分类封面；没有的话文章
   无图时自动回退到 `assets/covers/default.svg`。

新分类会自动出现在顶部导航、首页侧栏"话题"、页脚（排在
Projects/LLM/K8s 三个置顶话题之后），无需改任何模板。置顶顺序如需
调整，改 `layouts/_partials/nav-bar.html`、`layouts/home.html`、
`layouts/_partials/footer.html` 中的 `$topics := slice ...` 列表。

## 本地覆盖清单（升级主题时需对照上游）

以下文件覆盖了主题同名模板，升级 `themes/noesis` 后请 diff 上游版本再同步改动：

- `layouts/_partials/nav-bar.html`：导航顺序（Home → 话题 → 友情链接 → rss），话题按 Projects/LLM/K8s 置顶、新分类自动追加
- `layouts/_partials/footer.html`：页脚品牌、版权/备案信息与导航顺序（话题排序同上）
- `layouts/home.html`：首页中文化（侧栏标签、分页文案、默认"最新文章"）
- `layouts/page.html`：文章页日期格式 `2006-01-02`、"目录"标题、阅读计数（不蒜子）
- `layouts/_partials/card-cover.html`：首页与“下一篇文章”共用的封面解析逻辑
- `layouts/li.html` / `layouts/li-next.html`：卡片日期格式与"阅读全文"文案，共用上述封面规则
- `assets/covers/`：各分类极简 SVG 封面，新增分类时补充同名文件即可
- `layouts/_partials/disqus.html`：用 Giscus 替换 Disqus（参数需与
  `scripts/check_site.py` 校验项保持一致）
- `layouts/_partials/meta-tags.html`：注入不蒜子统计脚本及首页搜索引擎验证标签
- `layouts/robots.txt`：开放抓取并声明站点地图地址
- `assets/css/override.css`：首页内容区、评论区与页脚样式

## 本地预览

安装 Hugo `0.166.0` **extended** 版（Noesis 的 WebP 图片管线需要 extended），然后运行：

```sh
hugo server
```

访问 <http://localhost:1313/> 查看站点。

## 构建与检查

```sh
hugo --gc --minify --panicOnWarning
python scripts/check_site.py public
```

检查脚本使用 Python 3 标准库，验证生成页面、站内链接、静态资源、canonical URL、站点地图入口、
Giscus 配置，`scripts/legacy-paths.txt` 中仍需保留的旧文章 URL 是否存在，
以及 `scripts/retired-paths.txt` 中已下线的旧文章 URL 是否确实没有发布。

## 发布

腾讯云主站使用「构建与检查」生成的 `public/`，发布到 `sunflw.com` 对应的站点目录。

推送到默认分支后，GitHub Actions 使用 Hugo extended `0.166.0` 构建并发布 GitHub Pages 镜像。
Pull Request 会执行构建检查。两个站点共用 `hugo.toml` 的 `baseURL`，页面 canonical、站点地图和抓取入口均指向腾讯云主站。构建产物无需提交到仓库。

## 搜索引擎收录

Hugo 自动生成 `sitemap.xml`，`robots.txt` 指向 `https://sunflw.com/sitemap.xml`。

1. 在 [Google Search Console](https://search.google.com/search-console) 为 `sunflw.com` 添加「网域」资源。在 DNSPod 为主机记录 `@` 添加 Google 给出的完整 TXT 记录。解析生效后回到 Search Console 验证，并保留 TXT 记录。
2. 在 [百度搜索资源平台](https://ziyuan.baidu.com/) 添加 `https://sunflw.com/`，选择 HTML 标签验证。将标签的 `content` 值填入 `hugo.toml` 的 `[params.searchVerification]` → `baidu`，发布到腾讯云后完成验证。若 Google 使用「网址前缀」资源的 HTML 标签验证，填写同一节的 `google`。
3. 腾讯云发布后，在 Google 的「站点地图」和百度的「资源提交 → 普通收录」提交 `https://sunflw.com/sitemap.xml`。百度的提交方式以账号后台开放的选项为准。
