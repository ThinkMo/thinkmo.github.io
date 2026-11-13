// Inline 3D servo travel reference built on the original angle diagram.
// The diagram is laid flat as the base plate; each servo's horn sweeps at its
// own pivot in the correct plane: S0-S3 (R1,R2,L1,L2) horizontal, S4-S7 vertical.
// Dependency-free software-projected canvas renderer with damped orbit / zoom.
const DEG = Math.PI / 180;
const NAMES = ['R1','R2','L1','L2','R4','R3','L3','L4'];
const PINS = [1,2,4,6,8,10,13,14];
const WORLD_W = 5.2;

// type 'h': horizontal plane (top-down), 90 = outward, front/back per side.
// type 'v': vertical plane, down = the angle that points straight down.
// piv = pivot location in normalized diagram coordinates (u, v).
export const SERVO_REF = [
  { s:0, name:'R1', type:'h', side:'R', refs:[90,135,180], color:'#e8ecf2', piv:[0.577,0.274] },
  { s:1, name:'R2', type:'h', side:'R', refs:[0,45,90],   color:'#f27d98', piv:[0.599,0.510] },
  { s:2, name:'L1', type:'h', side:'L', refs:[0,45,90],   color:'#a05cc2', piv:[0.393,0.274] },
  { s:3, name:'L2', type:'h', side:'L', refs:[90,135,180], color:'#e03131', piv:[0.386,0.521] },
  { s:4, name:'R4', type:'v', side:'R', down:0,   refs:[0,90],  color:'#22a7e0', piv:[0.743,0.592] },
  { s:5, name:'R3', type:'v', side:'R', down:180, refs:[90,180], color:'#f28c38', piv:[0.714,0.466] },
  { s:6, name:'L3', type:'v', side:'L', down:0,   refs:[0,90],  color:'#37b24d', piv:[0.260,0.473] },
  { s:7, name:'L4', type:'v', side:'L', down:180, refs:[90,180], color:'#e8d44d', piv:[0.241,0.629] }
];

const S = {
  angle:90,
  yaw:-0.3, pitch:-0.7, dist:5.6,
  tYaw:-0.3, tPitch:-0.7, tDist:5.6,
  ghosts:true, labels:true, grid:true, base:true,
  raf:0, mounted:false, hintKey:''
};

let baseImg=null;
{
  const img=new Image();
  img.onload=()=>{ baseImg=img; };
  img.src='assets/images/sesame-angle-guide.webp';
}
const worldH=()=> baseImg ? WORLD_W*baseImg.naturalHeight/baseImg.naturalWidth : 2.24;
const rangeOf=sv=>[Math.min(...sv.refs), Math.max(...sv.refs)];
const pivotOf=sv=>[ (sv.piv[0]-0.5)*WORLD_W, 0.05, (0.5-sv.piv[1])*worldH() ];

function dirFor(sv, angle){
  const ox = sv.side==='R' ? 1 : -1;
  if (sv.type==='v'){
    const e=(sv.down===180 ? angle-90 : 90-angle)*DEG;
    return [ ox*Math.cos(e), -Math.sin(e), 0 ];
  }
  const a=angle*DEG;
  return [ ox*Math.sin(a), 0, -ox*Math.cos(a) ];
}
function describe(sv, angle){
  if (sv.type==='v'){
    if (angle===sv.down) return '竖直向下';
    if (angle===(sv.down===180?0:180)) return '竖直向上';
    if (angle===90) return '水平向外';
    return '斜向';
  }
  if (angle===90) return '水平向外';
  if (angle===(sv.side==='R'?180:0)) return '朝前';
  if (angle===(sv.side==='R'?0:180)) return '朝后';
  return '斜向';
}
const KEY_ANGLES=[0,90,180];

const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const norm=a=>{const l=Math.hypot(...a)||1;return [a[0]/l,a[1]/l,a[2]/l];};
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
function hexRgb(h){const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];}
function rgba(h,a,shade=1){const [r,g,b]=hexRgb(h);return `rgba(${Math.round(r*shade)},${Math.round(g*shade)},${Math.round(b*shade)},${a})`;}

