export function materialChecklist(rows, study, e) {
  return `<div class="table-scroll material-confirm"><table class="material-confirm-table"><thead><tr><th>打勾确认</th><th>物品名称</th><th>样例图</th></tr></thead><tbody>${rows.map(row=>{
    const sample = row.url ? `assets/images/materials/${row.id}.webp` : '';
    return `<tr><td class="material-check"><input type="checkbox" aria-label="已备齐 ${e(row.name)}" data-material="${e(row.id)}" ${study.materials[row.id]?'checked':''}></td><td><strong>${e(row.name)}</strong><span class="material-quantity">数量：${e(row.quantity)}</span><p>${e(row.note)}</p></td><td class="material-sample-cell">${sample?`<button class="image-expand material-sample" data-image="${e(sample)}" data-caption="${e(row.name)}" aria-label="放大 ${e(row.name)} 样例图"><img src="${e(sample)}" alt="${e(row.name)} 商品页样例图" loading="lazy"></button>`:''}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}

export function guideStep(step, index, e, extra = '') {
  const caption = (step.caption || step.title).replace(/[。，,\s]+$/u,'');
  return `<section class="chapter-step" id="step-${index+1}">
    <div class="step-heading"><span class="side-number">${String(index+1).padStart(2,'0')}</span><h2>${e(step.title)}</h2></div>
    <p>${e(step.text)}</p>
    ${extra}
    ${step.pins ? `<div class="gpio-pinout"><h3>GPIO 引脚对应表</h3><div class="table-scroll"><table class="gpio-table"><thead><tr><th>电机编号</th><th>机身位置</th><th>S2 Mini GPIO</th></tr></thead><tbody>${step.pins.map(row=>`<tr>${row.map(cell=>`<td>${e(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>` : ''}
    ${step.video ? `<figure class="step-figure step-video${step.video.portrait?' portrait':''}"><video controls playsinline preload="metadata" poster="${e(step.video.poster)}" src="${e(step.video.file)}"></video><figcaption>${e(step.video.caption)}</figcaption></figure>` : ''}
    ${step.image ? `<figure class="step-figure${step.fullImage?' full-image':''}"><button class="image-expand" data-image="${e(step.image)}" data-caption="${e(caption)}" aria-label="放大 ${e(step.title)}"><img src="${e(step.image)}" alt="${e(caption)}" loading="lazy"></button><figcaption>${e(caption)}</figcaption></figure>` : ''}
    ${step.images ? step.images.map(item => `<figure class="step-figure full-image${item.phone?' phone-shot':''}"><button class="image-expand" data-image="${e(item.src)}" data-caption="${e(item.caption)}" aria-label="放大 ${e(item.caption)}"><img src="${e(item.src)}" alt="${e(item.caption)}" loading="lazy"></button><figcaption>${e(item.caption)}</figcaption></figure>`).join('') : ''}
  </section>`;
}
