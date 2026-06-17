/**
 * In-browser MCP "servers" for the pilot apps + their ui:// HTML templates.
 *
 * In production each app is a real MCP server at /mcp (per SEP-1865). Here the
 * server logic and the pre-declared UI resource template run in the browser so
 * the full UI↔host loop is demonstrable. The JSON-RPC shapes match MCP:
 * tools return { structuredContent, content:[{type:"text", text}] } where the
 * text is the mandatory fallback for text-only hosts.
 */

export type ToolResult = { structuredContent: Record<string, unknown>; fallbackText: string };

/* ----------------------------- mock data -------------------------------- */
type Property = { id: string; name: string; price: string; areaM2: number; district: string; type: string; x: number; y: number; img: string; legal: string; desc: string };

const PROPERTIES: Property[] = [
  { id: "p1", name: "NOXH Thủ Đức Green", price: "1,25 tỷ", areaM2: 52, district: "TP Thủ Đức", type: "NOXH", x: 60, y: 38, img: "🏢", legal: "Sổ hồng riêng", desc: "Căn hộ nhà ở xã hội 2PN, bàn giao hoàn thiện cơ bản, gần Vành đai 3." },
  { id: "p2", name: "Shophouse Vạn Phúc", price: "12,8 tỷ", areaM2: 105, district: "TP Thủ Đức", type: "shophouse", x: 47, y: 55, img: "🏬", legal: "Sổ hồng lâu dài", desc: "Shophouse 1 trệt 3 lầu mặt tiền nội khu, kinh doanh sẵn." },
  { id: "p3", name: "Căn hộ Bình Thạnh Riverside", price: "3,4 tỷ", areaM2: 68, district: "Bình Thạnh", type: "apartment", x: 33, y: 30, img: "🌆", legal: "Sổ hồng riêng", desc: "2PN view sông, full nội thất, bàn giao ngay." },
  { id: "p4", name: "NOXH Hóc Môn CityLand", price: "980 triệu", areaM2: 48, district: "Hóc Môn", type: "NOXH", x: 20, y: 18, img: "🏢", legal: "Sổ hồng riêng", desc: "Căn 1PN+1, phù hợp gia đình trẻ, hỗ trợ vay 70%." },
  { id: "p5", name: "Shophouse Cát Lái Center", price: "9,5 tỷ", areaM2: 90, district: "TP Thủ Đức", type: "shophouse", x: 75, y: 62, img: "🏬", legal: "Sổ hồng lâu dài", desc: "Shophouse khu compound, dòng tiền cho thuê ổn định." },
];

/* ----------------------------- handlers --------------------------------- */
function propertyCall(name: string, args: Record<string, unknown>): ToolResult {
  if (name === "get_property_detail") {
    const d = PROPERTIES.find((p) => p.id === args.id) ?? PROPERTIES[0];
    return {
      structuredContent: { detail: d },
      fallbackText: `${d.name} — ${d.price} · ${d.areaM2} m² · ${d.district} · ${d.legal}. ${d.desc}`,
    };
  }
  // show_property_listings
  const type = args.type as string | undefined;
  const area = (args.area as string) || "TP.HCM";
  const listings = PROPERTIES.filter((p) => !type || p.type === type);
  const lines = listings.map((p) => `• ${p.name} — ${p.price} (${p.areaM2} m², ${p.district})`).join("\n");
  return {
    structuredContent: { area, listings },
    fallbackText: `Tìm thấy ${listings.length} bất động sản tại ${area}:\n${lines}`,
  };
}

function designerCall(_name: string, args: Record<string, unknown>): ToolResult {
  const prompt = ((args.prompt as string) || "landing page").trim();
  const seed = prompt.length;
  const base = [
    { type: "hero", label: "Hero · " + prompt.slice(0, 28), h: 96 },
    { type: "cols", label: "3 khối tính năng", h: 72 },
    { type: "media", label: "Ảnh / minh hoạ", h: 84 },
    { type: "cta", label: "Kêu gọi hành động", h: 56 },
    { type: "foot", label: "Footer", h: 44 },
  ];
  const blocks = seed % 2 === 0 ? base : [base[0], { type: "cols", label: "Bảng giá 3 gói", h: 78 }, base[2], base[3], base[4]];
  return {
    structuredContent: { prompt, blocks },
    fallbackText: `Layout đã sinh cho "${prompt}": ` + blocks.map((b) => b.label).join(" → "),
  };
}

function workflowCall(_name: string, _args: Record<string, unknown>): ToolResult {
  const steps = [
    { name: "Nhận lead mới", status: "done" },
    { name: "Làm giàu dữ liệu (trợ lý ảo)", status: "done" },
    { name: "Ghi vào RAI CRM", status: "running" },
    { name: "Gửi email chào", status: "pending" },
    { name: "Tạo nhiệm vụ cho sale", status: "pending" },
  ];
  return {
    structuredContent: { name: "Đồng bộ lead → CRM", steps },
    fallbackText: "Workflow 'Đồng bộ lead → CRM': " + steps.map((s) => `${s.name} [${s.status}]`).join(" · "),
  };
}

