const KEY = 'sesame-workshop-v1';
const empty = () => ({ version:4, materials:{}, verified:{}, lastChapter:'01' });
// 第 6、7 章合并后旧编号顺移：07→06、08→07，只在版本迁移时执行一次。
const mergedChapter = chapter => chapter === '08' ? '07' : chapter === '07' ? '06' : chapter;
export function readStudy(storage) {
  try {
    storage ||= globalThis.localStorage;
    const data = JSON.parse(storage.getItem(KEY) || 'null');
    if (!data || typeof data !== 'object' || Array.isArray(data)) return empty();
    const result = empty();
    for (const key of ['materials', 'verified']) {
      if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
        for (const [id, value] of Object.entries(data[key])) {
          if (/^[a-zA-Z0-9_-]{1,50}$/.test(id) && typeof value === 'boolean') result[key][id] = value;
        }
      }
    }
    if (data.version === 3 || data.version === 4) {
      if (/^0[1-8]$/.test(data.lastChapter)) result.lastChapter = data.lastChapter;
    } else if (data.version === 2) {
      if (/^0[1-8]$/.test(data.lastChapter)) result.lastChapter = mergedChapter(data.lastChapter);
    } else if (/^0[1-9]$/.test(data.lastChapter)) {
      const legacyChapter = Number(data.lastChapter);
      result.lastChapter = mergedChapter(String(legacyChapter > 5 ? legacyChapter - 1 : legacyChapter).padStart(2, '0'));
    }
    return result;
  } catch { return empty(); }
}
export function saveStudy(data, storage) {
  try { (storage || globalThis.localStorage).setItem(KEY, JSON.stringify(data)); return true; } catch { return false; }
}
