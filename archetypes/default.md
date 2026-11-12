+++
title = "{{ replace .File.ContentBaseName "-" " " | title }}"
date = {{ .Date }}
description = ""
# 分类可自由新建;当前已上线:projects / llm / k8s
# 新分类建议同步创建 content/categories/<分类名>/_index.md 定义显示名
categories = ["projects"]
# 缩略图默认取正文第一张图片。
# 如需单独指定封面,把图片放进当前页面包,再取消下面注释:
# [resources]
#   name = "featuredImage"
#   src = "images/cover.png"
# [resources.params]
#   description = "封面说明"
+++
