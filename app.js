const KEY="myfinance_v1";
const defaultCategories=[
["Rent",1670000],["Listrik",500000],["Wifi",170000],["Makan",4800000],["Main",500000],
["Kebutuhan Dapur, Cuci, Mandi",1500000],["Free Shop",1500000],["Arisan",220000],
["Galon + Gas",234000],["Sampah + keamanan",200000],["Sumbangan",500000],["Bensin + Ojek",350000],
["Servis",50000],["SPP",615000],["Uang Saku",200000],["Uang Sekolah Bilal",3350000],["Uang Sekolah Zaid",3195000]];
let db=JSON.parse(localStorage.getItem(KEY)||"null");
if(!db)db={initialBalance:28803000,categories:defaultCategories.map((x,i)=>({id:i+1,name:x[0],budget:x[1],active:true})),transactions:[]};
const save=()=>localStorage.setItem(KEY,JSON.stringify(db));
const rupiah=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);
const digits=s=>String(s??"").replace(/\D/g,"");
const fmtInput=s=>{let d=digits(s);return d?"Rp "+new Intl.NumberFormat("id-ID").format(Number(d)):""};
const cycleFor=(d=new Date())=>{let x=new Date(d),y=x.getFullYear(),m=x.getMonth(),day=x.getDate();let start=day>=29?new Date(y,m,29):new Date(y,m-1,29),end=new Date(start.getFullYear(),start.getMonth()+1,28);return{start,end,label:`${fmt(start)} - ${fmt(end)}`}};
const fmt=d=>d.toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"});
const dateInCycle=s=>{let d=new Date(s+"T12:00:00"),c=cycleFor();return d>=c.start&&d<=c.end};
const currentBalance=()=>db.initialBalance-db.transactions.reduce((a,t)=>a+Number(t.amount),0);
const totalBudget=()=>db.categories.filter(c=>c.active).reduce((a,c)=>a+Number(c.budget),0);
const spent=(id,period="cycle")=>db.transactions.filter(t=>t.categoryId===id&&(period==="all"||dateInCycle(t.date))).reduce((a,t)=>a+Number(t.amount),0);
const esc=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function render(){let c=cycleFor(),sp=db.transactions.filter(t=>dateInCycle(t.date)).reduce((a,t)=>a+Number(t.amount),0),tb=totalBudget(),rem=tb-sp,p=tb?Math.min(100,Math.round(sp/tb*100)):0;
balance.textContent=rupiah(currentBalance());cycle.textContent=`Budget Cycle: ${c.label}`;budgetTotal.textContent=rupiah(tb);spentTotal.textContent=rupiah(sp);remainingTotal.textContent=rupiah(rem);overallBar.style.width=p+"%";overallBar.parentElement.classList.toggle("over",rem<0);
budgetList.innerHTML=db.categories.filter(c=>c.active).map(c=>{let s=spent(c.id),r=c.budget-s,q=c.budget?Math.min(100,Math.round(s/c.budget*100)):0;return `<div class="budget ${r<0?"over":""}"><div class="row"><span class="category">${esc(c.name)}</span><span>${rupiah(s)} / ${rupiah(c.budget)}</span></div><div class="bar"><i style="width:${q}%"></i></div><div class="row small"><span class="remain">${r<0?"OVER BUDGET":"Remaining"} ${rupiah(r)}</span><span>${q}%</span></div></div>`}).join("");
categoryFilter.innerHTML='<option value="all">All Categories</option>'+db.categories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");renderHistory();renderCategories();}
function renderHistory(){let period=periodFilter.value,cat=categoryFilter.value,arr=[...db.transactions].filter(t=>(period==="all"||dateInCycle(t.date))&&(cat==="all"||String(t.categoryId)===cat)).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);historyTotal.textContent=rupiah(arr.reduce((a,t)=>a+Number(t.amount),0));if(!arr.length){historyList.innerHTML='<div class="card empty">No transactions found.</div>';return}let groups={};arr.forEach(t=>(groups[t.date]??=[]).push(t));historyList.innerHTML=Object.entries(groups).map(([date,ts])=>`<div class="dayhead">${new Date(date+"T12:00:00").toLocaleDateString("id-ID",{weekday:"long",day:"2-digit",month:"short",year:"numeric"})} · ${rupiah(ts.reduce((a,t)=>a+Number(t.amount),0))}</div>`+ts.map(t=>{let c=db.categories.find(x=>x.id===t.categoryId);return `<div class="tx"><div class="row"><div><b>${esc(c?.name||"Deleted Category")}</b><div class="muted">${t.note?esc(t.note):"No note"}</div></div><div class="amount">${rupiah(t.amount)}</div></div><div class="actions"><button onclick="editTx(${t.id})">Edit</button><button onclick="deleteTx(${t.id})">Delete</button></div></div>`}).join("")).join("");}
function renderCategories(){categoryList.innerHTML=db.categories.map(c=>`<div class="catrow ${c.active?"":"disabled"}"><div class="catinfo"><b>${esc(c.name)}</b><span>${rupiah(c.budget)} · ${c.active?"Active":"Disabled"}</span></div><div class="catactions"><button onclick="editCat(${c.id})">Edit</button><button onclick="toggleCat(${c.id})">${c.active?"Disable":"Restore"}</button></div></div>`).join("");initialBalance.value=db.initialBalance;}
function openExpense(id=null){modal.classList.remove("hidden");txId.value=id||"";txCategory.innerHTML=db.categories.filter(c=>c.active).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");if(id){let t=db.transactions.find(x=>x.id===id);modalTitle.textContent="Edit Expense";txCategory.value=t.categoryId;txAmount.value=fmtInput(t.amount);txDate.value=t.date;txNote.value=t.note||""}else{modalTitle.textContent="Add Expense";txAmount.value="";txDate.value=new Date().toISOString().slice(0,10);txNote.value=""}}
function close(){modal.classList.add("hidden")}
txAmount.addEventListener("input",()=>txAmount.value=fmtInput(txAmount.value));
expenseForm.onsubmit=e=>{e.preventDefault();let id=Number(txId.value),amt=Number(digits(txAmount.value));if(!amt)return alert("Enter an amount.");let o={categoryId:Number(txCategory.value),amount:amt,date:txDate.value,note:txNote.value.trim()};if(id){let t=db.transactions.find(x=>x.id===id);Object.assign(t,o)}else db.transactions.push({id:Date.now(),...o});save();close();render();show("history");};
function editTx(id){openExpense(id)}
function deleteTx(id){if(confirm("Delete this transaction?")){db.transactions=db.transactions.filter(t=>t.id!==id);save();render()}}
function editCat(id){let c=db.categories.find(x=>x.id===id),n=prompt("Category name:",c.name);if(n===null)return;n=n.trim();if(!n)return;let b=prompt("Budget amount (IDR):",c.budget);if(b===null)return;b=Number(digits(b));if(!Number.isFinite(b)||b<0)return alert("Invalid budget.");c.name=n;c.budget=b;save();render()}
function toggleCat(id){let c=db.categories.find(x=>x.id===id);c.active=!c.active;save();render()}
addCategory.onclick=()=>{let n=prompt("New category name:");if(!n?.trim())return;let b=Number(digits(prompt("Budget amount (IDR):","0")));if(!Number.isFinite(b)||b<0)return;db.categories.push({id:Date.now(),name:n.trim(),budget:b,active:true});save();render()};
saveInitial.onclick=()=>{let n=Number(initialBalance.value);if(!Number.isFinite(n)||n<0)return alert("Invalid balance.");db.initialBalance=n;save();render();alert("Initial balance saved.")};
function show(name){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));document.getElementById(name).classList.add("active");document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.screen===name))}
document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>show(n.dataset.screen));quickAdd.onclick=historyAdd.onclick=()=>openExpense();closeModal.onclick=close;modal.onclick=e=>{if(e.target===modal)close()};periodFilter.onchange=renderHistory;categoryFilter.onchange=renderHistory;
exportBtn.onclick=()=>{let blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`my-finance-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
importBtn.onclick=()=>importFile.click();
importFile.onchange=()=>{let f=importFile.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(!x||!Array.isArray(x.categories)||!Array.isArray(x.transactions)||typeof x.initialBalance!=="number")throw Error();if(confirm("Replace current data with this backup?")){db=x;save();render();alert("Backup restored.")}}catch(e){alert("Invalid backup file.")}};r.readAsText(f);importFile.value=""};
clearBtn.onclick=()=>{if(confirm("Clear ALL finance data? This cannot be undone. Export a backup first.")){localStorage.removeItem(KEY);location.reload()}};
let deferredPrompt=null;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false});installBtn.onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installBtn.hidden=true}};
if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
render();
