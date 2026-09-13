const KEY="myfinance_v1";
const $=id=>document.getElementById(id);
const balance=$("balance"),cycleLabel=$("cycle"),budgetTotal=$("budgetTotal"),spentTotal=$("spentTotal"),remainingTotal=$("remainingTotal"),overallBar=$("overallBar"),overallPct=$("overallPct"),topList=$("topList"),budgetList=$("budgetList"),categoryFilter=$("categoryFilter"),historyList=$("historyList"),historyTotal=$("historyTotal"),categoryList=$("categoryList"),initialBalance=$("initialBalance"),cycleStart=$("cycleStart"),cycleEnd=$("cycleEnd"),saveCycle=$("saveCycle"),addCategory=$("addCategory"),editInitial=$("editInitial"),saveInitial=$("saveInitial"),exportBtn=$("exportBtn"),importBtn=$("importBtn"),importFile=$("importFile"),clearBtn=$("clearBtn"),viewAll=$("viewAll"),quickAdd=$("quickAdd"),historyAdd=$("historyAdd"),catAddExpense=$("catAddExpense"),fab=$("fab"),modal=$("modal"),closeModal=$("closeModal"),modalTitle=$("modalTitle"),expenseForm=$("expenseForm"),txId=$("txId"),txCategory=$("txCategory"),txAmount=$("txAmount"),txDate=$("txDate"),txNote=$("txNote"),catModal=$("catModal"),closeCatModal=$("closeCatModal"),catForm=$("catForm"),catId=$("catId"),catName=$("catName"),catBudget=$("catBudget"),periodFilter=$("periodFilter");
const defaults=[["Rent",1670000],["Listrik",500000],["Wifi",170000],["Makan",4800000],["Main",500000],["Kebutuhan Dapur, Cuci, Mandi",1500000],["Free Shop",1500000],["Arisan",220000],["Galon + Gas",234000],["Sampah + keamanan",200000],["Sumbangan",500000],["Bensin + Ojek",350000],["Servis",50000],["SPP",615000],["Uang Saku",200000],["Uang Sekolah Bilal",3350000],["Uang Sekolah Zaid",3195000]];
let db=JSON.parse(localStorage.getItem(KEY)||"null")||{initialBalance:28803000,categories:defaults.map((x,i)=>({id:i+1,name:x[0],budget:x[1],active:true})),transactions:[]};
if(!Number.isInteger(db.cycleStart)||!Number.isInteger(db.cycleEnd)){db.cycleStart=29;db.cycleEnd=28;}
db.transactions=db.transactions.map(t=>({...t,categoryName:t.categoryName||db.categories.find(c=>c.id===t.categoryId)?.name||"Deleted Category"}));
const save=()=>localStorage.setItem(KEY,JSON.stringify(db));
const rp=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);
const digs=s=>String(s||"").replace(/\D/g,"");
const inputRp=s=>{let d=digs(s);return d?"Rp "+new Intl.NumberFormat("id-ID").format(Number(d)):""};
const esc=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const cycle=()=>{let d=new Date(),y=d.getFullYear(),m=d.getMonth(),day=d.getDate(),cs=db.cycleStart,ce=db.cycleEnd,start,end;
if(cs>ce){start=day>=cs?new Date(y,m,cs):new Date(y,m-1,cs);end=new Date(start.getFullYear(),start.getMonth()+1,ce);}
else{start=day>=cs?new Date(y,m,cs):new Date(y,m-1,cs);end=new Date(start.getFullYear(),start.getMonth(),ce);}
return{start,end,label:start.toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})+" - "+end.toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})}};
const inCycle=s=>{let d=new Date(s+"T12:00:00"),c=cycle();return d>=c.start&&d<=c.end};
const curBal=()=>db.initialBalance-db.transactions.reduce((a,t)=>a+Number(t.amount),0);
const budget=()=>db.categories.filter(c=>c.active).reduce((a,c)=>a+Number(c.budget),0);
const catSpent=id=>db.transactions.filter(t=>t.categoryId===id&&inCycle(t.date)).reduce((a,t)=>a+Number(t.amount),0);
function card(c){let s=catSpent(c.id),r=c.budget-s,p=c.budget?Math.min(100,Math.round(s/c.budget*100)):0;return `<div class="budget ${r<0?"over":""}"><div class="row"><b class="category">${esc(c.name)}</b><span>${rp(s)} / ${rp(c.budget)}</span></div><div class="bar"><i style="width:${p}%"></i></div><div class="row small"><span class="remain">${r<0?"OVER BUDGET":"Remaining"} ${rp(r)}</span><span>${p}%</span></div></div>`}
function render(){let c=cycle(),sp=db.transactions.filter(t=>inCycle(t.date)).reduce((a,t)=>a+Number(t.amount),0),b=budget(),r=b-sp,p=b?Math.min(100,Math.round(sp/b*100)):0;
balance.textContent=rp(curBal());cycle.textContent="Budget Cycle: "+c.label;budgetTotal.textContent=rp(b);spentTotal.textContent=rp(sp);remainingTotal.textContent=rp(r);overallBar.style.width=p+"%";overallPct.textContent=p+"% used";
let top=db.categories.filter(c=>c.active).map(c=>({c,s:catSpent(c.id)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,5);topList.innerHTML=top.length?top.map(x=>card(x.c)).join(""):'<div class="card empty">No spending in current cycle.</div>';
budgetList.innerHTML=db.categories.filter(c=>c.active).map(card).join("");
categoryFilter.innerHTML='<option value="all">All Categories</option>'+db.categories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");renderHistory();renderCats()}
function renderHistory(){let arr=db.transactions.filter(t=>(periodFilter.value==="all"||inCycle(t.date))&&(categoryFilter.value==="all"||String(t.categoryId)===categoryFilter.value)).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);historyTotal.textContent=rp(arr.reduce((a,t)=>a+Number(t.amount),0));if(!arr.length){historyList.innerHTML='<div class="card empty">No transactions found.</div>';return}let g={};arr.forEach(t=>(g[t.date]??=[]).push(t));historyList.innerHTML=Object.entries(g).map(([d,ts])=>`<div class="dayhead">${new Date(d+"T12:00:00").toLocaleDateString("id-ID",{weekday:"long",day:"2-digit",month:"short",year:"numeric"})} · ${rp(ts.reduce((a,t)=>a+Number(t.amount),0))}</div>`+ts.map(t=>{let c=db.categories.find(x=>x.id===t.categoryId);return `<div class="tx"><div class="row"><div><b>${esc(c?.name||t.categoryName||"Deleted Category")}</b><div class="muted">${esc(t.note||"No note")}</div></div><b class="amount">${rp(t.amount)}</b></div><div class="actions"><button onclick="editTx(${t.id})">Edit</button><button onclick="deleteTx(${t.id})">Delete</button></div></div>`}).join("")).join("")}
function renderCats(){cycleStart.value=db.cycleStart;cycleEnd.value=db.cycleEnd;categoryList.innerHTML=db.categories.map(c=>`<div class="catrow ${c.active?"":"disabled"}"><div class="catinfo"><b>${esc(c.name)}</b><span>${rp(c.budget)} · ${c.active?"Active":"Disabled"}</span></div><div class="catactions"><button onclick="editCat(${c.id})">Edit</button><button onclick="toggleCat(${c.id})">${c.active?"Disable":"Restore"}</button><button class="delete" onclick="deleteCat(${c.id})">Delete</button></div></div>`).join("");initialBalance.value=db.initialBalance}
function openExp(id=null){modal.classList.remove("hidden");txId.value=id||"";txCategory.innerHTML=db.categories.filter(c=>c.active).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");if(id){let t=db.transactions.find(x=>x.id===id);modalTitle.textContent="Edit Expense";txCategory.value=t.categoryId;txAmount.value=inputRp(t.amount);txDate.value=t.date;txNote.value=t.note||""}else{modalTitle.textContent="Add Expense";txAmount.value="";txDate.value=new Date().toISOString().slice(0,10);txNote.value=""}}
const close=()=>modal.classList.add("hidden");
expenseForm.onsubmit=e=>{e.preventDefault();let id=Number(txId.value),o={categoryId:Number(txCategory.value),amount:Number(digs(txAmount.value)),date:txDate.value,note:txNote.value.trim()};if(!o.amount)return alert("Enter an amount.");if(id)Object.assign(db.transactions.find(t=>t.id===id),o);else db.transactions.push({id:Date.now(),...o});save();close();render();show("history")};
function editTx(id){openExp(id)}function deleteTx(id){if(confirm("Delete this transaction?")){db.transactions=db.transactions.filter(t=>t.id!==id);save();render()}}
function editCat(id){
  let c=db.categories.find(x=>x.id===id);
  if(!c)return;
  catId.value=c.id;
  catName.value=c.name;
  catBudget.value=inputRp(c.budget);
  catModal.classList.remove("hidden");
  setTimeout(()=>catName.focus(),50);
}
function closeCat(){catModal.classList.add("hidden")}
catBudget.addEventListener("input",()=>catBudget.value=inputRp(catBudget.value));
catForm.addEventListener("submit",e=>{
  e.preventDefault();
  const c=db.categories.find(x=>x.id===Number(catId.value));
  const n=catName.value.trim(), b=Number(digs(catBudget.value));
  if(!c||!n||!Number.isFinite(b)||b<0){alert("Invalid category or budget.");return;}
  c.name=n; c.budget=b; save(); closeCat(); render();
});
function toggleCat(id){let c=db.categories.find(c=>c.id===id);if(!c)return;c.active=!c.active;save();render()}
function deleteCat(id){
 const c=db.categories.find(c=>c.id===id);
 if(!c)return;
 const hasTransactions=db.transactions.some(t=>t.categoryId===id);
 const message=hasTransactions
  ? `Delete category "${c.name}"? Existing transactions will remain in History.`
  : `Delete category "${c.name}"?`;
 if(!window.confirm(message))return;
 if(hasTransactions)db.transactions.forEach(t=>{if(t.categoryId===id)t.categoryName=c.name});
 db.categories=db.categories.filter(c=>c.id!==id);
 save();render();
}
addCategory.onclick=()=>{let n=prompt("New category name:");if(!n?.trim())return;let b=Number(digs(prompt("Budget amount (IDR):","0")));if(!Number.isFinite(b)||b<0)return;db.categories.push({id:Date.now(),name:n.trim(),budget:b,active:true});save();render()};
function show(name){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));document.getElementById(name).classList.add("active");document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.screen===name));fab.style.display=name==="settings"?"none":"block"}
document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>show(n.dataset.screen));
viewAll.onclick=()=>show("allCategories");quickAdd.onclick=historyAdd.onclick=catAddExpense.onclick=fab.onclick=()=>openExp();closeModal.onclick=close;modal.onclick=e=>{if(e.target===modal)close()};
closeCatModal.onclick=closeCat;catModal.onclick=e=>{if(e.target===catModal)closeCat()};periodFilter.onchange=renderHistory;categoryFilter.onchange=renderHistory;txAmount.oninput=()=>txAmount.value=inputRp(txAmount.value);
editInitial.onclick=()=>{initialBalance.disabled=false;editInitial.hidden=true;saveInitial.hidden=false};saveInitial.onclick=()=>{let n=Number(initialBalance.value);if(!Number.isFinite(n)||n<0)return alert("Invalid balance.");if(confirm("Changing Initial Balance will change Current Balance. Continue?")){db.initialBalance=n;save();initialBalance.disabled=true;editInitial.hidden=false;saveInitial.hidden=true;render()}};
exportBtn.onclick=()=>{let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:"application/json"}));a.download="my-finance-backup.json";a.click()};
importBtn.onclick=()=>importFile.click();importFile.onchange=()=>{let f=importFile.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(!x.categories||!x.transactions)throw 0;if(confirm("Replace current data with this backup?")){db=x;save();render()}}catch(e){alert("Invalid backup file.")}};r.readAsText(f);importFile.value=""};
saveCycle.addEventListener("click",()=>{
  const s=parseInt(cycleStart.value,10), e=parseInt(cycleEnd.value,10);
  if(!Number.isInteger(s)||!Number.isInteger(e)||s<1||s>31||e<1||e>31){alert("Cycle days must be between 1 and 31.");return;}
  db.cycleStart=s; db.cycleEnd=e; save(); render();
  alert("Budget cycle saved: "+s+" → "+e);
});
clearBtn.onclick=()=>{if(confirm("Clear ALL finance data? This cannot be undone.")){localStorage.removeItem(KEY);location.reload()}};
if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js?v=1.2.4").catch(()=>{});render();