/* ----------------------------- bridge client ---------------------------- */
// Injected into every widget iframe. Exposes window.RAI.{callTool,onRender,ready}.
const BRIDGE = `
(function(){
  var seq=1, pending={};
  function post(m){ parent.postMessage(m,'*'); }
  window.addEventListener('message', function(e){
    var m=e.data; if(!m||m.jsonrpc!=='2.0') return;
    if(m.id && (m.result!==undefined||m.error!==undefined)){
      var p=pending[m.id]; if(p){ delete pending[m.id]; if(m.error){p.reject(m.error);}else{p.resolve(m.result);} }
    } else if(m.method==='ui/render'){ if(window.__onRender){ window.__onRender(m.params); } }
  });
  window.RAI={
    callTool:function(name,args){ var id=seq++; return new Promise(function(res,rej){ pending[id]={resolve:res,reject:rej}; post({jsonrpc:'2.0',id:id,method:'tools/call',params:{name:name,arguments:args||{}}}); }); },
    onRender:function(cb){ window.__onRender=cb; },
    ready:function(){ post({jsonrpc:'2.0',method:'ui/ready'}); }
  };
})();
`;

const BASE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;font-family:Montserrat,system-ui,sans-serif}
body{padding:14px;color:#0F2A47;background:transparent}
.glass{background:rgba(255,255,255,.7);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(15,42,71,.12);border-radius:14px}
.btn{font-family:inherit;font-weight:600;font-size:12px;border:0;border-radius:8px;padding:7px 12px;background:#0F2A47;color:#fff;cursor:pointer}
.btn.gold{background:#C9A227}
.btn.ghost{background:rgba(15,42,71,.08);color:#0F2A47}
h3{font-weight:700;font-size:15px;color:#0F2A47}
`;

function htmlDoc(css: string, body: string, script: string): string {
  return (
    "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>" +
    "<style>" + BASE_CSS + css + "</style></head><body>" + body +
    "<script>" + BRIDGE + "</script><script>" + script + "</script></body></html>"
  );
}

/* ----------------------------- property template ------------------------ */
const PROPERTY_TPL = htmlDoc(
  `#wrap{display:grid;gap:12px}
   #map{position:relative;height:200px;border-radius:14px;background:linear-gradient(135deg,rgba(46,117,182,.18),rgba(201,162,39,.12));overflow:hidden}
   .pin{position:absolute;transform:translate(-50%,-50%);border:0;background:#2E75B6;color:#fff;width:22px;height:22px;border-radius:50% 50% 50% 0;rotate:-45deg;cursor:pointer;font-size:0;box-shadow:0 2px 6px rgba(0,0,0,.25)}
   #cards{display:grid;gap:8px;max-height:260px;overflow:auto}
   .card{display:flex;gap:10px;align-items:center;padding:10px}
   .thumb{font-size:26px;width:46px;height:46px;display:grid;place-items:center;background:rgba(15,42,71,.06);border-radius:10px}
   .meta{flex:1;min-width:0}.nm{font-weight:600;font-size:13px}.sub{font-size:11px;color:#5b6b7e}.price{font-weight:700;font-size:13px;color:#2E75B6}
   #modal{display:none;position:fixed;inset:0;background:rgba(15,42,71,.45);align-items:center;justify-content:center;padding:18px}
   .mc{max-width:340px;padding:18px}.mc ul{margin:10px 0 0;padding-left:16px;font-size:12px;color:#33485e}.mc p{font-size:12px;color:#33485e;margin-top:6px}
   .mrow{display:flex;gap:8px;margin-top:14px}`,
  `<div id="wrap"><div id="map"></div><div id="cards"></div></div>
   <div id="modal"><div class="glass mc"></div></div>`,
  `RAI.onRender(function(p){
     var list=(p.data&&p.data.listings)||[]; var map=document.getElementById('map'); var cards=document.getElementById('cards');
     map.innerHTML=''; cards.innerHTML='';
     list.forEach(function(it){
       var pin=document.createElement('button'); pin.className='pin'; pin.style.left=it.x+'%'; pin.style.top=it.y+'%'; pin.title=it.name; pin.onclick=function(){detail(it.id);}; map.appendChild(pin);
       var c=document.createElement('div'); c.className='card glass';
       c.innerHTML='<div class="thumb">'+it.img+'</div><div class="meta"><div class="nm">'+it.name+'</div><div class="sub">'+it.district+' · '+it.areaM2+' m²</div><div class="price">'+it.price+'</div></div>';
       var b=document.createElement('button'); b.className='btn'; b.textContent='Xem chi tiết'; b.onclick=function(){detail(it.id);}; c.appendChild(b); cards.appendChild(c);
     });
   });
   function detail(id){ RAI.callTool('get_property_detail',{id:id}).then(function(r){
     var d=(r.structuredContent&&r.structuredContent.detail)||{}; var m=document.getElementById('modal');
     m.querySelector('.mc').innerHTML='<h3>'+d.name+'</h3><p>'+d.desc+'</p><ul><li>Giá: '+d.price+'</li><li>Diện tích: '+d.areaM2+' m²</li><li>Pháp lý: '+d.legal+'</li></ul><div class="mrow"><button class="btn gold" id="adv">Tư vấn hồ sơ</button><button class="btn ghost" id="cl">Đóng</button></div>';
     m.style.display='flex'; document.getElementById('cl').onclick=function(){m.style.display='none';};
     document.getElementById('adv').onclick=function(){ m.querySelector('.mc').innerHTML='<h3>Đã gửi yêu cầu tư vấn</h3><p>Trợ lý ảo RAI sẽ liên hệ bạn về hồ sơ vay & pháp lý.</p><div class="mrow"><button class="btn ghost" id="cl2">Đóng</button></div>'; document.getElementById('cl2').onclick=function(){m.style.display='none';}; };
   }); }
   RAI.ready();`,
);

/* ----------------------------- designer template ------------------------ */
const DESIGNER_TPL = htmlDoc(
  `#bar{display:flex;gap:8px;margin-bottom:12px}
   #prompt{flex:1;font-family:inherit;font-size:12px;padding:8px 10px;border-radius:8px;border:1px solid rgba(15,42,71,.18);background:rgba(255,255,255,.7)}
   #canvas{display:grid;gap:8px}
   .block{border-radius:10px;display:grid;place-items:center;font-size:12px;font-weight:600;color:#0F2A47;border:1px dashed rgba(15,42,71,.25)}
   .block.hero{background:rgba(46,117,182,.16)}.block.cols{background:rgba(201,162,39,.16)}.block.media{background:rgba(15,42,71,.08)}.block.cta{background:rgba(46,117,182,.24);color:#0F2A47}.block.foot{background:rgba(15,42,71,.06)}
   #promptLabel{font-size:11px;color:#5b6b7e;margin-top:8px}`,
  `<div id="bar"><input id="prompt" placeholder="Mô tả thiết kế..." value="Landing page cho dự án NOXH"><button class="btn gold" id="regen">Tạo lại</button></div>
   <div id="canvas" class="glass" style="padding:10px"></div><div id="promptLabel"></div>`,
  `function draw(d){ var cv=document.getElementById('canvas'); cv.innerHTML=''; ((d&&d.blocks)||[]).forEach(function(b){ var el=document.createElement('div'); el.className='block '+b.type; el.style.height=b.h+'px'; el.textContent=b.label; cv.appendChild(el); }); document.getElementById('promptLabel').textContent='Prompt: '+((d&&d.prompt)||''); }
   RAI.onRender(function(p){ draw(p.data); });
   document.getElementById('regen').onclick=function(){ var pr=document.getElementById('prompt').value||'landing page'; RAI.callTool('generate_design',{prompt:pr}).then(function(r){ draw(r.structuredContent); }); };
   RAI.ready();`,
);

/* ----------------------------- workflow template ------------------------ */
const WORKFLOW_TPL = htmlDoc(
  `#hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
   #wfname{font-weight:700;font-size:14px;color:#0F2A47}
   #steps{display:grid;gap:6px}
   .step{display:flex;align-items:center;gap:10px;padding:9px 12px;font-size:12px}
   .dot{width:9px;height:9px;border-radius:50%;background:#cfd8e0;flex:none}
   .step.done .dot{background:#1D9E75}.step.running .dot{background:#C9A227;box-shadow:0 0 0 3px rgba(201,162,39,.25)}
   .lbl{flex:1;color:#0F2A47}.st{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#5b6b7e}`,
  `<div id="hd"><span id="wfname"></span><button class="btn" id="run">Chạy lại</button></div><div id="steps"></div>`,
  `function render(d){ document.getElementById('wfname').textContent=(d&&d.name)||''; var s=document.getElementById('steps'); s.innerHTML=''; ((d&&d.steps)||[]).forEach(function(st){ var el=document.createElement('div'); el.className='step glass '+st.status; el.innerHTML='<span class="dot"></span><span class="lbl">'+st.name+'</span><span class="st">'+st.status+'</span>'; s.appendChild(el); }); }
   RAI.onRender(function(p){ render(p.data); });
   document.getElementById('run').onclick=function(){ RAI.callTool('run_workflow',{id:'demo',params:{}}).then(function(r){ render(r.structuredContent); }); };
   RAI.ready();`,
);

/* ----------------------------- server registry -------------------------- */
type Server = { template: string; call: (name: string, args: Record<string, unknown>) => ToolResult; primaryTool: string; defaultArgs: Record<string, unknown> };

export const servers: Record<string, Server> = {
  property: { template: PROPERTY_TPL, call: propertyCall, primaryTool: "show_property_listings", defaultArgs: { area: "TP Thủ Đức" } },
  designer: { template: DESIGNER_TPL, call: designerCall, primaryTool: "generate_design", defaultArgs: { prompt: "Landing page cho dự án NOXH" } },
  workflow: { template: WORKFLOW_TPL, call: workflowCall, primaryTool: "run_workflow", defaultArgs: { id: "demo", params: {} } },
};

export function getServer(appId: string): Server | undefined {
  return servers[appId];
}
