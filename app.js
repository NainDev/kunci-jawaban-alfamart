const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fold=s=>String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
const SETS=window.SETS,DATA=window.DATA;
const PAGE=30;
let cur="semua",shown=PAGE,list=[];
/* indeks pencarian */
const ALL=[];
SETS.forEach(s=>(DATA[s.id]||[]).forEach(r=>ALL.push({set:s.id,nama:s.nama,q:r[0],a:r[1],o:r[2]||[],fq:fold(r[0]),fa:fold(r[1]+" "+(r[2]||[]).join(" "))})));
/* tema */
const root=document.documentElement;
try{const t=localStorage.getItem("tema");if(t)root.dataset.theme=t}catch{}
const dark=()=>root.dataset.theme?root.dataset.theme=="dark":matchMedia("(prefers-color-scheme: dark)").matches;
const ico=()=>$("#tema").innerHTML=dark()?'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>':'<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>';
$("#tema").onclick=()=>{const n=dark()?"light":"dark";root.dataset.theme=n;try{localStorage.setItem("tema",n)}catch{}ico()};ico();
/* tab bank soal */
function tabs(){const n={semua:ALL.length};SETS.forEach(s=>n[s.id]=(DATA[s.id]||[]).length);
 $("#sets").innerHTML=[{id:"semua",nama:"Semua"},...SETS].map(s=>`<button type="button" role="tab" data-s="${s.id}" aria-selected="${s.id==cur}" class="${s.id==cur?"on":""}">${esc(s.nama)}<em>${n[s.id]}</em></button>`).join("")}
$("#sets").onclick=e=>{const b=e.target.closest("[data-s]");if(!b)return;cur=b.dataset.s;tabs();run()};
/* pencarian */
const hl=(t,words)=>{let h=esc(t);if(!words.length)return h;const f=fold(t);
 /* tandai berdasarkan teks tanpa aksen (panjang sama untuk huruf latin) */
 const spans=[];words.forEach(w=>{let i=0;while((i=f.indexOf(w,i))>-1){spans.push([i,i+w.length]);i+=w.length}});
 if(!spans.length||f.length!=t.length)return h;
 spans.sort((a,b)=>a[0]-b[0]);const m=[];spans.forEach(s=>{const l=m[m.length-1];if(l&&s[0]<=l[1])l[1]=Math.max(l[1],s[1]);else m.push([...s])});
 let o="",p=0;m.forEach(([a,b])=>{o+=esc(t.slice(p,a))+"<mark>"+esc(t.slice(a,b))+"</mark>";p=b});return o+esc(t.slice(p))};
function run(){const raw=$("#q").value.trim(),words=fold(raw).split(/\s+/).filter(Boolean),onlyQ=$("#onlyAns").checked;
 $("#clr").hidden=!raw;shown=PAGE;
 const pool=ALL.filter(r=>cur=="semua"||r.set==cur);
 list=!words.length?pool:pool.filter(r=>words.every(w=>r.fq.includes(w)||(!onlyQ&&r.fa.includes(w))));
 if(words.length)list=list.map(r=>({r,s:words.reduce((n,w)=>n+(r.fq.includes(w)?2:0)+(r.fa.includes(w)?1:0)+(r.fq.startsWith(w)?1:0),0)})).sort((a,b)=>b.s-a.s).map(x=>x.r);
 $("#info").textContent=words.length?`${list.length} hasil untuk “${raw}”`:`${list.length} soal`;
 draw(words)}
function kartu(r,i,words){const tf=/^(true|false|benar|salah)$/i.test(r.a.trim()),bool=tf?(/^(true|benar)$/i.test(r.a.trim())):null;
 const opts=r.o.length?`<ul class="opts">${r.o.map(o=>{const ok=fold(o)==fold(r.a);return`<li class="${ok?"ok":""}"><span class="ch"></span><span>${hl(o,words)}</span></li>`}).join("")}</ul>`:"";
 const ans=r.o.length?"":`<div class="ans ${tf&&!bool?"no":""}"><b>Jawaban</b><span>${tf?(bool?"Benar (True)":"Salah (False)"):hl(r.a,words)}</span></div>`;
 return`<article class="card" style="--i:${Math.min(i,8)}"><div class="meta"><span class="tag">${esc(r.nama)}</span><button class="cp" type="button" data-c="${i}">Salin jawaban</button></div><div class="stem">${hl(r.q,words)}</div>${opts}${ans}</article>`}
function draw(words){const L=list.slice(0,shown);
 $("#res").innerHTML=L.length?L.map((r,i)=>kartu(r,i,words)).join(""):`<div class="empty"><b>Tidak ada soal yang cocok.</b><br>Coba kata kunci yang lebih pendek atau pilih “Semua”.</div>`;
 const m=$("#more");m.hidden=list.length<=shown;m.innerHTML=`<button type="button">Tampilkan lebih banyak (${list.length-shown} lagi)</button>`;
 window.__w=words}
$("#more").onclick=()=>{shown+=PAGE;draw(window.__w)};
$("#res").onclick=e=>{const b=e.target.closest("[data-c]");if(!b)return;const r=list[+b.dataset.c];
 navigator.clipboard.writeText(r.a).then(()=>toast("Jawaban disalin"),()=>toast("Gagal menyalin"))};
let tm;function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("on");clearTimeout(tm);tm=setTimeout(()=>e.classList.remove("on"),1500)}
let db;$("#q").addEventListener("input",()=>{clearTimeout(db);db=setTimeout(run,120)});
$("#onlyAns").onchange=run;
$("#clr").onclick=()=>{$("#q").value="";run();$("#q").focus()};
addEventListener("keydown",e=>{if(e.key=="/"&&document.activeElement!=$("#q")){e.preventDefault();$("#q").focus()}});
tabs();run();
