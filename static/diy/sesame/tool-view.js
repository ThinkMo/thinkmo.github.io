import { icon } from './icons.js';
import { escapeHtml as e } from './views.js';
import { servo3dControls } from './servo3d.js';

export const names = ['R1','R2','L1','L2','R4','R3','L3','L4'];
export const pins = [1,2,4,6,8,10,13,14];
export function tools(device, settings, study) {
  const ready = device.state === 'ready';
  const main = ready && device.identity?.kind === 'main';
  const disabled = ready ? '' : 'disabled';
  const selected = settings.motor;
  const firmware = settings.firmware;
  return `<div class="chapter-title"><h1>让程序与机器人相遇。</h1><p>先安装测试固件验证接线，再安装完整程序，完成关节校准与整机验收。</p></div>
    <ol class="tool-stages"><li>1. 安装固件</li><li>2. 复位并连接</li><li>3. 验证舵机</li><li>4. 校准与验收</li></ol>
    <div class="notice device-note"><p>首次验证时托起机身，让舵机轴自由转动。连接本身不会发送运动指令。页面显示的角度是输出目标，需要观察实物确认动作。</p></div>
    <div class="console-layout"><div class="tool-side"><section class="connection-panel">
      <h2>安装 S2 Mini 固件</h2><p>确认开发板为 ESP32-S2，使用 USB-C 数据线连接电脑。</p>
      <label class="field-label" for="firmware">选择要安装的程序</label><select id="firmware"><option value="tester" ${firmware==='tester'?'selected':''}>舵机测试固件</option><option value="main" ${firmware==='main'?'selected':''}>完整机器人程序</option></select>
      <p class="firmware-explanation">${firmware==='tester'?'原始角度回中、逐个舵机验证。适合接线和装配前检查。':'包含 Wi-Fi 遥控、OLED 表情、预置动作和持久校准。'}</p>
      <button class="button wide" id="prepare-install" ${device.state!=='disconnected'?'disabled':''}>${icon('download')} 准备网页烧录</button>
      <div id="installer-slot"></div><p id="flash-status" role="status"></p>
      <details class="boot-help"><summary>找不到串口或无法进入下载模式？</summary><p>关闭其他串口监视器。按住 BOOT，按下并释放 RST，再释放 BOOT，然后重试。烧录结束后按 RST，运行态端口可能需要重新选择。</p><p>保留校准时不要勾选安装器中的“Erase device”。分段写入会避开 NVS；主动全片擦除将清除校准值。</p></details>
    </section><section class="connection-panel runtime-panel"><h2>连接运行中的机器人</h2><p>烧录结束后复位，选择运行态串口。识别成功后才启用验证按钮。</p><button class="button secondary wide" data-connect ${device.state==='connecting'||device.state==='closing'?'disabled':''}>${icon('usb')} ${ready?'断开 USB 验证':device.state==='connecting'?'正在识别…':'连接并识别固件'}</button><div class="connection-state" role="status">${ready?`${device.identity.kind==='main'?'完整程序':'测试固件'} v${e(device.identity.version)} / USB 会话已连接`:device.state==='closing'?'正在关闭连接…':'尚未连接固件'}</div><p>网页退出或 USB 会话超时后，固件会取消当前动作并保持输出。释放 PWM 需使用“释放舵机”，物理断电通过电源开关完成。</p></section></div>
    <section class="motor-panel"><div class="header-line"><h2>逐个验证 8 个舵机</h2><span class="mono muted">S${selected} / ${names[selected]} / GPIO ${pins[selected]}</span></div>
      <div class="motor-selector" aria-label="选择舵机">${names.map((name,i)=>`<button data-motor="${i}" aria-pressed="${i===selected}" class="${i===selected?'selected':''}">S${i}<br><small>${name}</small></button>`).join('')}</div>
      <div class="motor-workarea"><div class="diagram"><img src="assets/images/sesame-topdown.webp" alt="机器人俯视结构与关节名称"></div><div class="motor-controls"><div class="angle-readout mono"><span id="angle-value">${settings.angle}</span><small>°</small></div><p>${main?'输出目标（含偏移）':'原始目标角度'} <strong id="adjusted-angle">${main?Math.max(0,Math.min(180,settings.angle+device.trims[selected])):settings.angle}°</strong></p>
      <label class="field-label" for="angle">目标角度</label><input id="angle" type="range" min="${settings.fullRange?0:60}" max="${settings.fullRange?180:120}" step="1" value="${settings.angle}" ${disabled}><label class="range-choice"><input type="checkbox" id="full-range" ${settings.fullRange?'checked':''}>已确认机械行程，启用 0–180°</label><button class="button wide" data-send-angle ${disabled}>发送选中角度</button><button class="button secondary" data-center ${disabled}>所有舵机回到 90°</button></div></div>
      <div class="motion-actions"><button class="button stop-button" data-stop ${disabled}>停止动作并保持</button><button class="button secondary" data-release ${disabled}>释放全部舵机 PWM</button><span>释放后请托住机身，舵机可能失去支撑。</span></div>
      <label class="verified-row"><input type="checkbox" data-verified="s${selected}" ${study.verified[`s${selected}`]?'checked':''}>我已观察 S${selected} 的位置、方向与动作，确认正常</label>
      <section class="calibration"><div class="header-line"><h2>零位微调</h2><span class="tag">完整程序功能</span></div><p>偏移统一作用于正式程序的动作。修改偏移不会自动移动舵机；随后发送角度观察效果。保存后重启，再连接读取核对。</p><div class="trim-controls"><label for="trim">S${selected} 偏移（度）</label><input type="number" id="trim" min="-90" max="90" step="1" value="${device.trims[selected] || 0}" ${main?'':'disabled'}><button class="button secondary" data-apply-trim ${main?'':'disabled'}>应用本通道</button><button class="button secondary" data-trims ${main?'':'disabled'}>读取全部偏移</button></div><div class="trim-values mono">${device.trims.map((value,i)=>`<span>S${i} ${value>=0?'+':''}${value}°</span>`).join('')}</div><div class="actions"><button class="button" data-save-trims ${main?'':'disabled'}>保存校准到开发板</button><button class="button secondary" data-reset-trims ${main?'':'disabled'}>恢复零偏移</button></div></section>
      <section class="pose-section"><h2>完整程序验收</h2><p>装好关节后，托起机身先检查 Rest 与 Stand。确认动作空间足够，再执行行走或舞蹈。</p><label class="verified-row"><input id="pose-ready" type="checkbox" ${settings.poseReady?'checked':''}>我已完成单舵机检查，确认关节安装和运动空间</label><div class="pose-buttons">${[['rest','Rest / 全部 90°'],['stand','Stand / 站立'],['forward','前进'],['backward','后退'],['left','左转'],['right','右转'],['wave','挥手'],['dance','舞蹈']].map(([pose,label])=>`<button class="button secondary" data-pose="${pose}" ${main&&settings.poseReady?'':'disabled'}>${label}</button>`).join('')}</div><p>行走为持续动作，点击“停止动作并保持”结束。按设备日志区分“指令已响应”和实物验收。</p><a class="text-link" href="http://192.168.4.1" target="_blank" rel="noopener">打开机器人 Wi-Fi 控制页 ${icon('arrow')}</a><p>先连接热点 Sesame-Controller，密码 12345678。完成 USB 验证后断开会话，再使用 Wi-Fi 控制。</p></section>
      <details class="device-log-panel" open><summary>设备日志</summary><div id="device-log" role="log" aria-live="polite">${device.logs.map(line=>`<p><span>${e(line.time)}</span> ${e(line.text)}</p>`).join('') || '<p>等待连接。启动日志、发送结果和固件回执会显示在这里。</p>'}</div></details>
    </section></div>`;
}

