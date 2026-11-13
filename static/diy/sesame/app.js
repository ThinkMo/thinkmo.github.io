import { chapters } from './course-data.js?v=20261112-19';
import { navigation, sidebar, home, course, videos, materials, printing, troubleshooting, search, downloads, escapeHtml as e } from './views.js?v=20261112-19';
import { tools, servoWorkbench, firmwareWorkbench } from './tool-view.js?v=20261112-19';
import { mountServo3D, stopServo3D } from './servo3d.js';
import { icon } from './icons.js';
import { readStudy, saveStudy } from './storage.js?v=20261112-19';
import { RobotDevice } from './device.js';
import { motorCommand } from './protocol.js';

const study = readStudy();
const device = new RobotDevice();
const settings = { motor:0, angle:90, firmware:'tester', fullRange:false, poseReady:false };
const data = { media:[], materials:[], parts:[], release:null };
let route;
let toastTimer;
let installerBusy = false;
let lastLog;
const app = document.querySelector('#app');
const dialog = document.querySelector('#media-dialog');

function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.remove('visible'),4500);
}
function persist() { if (!saveStudy(study)) notify('浏览器未能保存学习记录，请检查存储权限。'); }
function readRoute() {
  const params = new URLSearchParams(location.search);
  const page = params.get('page') || 'home';
  return { page:['home','course','videos','materials','printing','faq','downloads','search','tools'].includes(page)?page:'home', chapter:chapters.some(ch=>ch.id===params.get('chapter'))?params.get('chapter'):'01', query:(params.get('q')||'').slice(0,120) };
}
function render(focus = false) {
  route = readRoute();
  if (route.page === 'course') { study.lastChapter = route.chapter; persist(); }
  const pages = {
    home:()=>home(study), course:()=>course(route,study,data.media,data.materials,route.chapter==='05'?servoWorkbench(device,settings,study,installerBusy):route.chapter==='06'?firmwareWorkbench(device,settings,installerBusy):''), videos:()=>videos(data.media),
    materials:()=>materials(data.materials,study), printing:()=>printing(data.parts), faq:troubleshooting,
    downloads:()=>downloads(data.release), search:()=>search(route.query), tools:()=>tools(device,settings,study)
  };
  app.innerHTML = `${navigation(route)}<div class="studio-layout">${sidebar(route,study)}<main class="studio-main" id="main" tabindex="-1">${pages[route.page]()}</main></div><footer class="source-footer"><span>Sesame 开源机器人 / LOLIN S2 Mini 制作教材</span><span>原项目 Dorian Todd / <a href="assets/LICENSE" target="_blank" rel="noopener">Apache-2.0</a> / <a data-route href="?page=downloads">固件版本与资料来源</a></span><span class="footer-legal">© 2026 新境世界 <span aria-hidden="true">·</span> <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">浙ICP备2026086877号</a></span></footer>`;
  document.title = `Sesame 制作工坊 — ${route.page==='course'?chapters.find(ch=>ch.id===route.chapter).title:{home:'学习总览',videos:'实拍视频',materials:'物料清单',printing:'打印件',faq:'排障与术语',downloads:'程序与资料',search:'搜索',tools:'烧录与调试'}[route.page]}`;
  const workbenchRoute = route.page==='tools' || (route.page==='course' && ['05','06'].includes(route.chapter));
  if (route.page==='course' && route.chapter==='05') mountServo3D(()=>settings.motor); else stopServo3D();
  if (workbenchRoute && (!navigator.serial || !window.isSecureContext)) {
    document.querySelector('#prepare-install').disabled = true;
    document.querySelector('[data-connect]').disabled = true;
    document.querySelector('.connection-state').textContent = '当前环境不支持 Web Serial。请用桌面 Chrome／Edge 打开本网站。';
  }
  if (workbenchRoute && installerBusy) document.querySelector('#prepare-install').disabled=true;
  if (focus) document.querySelector('#main').focus({preventScroll:true});
}
function go(url, push = true) {
  if (installerBusy) { notify('请先关闭烧录窗口，再切换页面。'); return; }
  if (push) history.pushState(null,'',url);
  render(true);
  scrollToHash();
}
function scrollToHash() {
  const target=location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if(target)target.scrollIntoView({block:'start'});
  else window.scrollTo(0,0);
}
async function action(callback) {
  try { await callback(); }
  catch(error) { notify(error.message); }
}
function mediaDialog(title, html) {
  document.querySelector('#media-title').textContent=title;
  document.querySelector('#media-content').innerHTML=html;
  dialog.showModal();
}
function renderLog() {
  const target = document.querySelector('#device-log');
  if (target) {
    target.innerHTML=device.logs.map(line=>`<p><span>${e(line.time)}</span> ${e(line.text)}</p>`).join('');
    target.scrollTop=target.scrollHeight;
  }
}
device.addEventListener('change',()=>{ if((route?.page==='tools'||(route?.page==='course'&&['05','06'].includes(route.chapter)))&&!installerBusy) render(); });
device.addEventListener('log',()=>{ renderLog(); lastLog = device.logs.at(-1)?.text; });

