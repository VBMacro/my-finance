const CACHE="my-finance-v1-2-5";
const ASSETS=["./","./index.html","./style.css?v=1.2.5","./app.js?v=1.2.5","./manifest.json"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.mode==="navigate")e.respondWith(fetch(e.request,{cache:"no-store"}).catch(()=>caches.match("./index.html")));else e.respondWith(caches.match(e.request).then(x=>x||fetch(e.request)))});
