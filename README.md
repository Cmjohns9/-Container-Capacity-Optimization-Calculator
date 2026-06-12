# -Container-Capacity-Optimization-Calculator
Calculator for optimizing import shipments by container size, vendor, and style capacity
A browser-based tool for planning fabric container shipments. Select style, vendor, and container size to calculate fill efficiency, roll counts, and whether a shipment meets minimum load thresholds — with support for mixed-style containers

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Container Capacity Optimization Calculator</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f5f5f3;
    --surface: #ffffff;
    --surface2: #f0efec;
    --border: rgba(0,0,0,0.12);
    --border-md: rgba(0,0,0,0.22);
    --text: #1a1a18;
    --text-muted: #6b6b67;
    --text-hint: #9b9b96;
    --blue: #185FA5;
    --blue-bg: #E6F1FB;
    --blue-text: #0C447C;
    --green: #0F6E56;
    --green-bg: #E1F5EE;
    --green-text: #085041;
    --amber: #854F0B;
    --amber-bg: #FAEEDA;
    --amber-text: #633806;
    --red: #A32D2D;
    --red-bg: #FCEBEB;
    --red-text: #791F1F;
    --radius: 8px;
    --radius-lg: 12px;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #1c1c1a;
      --surface: #252523;
      --surface2: #2e2e2b;
      --border: rgba(255,255,255,0.1);
      --border-md: rgba(255,255,255,0.2);
      --text: #e8e8e3;
      --text-muted: #9b9b96;
      --text-hint: #6b6b67;
      --blue: #378ADD;
      --blue-bg: #0c2c4a;
      --blue-text: #85B7EB;
      --green: #1D9E75;
      --green-bg: #04342C;
      --green-text: #5DCAA5;
      --amber: #EF9F27;
      --amber-bg: #412402;
      --amber-text: #FAC775;
      --red: #E24B4A;
      --red-bg: #501313;
      --red-text: #F09595;
    }
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    font-size: 15px;
    line-height: 1.6;
    min-height: 100vh;
  }

  header {
    background: var(--surface);
    border-bottom: 0.5px solid var(--border);
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  header .logo { font-size: 20px; color: var(--blue); }
  header h1 { font-size: 17px; font-weight: 500; }
  header p { font-size: 13px; color: var(--text-muted); }

  .container { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; }

  .tab-row { display: flex; gap: 8px; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .tab {
    font-size: 13px; padding: 7px 16px;
    border: 0.5px solid var(--border-md);
    border-radius: var(--radius);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    font-family: inherit;
    transition: background .15s, color .15s;
  }
  .tab:hover { background: var(--surface2); color: var(--text); }
  .tab.active { background: var(--blue-bg); color: var(--blue-text); border-color: transparent; font-weight: 500; }

  .card {
    background: var(--surface);
    border: 0.5px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
  }

  label { font-size: 13px; color: var(--text-muted); display: block; margin-bottom: 6px; }

  select, input[type="number"] {
    width: 100%;
    padding: 8px 10px;
    font-size: 14px;
    border: 0.5px solid var(--border-md);
    border-radius: var(--radius);
    background: var(--surface);
    color: var(--text);
    font-family: inherit;
    appearance: none;
    -webkit-appearance: none;
  }
  select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px; }
  select:focus, input:focus { outline: none; border-color: var(--blue); box-shadow: 0 0 0 3px rgba(55,138,221,0.15); }
  select:disabled, input:disabled { opacity: .45; cursor: not-allowed; }

  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  @media (max-width: 600px) { .grid2, .grid3 { grid-template-columns: 1fr; } }

  .metric {
    background: var(--surface2);
    border-radius: var(--radius);
    padding: .9rem 1rem;
  }
  .metric .mlabel { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; }
  .metric .mval { font-size: 22px; font-weight: 500; line-height: 1.2; }
  .metric .msub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

  .badge { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: var(--radius); }
  .badge-ok { background: var(--green-bg); color: var(--green-text); }
  .badge-warn { background: var(--amber-bg); color: var(--amber-text); }
  .badge-no { background: var(--red-bg); color: var(--red-text); }
  .badge-info { background: var(--blue-bg); color: var(--blue-text); }

  .result-card { border-radius: var(--radius-lg); border: 0.5px solid var(--border); background: var(--surface); overflow: hidden; }
  .result-header { padding: .8rem 1.25rem; background: var(--surface2); border-bottom: 0.5px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .result-body { padding: 1.1rem 1.25rem; }

  hr.divider { border: none; border-top: 0.5px solid var(--border); margin: 1.1rem 0; }

  .fill-bar-bg { background: var(--surface2); border-radius: 4px; height: 8px; margin: .5rem 0 .25rem; overflow: hidden; }
  .fill-bar { height: 8px; border-radius: 4px; transition: width .5s ease; }

  .note {
    font-size: 13px;
    color: var(--text-muted);
    background: var(--surface2);
    border-radius: var(--radius);
    padding: .65rem .9rem;
    margin-top: .75rem;
    display: flex;
    gap: 6px;
    align-items: flex-start;
  }
  .note i { flex-shrink: 0; margin-top: 1px; font-size: 15px; }

  .empty-state { text-align: center; padding: 2.5rem 1rem; color: var(--text-hint); font-size: 14px; }
  .empty-state i { font-size: 36px; display: block; margin-bottom: .6rem; opacity: .4; }

  .btn-add {
    margin-top: .75rem; font-size: 13px; padding: 7px 14px;
    border: 0.5px solid var(--border-md);
    border-radius: var(--radius);
    background: transparent; color: var(--text);
    cursor: pointer; font-family: inherit;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-add:hover { background: var(--surface2); }

  .btn-remove {
    height: 36px; width: 36px;
    border: 0.5px solid var(--border);
    border-radius: var(--radius);
    background: transparent;
    cursor: pointer;
    color: var(--text-muted);
    display: flex; align-items: center; justify-content: center;
  }
  .btn-remove:hover { background: var(--red-bg); color: var(--red-text); border-color: transparent; }

  .multi-row { display: grid; grid-template-columns: 1fr 1fr 1fr 36px; gap: 8px; margin-bottom: 8px; align-items: end; }
  @media (max-width: 600px) { .multi-row { grid-template-columns: 1fr 1fr; } .multi-row .btn-remove { grid-column: 2; justify-self: end; } }

  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 7px 8px; font-weight: 500; font-size: 12px; color: var(--text-muted); border-bottom: 0.5px solid var(--border-md); }
  td { padding: 8px; border-bottom: 0.5px solid var(--border); vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .ref-wrap { overflow-x: auto; margin-top: 1rem; }

  h3 { font-size: 15px; font-weight: 500; margin-bottom: .75rem; }

  footer { text-align: center; padding: 2rem; font-size: 12px; color: var(--text-hint); border-top: 0.5px solid var(--border); margin-top: 2rem; }
</style>
</head>
<body>

<header>
  <i class="ti ti-container logo" aria-hidden="true"></i>
  <div>
    <h1>Container Capacity Optimization Calculator</h1>
    <p>Fabric import shipping — fill efficiency by style, vendor &amp; container</p>
  </div>
</header>

<div class="container">
  <div class="tab-row">
    <button class="tab active" onclick="setTab('single')" id="tab-single">Single style</button>
    <button class="tab" onclick="setTab('multi')" id="tab-multi">Multi-style / mixed container</button>
    <button class="tab" onclick="setTab('ref')" id="tab-ref">Reference table</button>
  </div>

  <!-- SINGLE STYLE -->
  <div id="view-single">
    <div class="grid2">
      <div class="card">
        <label for="sel-style">Style number</label>
        <select id="sel-style" onchange="onStyleChange()">
          <option value="">— select style —</option>
        </select>
      </div>
      <div class="card">
        <label for="sel-vendor">Vendor</label>
        <select id="sel-vendor" onchange="onVendorChange()" disabled>
          <option value="">— select vendor —</option>
        </select>
      </div>
    </div>
    <div class="grid2">
      <div class="card">
        <label for="sel-container">Container size</label>
        <select id="sel-container" onchange="onContainerChange()" disabled>
          <option value="">— select container —</option>
        </select>
      </div>
      <div class="card">
        <label for="inp-qty">Your quantity (yds)</label>
        <input type="number" id="inp-qty" placeholder="e.g. 45000" min="0" oninput="recalc()" disabled />
      </div>
    </div>
    <div id="result-single">
      <div class="empty-state">
        <i class="ti ti-selector" aria-hidden="true"></i>
        Select a style, vendor, and container to see fill analysis
      </div>
    </div>
  </div>

  <!-- MULTI STYLE -->
  <div id="view-multi" style="display:none;">
    <div class="card">
      <h3>Container</h3>
      <div class="grid2">
        <div>
          <label for="m-container">Container size</label>
          <select id="m-container" onchange="multiRecalc()">
            <option value="">— select —</option>
            <option value="20'">20' (28 CBM)</option>
            <option value="40'">40' (55 CBM)</option>
            <option value="40'HQ">40' HQ (65 CBM)</option>
          </select>
        </div>
        <div>
          <label for="m-fill-target">Minimum fill target</label>
          <select id="m-fill-target" onchange="multiRecalc()">
            <option value="90">≥ 90%</option>
            <option value="85">≥ 85%</option>
            <option value="80">≥ 80%</option>
            <option value="75">≥ 75%</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Styles to ship</h3>
      <div id="m-rows"></div>
      <button class="btn-add" onclick="addMultiRow()">
        <i class="ti ti-plus" aria-hidden="true"></i> Add style
      </button>
    </div>

    <div id="result-multi"></div>
  </div>

  <!-- REFERENCE TABLE -->
  <div id="view-ref" style="display:none;">
    <div class="card">
      <label for="ref-filter">Filter by style</label>
      <select id="ref-filter" onchange="renderRef()">
        <option value="">All styles</option>
      </select>
    </div>
    <div class="ref-wrap">
      <div id="ref-table"></div>
    </div>
  </div>
</div>

<footer>Container Capacity Optimization Calculator &mdash; Internal use only</footer>

<script>
const RAW = [
  {style:"461",vendor:"YG",container:"20'",qty:28000,notes:""},
  {style:"461",vendor:"YG",container:"40'HQ",qty:68000,notes:""},
  {style:"471",vendor:"YG",container:"20'",qty:26000,notes:""},
  {style:"471",vendor:"YG",container:"40'HQ",qty:46500,notes:""},
  {style:"481",vendor:"YG",container:"20'",qty:24000,notes:""},
  {style:"481",vendor:"YG",container:"40'HQ",qty:35600,notes:""},
  {style:"1025",vendor:"HT",container:"20'",qty:44000,notes:"+ 2k rolls"},
  {style:"1025",vendor:"HT",container:"40'HC",qty:92000,notes:"+ 2k rolls, CIF"},
  {style:"1025",vendor:"HT",container:"40' Flat",qty:87000,notes:"CIF"},
  {style:"1025",vendor:"LP",container:"20'",qty:43000,notes:""},
  {style:"1025",vendor:"LP",container:"40'",qty:85000,notes:""},
  {style:"1299",vendor:"Altex",container:"20'",qty:40000,notes:"Rolls; 14,500 Kgs GW"},
  {style:"1299",vendor:"Hi Tech",container:"20'",qty:46500,notes:"Rolls"},
  {style:"1299",vendor:"Hi Tech",container:"40'",qty:100000,notes:"approx; 63/CBM"},
  {style:"1299",vendor:"Hi Tech",container:"40'HQ",qty:110000,notes:"approx; 69/CBM"},
  {style:"1299",vendor:"Altex",container:"40'",qty:80000,notes:"Rolls; 18,700 Kgs GW"},
  {style:"1299",vendor:"Altex",container:"40'HQ",qty:85000,notes:""},
  {style:"1317",vendor:"Jin Jin",container:"20'",qty:150000,notes:"Rolls"},
  {style:"1317",vendor:"YG",container:"20'",qty:150000,notes:""},
  {style:"1375",vendor:"Lipeng",container:"20'",qty:37000,notes:""},
  {style:"1375",vendor:"Lipeng",container:"40'",qty:75000,notes:""},
  {style:"1375",vendor:"Jin Jin",container:"20'",qty:25000,notes:"loose rolls / 13K packed on pallets"},
  {style:"1929",vendor:"YG",container:"20'",qty:17000,notes:""},
  {style:"1929",vendor:"YG",container:"40'HQ",qty:38000,notes:""},
  {style:"1984",vendor:"Handseltex",container:"20'",qty:25500,notes:""},
  {style:"1984",vendor:"Jongstit",container:"20'",qty:22000,notes:"21,000–21,500 range"},
  {style:"1984",vendor:"Jongstit",container:"40'",qty:46000,notes:"±5%"},
  {style:"1984",vendor:"Jongstit",container:"40'HQ",qty:53000,notes:"±5%"},
  {style:"2000",vendor:"ITL",container:"20'",qty:29400,notes:""},
  {style:"2000",vendor:"Lipeng",container:"20'",qty:26000,notes:""},
  {style:"2000",vendor:"Lipeng",container:"40'",qty:52000,notes:""},
  {style:"2000",vendor:"Lipeng",container:"40'HQ",qty:60000,notes:"Weight limit: 19K tons for 40'HQ"},
  {style:"2000",vendor:"YG",container:"20'",qty:26500,notes:"Updated 5/22"},
  {style:"2000",vendor:"YG",container:"40'HQ",qty:52000,notes:""},
  {style:"2001",vendor:"YG",container:"20'",qty:21500,notes:""},
  {style:"2001",vendor:"YG",container:"40'HQ",qty:44500,notes:""},
  {style:"2001",vendor:"Lipeng",container:"20'",qty:20000,notes:""},
  {style:"2001",vendor:"Lipeng",container:"40'",qty:40000,notes:""},
  {style:"2110",vendor:"YG",container:"20'",qty:26000,notes:""},
  {style:"2110",vendor:"YG",container:"40'HQ",qty:62000,notes:""},
  {style:"2112",vendor:"YG",container:"20'",qty:17000,notes:""},
  {style:"2112",vendor:"YG",container:"40'HQ",qty:38000,notes:""},
  {style:"2114",vendor:"YG",container:"20'",qty:11000,notes:""},
  {style:"2114",vendor:"YG",container:"40'HQ",qty:27500,notes:""},
  {style:"4451",vendor:"Lipeng",container:"20'",qty:35000,notes:"Max weight 17.2 ton"},
  {style:"4451",vendor:"Lipeng",container:"40'",qty:69000,notes:"Max weight 19 ton"},
  {style:"4651",vendor:"Lipeng",container:"20'",qty:35000,notes:"Max weight 17.2 ton"},
  {style:"4651",vendor:"Lipeng",container:"40'",qty:69000,notes:"Max weight 19 ton"},
  {style:"4651 120\"",vendor:"Lipeng",container:"20'",qty:null,notes:"BBJ Atelier"},
  {style:"4651 120\"",vendor:"Lipeng",container:"40'",qty:null,notes:"BBJ Atelier"},
  {style:"4800",vendor:"HT",container:"20'",qty:40000,notes:"CIF"},
  {style:"4800",vendor:"Lipeng",container:"20'",qty:45000,notes:""},
  {style:"4800",vendor:"YG",container:"20'",qty:45000,notes:""},
  {style:"4800",vendor:"YG",container:"40'HQ",qty:82000,notes:""},
  {style:"4800",vendor:"Lipeng",container:"40'",qty:90000,notes:""},
  {style:"4800",vendor:"HT",container:"40'",qty:90000,notes:"CIF"},
  {style:"4801",vendor:"YG",container:"20'",qty:36000,notes:""},
  {style:"4801",vendor:"Lipeng",container:"20'",qty:40000,notes:""},
  {style:"4801",vendor:"Lipeng",container:"40'",qty:80000,notes:""},
  {style:"4801",vendor:"YG",container:"40'HQ",qty:69000,notes:""},
  {style:"5000/5150",vendor:"Cem Turkey",container:"20'",qty:41000,notes:"40,000–42,000 range"},
  {style:"5000/5150",vendor:"Cem Turkey",container:"40'HQ",qty:95000,notes:"90,000–100,000 range"},
  {style:"5000/5150",vendor:"CHINA",container:"40'",qty:null,notes:"68 CBM; 1000 yds Voile≈0.375 cbm, 1000 yds Batiste≈0.5 cbm"},
  {style:"5000/5150",vendor:"CHINA",container:"20'",qty:null,notes:"Don't exceed 27 CBM; leave 1 cbm clearance"},
  {style:"6000",vendor:"YG",container:"20'",qty:72000,notes:""},
  {style:"6000",vendor:"YG",container:"40'",qty:175000,notes:""},
  {style:"5118",vendor:"YG",container:"20'",qty:null,notes:""},
  {style:"5118",vendor:"YG",container:"40'",qty:null,notes:""},
  {style:"2020",vendor:"MT Meijali",container:"20'",qty:21500,notes:"28 CBM; MOQ 14K"},
  {style:"2020",vendor:"MT Meijali",container:"40'",qty:41000,notes:"58 CBM; MOQ 14K"},
  {style:"2020",vendor:"YG",container:"20'",qty:15500,notes:""},
  {style:"2020",vendor:"YG",container:"40'",qty:38000,notes:""},
  {style:"2025",vendor:"Li Peng",container:"20'",qty:45000,notes:""},
  {style:"2025",vendor:"Li Peng",container:"40'",qty:80000,notes:""},
  {style:"2246",vendor:"Youngbo",container:"20'",qty:100000,notes:"approx"},
  {style:"7036",vendor:"Li Peng",container:"20'",qty:32000,notes:""},
  {style:"7036",vendor:"Li Peng",container:"40'",qty:61000,notes:""},
  {style:"B Spun/Nuova",vendor:"Li Peng",container:"20'",qty:23000,notes:"approx"},
  {style:"B Spun/Nuova",vendor:"Li Peng",container:"40'",qty:43000,notes:"approx"},
  {style:"5550",vendor:"Jin Jin",container:"20'",qty:65000,notes:""},
  {style:"5550",vendor:"Jin Jin",container:"40'",qty:90000,notes:""},
  {style:"5550",vendor:"Handseltex",container:"20'",qty:50000,notes:""},
  {style:"5550",vendor:"Handseltex",container:"40'",qty:110000,notes:""},
  {style:"7016",vendor:"Li Peng",container:"20'",qty:31000,notes:""},
  {style:"7016",vendor:"Li Peng",container:"40'",qty:62000,notes:""},
  {style:"7016 120\"",vendor:"Li Peng",container:"20'",qty:null,notes:"BBJ Atelier"},
  {style:"7016 120\"",vendor:"Li Peng",container:"40'",qty:null,notes:"BBJ Atelier"},
  {style:"2115",vendor:"YISHAI Hengtai",container:"20'",qty:4921,notes:"4500m=4921 yds; 126 cartons"},
  {style:"2115",vendor:"YISHAI Hengtai",container:"40'",qty:10389,notes:"9500m=10389 yds; 264 cartons"},
  {style:"2115",vendor:"YISHAI Hengtai",container:"40'HQ",qty:12030,notes:"11000m=12030 yds; 308 cartons; volume pricing available"},
  {style:"2026",vendor:"Dorell",container:"20'",qty:13000,notes:"50–60 yds/roll; max 50 lbs/roll (OSHA)"},
  {style:"2026",vendor:"Dorell",container:"40'",qty:30000,notes:"50–60 yds/roll; max 50 lbs/roll (OSHA)"},
  {style:"Panama 120\"",vendor:"Dorell",container:"20'",qty:6000,notes:""},
  {style:"Panama 120\"",vendor:"Dorell",container:"40'",qty:13000,notes:""},
  {style:"Panama 120\"",vendor:"Dorell",container:"40'HQ",qty:16000,notes:""},
];

const CONTAINER_CBM = {"20'":28,"40'":55,"40'HQ":65,"40'HC":65,"40' Flat":55};

function styles() { return [...new Set(RAW.map(r=>r.style))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})); }
function vendorsFor(s) { return [...new Set(RAW.filter(r=>r.style===s).map(r=>r.vendor))]; }
function containersFor(s,v) { return [...new Set(RAW.filter(r=>r.style===s&&r.vendor===v).map(r=>r.container))]; }
function getRecord(s,v,c) { return RAW.find(r=>r.style===s&&r.vendor===v&&r.container===c); }

function fillColor(pct) {
  if (pct >= 90) return '#1D9E75';
  if (pct >= 80) return '#EF9F27';
  return '#E24B4A';
}
function fillBadge(pct) {
  if (pct >= 90) return `<span class="badge badge-ok"><i class="ti ti-circle-check" aria-hidden="true"></i>Efficient — ${pct}% full</span>`;
  if (pct >= 80) return `<span class="badge badge-warn"><i class="ti ti-alert-triangle" aria-hidden="true"></i>Marginal — ${pct}% full</span>`;
  return `<span class="badge badge-no"><i class="ti ti-circle-x" aria-hidden="true"></i>Under-utilized — ${pct}% full</span>`;
}

function populateDropdowns() {
  const sel = document.getElementById('sel-style');
  const rf = document.getElementById('ref-filter');
  styles().forEach(s => {
    [sel, rf].forEach(el => {
      const o = document.createElement('option');
      o.value = s; o.textContent = 'Style ' + s;
      el.appendChild(o);
    });
  });
}

function onStyleChange() {
  const s = document.getElementById('sel-style').value;
  const vSel = document.getElementById('sel-vendor');
  vSel.innerHTML = '<option value="">— select vendor —</option>';
  vSel.disabled = !s;
  if (s) vendorsFor(s).forEach(v => { const o=document.createElement('option'); o.value=v; o.textContent=v; vSel.appendChild(o); });
  const cSel = document.getElementById('sel-container');
  cSel.innerHTML = '<option value="">— select container —</option>';
  cSel.disabled = true;
  const inp = document.getElementById('inp-qty');
  inp.disabled = true; inp.value = '';
  document.getElementById('result-single').innerHTML = '<div class="empty-state"><i class="ti ti-selector" aria-hidden="true"></i>Select a vendor and container to continue</div>';
}

function onVendorChange() {
  const s = document.getElementById('sel-style').value;
  const v = document.getElementById('sel-vendor').value;
  const cSel = document.getElementById('sel-container');
  cSel.innerHTML = '<option value="">— select container —</option>';
  cSel.disabled = !v;
  if (v) containersFor(s,v).forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; cSel.appendChild(o); });
  document.getElementById('inp-qty').disabled = true;
  document.getElementById('inp-qty').value = '';
  recalc();
}

