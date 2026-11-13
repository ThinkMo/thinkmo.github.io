import { LineBuffer, parseReply, validateIdentity } from './protocol.js';

export class RobotDevice extends EventTarget {
  constructor(serial = globalThis.navigator?.serial) {
    super();
    this.serial = serial;
    this.state = 'disconnected';
    this.identity = null;
    this.trims = Array(8).fill(0);
    this.logs = [];
    this.pending = new Map();
    this.sequence = 0;
    this.generation = 0;
    this.writeChain = Promise.resolve();
    serial?.addEventListener('disconnect', event => {
      if (event.target === this.port || event.port === this.port) void this.disconnect(false);
    });
  }
  emit() { this.dispatchEvent(new Event('change')); }
  log(text) {
    this.logs.push({ time: new Date().toLocaleTimeString('zh-CN', {hour12:false}), text });
    this.logs = this.logs.slice(-70);
    this.dispatchEvent(new Event('log'));
  }
  async connect() {
    if (!this.serial) throw new Error('请在桌面 Chrome 或 Edge 中通过 HTTPS 或 localhost 打开网页。');
    if (this.state !== 'disconnected') throw new Error('设备正在连接或已连接。');
    this.state = 'connecting';
    this.emit();
    const generation = ++this.generation;
    try {
      this.port = await this.serial.requestPort();
      await this.port.open({ baudRate:115200 });
      this.writer = this.port.writable.getWriter();
      this.reader = this.port.readable.getReader();
      this.readTask = this.read(generation);
      let reply;
      for (let attempt = 0; attempt < 3; attempt++) {
        try { reply = await this.send('hello', 1800, true); break; }
        catch (error) { if (attempt === 2 || generation !== this.generation) throw error; }
      }
      this.identity = validateIdentity(reply);
      await this.send('session', 1800, true);
      if (generation !== this.generation) throw new Error('设备已断开，请重新连接。');
      this.state = 'ready';
      this.heartbeat = setInterval(() => this.ping(), 400);
      if (this.identity.kind === 'main') await this.send('trims');
      this.log(`已识别 ${this.identity.kind === 'main' ? '完整程序' : '测试固件'} v${this.identity.version}，USB 验证会话已开启。`);
      this.emit();
    } catch (error) {
      await this.disconnect(false);
      if (error.name === 'NotFoundError') throw new Error('未选择串口。可以再次点击连接。');
      throw error;
    }
  }
  async ping() {
    if (this.pinging || this.state !== 'ready') return;
    this.pinging = true;
    try { await this.send('ping', 1100); }
    catch { this.log('心跳中断，控制已停用。请检查 USB 并重新连接。'); await this.disconnect(false); }
    finally { this.pinging = false; }
  }
  async read(generation) {
    const buffer = new LineBuffer();
    const decoder = new TextDecoder();
    try {
      while (generation === this.generation) {
        const { value, done } = await this.reader.read();
        if (done) break;
        for (const line of buffer.push(decoder.decode(value, { stream:true }))) {
          const reply = parseReply(line);
          if (reply) {
            const request = this.pending.get(reply.id);
            if (!request) continue;
            clearTimeout(request.timer);
            this.pending.delete(reply.id);
            if (Array.isArray(reply.trims) && reply.trims.length === 8 && reply.trims.every(x => Number.isInteger(x) && x >= -90 && x <= 90)) {
              this.trims = reply.trims;
              this.emit();
            }
            if (reply.ok) request.resolve(reply);
            else request.reject(new Error(`设备拒绝指令：${reply.error || '未知错误'}`));
            if (request.command !== 'ping') this.log(`${reply.ok ? '已响应' : '指令失败'} ${request.command}${reply.queued ? '（已排入动作，观察实物确认）' : ''}`);
          } else {
            this.log(line);
            if (line.includes('"session_timeout"')) void this.disconnect(false);
          }
        }
      }
    } catch (error) {
      if (this.state !== 'closing') this.log(`串口读取中断：${error.message}`);
    } finally {
      this.reader?.releaseLock();
      if (generation === this.generation && this.state !== 'closing') void this.disconnect(false);
    }
  }
  send(command, timeout = 2500, handshake = false) {
    if (!this.writer || (!handshake && this.state !== 'ready')) return Promise.reject(new Error('请先连接并识别固件。'));
    const id = ++this.sequence;
    const generation = this.generation;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`设备未及时响应 ${command}，请检查日志与连接状态。`));
      }, timeout);
      this.pending.set(id, { resolve, reject, timer, command });
      this.writeChain = this.writeChain.catch(() => {}).then(async () => {
        if (!this.pending.has(id)) return;
        if (generation !== this.generation) throw new Error('连接已改变，指令已取消。');
        await this.writer.write(new TextEncoder().encode(`@${id} ${command}\n`));
      }).catch(error => {
        const request = this.pending.get(id);
        if (request) { clearTimeout(request.timer); this.pending.delete(id); request.reject(error); }
      });
    });
  }
  disconnect(graceful = true) {
    if (this.closing) return this.closing;
    if (this.state === 'disconnected' && !this.port) return Promise.resolve();
    const wasReady = this.state === 'ready';
    this.state = 'closing';
    clearInterval(this.heartbeat);
    this.emit();
    this.closing = this.close(graceful && wasReady);
    this.closing.finally(() => { this.closing = null; });
    return this.closing;
  }
  async close(graceful) {
    const { reader, writer, port, readTask } = this;
    for (const request of this.pending.values()) { clearTimeout(request.timer); request.reject(new Error('设备连接已关闭，待处理指令已取消。')); }
    this.pending.clear();
    if (graceful) {
      try { await this.send('end', 700, true); } catch { /* Device timeout also cancels motion. */ }
    }
    ++this.generation;
    try { await reader?.cancel(); } catch {}
    try { await readTask; } catch {}
    try { await writer?.abort(); writer?.releaseLock(); } catch {}
    try { await port?.close(); } catch {}
    this.reader = null;
    this.writer = null;
    this.port = null;
    this.identity = null;
    this.writeChain = Promise.resolve();
    this.state = 'disconnected';
    this.emit();
  }
}