export function servoWorkbench(device, settings, study, installerBusy = false) {
  const ready = device.state === 'ready';
  const testerReady = ready && device.identity?.kind === 'tester';
  const testDisabled = testerReady ? '' : 'disabled';
  const selected = settings.motor;
  const connecting = device.state === 'connecting' || device.state === 'closing';
  const stage = testerReady ? 4 : ready ? 3 : 2;
  const stages = ['连接开发板', '烧录测试固件', '复位并识别', '舵机测试'];
  return `<div class="chapter-workbench" id="chapter-workbench">
    <ol class="tool-stages chapter-tool-stages">${stages.map((label,i)=>`<li class="${i+1<stage?'done':i+1===stage?'current':''}" ${i+1===stage?'aria-current="step"':''}>${i+1}. ${label}</li>`).join('')}</ol>
    <div class="console-layout"><div class="tool-side"><section class="connection-panel">
      <h2>连接与烧录</h2><p>目标板 LOLIN S2 Mini／ESP32-S2。使用 USB-C 数据线连接电脑。</p>
      <span class="tag">舵机测试固件</span>
      <button class="button wide" id="prepare-install" ${device.state!=='disconnected'||installerBusy?'disabled':''}>${icon('download')} 准备网页烧录</button>
      <div id="installer-slot"></div><p id="flash-status" role="status"></p>
      <div class="runtime-connect"><p>烧录后按 RST 复位，再连接运行态串口启用测试。</p><button class="button secondary wide" data-connect ${connecting?'disabled':''}>${icon('usb')} ${ready?'断开连接':connecting?'正在识别…':'连接并识别固件'}</button><div class="connection-state" role="status">${ready?`${testerReady?'测试固件':'完整程序'} v${e(device.identity.version)} / USB 会话已连接`:device.state==='closing'?'正在关闭连接…':'尚未连接固件'}</div>${ready&&!testerReady?'<p class="resource-note">当前识别为完整程序。本章请先烧录舵机测试固件。</p>':''}</div>
      <details class="boot-help"><summary>找不到串口或无法进入下载模式？</summary><p>关闭其他串口监视器。按住 BOOT，按下并释放 RST，再释放 BOOT，然后重试。烧录结束后按 RST，运行态端口可能需要重新选择。</p><p>保留校准时不要勾选安装器中的“Erase device”。分段写入会避开 NVS；主动全片擦除将清除校准值。</p></details>
    </section></div>
    <section class="motor-panel"><div class="header-line"><h2>逐个验证 8 个舵机</h2><span class="mono muted">S${selected} / ${names[selected]} / GPIO ${pins[selected]}</span></div>
      <div class="motor-selector" aria-label="选择舵机">${names.map((name,i)=>`<button data-motor="${i}" aria-pressed="${i===selected}" class="${i===selected?'selected':''}">S${i}<br><small>${name}</small></button>`).join('')}</div>
      <div class="motor-workarea"><div class="diagram s3d-stage"><canvas id="s3d-canvas" aria-label="当前舵机行程三维参考，可拖动旋转与滚轮缩放"></canvas></div><div class="motor-controls"><div class="angle-readout mono"><span id="angle-value">${settings.angle}</span><small>°</small></div><p>原始目标角度 <strong id="adjusted-angle">${settings.angle}°</strong></p>
      <label class="field-label" for="angle">目标角度</label><input id="angle" type="range" min="${settings.fullRange?0:60}" max="${settings.fullRange?180:120}" step="1" value="${settings.angle}" ${testDisabled}><label class="range-choice"><input type="checkbox" id="full-range" ${settings.fullRange?'checked':''} ${testDisabled}>已确认机械行程，启用 0–180°</label><button class="button wide" data-send-angle ${testDisabled}>发送选中角度</button><button class="button secondary" data-center ${testDisabled}>所有舵机回到 90°</button></div></div>
      ${servo3dControls()}
      <div class="motion-actions"><button class="button stop-button" data-stop ${testDisabled}>停止动作并保持</button><button class="button secondary" data-release ${testDisabled}>释放全部舵机 PWM</button><span>释放后请托住机身，舵机可能失去支撑。</span></div>
      <label class="verified-row"><input type="checkbox" data-verified="s${selected}" ${study.verified[`s${selected}`]?'checked':''}>我已观察 S${selected} 的位置、方向与动作，确认正常</label>
      <details class="test-guide" open><summary>测试要点与异常处理</summary><ol>
        <li>逐路核对：从 S0／R1 开始小幅改变角度，确认实物由对应舵机响应；按 S0–S7 顺序逐项核对，注意 S4=R4、S5=R3。选中一个通道却带动其他部位时，停止并断电改线。</li>
        <li>方向与行程：从接近 90° 小幅调整，观察左右方向一致、转动平顺，无抖动、异响、堵转或发热；确认无干涉后再扩大行程，完成后回到 90°。</li>
        <li>交叉测试：方向相反、臂力不足或不动作时，先排除通道、接触、干涉与供电；断电后与已知正常舵机同通道交叉测试，故障随舵机转移则更换。</li>
        <li>释放与记录：托住机身后释放 PWM，记录 8 通道结果；物理断电通过电源开关完成。</li>
      </ol></details>
      <details class="device-log-panel" open><summary>设备日志</summary><div id="device-log" role="log" aria-live="polite">${device.logs.map(line=>`<p><span>${e(line.time)}</span> ${e(line.text)}</p>`).join('') || '<p>等待连接。启动日志、发送结果和固件回执会显示在这里。</p>'}</div></details>
    </section></div>
  </div>`;
}