// Permanent control region for the inline viewer. Channel comes from the workbench selector.
export function servo3dControls(){
  return `<div class="s3d-ref">
    <label class="field-label" for="s3d-angle">参考角度 <span class="mono" id="s3d-angle-value">${Math.round(S.angle)}°</span></label>
    <input id="s3d-angle" type="range" min="0" max="180" step="1" value="${Math.round(S.angle)}">
    <div class="s3d-presets" id="s3d-presets"></div>
  </div>
  <div class="s3d-bar">
    <label><input type="checkbox" id="s3d-ghosts" ${S.ghosts?'checked':''}> 参考残影</label>
    <label><input type="checkbox" id="s3d-labels" ${S.labels?'checked':''}> 角度标注</label>
    <label><input type="checkbox" id="s3d-base" ${S.base?'checked':''}> 角度图底</label>
    <label><input type="checkbox" id="s3d-grid" ${S.grid?'checked':''}> 网格</label>
    <button class="button secondary" id="s3d-reset">重置视角</button>
    <button class="button secondary" id="s3d-export">导出视图</button>
  </div>
  <p class="s3d-hint" id="s3d-hint"></p>`;
}

function basis(d){
  const ref = Math.abs(d[1])<0.9 ? [0,1,0] : [1,0,0];
  const u = norm(cross(d,ref));
  return [u, cross(d,u)];
}
function addBox(faces, base, d, len, w, h, color, alpha){
  const [u,v]=basis(d);
  const cs=[];
  for(const t of [0,len]) for(const a of [-w/2,w/2]) for(const b of [-h/2,h/2])
    cs.push(add(add(add(base,mul(d,t)),mul(u,a)),mul(v,b)));
  for(const f of [[0,1,3,2],[4,5,7,6],[0,1,5,4],[2,3,7,6],[0,2,6,4],[1,3,7,5]]){
    const pts=f.map(i=>cs[i]);
    faces.push({pts,color,alpha,n:norm(cross(sub(pts[1],pts[0]),sub(pts[2],pts[0])))});
  }
}

export function stopServo3D(){
  if (S.raf) cancelAnimationFrame(S.raf);
  S.raf=0; S.mounted=false;
}