function onContainerChange() {
  const s = document.getElementById('sel-style').value;
  const v = document.getElementById('sel-vendor').value;
  const c = document.getElementById('sel-container').value;
  const inp = document.getElementById('inp-qty');
  if (c && s && v) {
    const rec = getRecord(s,v,c);
    inp.disabled = false;
    if (rec && rec.qty) inp.value = rec.qty;
  } else { inp.disabled = true; inp.value = ''; }
  recalc();
}

function recalc() {
  const s = document.getElementById('sel-style').value;
  const v = document.getElementById('sel-vendor').value;
  const c = document.getElementById('sel-container').value;
  const qty = parseFloat(document.getElementById('inp-qty').value) || 0;
  const el = document.getElementById('result-single');
  if (!s||!v||!c) { el.innerHTML='<div class="empty-state"><i class="ti ti-selector" aria-hidden="true"></i>Complete all selections above</div>'; return; }
  const rec = getRecord(s,v,c);
  if (!rec) { el.innerHTML='<div class="empty-state">No data for this combination</div>'; return; }
  const cap = rec.qty;
  const hasQty = cap !== null;
  const targetQty = qty > 0 ? qty : (cap || 0);
  const fillPct = hasQty && cap > 0 ? Math.round((targetQty/cap)*100) : null;
  const cbm = CONTAINER_CBM[c] || null;

  let rollsHtml = '';
  if (hasQty && cap > 0 && targetQty > 0) {
    rollsHtml = `<hr class="divider"><h3>Roll size breakdown</h3><div class="grid3" style="gap:8px;">`;
    [50,60,75,100].forEach(rs => {
      const n = Math.ceil(targetQty/rs);
      rollsHtml += `<div class="metric"><div class="mlabel">${rs} yds / roll</div><div class="mval">${n.toLocaleString()}</div><div class="msub">rolls needed</div></div>`;
    });
    rollsHtml += `</div>`;
  }

  let fillSection = '';
  if (hasQty && cap > 0 && fillPct !== null) {
    const barColor = fillColor(fillPct);
    const safeWidth = Math.min(fillPct, 100);
    fillSection = `
    <hr class="divider">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;">
      <span style="font-size:14px;font-weight:500;">Container utilization</span>
      ${fillBadge(fillPct)}
    </div>
    <div class="fill-bar-bg"><div class="fill-bar" style="width:${safeWidth}%;background:${barColor};"></div></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-top:4px;">
      <span>${targetQty.toLocaleString()} yds ordered</span>
      <span>${cap.toLocaleString()} yds max capacity</span>
    </div>`;
    if (fillPct < 80) {
      const recQty = Math.round(cap * 0.9);
      fillSection += `<div class="note"><i class="ti ti-alert-triangle"></i><span>Below 80% fill — consider ordering at least <strong>${recQty.toLocaleString()} yds</strong> to justify this container, or consolidate with another style.</span></div>`;
    }
  }

  el.innerHTML = `
  <div class="result-card">
    <div class="result-header">
      <span style="font-weight:500;">Style ${s} &mdash; ${v} &mdash; ${c}</span>
      ${hasQty && fillPct !== null ? fillBadge(fillPct) : '<span class="badge badge-info">No qty data</span>'}
    </div>
    <div class="result-body">
      <div class="grid3" style="gap:8px;margin-bottom:1rem;">
        <div class="metric"><div class="mlabel">Max capacity</div><div class="mval">${hasQty ? cap.toLocaleString() : '—'}</div><div class="msub">yards</div></div>
        <div class="metric"><div class="mlabel">Your quantity</div><div class="mval">${targetQty > 0 ? targetQty.toLocaleString() : '—'}</div><div class="msub">yards</div></div>
        <div class="metric"><div class="mlabel">Container CBM</div><div class="mval">${cbm || '—'}</div><div class="msub">cubic meters</div></div>
      </div>
      ${rec.notes ? `<div class="note"><i class="ti ti-info-circle"></i><span>${rec.notes}</span></div>` : ''}
      ${fillSection}
      ${rollsHtml}
    </div>
  </div>`;
}