function activeFirmware() {
  if (route?.page==='course' && route.chapter==='05') return 'tester';
  if (route?.page==='course' && route.chapter==='06') return 'main';
  return settings.firmware;
}
function refreshWorkbench(focusSelector) {
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
  document.querySelector(focusSelector)?.focus({preventScroll:true});
}
async function prepareInstaller() {
  if (installerBusy) return;
  if (device.state!=='disconnected') throw new Error('请先断开 USB 验证，释放串口后再安装固件。');
  document.querySelector('#prepare-install').disabled=true;
  const slot=document.querySelector('#installer-slot');
  slot.innerHTML='<p class="resource-note">正在准备安装器…</p>';
  try {
    await import('./vendor/install-dialog-CLL1RKXl.js');
    const button=document.createElement('button');
    button.className='button wide';
    button.textContent='选择串口并安装';
    button.addEventListener('click',()=>action(openInstaller));
    slot.replaceChildren(button);
    notify('安装器已准备。点击“选择串口并安装”，按提示操作。保留校准时不要勾选 Erase device。');
  } catch(error) {
    slot.textContent='安装器加载失败，请刷新重试。';
    document.querySelector('#prepare-install').disabled=false;
    throw error;
  }
}
async function openInstaller() {
  if(installerBusy || device.state!=='disconnected') throw new Error('串口正被占用，请先结束 USB 验证。');
  installerBusy=true;
  document.querySelector('[data-connect]').disabled=true;
  const firmwareSelect=document.querySelector('#firmware');
  if(firmwareSelect) firmwareSelect.disabled=true;
  let port;
  try {
    port=await navigator.serial.requestPort();
    await port.open({baudRate:115200,bufferSize:8192});
    const installer=document.createElement('ewt-install-dialog');
    installer.port=port;
    installer.manifestPath=new URL(`firmware/${activeFirmware()}.json`,location.href).href;
    installer.addEventListener('closed',async()=>{
      try{await port.close();}catch{}
      installerBusy=false;
      render();
      notify('安装器已关闭。写入成功后按 RST，再连接运行态串口进行验证。');
    },{once:true});
    document.body.append(installer);
  } catch(error) {
    try{await port?.close();}catch{}
    installerBusy=false;
    render();
    if(error.name==='NotFoundError') throw new Error('未选择串口，可以重新准备烧录。');
    throw error;
  }
}
document.addEventListener('click',event=>{
  const target=event.target;
  const routeLink=target.closest('a[data-route]');
  if(routeLink && !event.ctrlKey && !event.metaKey) { event.preventDefault(); go(routeLink.href); return; }
  if(target.closest('.mobile-menu')) {
    const open=app.classList.toggle('sidebar-open');
    document.querySelector('.mobile-menu').setAttribute('aria-expanded',String(open));
    return;
  }
  if(target.closest('[data-close-dialog]')) { dialog.close(); return; }
  const video=target.closest('[data-video]');
  if(video) {
    const item=data.media.find(item=>item.id===video.dataset.video);
    if(item) {
      const title=item.id==='intro'?'原作者发布的 Sesame 演示视频':item.title;
      const details=item.id==='intro'?'':`<p>${e(item.description)}</p><p class="resource-note">来源 ${e(item.source)} / <a href="${e(item.file)}" download>下载视频</a></p>`;
      mediaDialog(title,`<video controls playsinline preload="metadata" poster="${e(item.poster)}" src="${e(item.file)}"></video>${details}`);
    }
    return;
  }
  const image=target.closest('[data-image]');
  if(image) { mediaDialog(image.dataset.caption,`<img class="zoom-image" src="${e(image.dataset.image)}" alt="${e(image.dataset.caption)}">`); return; }
  if(target.closest('[data-connect]')) return action(async()=>{
    if(installerBusy) throw new Error('请先关闭烧录安装器。');
    if(device.state==='ready') await device.disconnect();
    else await device.connect();
  });
  if(target.closest('#prepare-install')) return action(prepareInstaller);
  const motor=target.closest('[data-motor]');
  if(motor) { settings.motor=Number(motor.dataset.motor); refreshWorkbench(`[data-motor="${settings.motor}"]`); return; }
  if(target.closest('[data-send-angle]')) return action(()=>device.send(motorCommand(settings.motor,settings.angle)));
  if(target.closest('[data-center]')) return action(async()=>{
    if(!confirm('将 8 个舵机依次设为 90°。请确认舵机轴可自由转动，并托住机身。'))return;
    await device.send('center'); settings.angle=90; render();
  });
  if(target.closest('[data-stop]')) return action(()=>device.send('stop'));
  if(target.closest('[data-release]')) return action(()=>device.send('release'));
  if(target.closest('[data-apply-trim]')) return action(async()=>{
    const value=Number(document.querySelector('#trim').value);
    if(!Number.isInteger(value)||value< -90||value>90)throw new Error('偏移必须是 -90 到 90 的整数。');
    await device.send(`trim ${settings.motor} ${value}`);
  });
  if(target.closest('[data-trims]')) return action(()=>device.send('trims'));
  if(target.closest('[data-save-trims]')) return action(async()=>{ await device.send('save'); notify('开发板已确认保存。请重启后重新连接并读取偏移核对。'); });
  if(target.closest('[data-reset-trims]')) return action(async()=>{ if(confirm('将开发板中 8 个零位偏移恢复为 0 并保存？')) await device.send('reset'); });
  const pose=target.closest('[data-pose]');
  if(pose) return action(()=>device.send(`pose ${pose.dataset.pose}`));
  if(target.closest('[data-reset-study]'))return action(()=>{
    if(!confirm('重置本浏览器的课程学习位置和材料勾选？开发板里的校准值不受影响。'))return;
    study.materials={};study.verified={};study.lastChapter='01';persist();render();
  });
});
document.addEventListener('change',event=>{
  const input=event.target;
  if(input.dataset.material) {study.materials[input.dataset.material]=input.checked;persist();}
  if(input.dataset.verified) {study.verified[input.dataset.verified]=input.checked;persist();}
  if(input.dataset.verified==='build-done') {const y=window.scrollY;render();window.scrollTo(0,y);document.querySelector('.coffee-card')?.scrollIntoView({block:'nearest',behavior:'smooth'});}
  if(input.id==='firmware') {settings.firmware=input.value; render();}
  if(input.id==='trim-motor') {settings.motor=Number(input.value); refreshWorkbench('#trim-motor');}
  if(input.id==='full-range') {settings.fullRange=input.checked;settings.angle=Math.max(settings.fullRange?0:60,Math.min(settings.fullRange?180:120,settings.angle));refreshWorkbench('#full-range');}
  if(input.id==='pose-ready') {settings.poseReady=input.checked;render();}
});
document.addEventListener('input',event=>{
  if(event.target.id==='angle') {
    settings.angle=Number(event.target.value);
    document.querySelector('#angle-value').textContent=settings.angle;
    document.querySelector('#adjusted-angle').textContent=`${Math.max(0,Math.min(180,settings.angle+(device.identity?.kind==='main'?device.trims[settings.motor]:0)))}°`;
  }
});
document.addEventListener('submit',event=>{
  if(event.target.matches('.search-form')) {event.preventDefault();const q=new FormData(event.target).get('q');go(`?page=search&q=${encodeURIComponent(q)}`);}
});
dialog.addEventListener('close',()=>{dialog.querySelector('video')?.pause();document.querySelector('#media-content').replaceChildren();});
window.addEventListener('popstate',()=>{render(true);if(location.hash)scrollToHash();});
window.addEventListener('pagehide',()=>{if(device.state==='ready')void device.disconnect();});
async function loadJson(path, fallback) {
  const response=await fetch(path, { cache: 'no-store' });
  if(!response.ok)throw new Error(`资料加载失败：${path}`);
  return response.json();
}
try {
  const [media,rows,parts,release]=await Promise.all([loadJson('assets/media.json'),loadJson('assets/materials.json'),loadJson('assets/stl.json'),loadJson('firmware/release.json').catch(()=>null)]);
  Object.assign(data,{media,materials:rows,parts,release});render();scrollToHash();
} catch(error) {
  app.innerHTML=`<main class="page-wrap"><h1>资料暂时未能打开</h1><p>${e(error.message)}</p><p>请使用 HTTPS 网站或启动本地 HTTP 服务后刷新。</p><button class="button" onclick="location.reload()">重新载入</button></main>`;
}
