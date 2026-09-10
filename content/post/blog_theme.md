+++
keywords = ["hugo", "theme", "comments"]
title = "博客theme修改记录"
categories = ["others"]
comments = true
clearReading = true
date = 2020-12-13T21:40:30+08:00 
showSocial = false
showPagination = true
showTags = true
showDate = true
+++


### blog theme修改记录 

之前blog theme相关修改的代码丢失了， 需要重新配置一下，顺手记录一下

博客由hugo生成，关于hugo看[这里](https://gohugo.io/)

hugo主题使用[hugo-tranquilpeak-theme](https://github.com/kakawait/hugo-tranquilpeak-theme)

#### 评论设置

hugo-tranquilpeak-theme 默认使用 Disqus，本站改用基于 GitHub Discussions 的 [Giscus](https://giscus.app/zh-CN)。评论按文章路径关联，并通过仓库的 Announcements 分类统一管理。

```html
layouts/partials/post/giscus.html

<script src="https://giscus.app/client.js"
        data-repo="ThinkMo/thinkmo.github.io"
        data-mapping="pathname"
        data-theme="preferred_color_scheme"
        data-lang="zh-CN"
        crossorigin="anonymous"
        async>
</script>
```

#### 浏览统计

浏览统计使用的是[不蒜子](https://www.busuanzi.cc/)

修改hugo配置文件config.toml在[params]下添加相关js

```
  [[params.customJS]]
    src = "https://cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js"
```

修改layouts/partials/footer.html在copyright下添加

```
  <div class="busuanzi-count">
    <span class="site-uv">
      <i class="fa fa-user"></i>
      <span class="busuanzi-value" id="busuanzi_site_uv"></span>
    </span>
    <span class="site-pv">
      <i class="fa fa-eye"></i>
      <span class="busuanzi-value" id="busuanzi_site_pv"></span>
    </span>
  </div>
```