let multiRowCount = 0;
function addMultiRow() {
  const id = ++multiRowCount;
  const div = document.createElement('div');
  div.id = 'mrow-' + id;
  div.className = 'multi-row';
  div.innerHTML = `
    <div>
      <label>Style</label>
      <select id="ms-${id}" onchange="populateMVendor(${id})">
        <option value="">— style —</option>
        ${styles().map(s=>`<option value="${s}">Style ${s}</option>`).join('')}
      </select>
    </div>
    <div>
      <label>Vendor</label>
      <select id="mv-${id}" disabled onchange="multiRecalc()">
        <option value="">—</option>
      </select>
    </div>
    <div>
      <label>Quantity (yds)</label>
      <input type="number" id="mq-${id}" min="0" placeholder="0" oninput="multiRecalc()" disabled />
    </div>
    <div style="display:flex;align-items:flex-end;">
      <button class="btn-remove" onclick="removeRow(${id})" title="Remove row"><i class="ti ti-x" aria-hidden="true"></i></button>
    </div>`;
  document.getElementById('m-rows').appendChild(div);
  multiRecalc();
}

function removeRow(id) { const el=document.getElementById('mrow-'+id); if(el) el.remove(); multiRecalc(); }

function populateMVendor(id) {
  const s = document.getElementById('ms-'+id).value;
  const vSel = document.getElementById('mv-'+id);
  vSel.innerHTML = '<option value="">—</option>';
  vSel.disabled = !s;
  if (s) vendorsFor(s).forEach(v => { const o=document.createElement('option'); o.value=v; o.textContent=v; vSel.appendChild(o); });
  document.getElementById('mq-'+id).disabled = true;
  vSel.addEventListener('change', () => {
    const c = document.getElementById('m-container').value;
    const qInp = document.getElementById('mq-'+id);
    qInp.disabled = !(s && vSel.value);
    if (s && vSel.value && c) {
      const rec = getRecord(s, vSel.value, c);
      if (rec && rec.qty) qInp.value = rec.qty;
    }
    multiRecalc();
  }, {once:false});
  multiRecalc();
}