export function mountServo3D(getMotor){
  stopServo3D();
  const canvas=document.getElementById('s3d-canvas');
  if(!canvas) return;
  S.mounted=true; S.hintKey='';
  const ctx=canvas.getContext('2d');
  const $=id=>document.getElementById(id);

  const syncPresets=()=>{
    $('s3d-presets').innerHTML=KEY_ANGLES
      .map(a=>`<button class="s3d-preset${a===Math.round(S.angle)?' on':''}" data-s3d-angle="${a}">${a}°</button>`).join('');
  };
  const syncAngleUI=()=>{
    $('s3d-angle-value').textContent=`${Math.round(S.angle)}°`;
    const sl=$('s3d-angle'); if(Number(sl.value)!==Math.round(S.angle)) sl.value=Math.round(S.angle);
    document.querySelectorAll('.s3d-preset').forEach(b=>b.classList.toggle('on',Number(b.dataset.s3dAngle)===Math.round(S.angle)));
  };
  syncPresets(); syncAngleUI();

  $('s3d-angle').addEventListener('input',ev=>{ S.angle=Number(ev.target.value); syncAngleUI(); });
  $('s3d-presets').addEventListener('click',ev=>{
    const b=ev.target.closest('[data-s3d-angle]'); if(!b)return;
    S.angle=Number(b.dataset.s3dAngle); syncAngleUI();
  });
  $('s3d-ghosts').addEventListener('change',ev=>{ S.ghosts=ev.target.checked; });
  $('s3d-labels').addEventListener('change',ev=>{ S.labels=ev.target.checked; });
  $('s3d-base').addEventListener('change',ev=>{ S.base=ev.target.checked; });
  $('s3d-grid').addEventListener('change',ev=>{ S.grid=ev.target.checked; });
  $('s3d-reset').addEventListener('click',()=>{ S.tYaw=-0.3; S.tPitch=-0.7; S.tDist=5.6; });
  $('s3d-export').addEventListener('click',()=>{
    const out=document.createElement('canvas');
    out.width=canvas.width; out.height=canvas.height;
    const g=out.getContext('2d');
    g.fillStyle='#121920'; g.fillRect(0,0,out.width,out.height);
    g.drawImage(canvas,0,0);
    const a=document.createElement('a');
    a.download=`sesame-servo-S${getMotor()}-${Math.round(S.angle)}deg.png`;
    a.href=out.toDataURL('image/png'); a.click();
  });

  let dragging=false, lx=0, ly=0;
  canvas.addEventListener('pointerdown',ev=>{ dragging=true; lx=ev.clientX; ly=ev.clientY; canvas.setPointerCapture(ev.pointerId); });
  canvas.addEventListener('pointermove',ev=>{ if(!dragging)return; S.tYaw+=(ev.clientX-lx)*0.006; S.tPitch=Math.max(-1.3,Math.min(1.3,S.tPitch+(ev.clientY-ly)*0.006)); lx=ev.clientX; ly=ev.clientY; });
  canvas.addEventListener('pointerup',()=>{ dragging=false; });
  canvas.addEventListener('pointercancel',()=>{ dragging=false; });
  canvas.addEventListener('wheel',ev=>{ ev.preventDefault(); S.tDist=Math.max(3,Math.min(12,S.tDist*(1+ev.deltaY*0.001))); },{passive:false});

  const LIGHT=norm([0.5,0.85,0.6]);
  function frame(){
    if(!S.mounted) return;
    S.raf=requestAnimationFrame(frame);
    S.yaw+=(S.tYaw-S.yaw)*0.18; S.pitch+=(S.tPitch-S.pitch)*0.18; S.dist+=(S.tDist-S.dist)*0.18;
    const motor=getMotor();
    const sv=SERVO_REF[motor];
    const [lo,hi]=rangeOf(sv);

    const angle=S.angle;
    const key=`${motor}:${Math.round(angle)}`;
    if(key!==S.hintKey){
      S.hintKey=key;
      const hint=$('s3d-hint');
      if(hint) hint.textContent=`S${sv.s}／${sv.name}／GPIO ${PINS[motor]} · ${sv.type==='h'?'水平动作':'垂直动作'} · 活动范围 ${lo}°–${hi}°。关键核对 ${KEY_ANGLES.map(a=>`${a}°=${describe(sv,a)}`).join('；')}。以原角度图为底，对照实物核对方向与行程。`;
    }

    const stage=canvas.parentElement;
    const dpr=Math.min(2,window.devicePixelRatio||1);
    const w=stage.clientWidth, h=stage.clientHeight;
    if(!w||!h) return;
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){ canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr); }
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,w,h);

    const cy=Math.cos(S.yaw), sy=Math.sin(S.yaw), cp=Math.cos(S.pitch), sp=Math.sin(S.pitch);
    const f0=Math.min(w,h)*1.4, cx=w/2, cy2=h/2;
    const proj=p=>{
      const x=p[0]*cy+p[2]*sy, z=-p[0]*sy+p[2]*cy;
      const y=p[1]*cp-z*sp, z2=p[1]*sp+z*cp;
      const depth=S.dist-z2, f=f0/Math.max(0.5,depth);
      return {x:cx+x*f, y:cy2-y*f, depth};
    };

    if(S.grid){
      ctx.strokeStyle='rgba(148,163,184,0.16)'; ctx.lineWidth=1;
      for(let i=-4;i<=4;i++){
        const a=proj([i*0.65,-0.85,-1.6]), b=proj([i*0.65,-0.85,1.6]);
        const c=proj([-2.6,-0.85,i*0.4]), d=proj([2.6,-0.85,i*0.4]);
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c.x,c.y); ctx.lineTo(d.x,d.y); ctx.stroke();
      }
    }

    // Lay the original angle diagram flat as the base plate.
    if(S.base && baseImg){
      const hw=WORLD_W/2, hh=worldH()/2;
      const O=proj([-hw,0,hh]), U=proj([hw,0,hh]), V=proj([-hw,0,-hh]);
      const nw=baseImg.naturalWidth, nh=baseImg.naturalHeight;
      ctx.save();
      ctx.globalAlpha=0.82;
      ctx.setTransform(dpr*(U.x-O.x)/nw, dpr*(U.y-O.y)/nw, dpr*(V.x-O.x)/nh, dpr*(V.y-O.y)/nh, dpr*O.x, dpr*O.y);
      ctx.drawImage(baseImg,0,0);
      ctx.restore();
    }

    const pivot=pivotOf(sv);
    const faces=[];
    if(S.ghosts) for(const a of KEY_ANGLES){
      if(a===Math.round(angle)) continue;
      addBox(faces,pivot,dirFor(sv,a),0.55,0.07,0.11,sv.color,0.25);
    }
    const d=dirFor(sv,angle);
    addBox(faces,pivot,d,0.6,0.09,0.14,sv.color,0.98);
    addBox(faces,add(pivot,mul(d,0.6)),d,0.08,0.13,0.17,'#ffffff',0.98);

    faces.forEach(fc=>{ fc.p=fc.pts.map(proj); fc.depth=fc.p.reduce((s,p)=>s+p.depth,0)/fc.p.length; });
    faces.sort((a,b)=>b.depth-a.depth);
    for(const fc of faces){
      const shade=0.55+0.45*Math.max(0,dot(fc.n,LIGHT));
      ctx.fillStyle=rgba(fc.color,fc.alpha,shade);
      ctx.strokeStyle=rgba(fc.color,Math.min(1,fc.alpha+0.15),Math.min(1,shade+0.15));
      ctx.lineWidth=1;
      ctx.beginPath(); fc.p.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }

    // Travel arc limited to this servo's diagrammed range.
    ctx.strokeStyle=rgba(sv.color,0.55); ctx.lineWidth=1.5; ctx.beginPath();
    for(let a=lo;a<=hi;a+=4){ const p=proj(add(pivot,mul(dirFor(sv,a),0.72))); a===lo?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y); }
    ctx.stroke();

    // Pivot marker on the base diagram.
    const o=proj(pivot);
    ctx.strokeStyle=rgba(sv.color,0.95); ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(o.x,o.y,5,0,Math.PI*2); ctx.stroke();

    // Orientation anchor: straight down for vertical, forward for horizontal.
    const anchor = sv.type==='v' ? add(pivot,[0,-0.75,0]) : add(pivot,[0,0,0.75]);
    const an=proj(anchor);
    ctx.strokeStyle='rgba(148,163,184,0.6)'; ctx.setLineDash([4,4]); ctx.beginPath();
    ctx.moveTo(o.x,o.y); ctx.lineTo(an.x,an.y); ctx.stroke(); ctx.setLineDash([]);
    if(S.labels){
      ctx.font='11px sans-serif'; ctx.fillStyle='rgba(148,163,184,0.95)';
      ctx.fillText(sv.type==='v'?'竖直向下':'朝前',an.x+6,an.y);
      ctx.font='600 12px sans-serif';
      ctx.fillStyle=rgba(sv.color,0.95); ctx.fillText(`${sv.name} · S${sv.s}`,o.x+8,o.y-8);
      for(const a of KEY_ANGLES){ const p=proj(add(pivot,mul(dirFor(sv,a),0.8))); ctx.fillStyle=rgba(sv.color,0.95); ctx.fillText(`${a}°`,p.x+4,p.y-4); }
      const p=proj(add(pivot,mul(d,0.9))); ctx.fillStyle='#ffffff'; ctx.fillText(`${Math.round(angle)}°`,p.x+4,p.y-4);
    }
  }
  S.raf=requestAnimationFrame(frame);
}
