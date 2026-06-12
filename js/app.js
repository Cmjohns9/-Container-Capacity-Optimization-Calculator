const CONTAINER_CBM = {"20'":28,"40'":55,"40'HQ":65,"40'HC":65,"40' Flat":55};
const FILL_THRESHOLDS = {good:90,ok:80};

function styles() { return [...new Set(RAW.map(r=>r.style))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})); }
function vendorsFor(s) { return [...new Set(RAW.filter(r=>r.style===s).map(r=>r.vendor))]; }
function containersFor(s,v) { return [...new Set(RAW.filter(r=>r.style===s&&r.vendor===v).map(r=>r.container))]; }
function getRecord(s,v,c) { return RAW.find(r=>r.style===s&&r.vendor===v&&r.container===c); }

function fillColor(pct) {
  if(pct>=FILL_THRESHOLDS.good) return '#1D9E75';
  if(pct>=FILL_THRESHOLDS.ok) return '#EF9F27';
  return '#E24B4A';
}
function fillBadge(pct) {
  if(pct>=FILL_THRESHOLDS.good) return `<span class="badge badge-ok">Efficient — ${pct}% full</span>`;
  if(pct>=FILL_THRESHOLDS.ok) return `<span class="badge badge-warn">Marginal — ${pct}% full</span>`;
  return `<span class="badge badge-no">Under-utilized — ${pct}% full</span>`;
}

function populateStyleDropdown() {
  const sel = document.getElementById('sel-style');
  styles().forEach(s => { const o=document.createElement('option'); o.value=s; o.textContent='Style '+s; sel.appendChild(o); });
  const rf = document.getElementById('ref-filter');
  styles().forEach(s => { const o=document.createElement('option'); o.value=s; o.textContent='Style '+s; rf.appendChild(o); });
}

function onStyleChange() {
  const s = document.getElementById('sel-style').value;
  const vSel = document.getElementById('sel-vendor');
  vSel.innerHTML = '<option value="">— select vendor —</option>';
  vSel.disabled = !s;
  if(s) vendorsFor(s).forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; vSel.appendChild(o); });
  document.getElementById('sel-container').innerHTML='<option value="">— select container —</option>';
  document.getElementById('sel-container').disabled=true;
  document.getElementById('inp-qty').disabled=true;
  document.getElementById('inp-qty').value='';
  document.getElementById('result-single').innerHTML='<div class="empty-state"><i class="ti ti-selector" aria-hidden="true"></i>Select a vendor and container to continue</div>';
}

function onVendorChange() {
  const s=document.getElementById('sel-style').value;
  const v=document.getElementById('sel-vendor').value;
  const cSel=document.getElementById('sel-container');
  cSel.innerHTML='<option value="">— select container —</option>';
  cSel.disabled=!v;
  if(v) containersFor(s,v).forEach(c=>{ const o=document.createElement('option'); o.value=c; o.textContent=c; cSel.appendChild(o); });
  document.getElementById('inp-qty').disabled=true;
  document.getElementById('inp-qty').value='';
  recalc();
}

function onContainerChange() {
  const s=document.getElementById('sel-style').value;
  const v=document.getElementById('sel-vendor').value;
  const c=document.getElementById('sel-container').value;
  const inp=document.getElementById('inp-qty');
  if(c && s && v) {
    const rec=getRecord(s,v,c);
    inp.disabled=false;
    if(rec && rec.qty) inp.value=rec.qty;
  } else { inp.disabled=true; inp.value=''; }
  recalc();
}

