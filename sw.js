const CACHE='companion-xl-v10';
const CORE=['./index.html','./app-v2.js?v=10','./manifest.webmanifest','./catalog.js'];
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{
    const copy=res.clone();
    if(new URL(e.request.url).origin===self.location.origin) caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
    return res;
  }).catch(()=>caches.match(e.request)));
});