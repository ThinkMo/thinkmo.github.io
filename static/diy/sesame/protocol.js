export class LineBuffer {
  constructor(limit = 4096) { this.limit = limit; this.text = ''; this.dropping = false; }
  push(chunk) {
    const lines = [];
    for (const ch of chunk) {
      if (ch === '\r') continue;
      if (ch === '\n') {
        if (!this.dropping && this.text) lines.push(this.text);
        this.text = '';
        this.dropping = false;
      } else if (!this.dropping) {
        this.text += ch;
        if (this.text.length > this.limit) { this.text = ''; this.dropping = true; }
      }
    }
    return lines;
  }
}
export function parseReply(line) {
  try {
    const reply = JSON.parse(line);
    return Number.isSafeInteger(reply.id) && reply.id >= 0 && typeof reply.ok === 'boolean' ? reply : null;
  } catch { return null; }
}
export function motorCommand(channel, angle) {
  if (!Number.isInteger(channel) || channel < 0 || channel > 7 || !Number.isInteger(angle) || angle < 0 || angle > 180) {
    throw new Error('通道必须是 0–7，角度必须是 0–180 的整数。');
  }
  return `motor ${channel} ${angle}`;
}
export function validateIdentity(reply) {
  if (reply.board !== 'lolin_s2_mini' || reply.chip !== 'ESP32-S2' || reply.protocol !== 1 ||
      !['main', 'tester'].includes(reply.kind) || typeof reply.version !== 'string' || !reply.version) {
    throw new Error('固件身份不匹配。请先安装本网站提供的 S2 Mini 固件，再重新连接。');
  }
  return reply;
}