function recalc() {
  const s=document.getElementById('sel-style').value;
  const v=document.getElementById('sel-vendor').value;
  const c=document.getElementById('sel-container').value;
  const qty=parseFloat(document.getElementById('inp-qty').value)||0;
  const el=document.getElementById('result-single');
  if(!s||!v||!c){el.innerHTML='<div class="empty-state"><i class="ti ti-selector" aria-hidden="true"></i>Complete all selections above</div>';return;}
  const rec=getRecord(s,v,c);
  if(!rec){el.innerHTML='<div class="empty-state">No data for this combination</div>';return;}
  const cap=rec.qty;
  const hasQty=cap!==null;
  const targetQty=qty>0?qty:(cap||0);
  const fillPct=hasQty&&cap>0?Math.round((targetQty/cap)*100):null;
  const cbm=CONTAINER_CBM[c]||null;

  let rollsHtml='';
  if(hasQty&&cap>0&&targetQty>0){
    const rollSizes=[50,60,75,100];
    rollsHtml=`<hr class="divider"><h3 style="font-size:14px;font-weight:500;margin-bottom:.75rem;">Roll size breakdown</h3>
    <div class="grid3" style="gap:8px;">`;
    rollSizes.forEach(rs=>{
      const numRolls=Math.ceil(targetQty/rs);
      rollsHtml+=`<div class="metric"><div class="mlabel">${rs} yds/roll</div><div class="mval">${numRolls.toLocaleString()}</div><div class="msub">rolls</div></div>`;
    });
    const custom50=Math.ceil(targetQty/50);
    rollsHtml+=`</div>`;
  }

  let fillSection='';
  if(hasQty&&cap>0&&fillPct!==null){
    const barColor=fillColor(fillPct);
    const safeWidth=Math.min(fillPct,100);
    fillSection=`
    <hr class="divider">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;">
      <span style="font-size:14px;font-weight:500;">Container utilization</span>
      ${fillBadge(fillPct)}
    </div>
    <div class="fill-bar-bg"><div class="fill-bar" style="width:${safeWidth}%;background:${barColor};"></div></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--color-text-secondary);margin-top:4px;">
      <span>${targetQty.toLocaleString()} yds ordered</span>
      <span>${cap.toLocaleString()} yds max capacity</span>
    </div>`;
    if(fillPct<FILL_THRESHOLDS.ok){
      const recQty=Math.round(cap*0.9);
      fillSection+=`<div class="note"><i class="ti ti-alert-triangle" aria-hidden="true" style="font-size:14px;vertical-align:-2px;margin-right:4px;"></i>Below 80% fill — consider ordering at least ${recQty.toLocaleString()} yds to justify the container, or consolidate with another style.</div>`;
    }
  }

  el.innerHTML=`
  <div class="result-card">
    <div class="result-header">
      <span style="font-weight:500;">Style ${s} — ${v} — ${c}</span>
      ${hasQty?fillBadge(fillPct):'<span class="badge badge-info">No qty data</span>'}
    </div>
    <div class="result-body">
      <div class="grid3" style="gap:8px;margin-bottom:1rem;">
        <div class="metric"><div class="mlabel">Max capacity</div><div class="mval">${hasQty?cap.toLocaleString():'—'}</div><div class="msub">yards</div></div>
        <div class="metric"><div class="mlabel">Your quantity</div><div class="mval">${targetQty>0?targetQty.toLocaleString():'—'}</div><div class="msub">yards</div></div>
        <div class="metric"><div class="mlabel">Container CBM</div><div class="mval">${cbm||'—'}</div><div class="msub">cubic meters</div></div>
      </div>
      ${rec.notes?`<div class="note"><i class="ti ti-info-circle" aria-hidden="true" style="font-size:14px;vertical-align:-2px;margin-right:4px;"></i>${rec.notes}</div>`:''}
      ${fillSection}
      ${rollsHtml}
    </div>
  </div>`;
}

