const icons = {
  robot: '<rect x="4" y="6" width="16" height="13" rx="4"/><path d="M12 3v3M2 11h2m16 0h2M8 19v2m8-2v2"/><path d="M8 11h.01M16 11h.01M9 15h6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  play: '<path d="m9 5 11 7-11 7z"/>',
  book: '<path d="M12 6c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1Zm0 0v15"/>',
  box: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v10l9 5 9-5V8M12 13v10M7 6l9 5"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  tool: '<path d="m15 6 3 3 3-3c1 4-2 8-6 7L6 22l-4-4 9-9c-1-4 3-7 7-6l-3 3Z"/>',
  usb: '<path d="M12 21V3m-3 3 3-3 3 3M12 16l-5-4V8m5 5 5-4V6"/><circle cx="7" cy="7" r="1"/><path d="M16 4h3v3h-3z"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  file: '<path d="M14 2H5v20h14V7l-5-5Z"/><path d="M14 2v6h5M8 13h8m-8 4h6"/>',
};
export const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.book}</svg>`;