export function firmwareWorkbench(device, settings, installerBusy = false) {
  const ready = device.state === 'ready';
  const mainReady = ready && device.identity?.kind === 'main';
  const mainDisabled = mainReady ? '' : 'disabled';
  const selected = settings.motor;
  const connecting = device.state === 'connecting' || device.state === 'closing';
  const stage = mainReady ? 4 : ready ? 3 : 2;
  const stages = ['连接开发板', '烧录正式固件', '复位并识别', '校准与验收'];
  return `<div class="chapter-workbench" id="chapter-workbench">
    <ol class="tool-stages chapter-tool-stages">${stages.map((label,i)=>`<li class="${i+1<stage?'done':i+1===stage?'current':''}" ${i+1===stage?'aria-current="step"':''}>${i+1}. ${label}</li>`).join('')}</ol>
    <div class="console-layout"><div class="tool-side"><section class="connection-panel">
      <h2>连接与烧录</h2><p>目标板 LOLIN S2 Mini／ESP32-S2。使用 USB-C 数据线连接电脑。</p>
      <span class="tag">正式固件 · 完整机器人程序</span>
      <button class="button wide" id="prepare-install" ${device.state!=='disconnected'||installerBusy?'disabled':''}>${icon('download')} 准备网页烧录</button>
      <div id="installer-slot"></div><p id="flash-status" role="status"></p>
      <div class="runtime-connect"><p>烧录后按 RST 复位，再连接运行态串口启用校准。</p><button class="button secondary wide" data-connect ${connecting?'disabled':''}>${icon('usb')} ${ready?'断开连接':connecting?'正在识别…':'连接并识别固件'}</button><div class="connection-state" role="status">${ready?`${mainReady?'完整程序':'测试固件'} v${e(device.identity.version)} / USB 会话已连接`:device.state==='closing'?'正在关闭连接…':'尚未连接固件'}</div>${ready&&!mainReady?'<p class="resource-note">当前识别为舵机测试固件。本章请先烧录完整机器人程序。</p>':''}</div>
      <details class="boot-help"><summary>找不到串口或无法进入下载模式？</summary><p>关闭其他串口监视器。按住 BOOT，按下并释放 RST，再释放 BOOT，然后重试。烧录结束后按 RST，运行态端口可能需要重新选择。</p><p>保留校准时不要勾选安装器中的“Erase device”。分段写入会避开 NVS；主动全片擦除将清除校准值。</p></details>
    </section></div>
    <section class="motor-panel">
      <section class="calibration"><div class="header-line"><h2>零位微调</h2><span class="tag">完整程序功能</span></div><p>偏移统一作用于正式程序的动作。应用偏移不会自动移动舵机；执行 Rest 或 Stand 观察效果。保存后重启，再连接读取核对。</p><div class="trim-controls"><label for="trim-motor">通道</label><select id="trim-motor">${names.map((name,i)=>`<option value="${i}" ${i===selected?'selected':''}>S${i} ${name}</option>`).join('')}</select><label for="trim">S${selected} 偏移（度）</label><input type="number" id="trim" min="-90" max="90" step="1" value="${device.trims[selected] || 0}" ${mainReady?'':'disabled'}><button class="button secondary" data-apply-trim ${mainReady?'':'disabled'}>应用本通道</button><button class="button secondary" data-trims ${mainReady?'':'disabled'}>读取全部偏移</button></div><div class="trim-values mono">${device.trims.map((value,i)=>`<span>S${i} ${value>=0?'+':''}${value}°</span>`).join('')}</div><div class="actions"><button class="button" data-save-trims ${mainReady?'':'disabled'}>保存校准到开发板</button><button class="button secondary" data-reset-trims ${mainReady?'':'disabled'}>恢复零偏移</button></div></section>
      <section class="pose-section"><h2>姿态与动作验收</h2><p>装好关节后，托起机身先检查 Rest 与 Stand。确认动作空间足够，再执行行走或舞蹈。</p><label class="verified-row"><input id="pose-ready" type="checkbox" ${settings.poseReady?'checked':''}>我已完成单舵机检查，确认关节安装和运动空间</label><div class="pose-buttons">${[['rest','Rest / 全部 90°'],['stand','Stand / 站立'],['forward','前进'],['backward','后退'],['left','左转'],['right','右转'],['wave','挥手'],['dance','舞蹈']].map(([pose,label])=>`<button class="button secondary" data-pose="${pose}" ${mainReady&&settings.poseReady?'':'disabled'}>${label}</button>`).join('')}</div><p>行走为持续动作，点击“停止动作并保持”结束。按设备日志区分“指令已响应”和实物验收。Wi-Fi 遥控验收见下一章。</p></section>
      <div class="motion-actions"><button class="button stop-button" data-stop ${mainDisabled}>停止动作并保持</button><button class="button secondary" data-release ${mainDisabled}>释放全部舵机 PWM</button><span>释放后请托住机身，舵机可能失去支撑。</span></div>
      <details class="test-guide" open><summary>校准与验收要点</summary><ol>
        <li>参考姿态：Rest 将 8 通道设为 90°，Stand 按通道表输出。先托住机身执行，对照参考图确认关节空间方向。</li>
        <li>花键优先：明显装错时重新安装摇臂，不要用大幅偏移补偿；微调只修正小偏差，最终目标被限制在 0–180°。</li>
        <li>观察与保存：应用偏移后执行 Rest 或 Stand 观察效果；保存后等待设备回执并读取 8 个偏移；停止动作、托住机身后复位，重新连接再次读取核对。</li>
        <li>停止与释放：“停止动作”取消序列并保持当前输出；释放 PWM 前先托住机身。单舵机、静态姿态通过后再尝试行走。</li>
      </ol></details>
      <details class="device-log-panel" open><summary>设备日志</summary><div id="device-log" role="log" aria-live="polite">${device.logs.map(line=>`<p><span>${e(line.time)}</span> ${e(line.text)}</p>`).join('') || '<p>等待连接。启动日志、发送结果和固件回执会显示在这里。</p>'}</div></details>
    </section></div>
  </div>`;
}