let multiRowCount=0;
function addMultiRow() {
  const id=++multiRowCount;
  const div=document.createElement('div');
  div.id='mrow-'+id;
  div.style.cssText='display:grid;grid-template-columns:1fr 1fr 1fr 36px;gap:8px;margin-bottom:8px;align-items:end;';
  div.innerHTML=`
    <div><label>Style</label>
    <select id="ms-${id}" onchange="populateMVendor(${id})">
      <option value="">— style —</option>
      ${styles().map(s=>`<option value="${s}">Style ${s}</option>`).join('')}
    </select></div>
    <div><label>Vendor</label><select id="mv-${id}" disabled onchange="populateMContainer(${id})"><option value="">—</option></select></div>
    <div><label>Quantity (yds)</label><input type="number" id="mq-${id}" min="0" placeholder="0" oninput="multiRecalc()" disabled /></div>
    <div><button onclick="removeRow(${id})" style="height:36px;width:36px;border:0.5px solid var(--color-border-secondary);border-radius:var(--border-radius-md);background:transparent;cursor:pointer;color:var(--color-text-secondary);"><i class="ti ti-x" aria-hidden="true"></i></button></div>`;
  document.getElementById('m-rows').appendChild(div);
  multiRecalc();
}
function removeRow(id){const el=document.getElementById('mrow-'+id);if(el)el.remove();multiRecalc();}
function populateMVendor(id){
  const s=document.getElementById('ms-'+id).value;
  const vSel=document.getElementById('mv-'+id);
  vSel.innerHTML='<option value="">—</option>';
  vSel.disabled=!s;
  if(s)vendorsFor(s).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;vSel.appendChild(o);});
  document.getElementById('mq-'+id).disabled=true;
  multiRecalc();
}
function populateMContainer(id){
  const qInp=document.getElementById('mq-'+id);
  const s=document.getElementById('ms-'+id).value;
  const v=document.getElementById('mv-'+id).value;
  qInp.disabled=!(s&&v);
  multiRecalc();
}
function multiRecalc(){
  const c=document.getElementById('m-container').value;
  const fillTarget=parseInt(document.getElementById('m-fill-target').value)||90;
  const res=document.getElementById('result-multi');
  if(!c){res.innerHTML='<div class="empty-state" style="margin-top:1rem;"><i class="ti ti-container" aria-hidden="true"></i>Select a container size first</div>';return;}
  const rows=[];
  document.querySelectorAll('[id^="mrow-"]').forEach(row=>{
    const id=row.id.replace('mrow-','');
    const s=document.getElementById('ms-'+id)?.value;
    const v=document.getElementById('mv-'+id)?.value;
    const q=parseFloat(document.getElementById('mq-'+id)?.value)||0;
    if(s&&v&&q>0){
      const rec=getRecord(s,v,c);
      rows.push({style:s,vendor:v,qty:q,cap:rec?rec.qty:null,notes:rec?rec.notes:''});
    }
  });
  if(rows.length===0){res.innerHTML='<div class="empty-state" style="margin-top:1rem;"><i class="ti ti-selector" aria-hidden="true"></i>Add at least one style with a quantity</div>';return;}
  const totalQty=rows.reduce((s,r)=>s+r.qty,0);
  const totalCap=rows.reduce((s,r)=>s+(r.cap||0),0);
  const cbm=CONTAINER_CBM[c]||null;
  const overallPct=totalCap>0?Math.round((totalQty/totalCap)*100):null;
  const barColor=overallPct?fillColor(overallPct):'#888';
  const safeWidth=overallPct?Math.min(overallPct,100):0;
  const statusBadge=overallPct?fillBadge(overallPct):'';

  let rowsHtml=rows.map(r=>{
    const capCell=r.cap?r.cap.toLocaleString()+' yds':'N/A';
    const p=r.cap&&r.cap>0?Math.round((r.qty/r.cap)*100):null;
    const badge=p?`<span class="badge ${p>=90?'badge-ok':p>=80?'badge-warn':'badge-no'}">${p}%</span>`:'—';
    return `<tr>
      <td style="padding:8px 6px;font-size:13px;">Style ${r.style}</td>
      <td style="padding:8px 6px;font-size:13px;color:var(--color-text-secondary);">${r.vendor}</td>
      <td style="padding:8px 6px;font-size:13px;text-align:right;">${r.qty.toLocaleString()}</td>
      <td style="padding:8px 6px;font-size:13px;text-align:right;color:var(--color-text-secondary);">${capCell}</td>
      <td style="padding:8px 6px;font-size:13px;text-align:center;">${badge}</td>
    </tr>`;
  }).join('');

  let advice='';
  if(overallPct!==null&&overallPct<fillTarget){
    advice=`<div class="note" style="margin-top:1rem;"><i class="ti ti-alert-triangle" aria-hidden="true" style="font-size:14px;vertical-align:-2px;margin-right:4px;"></i>Combined fill is ${overallPct}% — below your ${fillTarget}% target. Add more quantity or consolidate styles to justify this container.</div>`;
  }

  res.innerHTML=`
  <div class="result-card" style="margin-top:1rem;">
    <div class="result-header">
      <span style="font-weight:500;">${c} container summary</span>
      ${statusBadge}
    </div>
    <div class="result-body">
      <div class="grid3" style="gap:8px;margin-bottom:1rem;">
        <div class="metric"><div class="mlabel">Total yards</div><div class="mval">${totalQty.toLocaleString()}</div><div class="msub">ordered</div></div>
        <div class="metric"><div class="mlabel">Total capacity</div><div class="mval">${totalCap>0?totalCap.toLocaleString():'—'}</div><div class="msub">yards available</div></div>
        <div class="metric"><div class="mlabel">Container</div><div class="mval">${cbm||'—'}</div><div class="msub">CBM</div></div>
      </div>
      ${overallPct?`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;"><span style="font-size:13px;color:var(--color-text-secondary);">Overall fill</span></div>
      <div class="fill-bar-bg"><div class="fill-bar" style="width:${safeWidth}%;background:${barColor};"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--color-text-secondary);margin-top:4px;margin-bottom:1rem;"><span>${totalQty.toLocaleString()} yds</span><span>${totalCap.toLocaleString()} yds max</span></div>`:''}
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr style="border-bottom:0.5px solid var(--color-border-secondary);">
          <th style="text-align:left;padding:6px;font-weight:500;font-size:12px;color:var(--color-text-secondary);">Style</th>
          <th style="text-align:left;padding:6px;font-weight:500;font-size:12px;color:var(--color-text-secondary);">Vendor</th>
          <th style="text-align:right;padding:6px;font-weight:500;font-size:12px;color:var(--color-text-secondary);">Qty (yds)</th>
          <th style="text-align:right;padding:6px;font-weight:500;font-size:12px;color:var(--color-text-secondary);">Max cap</th>
          <th style="text-align:center;padding:6px;font-weight:500;font-size:12px;color:var(--color-text-secondary);">Fill %</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      ${advice}
    </div>
  </div>`;
}

function renderRef(){
  const filter=document.getElementById('ref-filter').value;
  const data=filter?RAW.filter(r=>r.style===filter):RAW;
  const el=document.getElementById('ref-table');
  const rows=data.map(r=>`<tr>
    <td style="padding:8px 6px;font-size:13px;">Style ${r.style}</td>
    <td style="padding:8px 6px;font-size:13px;color:var(--color-text-secondary);">${r.vendor}</td>
    <td style="padding:8px 6px;font-size:13px;">${r.container}</td>
    <td style="padding:8px 6px;font-size:13px;text-align:right;">${r.qty?r.qty.toLocaleString()+'yds':'—'}</td>
    <td style="padding:8px 6px;font-size:12px;color:var(--color-text-secondary);">${r.notes||''}</td>
  </tr>`).join('');
  el.innerHTML=`<table style="width:100%;border-collapse:collapse;min-width:500px;">
    <thead><tr style="border-bottom:0.5px solid var(--color-border-secondary);">
      <th style="text-align:left;padding:8px 6px;font-weight:500;font-size:12px;color:var(--color-text-secondary);">Style</th>
      <th style="text-align:left;padding:8px 6px;font-weight:500;font-size:12px;color:var(--color-text-secondary);">Vendor</th>
      <th style="text-align:left;padding:8px 6px;font-weight:500;font-size:12px;color:var(--color-text-secondary);">Container</th>
      <th style="text-align:right;padding:8px 6px;font-weight:500;font-size:12px;color:var(--color-text-secondary);">Max qty</th>
      <th style="text-align:left;padding:8px 6px;font-weight:500;font-size:12px;color:var(--color-text-secondary);">Notes</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function setTab(tab){
  ['single','multi','ref'].forEach(t=>{
    document.getElementById('view-'+t).style.display=t===tab?'block':'none';
    document.getElementById('tab-'+t).classList.toggle('active',t===tab);
  });
  if(tab==='ref') renderRef();
  if(tab==='multi' && document.getElementById('m-rows').children.length===0) addMultiRow();
}

populateStyleDropdown();
renderRef();