function multiRecalc() {
  const c = document.getElementById('m-container').value;
  const fillTarget = parseInt(document.getElementById('m-fill-target').value) || 90;
  const res = document.getElementById('result-multi');
  if (!c) { res.innerHTML = '<div class="empty-state" style="margin-top:1rem;"><i class="ti ti-container" aria-hidden="true"></i>Select a container size first</div>'; return; }
  const rows = [];
  document.querySelectorAll('[id^="mrow-"]').forEach(row => {
    const id = row.id.replace('mrow-','');
    const s = document.getElementById('ms-'+id)?.value;
    const v = document.getElementById('mv-'+id)?.value;
    const q = parseFloat(document.getElementById('mq-'+id)?.value) || 0;
    if (s && v && q > 0) {
      const rec = getRecord(s, v, c);
      rows.push({style:s, vendor:v, qty:q, cap:rec?rec.qty:null, notes:rec?rec.notes:''});
    }
  });
  if (rows.length === 0) { res.innerHTML = '<div class="empty-state" style="margin-top:1rem;"><i class="ti ti-selector" aria-hidden="true"></i>Add at least one style with a quantity</div>'; return; }
  const totalQty = rows.reduce((s,r)=>s+r.qty, 0);
  const totalCap = rows.reduce((s,r)=>s+(r.cap||0), 0);
  const cbm = CONTAINER_CBM[c] || null;
  const overallPct = totalCap > 0 ? Math.round((totalQty/totalCap)*100) : null;
  const barColor = overallPct ? fillColor(overallPct) : '#888';
  const safeWidth = overallPct ? Math.min(overallPct,100) : 0;

  const rowsHtml = rows.map(r => {
    const p = r.cap && r.cap > 0 ? Math.round((r.qty/r.cap)*100) : null;
    const badge = p ? `<span class="badge ${p>=90?'badge-ok':p>=80?'badge-warn':'badge-no'}">${p}%</span>` : '—';
    return `<tr>
      <td>Style ${r.style}</td>
      <td style="color:var(--text-muted);">${r.vendor}</td>
      <td style="text-align:right;">${r.qty.toLocaleString()}</td>
      <td style="text-align:right;color:var(--text-muted);">${r.cap ? r.cap.toLocaleString()+' yds' : 'N/A'}</td>
      <td style="text-align:center;">${badge}</td>
    </tr>`;
  }).join('');

  let advice = '';
  if (overallPct !== null && overallPct < fillTarget) {
    advice = `<div class="note" style="margin-top:1rem;"><i class="ti ti-alert-triangle"></i><span>Combined fill is ${overallPct}% — below your ${fillTarget}% target. Add more quantity or consolidate styles to justify this container.</span></div>`;
  }

  res.innerHTML = `
  <div class="result-card" style="margin-top:1rem;">
    <div class="result-header">
      <span style="font-weight:500;">${c} container summary</span>
      ${overallPct ? fillBadge(overallPct) : ''}
    </div>
    <div class="result-body">
      <div class="grid3" style="gap:8px;margin-bottom:1rem;">
        <div class="metric"><div class="mlabel">Total yards</div><div class="mval">${totalQty.toLocaleString()}</div><div class="msub">ordered</div></div>
        <div class="metric"><div class="mlabel">Total capacity</div><div class="mval">${totalCap > 0 ? totalCap.toLocaleString() : '—'}</div><div class="msub">yards available</div></div>
        <div class="metric"><div class="mlabel">Container size</div><div class="mval">${cbm || '—'}</div><div class="msub">CBM</div></div>
      </div>
      ${overallPct ? `
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:.4rem;">Overall fill</div>
      <div class="fill-bar-bg"><div class="fill-bar" style="width:${safeWidth}%;background:${barColor};"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-top:4px;margin-bottom:1rem;">
        <span>${totalQty.toLocaleString()} yds</span><span>${totalCap.toLocaleString()} yds max</span>
      </div>` : ''}
      <table>
        <thead><tr>
          <th>Style</th><th>Vendor</th>
          <th style="text-align:right;">Qty (yds)</th>
          <th style="text-align:right;">Max cap</th>
          <th style="text-align:center;">Fill %</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      ${advice}
    </div>
  </div>`;
}

function renderRef() {
  const filter = document.getElementById('ref-filter').value;
  const data = filter ? RAW.filter(r=>r.style===filter) : RAW;
  const rows = data.map(r=>`<tr>
    <td>Style ${r.style}</td>
    <td style="color:var(--text-muted);">${r.vendor}</td>
    <td>${r.container}</td>
    <td style="text-align:right;">${r.qty ? r.qty.toLocaleString()+' yds' : '—'}</td>
    <td style="color:var(--text-muted);font-size:12px;">${r.notes||''}</td>
  </tr>`).join('');
  document.getElementById('ref-table').innerHTML = `
  <table>
    <thead><tr>
      <th>Style</th><th>Vendor</th><th>Container</th>
      <th style="text-align:right;">Max qty</th><th>Notes</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function setTab(tab) {
  ['single','multi','ref'].forEach(t => {
    document.getElementById('view-'+t).style.display = t===tab ? 'block' : 'none';
    document.getElementById('tab-'+t).classList.toggle('active', t===tab);
  });
  if (tab==='ref') renderRef();
  if (tab==='multi' && document.getElementById('m-rows').children.length===0) addMultiRow();
}

populateDropdowns();
renderRef();
</script>
</body>
</html>
