import { icon } from './icons.js';
import { chapters, faqs, glossary } from './course-data.js?v=20261112-19';
import { guideStep, materialChecklist } from './verification-view.js?v=20261112-19';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const e = escapeHtml;
export const href = (page, chapter) => `?page=${page}${chapter ? `&chapter=${chapter}` : ''}`;
const link = (page, label, className = 'text-link', chapter) => `<a class="${className}" data-route href="${href(page,chapter)}">${label}</a>`;
export function navigation(route) {
  return `<header class="site-nav">
    <a class="brand" data-route href="?page=home"><i class="brand-mark">${icon('robot')}</i>sesame<span>制作工坊</span></a>
    <nav class="nav-links" aria-label="主导航">
      ${[['home','学习总览'],['course','制作课程'],['videos','实拍视频'],['tools','烧录与调试']].map(([page,label]) => link(page,label,`nav-item ${route.page === page ? 'active' : ''}`,page === 'course' ? route.chapter || '01' : null)).join('')}
    </nav>
    <form class="search-form" role="search"><label class="sr-only" for="search">搜索课程和问题</label><input id="search" name="q" type="search" placeholder="搜索课程或问题" value="${route.page === 'search' ? e(route.query) : ''}"><button type="submit" aria-label="搜索">${icon('arrow')}</button></form>
    <button class="icon-button mobile-menu" aria-expanded="false" aria-controls="sidebar" aria-label="打开课程目录">${icon('book')}</button>
  </header>`;
}
export function sidebar(route) {
  return `<aside id="sidebar" class="course-sidebar">
    ${link('home',`${icon('grid')} 学习总览`,`side-row ${route.page === 'home' ? 'active' : ''}`)}
    <nav aria-label="课程章节">${chapters.map(ch => `<a data-route class="side-chapter ${route.page === 'course' && route.chapter === ch.id ? 'active' : ''}" href="${href('course',ch.id)}" ${route.page === 'course' && route.chapter === ch.id ? 'aria-current="page"' : ''}><span class="side-number">${ch.id}</span>${e(ch.title)}${ch.pending?'<span class="side-tbd">TBD</span>':''}</a>`).join('')}</nav>
    <p class="side-caption">制作时随手查</p>
    ${[['materials','box','物料清单'],['printing','download','打印件下载'],['faq','book','排障与术语'],['downloads','file','程序与资料']].map(([page,name,label]) => link(page,`${icon(name)} ${label}`,`side-row ${route.page === page ? 'active' : ''}`)).join('')}
    <div class="side-device"><strong>LOLIN S2 Mini</strong><p>ESP32-S2 / 原生 USB</p>${link('tools',`打开设备工作台 ${icon('arrow')}`)}</div>
  </aside>`;
}
export function home(study) {
  const current = chapters.find(ch => ch.id === study.lastChapter) || chapters[0];
  return `<section class="studio-hero"><div class="studio-copy">
    <h1>从零制作你的<br>四足机器人</h1>
    <p>从物料清单开始，逐步完成组装焊接、调试、完成自己的一个DIY四足机器人，整体成本在200以内。</p>
    <div class="facts"><span>${icon('book')} 7 章图文 · 第 8 章待完成</span><span>${icon('chip')} ESP32-S2</span></div>
    <div class="actions">${link('course',`${study.lastChapter !== '01' ? '继续制作' : '开始制作'} ${icon('arrow')}`,'button',current.id)}<button class="button quiet" data-video="intro">${icon('play')} 看看它会什么</button></div>
    </div><div class="studio-art"><img src="assets/images/robot-sticker.webp" alt="橙色 Sesame 四足机器人"></div></section>
    <section class="section-space"><div class="header-line"><h2>材料和图纸，准备在手边</h2>${link('downloads','查看全部资料 '+icon('arrow'))}</div><div class="resource-shortcuts">${link('materials',`${icon('box')}<div><h3>核对实购物料</h3><p>型号、数量与原始采购备注</p></div>`,'resource-shortcut')}${link('printing',`${icon('download')}<div><h3>下载基础 11 件套</h3><p>15 个 STL，顶盖三选一</p></div>`,'resource-shortcut')}${link('videos',`${icon('play')}<div><h3>查看实拍视频</h3><p>原版演示、接线测量与遥控参考</p></div>`,'resource-shortcut')}</div></section>`;
}
const videoCard = video => `<button class="video-card" data-video="${e(video.id)}"><div class="video-poster"><img src="${e(video.poster)}" alt="${e(video.title)}" loading="lazy"><span class="video-play">${icon('play')}</span><span class="video-time">${Math.floor(video.duration / 60)}:${String(Math.round(video.duration % 60)).padStart(2,'0')}</span></div><h3>${e(video.title)}</h3><p>${e(video.description)}</p></button>`;
const tbdPanel = () => `<section class="tbd-panel">
  <svg class="tbd-route" viewBox="0 0 320 120" aria-hidden="true">
    <path class="tbd-path" d="M16 96C80 96 96 24 160 24s80 72 144 72"/>
    <circle class="tbd-node" cx="16" cy="96" r="6"/>
    <circle class="tbd-node mid" cx="160" cy="24" r="5"/>
    <circle class="tbd-node goal" cx="304" cy="96" r="6"/>
    <path class="tbd-flag" d="M304 90V64l14 5-14 5"/>
    <circle class="tbd-rover" r="4"/>
  </svg>
  <div class="tbd-copy"><span class="tag pending-tag">待完成 · TBD</span><h2>本章内容正在整理</h2><p>自动寻路训练的制作与验证流程完成后，会在这里发布；当前暂无链接。先完成前七章，让机器人稳稳地站起来、走起来。</p></div>
</section>`;
const finishLine = study => {
  const done = !!study.verified['build-done'];
  return `<div class="finish-line${done?' done':''}">
    <div class="finish-head"><span class="finish-cup" aria-hidden="true"><svg viewBox="0 0 24 24"><path class="steam steam-a" d="M9 2.5c-.7 1 .7 1.7 0 2.7"/><path class="steam steam-b" d="M13 2.5c-.7 1 .7 1.7 0 2.7"/><path d="M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z"/><path d="M16 10h1.5a3 3 0 0 1 0 6H16"/><path d="M5 22.5h10"/></svg></span>
      <div>${done?'<h3>恭喜，复刻完成！</h3>':''}<p>${done?'从一堆打印件到一台会走、会挥手的小机器人，你做到了。':'整机验收通过后，勾选下面这一项，为这次制作收尾。'}</p></div></div>
    <label class="verified-row finish-confirm"><input type="checkbox" data-verified="build-done" ${done?'checked':''}>我已完成整机验收，复刻完毕</label>
    ${done?`<div class="coffee-card"><p class="coffee-ask">如果这份教材帮到了你，愿意的话请作者喝杯咖啡。</p>
      <div class="coffee-qr-grid">
        <figure class="qr-card alipay"><button class="image-expand" data-image="assets/images/coffee-alipay.webp?v=20261112-19" data-caption="支付宝收款码" aria-label="放大支付宝收款码"><img src="assets/images/coffee-alipay.webp?v=20261112-19" alt="支付宝收款码" loading="lazy"></button><figcaption><i class="qr-dot"></i>支付宝 · 扫一扫</figcaption></figure>
        <figure class="qr-card wechat"><button class="image-expand" data-image="assets/images/coffee-wechat.webp?v=20261112-19" data-caption="微信收款码" aria-label="放大微信收款码"><img src="assets/images/coffee-wechat.webp?v=20261112-19" alt="微信收款码" loading="lazy"></button><figcaption><i class="qr-dot"></i>微信支付 · 扫一扫</figcaption></figure>
      </div>
      <p class="coffee-note">完全自愿，金额随意，不扫码也不影响任何内容。点击二维码可放大后扫码。</p></div>`:''}
  </div>`;
};
export function course(route, study, media, materialRows = [], workbenchHtml = '') {
  const chapter = chapters.find(ch => ch.id === route.chapter) || chapters[0];
  const index = chapters.indexOf(chapter);
  const steps = chapter.steps.map((step,i)=>step.finish?`<section class="chapter-step" id="step-${i+1}"><div class="step-heading"><span class="side-number">${String(i+1).padStart(2,'0')}</span><h2>${e(step.title)}</h2></div>${finishLine(study)}</section>`:guideStep(step,i,e,step.materialTable?materialChecklist(materialRows,study,e):step.workbench?workbenchHtml:'')).join('');
  return `<div class="breadcrumb">制作课程 / 第 ${chapter.id} 章</div><div class="chapter-title"><h1>${e(chapter.title)}</h1><p>${e(chapter.summary)}</p></div>
    <div class="course-grid"><article class="chapter-article">
      ${!['01','02'].includes(chapter.id) && !chapter.pending ? `<section class="learning-goal"><h2>这一章，完成什么</h2><p>${e(chapter.goal)}</p><details><summary>准备材料与工具</summary><ul>${chapter.materials.map(item=>`<li>${e(item)}</li>`).join('')}</ul></details></section>` : ''}
      ${chapter.concept ? `<section class="concept"><h2>${e(chapter.concept.title)}</h2><p>${e(chapter.concept.text)}</p></section>` : ''}
      ${!['01','02','03'].includes(chapter.id) && chapter.warnings.length ? `<section class="notice"><h2>操作前核对</h2><ul>${chapter.warnings.map(text=>`<li>${e(text)}</li>`).join('')}</ul></section>` : ''}
      ${chapter.pending?tbdPanel():steps}
      ${chapter.videos.length ? `<section class="section-space"><h2>参考视频</h2><p class="video-reference-note">实拍视频仅作制作过程参考。</p><div class="video-grid compact">${chapter.videos.map(id=>media.find(v=>v.id===id)).filter(Boolean).map(videoCard).join('')}</div></section>` : ''}
      <section class="chapter-next"><div>${index ? link('course',`上一章 ${e(chapters[index-1].title)}`,'text-link',chapters[index-1].id) : ''}</div><div>${index < chapters.length - 1 ? link('course',`下一章 ${e(chapters[index+1].title)} ${icon('arrow')}`,'button',chapters[index+1].id) : link('tools','前往烧录与调试 '+icon('arrow'),'button')}</div></section>
      ${chapter.source.length?`<details class="source-details"><summary>本章资料来源</summary>${chapter.source.map(source=>`<a href="${e(source.path)}" target="_blank" rel="noopener">${e(source.label)}</a>`).join('')}<p>课程按原仓库 dorianborian/sesame-robot 的组装指南整理，原仓库可能继续更新。</p></details>`:''}
    </article><aside class="check-panel">${chapter.steps.length?`<h2>本章步骤</h2><ol class="step-outline">${chapter.steps.map((step,i)=>`<li><a href="#step-${i+1}"><span>${String(i+1).padStart(2,'0')}</span><span>${e(step.title)}</span></a></li>`).join('')}</ol>`:'<h2>章节状态</h2><p class="side-status">待完成，暂无步骤。</p>'}${['05','06'].includes(chapter.id)?`<a class="button wide" href="#chapter-workbench">${icon('usb')} 本章工作台</a>`:link('tools',`${icon('usb')} 烧录与调试`,'button wide')}<div class="help-line">${link('faq','遇到问题？查查排障指南 '+icon('arrow'))}</div></aside></div>`;
}
export function videos(media) {
  return `<div class="chapter-title"><h1>把制作过程，看得更清楚。</h1><p>实拍视频记录真实的制作过程，仅作参考。</p></div>
    <section class="section-space"><h2>实拍参考</h2><div class="video-grid">${media.map(videoCard).join('')}</div></section>`;
}
export function materials(rows, study) {
  const groups = [...new Set(rows.map(row=>row.category))];
  return `<div class="chapter-title"><h1>先把材料，准备齐。</h1><p>根据你的实购物料清单整理。价格来自原清单记录或商品链接，未标价项留空。</p><a class="text-link" href="assets/materials.pdf" target="_blank" rel="noopener">打开原始 PDF ${icon('arrow')}</a></div>${groups.map(group=>`<section class="material-group"><h2>${e(group)}</h2><div class="table-scroll"><table><thead><tr><th>已有</th><th>物料与规格</th><th>数量</th><th>参考价格</th><th>采购来源</th></tr></thead><tbody>${rows.filter(row=>row.category===group).map(row=>`<tr><td><input type="checkbox" aria-label="已备齐 ${e(row.name)}" data-material="${e(row.id)}" ${study.materials[row.id]?'checked':''}></td><td><strong>${e(row.name)}</strong><p>${e(row.note)}</p></td><td>${e(row.quantity)}</td><td>${row.price ? e(row.price) : '未记录'}</td><td>${row.url?`<a class="text-link" href="${e(row.url)}" target="_blank" rel="noopener">商品链接 ${icon('arrow')}</a>`:'自备／未附链接'}</td></tr>`).join('')}</tbody></table></div></section>`).join('')}<div class="notice"><h2>配套工具</h2><p>另备电烙铁、万用表、剪钳、精密螺丝刀和标签。使用 10440 锂电池时，配套专用充电器需单独核对。螺丝长度按具体孔位试装。</p></div>`;
}
export function printing(parts) {
  return `<div class="chapter-title"><h1>先打印一套身体。</h1><p>8 个关节、内部框架、底盖，加上三选一的顶盖。基础机器人共 11 件。</p><div class="actions"><a class="button" href="assets/basic-11.zip" download>${icon('download')} 下载基础 11 件套</a><a class="button secondary" href="assets/all-stl.zip" download>下载全部 15 个 STL</a>${link('course','查看打印教程 '+icon('arrow'),'text-link','02')}</div></div><div class="print-settings"><span>PLA / PLA+</span><span>8–10% 填充</span><span>2 圈外壁</span><span>顶盖按图加支撑</span></div><div class="resource-list">${parts.map(part=>`<section class="resource-row">${icon('box')}<div><h2>${e(part.name)}</h2><p>${e(part.group)} / ${(part.size/1024).toFixed(0)} KB ${part.basic ? '/ 基础套件' : ''}</p></div><a class="button secondary" href="${e(part.file)}" download>下载 STL ${icon('download')}</a></section>`).join('')}</div><p class="resource-note">基础套件默认采用封闭版 Enclosed v117。猫耳版可替换，无耳版用于自行设计。说明中的旧版号以实际文件名为准。</p>`;
}
export function troubleshooting() {
  return `<div class="chapter-title"><h1>卡住时，从这里找线索。</h1><p>按现象查问题，再回到对应制作步骤。也可以在顶部搜索关键词。</p></div><section class="faq-list">${faqs.map(item=>`<details><summary>${e(item.question)}</summary><p>${e(item.answer)}</p>${link('course','回到对应课程 '+icon('arrow'),'text-link',item.chapter)}</details>`).join('')}</section><section class="section-space"><h2>第一次遇到这些词？</h2><dl class="glossary">${glossary.map(item=>`<div><dt>${e(item.term)}</dt><dd>${e(item.text)}</dd></div>`).join('')}</dl></section>`;
}
export function search(query) {
  const q = query.trim().toLocaleLowerCase();
  const results = q ? chapters.filter(ch=>JSON.stringify([ch.title,ch.summary,ch.steps,ch.concept]).toLocaleLowerCase().includes(q)) : [];
  const questions = q ? faqs.filter(item=>(item.question+item.answer).toLocaleLowerCase().includes(q)) : [];
  return `<div class="chapter-title"><h1>${q ? `搜索“${e(query)}”` : '你想了解什么？'}</h1><p>${q ? `找到 ${results.length} 章课程与 ${questions.length} 条排障说明。` : '输入关键词，例如“回中”“OLED”“GPIO”或“找不到串口”。'}</p></div><div class="search-results">${results.map(ch=>link('course',`<span class="tag">第 ${ch.id} 章</span><h2>${e(ch.title)}</h2><p>${e(ch.summary)}</p>`,'search-result',ch.id)).join('')}${questions.map(item=>`<details class="search-result"><summary>${e(item.question)}</summary><p>${e(item.answer)}</p></details>`).join('')}${q&&!results.length&&!questions.length?'<p>没有找到匹配内容。试试更短的词，或打开排障指南。</p>':''}</div>`;
}
export function downloads(release) {
  return `<div class="chapter-title"><h1>把资料，留在手边。</h1><p>网站固件按 LOLIN S2 Mini／ESP32-S2 构建。保留原项目作者与许可证。</p></div><div class="resource-list">${[['assets/materials.pdf','原始物料清单','3 页 PDF，包含实作备注'],['assets/basic-11.zip','基础打印件','11 件，默认封闭版顶盖 v117'],['assets/all-stl.zip','全部打印件','15 个 STL，含替换顶盖与帽子'],['firmware/source.zip','固件源码与构建说明','含测试与正式程序、USB 协议与校准修改']].map(([path,title,desc])=>`<section class="resource-row">${icon('file')}<div><h2>${title}</h2><p>${desc}</p></div><a class="button secondary" href="${path}" download>下载 ${icon('download')}</a></section>`).join('')}</div><section class="section-space"><h2>已发布固件</h2><p class="resource-note">${release ? `版本 ${e(release.version)} / ${e(release.fqbn)}。编译通过，USB 烧录与运动效果仍需连接实板验收。` : '正在读取发布信息。'}</p>${release ? release.builds.map(build=>`<details class="release-detail"><summary>${build.kind==='main'?'完整机器人程序':'舵机测试固件'} / ${build.appBytes.toLocaleString()} 字节</summary>${build.files.map(file=>`<p><a href="firmware/${e(file.name)}" download>${e(file.name)}</a><br><code>${e(file.sha256)}</code></p>`).join('')}</details>`).join(''):''}</section><section class="notice"><h2>项目来源</h2><p>原项目 Sesame Robot 由 Dorian Todd 创建，采用 Apache-2.0 许可证。</p></section>`;
}
